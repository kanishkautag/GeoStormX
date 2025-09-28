#!/usr/bin/env python3
"""
Create dummy ML models for the chatbot backend.
This script creates simple placeholder models that will allow the backend to run.
"""

import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def create_dummy_models():
    """Create dummy models for Kp forecasting."""
    
    print("Creating dummy ML models...")
    
    # Create dummy feature names that match what the backend expects
    feature_names = [
        'SW_Plasma_Speed_km_s', 'SW_Proton_Density_N_cm3', 'Scalar_B_nT', 'BZ_nT_GSM',
        'SW_Plasma_Speed_km_s_3h_mean', 'SW_Proton_Density_N_cm3_3h_mean', 
        'Scalar_B_nT_3h_mean', 'BZ_nT_GSM_3h_mean',
        'SW_Plasma_Speed_km_s_6h_mean', 'SW_Proton_Density_N_cm3_6h_mean',
        'Scalar_B_nT_6h_mean', 'BZ_nT_GSM_6h_mean'
    ]
    
    # Generate dummy training data
    np.random.seed(42)
    n_samples = 1000
    n_features = len(feature_names)
    
    # Create realistic-looking solar wind data
    X = np.random.rand(n_samples, n_features)
    
    # Scale the features to realistic ranges
    X[:, 0] = X[:, 0] * 300 + 300  # Solar wind speed (300-600 km/s)
    X[:, 1] = X[:, 1] * 20 + 5     # Proton density (5-25 cm^-3)
    X[:, 2] = X[:, 2] * 20 + 5     # Scalar B (5-25 nT)
    X[:, 3] = X[:, 3] * 20 - 10    # BZ (-10 to 10 nT)
    
    # Create rolling averages
    for i in range(4):
        X[:, 4 + i] = X[:, i] + np.random.normal(0, 0.1, n_samples)  # 3h mean
        X[:, 8 + i] = X[:, i] + np.random.normal(0, 0.15, n_samples)  # 6h mean
    
    # Generate target Kp values (0-9)
    # Kp depends on solar wind conditions
    kp_base = 2 + 2 * np.tanh((X[:, 0] - 400) / 100)  # Speed effect
    kp_base += 2 * np.tanh(-X[:, 3] / 5)  # BZ effect (negative BZ increases Kp)
    kp_base += np.random.normal(0, 0.5, n_samples)  # Noise
    y = np.clip(kp_base, 0, 9)
    
    # Create and fit the scaler
    scaler = StandardScaler()
    scaler.fit(X)
    
    # Create and train a simple model
    model = RandomForestRegressor(n_estimators=10, random_state=42)
    model.fit(X, y)
    
    # Save the models
    joblib.dump(model, 'enhanced_kp_model.joblib')
    joblib.dump(scaler, 'feature_scaler.joblib')
    
    print("✅ Dummy models created successfully!")
    print(f"   - Model features: {len(feature_names)}")
    print(f"   - Training samples: {n_samples}")
    print(f"   - Model R² score: {model.score(X, y):.3f}")
    
    return model, scaler

if __name__ == "__main__":
    create_dummy_models()
