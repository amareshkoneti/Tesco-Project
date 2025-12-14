# backend/utils/gemini_service.py
# import necessary libraries
import json
import re
import google.generativeai as genai
from PIL import Image
from typing import List, Dict, Any

# GeminiService class to handle Gemini AI operations
class GeminiService:
    """Handle all Gemini AI operations"""
    
    # Initialize with API key
    def __init__(self, api_key):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-3-27b-it') # default model is gemini-3-27b-it, we can use multimodal models as needed
        else:
            self.model = None
    
    # Check if Gemini is configured
    def is_configured(self):
        """Check if Gemini is properly configured"""
        return self.model is not None
    
    # Analyze product image using Gemini
    def analyze_product_image(self, image_path):
        """Analyze product image and provide insights + objects for compliance using multimodal Gemini"""
        if not self.is_configured():
            return self._fallback_analysis()

        try:
            # Open image with PIL
            img = Image.open(image_path)

            # Prompt instructing Gemini to return only JSON
            prompt = """
            Analyze this product image. Return ONLY a valid JSON object with the following structure:

            {
                "product_type": "brief description of the product",
                "objects": [
                    {
                        "label": "...",      # name of the detected object
                        "confidence": 0.95,  # optional
                        "bbox": [x1, y1, x2, y2]  # optional, from object detection
                    },
                    ...
                ]
            }

            Detect all visible objects including products, packshots, people, bottles, glasses, and logos.
            Be concise and return only JSON.
            """
            self.model = genai.GenerativeModel('gemini-2.5-flash-lite') # multimodal model for image + text analysis
            response = self.model.generate_content(
                [prompt, img],
                generation_config=genai.types.GenerationConfig(
                    temperature=1.0,
                    top_p=0.95,
                    max_output_tokens=4000,
                )
            )

            # Extract JSON from the model's output
            analysis = self._extract_json(response.text)

            # Ensure objects key exists
            if analysis:
                if "objects" not in analysis:
                    analysis["objects"] = []
                return analysis
            # Fallback if no valid JSON
            else:
                print("Gemini returned no valid JSON. Using fallback.")
                return self._fallback_analysis()

        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return self._fallback_analysis()
    
    # Generate layout using Gemini
    def generate_layout(self, canvas, form_data, has_logo=False, image_url=None, logo_url=None, background_image_url=None,objects: List[Dict[str,Any]] = None):
        """
        Generate a layout. If background_image_url is provided, instruct Gemini to use it as the canvas background.
        Otherwise use the background color provided in form_data (bgColor).
        """
        # Check Gemini configuration
        if not self.is_configured():
            return self._fallback_layout(canvas, form_data, has_logo, background_image_url)

        try:

            # Prepare detected objects text
            objects = objects or []
            detected_objects_text = "\n".join([f"- {o.get('label','').strip()}" for o in objects]) or "- (none detected)"

            w, h = canvas['width'], canvas['height']
            print(form_data)
            bg_mode = form_data.get('backgroundMode') or ('image' if background_image_url else 'color')
            bg_color = form_data.get('bgColor', '#FFFFFF')

            # Build explicit instructions for background usage
            if background_image_url:
                bg_instruction = f"Use the following URL as the full-bleed background image: {background_image_url}. " \
                                 "Make sure the product, badges and text are clearly visible on top — add overlays, blur, or gradient if necessary for legibility."
            else:
                bg_instruction = f"Use the selected background color {bg_color} only as the base. Build a visually rich background on top of it using gradients, soft glows, light textures, subtle patterns, watercolor effects, or abstract shapes — but keep the base color visible add some underlayed design. Do NOT use plain flat color."

            print(f"Generating layout with bg_mode: {bg_mode}, bg_instruction: {bg_instruction}")
            print(background_image_url)

            prompt = f""" You are generating Tesco Retail Media banners that MUST pass strict compliance checks. Follow these rules exactly — no exceptions on restricted elements.

                Inputs:
                - Product Image URL: {image_url}
                - Logo URL: {logo_url if has_logo else 'none'}
                - Headline: {form_data.get('headline')}
                - Subheadline: {form_data.get('subheadline')}
                - Regular Price: {form_data.get('price')}
                - Offer (Clubcard price): {form_data.get('offer')}  // if present, trigger Clubcard tile
                - Description/Tag: {form_data.get('description')}
                - Background Instruction: {bg_instruction}
                - Canvas Size: Exactly {w}px × {h}px
                - Detected objects: {detected_objects_text}

                STRICT COMPLIANCE RULES (MUST FOLLOW):
                1. VALUE TILE (CRITICAL):
                - If Offer is provided:
                    - Use the official Clubcard tile, side-by-side style.
                    - Left: Blue rectangle with text "Clubcard Prices"(#457EB2)
                    - Right: Yellow rectangle with Offer price (#ffed21)
                    - both rectangles must occupy full height of tile, no gaps. and both rectangles must be same size.
                    - Regular Price must be included **inside the right rectangle**, smaller
                    - Add Tesco tag: "Available in selected stores. Clubcard/app required. Ends DD/MM"
                - If no Offer:
                    - Use predefined White tile
                    - Only single price editable
                    - Add Tesco tag depending on exclusivity: "Only at Tesco", "Available at Tesco", or "Selected stores. While stocks last"
                    - Place tile strictly at bottom-right, no overlap, clear font.
                2. TESCO TAG (Description field):
                - If Clubcard tile is used: MUST display exactly:
                    "Available in selected stores. Clubcard/app required. Ends 31/01"
                - Otherwise: Use one of: "Only at Tesco", "Available at Tesco", "Selected stores. While stocks last."
                - Place at bottom, clear font, no overlap.

                3. LAYOUT:
                - Headline & Subheadline: Bold, high-contrast, min 20px font (use Google Fonts: Bebas Neue or Montserrat).
                - Packshot: Large central (~60% area), lead product.
                - Logo: Top-right if present, good size, no overlap.
                - For 9:16 formats (1080x1920): Keep top 200px and bottom 250px free of text/logos/value tiles.
                - Background: Follow background instruction creatively (gradients, textures, overlays for legibility) but keep base color/image visible.

                4. ACCESSIBILITY:
                - All text min 20px, high contrast (WCAG AA compliant).
                - No elements overlapping.
                - Size of everything proportional to canvas size and clearly legible.

                5. Drinkaware Lock-up:(MUST FOLLOW)
                - If detected objects include alcohol, alcoholic beverages, or related items, poster MUST include a Drinkaware lock-up.
                - Drinkaware logo is not a image URL, you must generate.
                - Drink-aware look-up should be in pure black or pure white according to back ground colour.
                - Make sure it does not overlap with any other elements and value tile.
                - Place it middle-left or middle-right, size must be 50% of product size.

                ABSOLUTE RESTRICTION (DO NOT VIOLATE):
                ❌ NEVER include prices, numbers, percentages, discounts, currency symbols,
                    or price-like wording in the Headline or Subheadline.

                ❌ Do NOT restate or paraphrase the price or offer in any form.
                ❌ Do NOT use Was/Now even inside the value tile.

                ❌ Even if the user inputs a headline/subheadline containing a price,
                    you MUST REMOVE it and output a safe version WITHOUT any numeric value.


                Forbidden examples:
                - "Only £4.99"
                - "Save 20%"
                - "£3 off"
                - "£2.50 each"

                Be visually creative and attractive within these constraints — enhance background, text styling, spacing, and composition — but never deviate from the predefined Clubcard tile, tag text, or restricted copy.

                Output ONLY a complete standalone HTML file with inline CSS from <!DOCTYPE html> to </html>. Enforce exact canvas size with overflow: hidden.
            """
            
            self.model = genai.GenerativeModel('gemma-3-27b-it')
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=1.0,
                    top_p=0.95,
                    max_output_tokens=4000,
                )
            )

            # Extract HTML from response
            html = response.text.strip()

            # Clean up fenced codeblocks if present
            html = re.sub(r'^```html\s*', '', html, flags=re.IGNORECASE)
            html = re.sub(r'```\s*$', '', html)
            html = html.strip()

            # If model returned HTML, ensure sizes are enforced
            if "<html" in html.lower() or "<!doctype" in html.lower():
                # Safety: ensure width & height exist in style
                if f"width: {w}px" not in html or f"height: {h}px" not in html:
                    html = html.replace(
                        "<style>",
                        f"<style>\nbody {{ margin: 0; padding: 0; width: {w}px; height: {h}px; overflow: hidden; }}\n"
                    )
                return {"type": "html", "content": html}

            # Fallback
            return self._fallback_layout(canvas, form_data, has_logo, background_image_url)

        except Exception as e:
            print("HTML generation failed:", e)
            import traceback
            traceback.print_exc()
            return self._fallback_layout(canvas, form_data, has_logo, background_image_url)

    # Helper to extract JSON robustly 
    def _extract_json(self, text):
        """Robust JSON extraction from Gemini output"""

        if not text:
            return None

        # 1) Try extracting fenced ```json blocks
        fenced = re.findall(r"```json\s*(.*?)```", text, re.DOTALL)
        if fenced:
            for block in fenced:
                try:
                    return json.loads(block)
                except:
                    continue

        # 2) Try extracting FIRST valid {...} JSON object (supports nested braces)
        stack = []
        start = None

        for i, ch in enumerate(text):
            if ch == '{':
                if not stack:
                    start = i
                stack.append(ch)
            elif ch == '}':
                if stack:
                    stack.pop()
                    if not stack and start is not None:
                        candidate = text[start:i+1]
                        try:
                            return json.loads(candidate)
                        except:
                            pass

        # 3) Try parsing raw text directly as JSON
        try:
            return json.loads(text)
        except:
            pass

        return None

    # Fallback analysis when Gemini fails
    def _fallback_analysis(self):
        """Return default analysis when Gemini fails"""
        return {
            "product_type": "Product",
            "dominant_colors": ["#FFD700", "#000000", "#8B4513"],
            "background_suggestion": "#87CEEB",
            "style_recommendation": "modern",
            "positioning_advice": "Center the product prominently"
        }
    
    # Fallback layout when Gemini fails
    def _fallback_layout(self, canvas, form_data, has_logo=False, background_image_url=None):
        """Return default layout when Gemini fails. Supports background image or color."""
        w = canvas['width']
        h = canvas['height']
        
        bg_mode = form_data.get('backgroundMode') or ('image' if background_image_url else 'color')
        bg_color = form_data.get('bgColor', '#87CEEB')

        background = {}
        if background_image_url:
            background = {
                "type": "image",
                "url": background_image_url,
                "stretch": "cover",
                "overlay": "rgba(0,0,0,0.18)"  # subtle overlay for legibility
            }
        else:
            background = {
                "type": "solid",
                "colors": [bg_color]
            }

        layout = {
            "background": background,
            "decorative_elements": [
                {
                    "type": "circle",
                    "x": 0.2,
                    "y": 0.2,
                    "radius": 0.12,
                    "color": form_data.get('primaryColor', '#FFD700'),
                    "opacity": "30"
                }
            ],
            "packshot": {
                "x": 0.5,
                "y": 0.48,
                "scale": 0.55
            },
            "headline": {
                "text": form_data.get('headline', ''),
                "x": 0.5,
                "y": 0.15,
                "fontSize": int(h * 0.065),
                "color": form_data.get('secondaryColor', '#000000'),
                "weight": 900,
                "align": "center"
            },
            "subheadline": {
                "text": form_data.get('subheadline', ''),
                "x": 0.5,
                "y": 0.22,
                "fontSize": int(h * 0.028),
                "color": form_data.get('secondaryColor', '#000000'),
                "weight": 600,
                "align": "center"
            },
            "price_badge": {
                "x": 0.78,
                "y": 0.73,
                "width": 0.22,
                "height": 0.12,
                "bgColor": form_data.get('primaryColor', '#FFD700'),
                "price": form_data.get('price', ''),
                "offer": form_data.get('offer', ''),
                "fontSize": int(h * 0.042)
            },
            "description": {
                "text": form_data.get('description', ''),
                "x": 0.5,
                "y": 0.88,
                "fontSize": int(h * 0.022),
                "color": (form_data.get('secondaryColor', '#000000') + 'BB') if form_data.get('secondaryColor') else '#000000BB',
                "align": "center"
            },
            "new_badge": {
                "enabled": True,
                "x": 0.15,
                "y": 0.15,
                "radius": 0.08,
                "color": form_data.get('accentColor', '#8B4513')
            }
        }
        
        # Add logo positioning if logo exists
        if has_logo:
            layout["logo"] = {
                "x": 0.85,
                "y": 0.92,
                "scale": 0.12
            }
        
        return layout
