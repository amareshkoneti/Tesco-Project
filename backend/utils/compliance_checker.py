# utils/compliance_checker.py
# import statements
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

# ComplianceChecker class
class ComplianceChecker:
    def __init__(self, gemini_service: GeminiService = None):
        # If no GeminiService instance is passed, create one (use configured key)
        self.gemini = gemini_service or GeminiService(None)

    # Simple local checks to catch obvious infractions quickly
    def _simple_local_check(self, html_content: str, objects: List[Dict[str,Any]], assets: Dict[str,Any]):
        """
        Improved deterministic checks:
        - Detect restricted object labels (alcohol etc).
        - Detect disallowed copy tokens (global) but ignore text inside allowed tiles.
        - Detect price-like tokens and ensure they appear ONLY inside allowed value-tile elements.
        Returns: None if no quick-fail found, otherwise a dict {passed:False, reason:..., details: [...]}
        """        
        # prepare HTML parsing using BeautifulSoup
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
            r"\d{1,3}\s*%"                                              # 20%
            r"\b(?:was|now|save|off)\s+\d{1,3}"
            r"\b(?:discount|% off|off)\b",                        # "save 20" heuristics
            re.IGNORECASE
        )

        # Allowed containers (if price found inside any of these ancestors, consider it allowed)
        ALLOWED_VALUE_TILE_CLASSES = {
            "value-tile",
            "clubcard-side",
            "clubcard-left",
            "clubcard-right",
            "offer-side",
            "value-price",
            "clubcard",
            "price-tile",
            "white-tile"
        }

        # Helper to check if a node is inside an allowed value-tile container
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

    # Main compliance check method
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

        # 1) First run simple local checks to catch obvious failures quickly
        local = self._simple_local_check(html_content, objects, assets)

        # If local check fails, return immediately
        if local['passed'] is False:
            return local

        # 2) Compose a deterministic prompt for Gemini using the official TRM rules
        detected_objects_text = "\n".join([f"- {o.get('label','').strip()}" for o in objects]) or "- (none detected)"
        user_inputs_text = json.dumps(assets.get("user_inputs", {}))
        format_text = json.dumps(assets.get("format", {}))

        prompt = f"""
            You are a retail media creative compliance engine. You will receive:
            1) Final poster HTML (analyze DOM/inline styles/text; do NOT render)
            2) Detected objects from product image
            3) Metadata (user_inputs, format)

            HTML CONTENT:
            {html_content}

            Detected objects:
            {detected_objects_text}

            User inputs:
            {user_inputs_text}

            Format metadata:
            {format_text}

            --------------------------------
            RULES
            --------------------------------
            1) ALCOHOL / DRINKAWARE
            - Alcohol detected or related beverages present in detected objects → Drinkaware lock-up must be present
            - Missing/invalid → FAIL

            2) PRICE TEXT
            - Currency only in value/clubcard tile;Both ORIGINAL AND OFFER price CAN be PRESENT in value/culbcard tile.
            - No Offers related text (except OFFER PRICE) should be present inside value/clubcard tile. ONLY Currency and Price related text allowed(eg: £4.99, $30).
            - Percentages never allowed in any part of poster
            - Currency outside tile → FAIL

            3) VALUE TILE (DESIGN)
            - Allowed types: New, White, Clubcard
            - No overlap; Clubcard must be flat
            - Wrong type/size/position → FAIL


            4) ACCESSIBILITY
            - Min font sizes: Brand/Checkout double/Social 20px, Checkout single 10px, SAYS 12px
            - WCAG AA contrast (4.5:1)
            - Violations → FAIL

            5) LOGO
            - Must be present where required
            - Missing/invalid → FAIL

            IMPORTANT
            - Treat "% off", "discount", "save", "was/now", "Offer" as PRICE TEXT if anything anything resembling a price (except "Clubcard Prices") is present in headline or subheadline -> Block
            - Ignore HTML tags; check visible text only
            - Ignore fine print at bottom

            TASK
            1) Analyze HTML + detected objects
            2) For each rule, output PASS/FAIL + explanation
            3) Hard-fail → JSON: {{ "passed": false, "reason": "...", "details": [ ... ] }}
            4) Clean → JSON: {{ "passed": true, "reason": "OK", "details": [ ... ] }}

            Output must be valid JSON only; "details" is array of {{ "rule": "<rule-name>", "result": "pass|fail|warn", "explain": "..." }}.
            """


        # 3) Call Gemini
        # we send just the prompt (Gemini can also accept images but we rely on objects + html due to API constraints)
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

            print(text)
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
