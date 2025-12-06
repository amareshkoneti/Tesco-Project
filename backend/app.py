import os
import base64
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from utils.image_processor import ImageProcessor
from utils.gemini_service import GeminiService

load_dotenv()

app = Flask(__name__)

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

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 32 * 1024 * 1024))
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize services
image_processor = ImageProcessor()
gemini_service = GeminiService("AIzaSyBP1VnlSoHZZFulQ8zrhQCzAVDtUMPagpA")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

product_analysis = {}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'gemini_configured': gemini_service.is_configured()
    })

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

        global product_analysis
        product_analysis = analysis

        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-layout', methods=['POST'])
def generate_layout():
    try:
        data = request.json
        image_filename = data.get('image_filename')
        logo_filename = data.get('logo_filename')
        form_data = data.get('form_data', {})
        product_analysis = data.get('product_analysis')
        ratio = data.get('ratio', '1:1')

        # Build URLs
        image_url = f"http://localhost:5000/uploads/{image_filename}" if image_filename else ""
        logo_url = f"http://localhost:5000/uploads/{logo_filename}" if logo_filename else None

        canvas = {'width': 1080, 'height': 1080} if ratio == '1:1' else {'width': 1080, 'height': 1920} if ratio == '9:16' else {'width': 1200, 'height': 628}

        result = gemini_service.generate_layout(
            canvas=canvas,
            form_data=form_data,
            product_analysis=product_analysis,
            has_logo=(logo_filename is not None),
            image_url=image_url,
            logo_url=logo_url
        )

        return jsonify({"success": True, "layout": result})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Serve uploaded files with CORS headers"""
    response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    return response

if __name__ == '__main__':
    print("Starting Flask server...")
    print(f"Gemini API configured: {gemini_service.is_configured()}")
    app.run(debug=True, port=5000, host='0.0.0.0')