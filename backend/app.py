# Import statements
import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from utils.image_processor import ImageProcessor
from utils.gemini_service import GeminiService
from utils.compliance_checker import ComplianceChecker
from utils.palette_db import init_palette_db
from utils.palette_routes import palette_bp
from utils.palette_db import get_db

# Load environment variables
load_dotenv()

app = Flask(__name__)
init_palette_db()


# CORS configuration - allow React frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    },
    r"/uploads/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET"],
        "allow_headers": ["Content-Type"]
    }
})

# Register blueprint for palette routes
app.register_blueprint(palette_bp)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 32 * 1024 * 1024))
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp','jfif'}

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize services
image_processor = ImageProcessor()
gemini_service = GeminiService(os.getenv('GEMINI_API_KEY')) # Replace with your actual API key

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'gemini_configured': gemini_service.is_configured()
    })

# Image upload endpoint
@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Handle image upload and background removal"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file'}), 400
        
        # Save original image
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = secure_filename(f"{timestamp}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        print(f"Image saved: {filepath}")
        
        # Remove background
        nobg_filename = f"{timestamp}_nobg.png"
        nobg_path = os.path.join(app.config['UPLOAD_FOLDER'], nobg_filename)
        success = image_processor.remove_background(filepath, nobg_path)
        
        print(f"Background removal {'succeeded' if success else 'failed'}: {nobg_path}")
        
        # Get image info
        image_info = image_processor.get_image_info(nobg_path)
        
        return jsonify({
            'success': True,
            'original_filename': filename,
            'nobg_filename': nobg_filename,
            'image_info': image_info
        })
    
    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Background Image upload endpoint
@app.route('/api/upload-bg', methods=['POST'])
def upload_bg():
    """Handle image upload and background removal"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file'}), 400
        
        # Save original image
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = secure_filename(f"{timestamp}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        print(f"Image saved: {filepath}")
                
        # Get image info
        image_info = image_processor.get_image_info(filepath)
        
        return jsonify({
            'success': True,
            'original_filename': filename,
            'nobg_filename': filename,
            'image_info': image_info
        })
    
    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    

# Logo upload endpoint with background removal
@app.route('/api/upload-logo', methods=['POST'])
def upload_logo():
    """Handle brand logo upload and background removal"""
    try:
        if 'logo' not in request.files:
            return jsonify({'error': 'No logo provided'}), 400
        
        file = request.files['logo']
        
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file'}), 400
        
        # Save original logo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        original_filename = secure_filename(f"{timestamp}_logo_{file.filename}")
        original_filepath = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)
        file.save(original_filepath)
        
        print(f"Logo saved: {original_filepath}")
        
        # Remove background from logo
        nobg_filename = f"{timestamp}_logo_nobg.png"
        nobg_path = os.path.join(app.config['UPLOAD_FOLDER'], nobg_filename)
        success = image_processor.remove_background(original_filepath, nobg_path)
        
        print(f"Logo background removal {'succeeded' if success else 'failed'}: {nobg_path}")
        
        # Get image info
        image_info = image_processor.get_image_info(nobg_path)
        
        return jsonify({
            'success': True,
            'original_filename': original_filename,
            'nobg_filename': nobg_filename,
            'filename': nobg_filename,  # For backward compatibility
            'image_info': image_info
        })
    
    except Exception as e:
        print(f"Logo upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    

# Image analysis endpoint returning product analysis using Gemini    
@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """Use Gemini to analyze product image"""
    try:
        data = request.json
        image_filename = data.get('image_filename')
        
        if not image_filename:
            return jsonify({'error': 'No image filename provided'}), 400
        
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 404
        
        # Analyze with Gemini
        analysis = gemini_service.analyze_product_image(image_path)

        print(f"Analysis result: {analysis}")
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Main layout generation endpoint
@app.route('/api/generate-layout', methods=['POST'])
def generate_layout():
    try:
        data = request.json or {}
        image_filename = data.get('image_filename')
        logo_filename = data.get('logo_filename')
        product_analysis = data.get('product_analysis')

        # Build URLs for images
        image_url = f"http://localhost:5000/uploads/{image_filename}" if image_filename else ""
        logo_url = f"http://localhost:5000/uploads/{logo_filename}" if logo_filename else None

        background_image_filename = (
            data.get('backgroundImage')
        )

        background_image_url = f"http://localhost:5000/uploads/{background_image_filename}" \
            if background_image_filename else None

        print("Background filename:", background_image_filename)        # ← debug
        print("Background URL:", background_image_url)    
        
        # Save colour palette to DB with usage count
        conn = get_db()
        conn.execute("""
            INSERT INTO color_palettes
            (primary_color, secondary_color, accent_color, bg_color, usage_count)
            VALUES (?, ?, ?, ?, 1)
            ON CONFLICT(primary_color, secondary_color, accent_color, bg_color)
            DO UPDATE SET usage_count = usage_count + 1
        """, (
            data.get("primaryColor"),
            data.get("secondaryColor"),
            data.get("accentColor"),
            data.get("bgColor")
        ))
        conn.commit()
        conn.close()
        print("Saved Colour Palette.")   
        
        # Canvas sizes for different format ratios
        canvas_1 = {'width': 1080, 'height': 1080} 
        canvas_2 = {'width': 1080, 'height': 1920}
        canvas_3 = {'width': 1200, 'height': 628}

        print("generating layout with canvas size:", canvas_1)

        # Generating layout for canvas 1 using Gemini
        layout_1= gemini_service.generate_layout(
            canvas=canvas_1,
            form_data=data,
            has_logo=(logo_filename is not None),
            image_url=image_url,
            logo_url=logo_url,
            background_image_url=background_image_url,
            objects = product_analysis.get("objects", [])
        )        
        print("Layout 1 generated: ", layout_1)

        # Compliance checking for rules mentioned in Appendix A and B
        checker = ComplianceChecker(gemini_service)   # pass your gemini instance so it uses the configured key

       
        compliance_report = checker.check_html(
            html_content = layout_1['content'],                         # HTML string returned by Gemini layout
            objects = product_analysis.get("objects", []),                      # product detection objects
            assets = {
                "user_inputs": data,
                "format": {"width": canvas_1["width"], "height": canvas_1["height"]}
            }
        )

        print("Compliance check", compliance_report)

        # If compliance fails after 1st layout, return error without generating other layouts
        if not compliance_report.get("passed", False):
           
            return jsonify({
                "success": False,
                "error": "Poster failed compliance rules",
                "compliance": compliance_report
            }), 400
        

        print("generating layout with canvas size:", canvas_2)

        layout_2 = gemini_service.generate_layout(
            canvas=canvas_2,
            form_data=data,
            has_logo=(logo_filename is not None),
            image_url=image_url,
            logo_url=logo_url,
            background_image_url=background_image_url,
            objects = product_analysis.get("objects", [])
        )

        print("generating layout with canvas size:", canvas_3)

        layout_3 = gemini_service.generate_layout(
            canvas=canvas_3,
            form_data=data,
            has_logo=(logo_filename is not None),
            image_url=image_url,
            logo_url=logo_url,
            background_image_url=background_image_url,
            objects = product_analysis.get("objects", [])
        )

        return jsonify({"success": True, "layout_1": layout_1, "layout_2": layout_2, "layout_3": layout_3})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
# Endpoint to serve uploaded files with CORS headers
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Serve uploaded files with CORS headers"""
    response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    return response

# Run the Flask app
if __name__ == '__main__':
    print("Starting Flask server...")
    print(f"Gemini API configured: {gemini_service.is_configured()}")
    app.run(debug=True, port=5000, host='0.0.0.0')