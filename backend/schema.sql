-- AI Urban Flood Prediction System Database Schema
-- Compatible with MySQL and PostgreSQL

-- Locations Table
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    elevation DECIMAL(5, 2) NOT NULL,
    drainage_capacity DECIMAL(3, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather Data Table
CREATE TABLE weather_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT,
    temperature DECIMAL(4, 1),
    humidity DECIMAL(4, 1),
    rainfall DECIMAL(5, 1),
    wind_speed DECIMAL(4, 1),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Predictions Table
CREATE TABLE predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT,
    prediction_date DATE NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    risk_score DECIMAL(3, 2) NOT NULL,
    precipitation DECIMAL(5, 1),
    humidity DECIMAL(4, 1),
    wind_speed DECIMAL(4, 1),
    temperature DECIMAL(4, 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Alerts Table
CREATE TABLE alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT,
    message TEXT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Insert Sample Locations
INSERT INTO locations (name, latitude, longitude, elevation, drainage_capacity) VALUES
('Zone A - Downtown', 40.7128, -74.0060, 10.00, 0.70),
('Zone B - Riverside', 40.7580, -73.9855, 5.00, 0.40),
('Zone C - Hills', 40.6782, -73.9442, 50.00, 0.90),
('Zone D - Industrial', 40.7489, -73.9680, 15.00, 0.60),
('Zone E - Suburbs', 40.6892, -74.0445, 25.00, 0.80);

-- Indexes for Performance
CREATE INDEX idx_predictions_date ON predictions(prediction_date);
CREATE INDEX idx_alerts_active ON alerts(is_active);
CREATE INDEX idx_weather_recorded ON weather_data(recorded_at);
