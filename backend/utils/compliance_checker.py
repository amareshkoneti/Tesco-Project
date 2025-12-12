# utils/compliance_checker.py
import json
import re
from typing import List, Dict, Any
from utils.gemini_service import GeminiService
import google.generativeai as genai
from bs4 import BeautifulSoup


# Simple local fallback checks (fast, catches obvious failures)
PRICE_KEYWORDS = {"discount","save","% off","was £","now £"}
COPY_HARD_FAIL_KEYWORDS = {
    "t&c","t&cs","terms and conditions","win","prize","competition",
    "guarantee","money-back","money back","sustainab","green","charity",
    "best","#1","guaranteed","free trial","money back guarantee"
}

class ComplianceChecker:
    def __init__(self, gemini_service: GeminiService = None):
        # If no GeminiService instance is passed, create one (use configured key)
        self.gemini = gemini_service or GeminiService(None)

# Replace the old _simple_local_check(...) with this:
    def _simple_local_check(self, html_content: str, objects: List[Dict[str,Any]], assets: Dict[str,Any]):
        """
        Improved deterministic checks:
        - Detect restricted object labels (alcohol etc).
        - Detect disallowed copy tokens (global) but ignore text inside allowed tiles.
        - Detect price-like tokens and ensure they appear ONLY inside allowed value-tile elements.
        Returns: None if no quick-fail found, otherwise a dict {passed:False, reason:..., details: [...]}
        """        
        # prepare soup
        try:
            soup = BeautifulSoup(html_content or "", "html.parser")
        except Exception:
            # fallback to old behaviour if parsing fails
            text = re.sub(r"<[^>]+>", " ", html_content or "")
            low = text.lower()
            for kw in COPY_HARD_FAIL_KEYWORDS:
                if kw in low:
                    return {"passed": False, "reason": f"Disallowed copy keyword detected in HTML: '{kw}'"}
            for kw in PRICE_KEYWORDS:
                if kw in low:
                    return {"passed": False, "reason": f"Price/discount copy detected in HTML: '{kw}'"}
            return None

        details = []

        # Define robust price regex (currencies, plain numbers with currency codes, percents)
        price_regex = re.compile(
            r"(?:£|\$|€|₹)\s?\d{1,3}(?:[,\d{3}])*(?:\.\d{1,2})?|"      # £1,234.56 or $12.99
            r"\d{1,3}(?:[,\d{3}])*(?:\.\d{1,2})?\s?(?:GBP|USD|EUR|INR)\b|" # 12.99 GBP
            r"\d{1,3}%\b|"                                              # 20%
            r"\b(?:was|now|save|off)\s+\d{1,3}",                        # "save 20" heuristics
            re.IGNORECASE
        )

        # Allowed containers (if price found inside any of these ancestors, consider it allowed)
        ALLOWED_VALUE_TILE_CLASSES = {"value-tile", "clubcard-side", "offer-side", "value-price", "clubcard", "price-tile", "white-tile"}
        def is_within_allowed_tile(node):
            # node may be NavigableString or Tag; get parent tag
            parent = node.parent if hasattr(node, "parent") else None
            while parent and parent.name != "[document]":
                # check class attributes
                cls = parent.get("class") or []
                if any(c in ALLOWED_VALUE_TILE_CLASSES for c in cls):
                    return True
                # also check common id names
                pid = parent.get("id") or ""
                if pid and any(s in pid for s in ["value-tile", "clubcard", "price", "offer"]):
                    return True
                parent = parent.parent
            return False

        # 1) Check for copy hard-fails outside of value-tiles (ignore content inside value-tile)
        page_text_nodes = soup.find_all(string=True)
        page_text_outside_tiles = []
        for t in page_text_nodes:
            if not t.strip():
                continue
            # skip script/style/comments
            if t.parent.name in ("script", "style"):
                continue
            if not is_within_allowed_tile(t):
                page_text_outside_tiles.append(t)

        outside_text = " ".join([t.strip() for t in page_text_outside_tiles]).lower()
        for kw in COPY_HARD_FAIL_KEYWORDS:
            if kw in outside_text:
                return {"passed": False, "reason": f"Disallowed copy keyword detected outside value-tile: '{kw}'"}

        # 2) Price detection: find any text node matching price_regex that is NOT inside an allowed tile -> FAIL
        for t in page_text_nodes:
            if not t.strip():
                continue
            if t.parent.name in ("script", "style"):
                continue
            txt = t.strip()
            m = price_regex.search(txt)
            if m:
                if not is_within_allowed_tile(t):
                    # Return the offending snippet and a hint about where it was found
                    parent = t.parent
                    # build a selector-like hint
                    selector_hint = parent.name
                    cls = parent.get("class")
                    if cls:
                        selector_hint += "." + ".".join(cls)
                    idv = parent.get("id")
                    if idv:
                        selector_hint += f"#{idv}"
                    return {
                        "passed": False,
                        "reason": "Price/discount copy detected outside allowed value-tile",
                        "details": [
                            {"rule": "Price text", "result": "fail",
                            "explain": f"Found price-like token '{m.group(0)}' in element <{selector_hint}> with text '{txt[:80]}'"}
                        ]
                    }
                else:
                    # price inside allowed tile -> record a pass detail (optional)
                    details.append({"rule": "Price text", "result": "pass",
                                    "explain": f"Found price inside allowed tile: '{txt[:80]}'"})

        # No quick-fail found
        if details:
            return {"passed": True, "reason": "OK (fast-checks)", "details": details}
        return None

    def check_html(self, html_content: str, objects: List[Dict[str,Any]] = None, assets: Dict[str,Any] = None, timeout_s: int = 20) -> Dict[str,Any]:
        """
        Main entry point:
        - html_content: final poster HTML (string)
        - objects: detected product objects (list of dicts with 'label' and optional 'bbox')
        - assets: additional metadata (brand, user_inputs, format) that can help compliance checks
        Returns a dict:
        {
          "passed": bool,
          "reason": "text explanation",
          "details": {...}   # optional structured reasons from Gemini
        }
        """

        objects = objects or []
        assets = assets or {}

        # 1) quick local checks to fail-fast on obvious infractions
        local = self._simple_local_check(html_content, objects, assets)
        if local is not None:
            return local

        # 2) Compose a deterministic prompt for Gemini using the official TRM rules
        # Note: rules come from your uploaded TRM Hackathon doc (Appendix A & B). Use them in the prompt. :contentReference[oaicite:1]{index=1}
        detected_objects_text = "\n".join([f"- {o.get('label','').strip()}" for o in objects]) or "- (none detected)"
        user_inputs_text = json.dumps(assets.get("user_inputs", {}))
        format_text = json.dumps(assets.get("format", {}))

        rules_summary = """
        APPLY THE FOLLOWING RULES (STRICT):
        1) Alcohol: If alcohol appears in imagery (bottles/labels) the poster MUST include a Drinkaware lock-up in either pure black or pure white and minimum 20px height (SAYS override 12px). If missing -> BLOCK.
        2) Copy: No T&Cs, competitions, sustainability/green claims, charity claims, money-back guarantees, or any claim language. Any occurrence -> BLOCK.
        3) Price text: Prices are allowed ONLY inside value tiles (Clubcard / White / New). 
        Prices inside headline, subheadline, body copy, description or tags → BLOCK.
        4) Value tile: Allowed types are New, White, Clubcard. Nothing must overlap a value tile. Clubcard tile must be flat style. Wrong size/position -> BLOCK.
        5) Packshots: 1-3 packshots allowed, exactly one must be lead=True. Packshot must be closest to CTA and minimum gap from CTA depends on density. Violations -> BLOCK.
        6) CTA: Must exist, must exceed minimum area, must not be overlapped -> BLOCK.
        7) Safe zone (9:16 / 1080x1920): top 200px and bottom 250px must be free of text, logos or value tiles -> BLOCK.
        8) Accessibility: minimum font sizes per density; contrast ratio WCAG AA (4.5) for text -> BLOCK.
        9) Drinkaware color: must be black or white; if color not pure -> WARN.
        10) Logo: present and not too small -> BLOCK if missing when required.
        11) Pinterest: requires tag -> BLOCK if missing.
        """

        prompt = f"""
        You are a compliance engine for retail media creatives. You will receive:
        1) The final poster HTML (do NOT render, analyze the DOM/inline styles and text).
        2) A list of detected objects from the product image.
        3) Additional metadata (user_inputs, format).

        HTML CONTENT:
        {html_content}

        Detected objects:
        {detected_objects_text}

        User inputs:
        {user_inputs_text}

        Format metadata:
        {format_text}

        RULES TO APPLY:
        {rules_summary}

        TASK:
        1) Analyze the HTML and the detected_objects.
        2) For each rule above, state whether the poster PASSES or FAILS and WHY.
        3) If any hard-fail is present, respond with JSON: {{ "passed": false, "reason": "short reason", "details": [ ... ] }}
        4) If clean, respond with {{ "passed": true, "reason": "OK", "details": [ ... ] }}

        IMPORTANT:
        - Output must be valid JSON (no extra text).
        - Keep "details" an array of objects like {{ "rule": "<rule-name>", "result": "pass|fail|warn", "explain": "..." }}.
        """

        # 3) Call Gemini
        # we send just the prompt (Gemini can also accept images but we rely on objects + html)
        try:
            model = self.gemini.model
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=1.0,
                    top_p=0.95,
                    max_output_tokens=4000,
                )
            )
            text = response.text.strip()

            # 4) Extract JSON from response robustly
            # Try direct load, then fenced block, then first {...}
            try:
                return json.loads(text)
            except Exception:
                # try fenced ```json blocks
                m = re.search(r"```json\s*(\{.*\})\s*```", text, re.S)
                if m:
                    try:
                        return json.loads(m.group(1))
                    except:
                        pass
                # try to find first {...} substring
                stack = []
                start = None
                for i,ch in enumerate(text):
                    if ch == '{':
                        if not stack:
                            start = i
                        stack.append('{')
                    elif ch == '}':
                        if stack:
                            stack.pop()
                            if not stack and start is not None:
                                cand = text[start:i+1]
                                try:
                                    return json.loads(cand)
                                except:
                                    pass
                # fallback parse failed:
                return {"passed": False, "reason": "Gemini returned unparsable response", "raw": text}
        except Exception as e:
            # On any failure calling Gemini, fallback to deterministic local blocking if obvious,
            # otherwise return failure (safe default)
            local = self._simple_local_check(html_content, objects, assets)
            if local:
                return local
            return {"passed": False, "reason": f"Compliance engine failed: {str(e)}"}
