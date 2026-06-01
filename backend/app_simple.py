from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)

# Tamil Nadu locations
LOCATIONS = {
    'Chennai - T Nagar': {'elevation': 7, 'drainage': 0.5, 'lat': 13.0418, 'lng': 80.2341},
    'Chennai - Anna Nagar': {'elevation': 10, 'drainage': 0.6, 'lat': 13.0850, 'lng': 80.2101},
    'Chennai - Velachery': {'elevation': 5, 'drainage': 0.4, 'lat': 12.9750, 'lng': 80.2210},
    'Chennai - Adyar': {'elevation': 3, 'drainage': 0.3, 'lat': 13.0067, 'lng': 80.2570},
    'Chennai - Tambaram': {'elevation': 15, 'drainage': 0.7, 'lat': 12.9249, 'lng': 80.1000},
    'Coimbatore': {'elevation': 411, 'drainage': 0.8, 'lat': 11.0168, 'lng': 76.9558},
    'Madurai': {'elevation': 134, 'drainage': 0.7, 'lat': 9.9252, 'lng': 78.1198},
    'Tiruchirappalli': {'elevation': 88, 'drainage': 0.6, 'lat': 10.7905, 'lng': 78.7047},
    'Salem': {'elevation': 278, 'drainage': 0.7, 'lat': 11.6643, 'lng': 78.1460},
    'Tirunelveli': {'elevation': 47, 'drainage': 0.6, 'lat': 8.7139, 'lng': 77.7567}
}

# Storage
alerts = []
prediction_history = []
flood_reports = []

def get_risk_category(score):
    if score < 0.3: return 'Low'
    elif score < 0.5: return 'Medium'
    elif score < 0.7: return 'High'
    return 'Critical'

def analyze_flood_image(image_path):
    try:
        from PIL import Image
        img = Image.open(image_path)
        img = img.resize((224, 224))
        img_array = np.array(img)
        
        if len(img_array.shape) == 3:
            blue_ratio = np.mean(img_array[:, :, 2]) / 255.0
            green_ratio = np.mean(img_array[:, :, 1]) / 255.0
            water_score = (blue_ratio + green_ratio) / 2.0
            contrast = np.std(img_array) / 255.0
            confidence = (water_score * 0.6 + (1 - contrast) * 0.4)
            confidence = min(1.0, max(0.0, confidence + np.random.uniform(-0.2, 0.2)))
            return confidence
        return 0.5
    except Exception as e:
        print(f"Image analysis error: {e}")
        return 0.5

@app.route('/weather-data', methods=['GET'])
def get_weather_data():
    return jsonify({
        'temperature': round(np.random.uniform(20, 35), 1),
        'humidity': round(np.random.uniform(40, 90), 1),
        'rainfall': round(np.random.uniform(0, 50), 1),
        'windSpeed': round(np.random.uniform(5, 25), 1),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict-flood', methods=['POST'])
def predict_flood():
    data = request.json
    location = data.get('location', 'Chennai - T Nagar')
    days = int(data.get('days', 7))
    
    loc_data = LOCATIONS.get(location, LOCATIONS['Chennai - T Nagar'])
    predictions = []
    
    for i in range(days):
        date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
        rainfall = np.random.uniform(0, 100)
        humidity = np.random.uniform(40, 95)
        wind_speed = np.random.uniform(5, 30)
        temperature = np.random.uniform(20, 38)
        
        risk_score = (rainfall * 0.4 + humidity * 0.3 - loc_data['elevation'] * 0.01 - loc_data['drainage'] * 0.2) / 100
        risk_score = max(0, min(1, risk_score))
        
        predictions.append({
            'date': date,
            'riskLevel': get_risk_category(risk_score),
            'riskScore': round(risk_score, 2),
            'precipitation': round(rainfall, 1),
            'humidity': round(humidity, 1),
            'windSpeed': round(wind_speed, 1),
            'temperature': round(temperature, 1)
        })
    
    return jsonify({'predictions': predictions, 'location': location, 'emailSent': False})

@app.route('/alerts', methods=['GET'])
def get_alerts():
    return jsonify(alerts[-10:])

@app.route('/history', methods=['GET'])
def get_history():
    return jsonify(prediction_history[-20:])

@app.route('/locations', methods=['GET'])
def get_locations():
    return jsonify(list(LOCATIONS.keys()))

@app.route('/map-data', methods=['GET'])
def get_map_data():
    zones = []
    for name, data in LOCATIONS.items():
        risk_score = np.random.uniform(0, 1)
        risk_level = 'low' if risk_score < 0.3 else 'medium' if risk_score < 0.7 else 'high'
        zones.append({
            'name': name,
            'lat': data['lat'],
            'lng': data['lng'],
            'risk': risk_level,
            'score': round(risk_score, 2)
        })
    return jsonify(zones)

@app.route('/verify-flood-image', methods=['POST'])
def verify_flood_image():
    try:
        print("=== Received flood report ===")
        latitude = float(request.form.get('latitude'))
        longitude = float(request.form.get('longitude'))
        severity = request.form.get('severity', 'Medium')
        print(f"Location: {latitude}, {longitude}")
        print(f"Severity: {severity}")
        
        image_file = request.files.get('image')
        verified = False
        confidence = 0.0
        image_analyzed = False
        image_url = None
        
        if image_file:
            print(f"Image received: {image_file.filename}")
            import uuid
            filename = f"{uuid.uuid4()}.jpg"
            os.makedirs('uploads', exist_ok=True)
            image_path = os.path.join('uploads', filename)
            image_file.save(image_path)
            image_url = image_path
            print(f"Image saved to: {image_path}")
            
            confidence = analyze_flood_image(image_path)
            image_analyzed = True
            verified = confidence > 0.6
            print(f"AI Analysis - Confidence: {confidence}, Verified: {verified}")
        else:
            print("No image provided")
        
        # Find nearest location
        nearest_location = 'Unknown'
        min_distance = float('inf')
        for loc_name, loc_data in LOCATIONS.items():
            distance = ((loc_data['lat'] - latitude)**2 + (loc_data['lng'] - longitude)**2)**0.5
            if distance < min_distance:
                min_distance = distance
                nearest_location = loc_name
        
        report = {
            'id': len(flood_reports) + 1,
            'latitude': latitude,
            'longitude': longitude,
            'location': nearest_location,
            'severity': severity,
            'verified': verified,
            'confidence': round(confidence, 2),
            'image_url': image_url,
            'image_analyzed': image_analyzed,
            'status': 'AI-Confirmed' if verified else 'Unverified' if image_analyzed else 'No Image',
            'timestamp': datetime.now().isoformat(),
            'marker_type': 'red' if verified else 'orange' if image_analyzed else 'yellow'
        }
        
        flood_reports.append(report)
        print(f"Report created: ID={report['id']}, Status={report['status']}")
        print("=== Report successful ===")
        
        return jsonify(report)
    
    except Exception as e:
        print(f"ERROR in verify_flood_image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/flood-reports', methods=['GET'])
def get_flood_reports():
    return jsonify(flood_reports)

@app.route('/verified-reports', methods=['GET'])
def get_verified_reports():
    return jsonify([r for r in flood_reports if r['verified']])

if __name__ == '__main__':
    print("=" * 50)
    print("Starting Flask Backend Server")
    print("=" * 50)
    print("Available endpoints:")
    print("  GET  /weather-data")
    print("  POST /predict-flood")
    print("  GET  /alerts")
    print("  GET  /history")
    print("  GET  /locations")
    print("  GET  /map-data")
    print("  POST /verify-flood-image  <-- IMAGE UPLOAD")
    print("  GET  /flood-reports")
    print("  GET  /verified-reports")
    print("=" * 50)
    app.run(debug=True, port=5000, host='0.0.0.0')
