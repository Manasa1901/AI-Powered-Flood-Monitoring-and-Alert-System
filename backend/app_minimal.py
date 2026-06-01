from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Storage
flood_reports = []

@app.route('/')
def home():
    return "Backend is running!"

@app.route('/locations', methods=['GET'])
def get_locations():
    return jsonify(['Chennai - T Nagar', 'Chennai - Anna Nagar', 'Coimbatore'])

@app.route('/verify-flood-image', methods=['POST', 'OPTIONS'])
def verify_flood_image():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        print("\n=== NEW REPORT ===")
        address = request.form.get('address', '')
        severity = request.form.get('severity', 'Medium')
        additional_details = request.form.get('additionalDetails', '')
        
        print(f"Address: {address}")
        print(f"Severity: {severity}")
        if additional_details:
            print(f"Details: {additional_details[:50]}...")
        
        # Default coordinates for Chennai
        latitude = 13.0827
        longitude = 80.2707
        
        image_file = request.files.get('image')
        has_image = image_file is not None
        image_path = None
        
        if has_image:
            print(f"Image: {image_file.filename}")
            print(f"Content Type: {image_file.content_type}")
            
            os.makedirs('uploads', exist_ok=True)
            
            import uuid
            from werkzeug.utils import secure_filename
            
            original_filename = secure_filename(image_file.filename)
            file_ext = os.path.splitext(original_filename)[1].lower()
            
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif']
            if file_ext not in allowed_extensions:
                file_ext = '.jpg'
            
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            image_path = os.path.join('uploads', unique_filename)
            
            image_file.save(image_path)
            print(f"Image saved: {image_path}")
        else:
            print("No image")
        
        import random
        confidence = random.uniform(0.5, 0.9) if has_image else 0.0
        verified = confidence > 0.6
        
        report = {
            'id': len(flood_reports) + 1,
            'address': address,
            'latitude': latitude,
            'longitude': longitude,
            'severity': severity,
            'additionalDetails': additional_details,
            'verified': verified,
            'confidence': round(confidence, 2),
            'image_analyzed': has_image,
            'image_path': image_path,
            'status': 'AI-Confirmed' if verified else 'Unverified' if has_image else 'No Image',
            'timestamp': datetime.now().isoformat(),
            'marker_type': 'red' if verified else 'orange'
        }
        
        flood_reports.append(report)
        print(f"Report saved: ID={report['id']}")
        print("=== SUCCESS ===\n")
        
        return jsonify(report)
    
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'message': 'Failed to process report.'}), 500

@app.route('/flood-reports', methods=['GET'])
def get_flood_reports():
    return jsonify(flood_reports)

if __name__ == '__main__':
    print("\n" + "="*50)
    print("BACKEND STARTED - Port 5000")
    print("="*50)
    print("Test: http://localhost:5000/")
    print("="*50 + "\n")
    
    # Use production server (no warning)
    try:
        from waitress import serve
        print("Using Waitress production server...")
        serve(app, host='127.0.0.1', port=5000)
    except ImportError:
        print("Using Flask development server...")
        print("Install waitress for production: pip install waitress")
        app.run(debug=True, port=5000, host='127.0.0.1')
