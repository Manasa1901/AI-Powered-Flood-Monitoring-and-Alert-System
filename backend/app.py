from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import joblib
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'models/flood_model.pkl'
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)

# Tamil Nadu locations with real coordinates
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

# Email configuration
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'sender_email': 'your-email@gmail.com',  # Update with your email
    'sender_password': 'your-app-password'    # Update with app password
}

def send_email_alert(recipient_email, location, risk_level, risk_score, predictions):
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'🚨 Flood Alert: {risk_level} Risk in {location}'
        msg['From'] = EMAIL_CONFIG['sender_email']
        msg['To'] = recipient_email
        
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #{'#f44336' if risk_level in ['High', 'Critical'] else '#ff9800'}; text-align: center;">🌊 Flood Risk Alert</h1>
              <div style="background: #{'#ffebee' if risk_level in ['High', 'Critical'] else '#fff3e0'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin: 0; color: #333;">Location: {location}</h2>
                <h3 style="margin: 10px 0; color: #{'#f44336' if risk_level in ['High', 'Critical'] else '#ff9800'};">Risk Level: {risk_level}</h3>
                <p style="font-size: 18px; margin: 10px 0;">Risk Score: {risk_score}</p>
              </div>
              <h3 style="color: #333;">7-Day Forecast:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #2196f3; color: white;">
                  <th style="padding: 10px; text-align: left;">Date</th>
                  <th style="padding: 10px; text-align: left;">Risk</th>
                  <th style="padding: 10px; text-align: left;">Rainfall</th>
                </tr>
        """
        
        for pred in predictions[:7]:
            html += f"""
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px;">{pred['date']}</td>
                  <td style="padding: 10px; color: #{'#f44336' if pred['riskLevel'] in ['High', 'Critical'] else '#4caf50'};">{pred['riskLevel']}</td>
                  <td style="padding: 10px;">{pred['precipitation']} mm</td>
                </tr>
            """
        
        html += """
              </table>
              <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
                <h3 style="color: #1976d2; margin-top: 0;">Safety Recommendations:</h3>
                <ul style="color: #333;">
                  <li>Stay informed about weather updates</li>
                  <li>Keep emergency supplies ready</li>
                  <li>Avoid low-lying areas during heavy rainfall</li>
                  <li>Follow local authority instructions</li>
                </ul>
              </div>
              <p style="text-align: center; color: #666; margin-top: 30px; font-size: 12px;">AI Urban Flood Prediction System - Tamil Nadu</p>
            </div>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html, 'html'))
        
        with smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port']) as server:
            server.starttls()
            server.login(EMAIL_CONFIG['sender_email'], EMAIL_CONFIG['sender_password'])
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

alerts = []
prediction_history = []

def get_risk_category(score):
    if score < 0.3:
        return 'Low'
    elif score < 0.5:
        return 'Medium'
    elif score < 0.7:
        return 'High'
    return 'Critical'

@app.route('/weather-data', methods=['GET'])
def get_weather_data():
    weather = {
        'temperature': round(np.random.uniform(20, 35), 1),
        'humidity': round(np.random.uniform(40, 90), 1),
        'rainfall': round(np.random.uniform(0, 50), 1),
        'windSpeed': round(np.random.uniform(5, 25), 1),
        'timestamp': datetime.now().isoformat()
    }
    return jsonify(weather)

@app.route('/predict-flood', methods=['POST'])
def predict_flood():
    data = request.json
    location = data.get('location', 'Chennai - T Nagar')
    days = int(data.get('days', 7))
    user_email = data.get('email', '')
    
    loc_data = LOCATIONS.get(location, LOCATIONS['Chennai - T Nagar'])
    predictions = []
    
    for i in range(days):
        date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
        
        rainfall = np.random.uniform(0, 100)
        humidity = np.random.uniform(40, 95)
        wind_speed = np.random.uniform(5, 30)
        temperature = np.random.uniform(20, 38)
        
        features = np.array([[rainfall, humidity, wind_speed, loc_data['elevation'], loc_data['drainage'], temperature]])
        
        if model:
            risk_score = model.predict_proba(features)[0][1]
        else:
            risk_score = (rainfall * 0.4 + humidity * 0.3 - loc_data['elevation'] * 0.01 - loc_data['drainage'] * 0.2 + (40 - temperature) * 0.1) / 100
            risk_score = max(0, min(1, risk_score))
        
        risk_level = get_risk_category(risk_score)
        
        prediction = {
            'date': date,
            'riskLevel': risk_level,
            'riskScore': round(risk_score, 2),
            'precipitation': round(rainfall, 1),
            'humidity': round(humidity, 1),
            'windSpeed': round(wind_speed, 1),
            'temperature': round(temperature, 1)
        }
        predictions.append(prediction)
        
        if risk_score >= 0.7:
            alert = {
                'id': len(alerts) + 1,
                'location': location,
                'message': f'High Flood Risk Detected in {location}',
                'riskLevel': risk_level,
                'timestamp': date,
                'severity': 'critical' if risk_score >= 0.85 else 'high'
            }
            alerts.append(alert)
    
    prediction_history.append({
        'location': location,
        'timestamp': datetime.now().isoformat(),
        'predictions': predictions
    })
    
    # Send email if provided and high risk detected
    email_sent = False
    if user_email and predictions and predictions[0]['riskScore'] >= 0.5:
        email_sent = send_email_alert(
            user_email, 
            location, 
            predictions[0]['riskLevel'], 
            predictions[0]['riskScore'], 
            predictions
        )
    
    return jsonify({
        'predictions': predictions, 
        'location': location,
        'emailSent': email_sent
    })

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
        # Calculate current risk for each location
        rainfall = np.random.uniform(0, 100)
        humidity = np.random.uniform(40, 95)
        wind_speed = np.random.uniform(5, 30)
        temperature = np.random.uniform(25, 40)
        
        features = np.array([[rainfall, humidity, wind_speed, data['elevation'], data['drainage'], temperature]])
        
        if model:
            risk_score = model.predict_proba(features)[0][1]
        else:
            risk_score = (rainfall * 0.4 + humidity * 0.3 - data['elevation'] * 0.01 - data['drainage'] * 0.2) / 100
            risk_score = max(0, min(1, risk_score))
        
        risk_level = 'low' if risk_score < 0.3 else 'medium' if risk_score < 0.7 else 'high'
        
        zones.append({
            'name': name,
            'lat': data['lat'],
            'lng': data['lng'],
            'risk': risk_level,
            'score': round(risk_score, 2)
        })
    
    return jsonify(zones)

# Image verification storage
flood_reports = []

def analyze_flood_image(image_path):
    """
    AI-based flood detection using computer vision
    Returns confidence score (0.0 to 1.0)
    """
    try:
        from PIL import Image
        import numpy as np
        
        # Load image
        img = Image.open(image_path)
        img = img.resize((224, 224))
        img_array = np.array(img)
        
        # Simple heuristic-based water detection
        if len(img_array.shape) == 3:
            # Calculate color statistics
            blue_channel = img_array[:, :, 2]
            green_channel = img_array[:, :, 1]
            red_channel = img_array[:, :, 0]
            
            # Water typically has higher blue/green values
            blue_ratio = np.mean(blue_channel) / 255.0
            green_ratio = np.mean(green_channel) / 255.0
            
            # Check for grayish/bluish tones (flood water)
            water_score = (blue_ratio + green_ratio) / 2.0
            
            # Check for low contrast (typical in flooded areas)
            contrast = np.std(img_array) / 255.0
            
            # Combine scores
            confidence = (water_score * 0.6 + (1 - contrast) * 0.4)
            
            # Add randomness for demo (simulate ML model variability)
            confidence = min(1.0, max(0.0, confidence + np.random.uniform(-0.2, 0.2)))
            
            return confidence
        
        return 0.5
    except Exception as e:
        print(f"Image analysis error: {e}")
        return 0.5

@app.route('/verify-flood-image', methods=['POST'])
def verify_flood_image():
    try:
        latitude = float(request.form.get('latitude'))
        longitude = float(request.form.get('longitude'))
        severity = request.form.get('severity', 'Medium')
        
        # Check if image was uploaded
        image_file = request.files.get('image')
        
        verified = False
        confidence = 0.0
        image_analyzed = False
        image_url = None
        
        if image_file:
            # Save image
            import uuid
            filename = f"{uuid.uuid4()}.jpg"
            image_path = os.path.join('uploads', filename)
            os.makedirs('uploads', exist_ok=True)
            image_file.save(image_path)
            image_url = image_path
            
            # AI Image Analysis
            confidence = analyze_flood_image(image_path)
            image_analyzed = True
            verified = confidence > 0.6
        
        # Find nearest location
        nearest_location = None
        min_distance = float('inf')
        for loc_name, loc_data in LOCATIONS.items():
            distance = ((loc_data['lat'] - latitude)**2 + (loc_data['lng'] - longitude)**2)**0.5
            if distance < min_distance:
                min_distance = distance
                nearest_location = loc_name
        
        # Create report
        report = {
            'id': len(flood_reports) + 1,
            'latitude': latitude,
            'longitude': longitude,
            'location': nearest_location or 'Unknown',
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
        
        return jsonify(report)
    except Exception as e:
        print(f"Error in verify_flood_image: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/flood-reports', methods=['GET'])
def get_flood_reports():
    """Get all citizen flood reports"""
    return jsonify(flood_reports)

@app.route('/verified-reports', methods=['GET'])
def get_verified_reports():
    """Get only AI-verified flood reports"""
    verified = [r for r in flood_reports if r['verified']]
    return jsonify(verified)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
