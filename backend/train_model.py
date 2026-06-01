import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

np.random.seed(42)
n_samples = 5000

data = {
    'rainfall': np.random.uniform(0, 150, n_samples),
    'humidity': np.random.uniform(30, 100, n_samples),
    'wind_speed': np.random.uniform(0, 40, n_samples),
    'elevation': np.random.uniform(0, 100, n_samples),
    'drainage_capacity': np.random.uniform(0.1, 1.0, n_samples),
    'temperature': np.random.uniform(15, 40, n_samples)
}

df = pd.DataFrame(data)

def calculate_flood_risk(row):
    score = 0
    score += (row['rainfall'] / 150) * 0.4
    score += (row['humidity'] / 100) * 0.2
    score -= (row['elevation'] / 100) * 0.2
    score -= (row['drainage_capacity']) * 0.15
    score += ((40 - row['temperature']) / 40) * 0.05
    
    if score < 0.3:
        return 0
    elif score < 0.6:
        return 1
    return 1

df['flood_risk'] = df.apply(calculate_flood_risk, axis=1)

df.to_csv('data/flood_training_data.csv', index=False)
print(f"Dataset created with {len(df)} samples")
print(f"Flood risk distribution:\n{df['flood_risk'].value_counts()}")

X = df[['rainfall', 'humidity', 'wind_speed', 'elevation', 'drainage_capacity', 'temperature']]
y = df['flood_risk']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("\nTraining Random Forest model...")
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {accuracy:.2%}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Low Risk', 'High Risk']))

feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print("\nFeature Importance:")
print(feature_importance)

joblib.dump(model, 'models/flood_model.pkl')
print("\nModel saved to models/flood_model.pkl")
