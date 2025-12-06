import os
from PIL import Image
from rembg import remove
import io

class ImageProcessor:
    """Handle image processing operations"""
    
    def remove_background(self, input_path, output_path):
        """Remove background from image using rembg"""
        try:
            # Open image
            with open(input_path, 'rb') as i:
                input_data = i.read()
            
            # Remove background
            output_data = remove(input_data)
            
            # Save result
            with open(output_path, 'wb') as o:
                o.write(output_data)
            
            return True
        except Exception as e:
            print(f"Background removal error: {str(e)}")
            # If rembg fails, copy original as fallback
            img = Image.open(input_path)
            img.save(output_path, 'PNG')
            return False
    
    def get_image_info(self, image_path):
        """Get image dimensions and basic info"""
        try:
            img = Image.open(image_path)
            
            # Get bounding box of non-transparent area
            if img.mode == 'RGBA':
                bbox = img.getbbox()
            else:
                bbox = None
            
            info = {
                'width': img.width,
                'height': img.height,
                'mode': img.mode,
                'format': img.format,
                'bbox': bbox
            }
            
            # Calculate suggested scale
            if bbox:
                obj_width = bbox[2] - bbox[0]
                obj_height = bbox[3] - bbox[1]
                obj_size = min(obj_width, obj_height)
                canvas_size = min(img.width, img.height)
                info['suggested_scale'] = round(0.5 * canvas_size / obj_size if obj_size > 0 else 1.0, 2)
            else:
                info['suggested_scale'] = 0.6
            
            return info
        except Exception as e:
            print(f"Get image info error: {str(e)}")
            return {
                'width': 0,
                'height': 0,
                'suggested_scale': 0.6
            }