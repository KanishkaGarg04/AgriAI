import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Load dataset
def train_model():
    # Read the CSV file
    df = pd.read_csv('irrigation_data.csv')
    
    print("✅ Dataset loaded successfully!")
    print(df.head())
    
    # Features and target
    X = df[['moisture', 'humidity', 'temp', 'et']]
    y = df['irrigate']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    
    # Train model
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X_train, y_train)
    
    # Save model
    os.makedirs('model', exist_ok=True)
    joblib.dump(model, 'model/irrigation_model.joblib')
    
    # Test accuracy
    accuracy = model.score(X_test, y_test)
    print(f"\n🎉 Model trained successfully!")
    print(f"Accuracy: {accuracy:.2f} ({accuracy*100:.1f}%)")
    
    # Save report
    with open('model_report.txt', 'w') as f:
        f.write(f"Irrigation Advisor Model Report\n")
        f.write(f"Accuracy: {accuracy:.2f}\n")
        f.write(f"Features: moisture, humidity, temp, et\n")
        f.write(f"Total samples: {len(df)}")

    print("📁 Model saved in 'model/irrigation_model.joblib'")

if __name__ == "__main__":
    train_model()