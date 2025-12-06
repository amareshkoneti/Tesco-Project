import json
import re
import google.generativeai as genai
from PIL import Image
import os

class GeminiService:
    """Handle all Gemini AI operations"""
    
    def __init__(self, api_key):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        else:
            self.model = None
    
    def is_configured(self):
        """Check if Gemini is properly configured"""
        return self.model is not None
    
    def analyze_product_image(self, image_path):
        """Analyze product image and provide insights"""
        if not self.is_configured():
            return self._fallback_analysis()
        
        try:
            img = Image.open(image_path)
            
            prompt = """Analyze this product image and provide design recommendations in JSON format.

Return ONLY a valid JSON object with this structure:
{
  "product_type": "brief description of the product",
  "dominant_colors": ["#color1", "#color2", "#color3"],
  "background_suggestion": "#hexcolor",
  "style_recommendation": "modern|bold|minimal|vibrant",
  "positioning_advice": "brief advice on how to position this product"
}

Be concise and return only the JSON."""

            response = self.model.generate_content([prompt, img])
            analysis = self._extract_json(response.text)
            
            if analysis:
                return analysis
            else:
                return self._fallback_analysis()
        
        except Exception as e:
            print(f"Gemini analysis error: {str(e)}")
            return self._fallback_analysis()
    
    def generate_layout(self, canvas, form_data, product_analysis=None, has_logo=False, image_url=None, logo_url=None):
        if not self.is_configured():
            return self._fallback_layout(canvas, form_data, has_logo)

        try:
            w, h = canvas['width'], canvas['height']
            prod_type = (product_analysis or {}).get("product_type", "product")
            prod_colors = (product_analysis or {}).get("dominant_colors", ["#000000", "#FFFFFF"])

            prompt = f"""
You are the world's best retail poster designer.

Create a complete, standalone HTML file with inline CSS.

CRITICAL REQUIREMENTS:
- Canvas MUST be EXACTLY {w}px × {h}px (use width:{w}px; height:{h}px;)
- No element should overlap. Maintain at least 40px spacing between elements.
- Maintain a safe zone of 5% around all edges.
- Respect aspect ratio (portrait / landscape / square) and adjust layout automatically.

CONTENT:
- Product: {image_url}
- Logo: {logo_url if has_logo else 'none'}
- Headline: {form_data.get('headline')}
- Subheadline: {form_data.get('subheadline')}
- Price: {form_data.get('price')}
- Offer: {form_data.get('offer')}
- Description: {form_data.get('description')}

DESIGN RULES:
- Use absolute positioning
- Logo should be 20–30% larger than usual. Keep it top-right or top-left without overlap.
- Price badge can be of any shape but must be eye-catching.
- Price badge adjusts automatically to canvas ratio
- Product image should be large, centered, and NEVER overlap with text or badges
- Text must be bold, large, high contrast
- Use Google Fonts (Impact, Bebas Neue, Oswald, Montserrat)
- Add creative shapes if needed but ensure they don't cover text or product
- No elements should overlap each other either text or images
- NEVER repeat the same design - be creative!

**Example Structure:**
```html
<!DOCTYPE html>
<html>
<head>
<style>
body {{
  margin: 0;
  padding: 0;
  width: {w}px;
  height: {h}px;
  overflow: hidden;
  background: {form_data.get('bgColor')};
  position: relative;
}}
/* Your creative styles here */
</style>
</head>
<body>
  <!-- Your creative HTML here -->
</body>
</html>
```

OUTPUT ONLY THE COMPLETE HTML CODE.
Start with <!DOCTYPE html> and end with </html>.
NO markdown, NO explanation, NO json - JUST HTML."""

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=1.2,
                    top_p=0.95,
                    max_output_tokens=4000,
                )
            )

            html = response.text.strip()

            # Clean up markdown artifacts
            html = re.sub(r'^```html\s*', '', html, flags=re.IGNORECASE)
            html = re.sub(r'```\s*$', '', html)
            html = html.strip()

            # Verify it's HTML
            if "<html" in html.lower() or "<!doctype" in html.lower():
                # Ensure dimensions are correct (safety check)
                if f"width: {w}px" not in html or f"height: {h}px" not in html:
                    html = html.replace(
                        "<style>", 
                        f"<style>\nbody {{ margin: 0; padding: 0; width: {w}px; height: {h}px; overflow: hidden; }}\n"
                    )
                return {"type": "html", "content": html}

            # Fallback if Gemini fails
            return self._fallback_layout(canvas, form_data, has_logo)

        except Exception as e:
            print("HTML generation failed:", e)
            import traceback
            traceback.print_exc()
            return self._fallback_layout(canvas, form_data, has_logo)
   
        
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

    
    def _fallback_analysis(self):
        """Return default analysis when Gemini fails"""
        return {
            "product_type": "Product",
            "dominant_colors": ["#FFD700", "#000000", "#8B4513"],
            "background_suggestion": "#87CEEB",
            "style_recommendation": "modern",
            "positioning_advice": "Center the product prominently"
        }
    
    def _fallback_layout(self, canvas, form_data, has_logo=False):
        """Return default layout when Gemini fails"""
        w = canvas['width']
        h = canvas['height']
        
        layout = {
            "background": {
                "type": "solid",
                "colors": [form_data.get('bgColor', '#87CEEB')]
            },
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
                "fontSize": h * 0.065,
                "color": form_data.get('secondaryColor', '#000000'),
                "weight": 900,
                "align": "center"
            },
            "subheadline": {
                "text": form_data.get('subheadline', ''),
                "x": 0.5,
                "y": 0.22,
                "fontSize": h * 0.028,
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
                "fontSize": h * 0.042
            },
            "description": {
                "text": form_data.get('description', ''),
                "x": 0.5,
                "y": 0.88,
                "fontSize": h * 0.022,
                "color": form_data.get('secondaryColor', '#000000') + 'BB',
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