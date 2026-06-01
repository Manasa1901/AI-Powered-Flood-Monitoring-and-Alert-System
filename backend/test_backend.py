import requests
import os

# Test backend endpoints
BASE_URL = 'http://localhost:5000'

print("Testing Backend Endpoints...")
print("=" * 50)

# Test 1: Weather data
try:
    response = requests.get(f'{BASE_URL}/weather-data')
    print(f"✅ GET /weather-data: {response.status_code}")
except Exception as e:
    print(f"❌ GET /weather-data: {e}")

# Test 2: Locations
try:
    response = requests.get(f'{BASE_URL}/locations')
    print(f"✅ GET /locations: {response.status_code}")
except Exception as e:
    print(f"❌ GET /locations: {e}")

# Test 3: Map data
try:
    response = requests.get(f'{BASE_URL}/map-data')
    print(f"✅ GET /map-data: {response.status_code}")
except Exception as e:
    print(f"❌ GET /map-data: {e}")

# Test 4: Flood reports
try:
    response = requests.get(f'{BASE_URL}/flood-reports')
    print(f"✅ GET /flood-reports: {response.status_code}")
except Exception as e:
    print(f"❌ GET /flood-reports: {e}")

# Test 5: Verify flood image (without image)
try:
    data = {
        'latitude': '13.0418',
        'longitude': '80.2341',
        'severity': 'Medium'
    }
    response = requests.post(f'{BASE_URL}/verify-flood-image', data=data)
    print(f"✅ POST /verify-flood-image (no image): {response.status_code}")
    if response.status_code == 200:
        print(f"   Response: {response.json()}")
except Exception as e:
    print(f"❌ POST /verify-flood-image: {e}")

print("=" * 50)
print("Backend test complete!")
