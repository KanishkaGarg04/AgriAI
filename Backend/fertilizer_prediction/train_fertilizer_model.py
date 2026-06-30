"""
Trains a model to classify soil NPK condition (e.g. "N_deficient",
"balanced", "NPK_deficient", etc.) given crop + current N, P, K.

Note on why crop is encoded as input: the same N,P,K reading means
something different for rice (which wants high N) vs grapes (which wants
very high P,K) — so crop type is a required feature, not optional.

Saves:
  - fertilizer_model.joblib
  - fertilizer_label_encoder.joblib   (encodes condition labels)
  - fertilizer_crop_encoder.joblib    (encodes crop name as a feature)
  - fertilizer_scaler.joblib
  - fertilizer_model_report.txt
"""
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

df = pd.read_csv("Fertilizer_recommendation.csv")

crop_encoder = LabelEncoder()
df["crop_encoded"] = crop_encoder.fit_transform(df["crop"])

FEATURES = ["crop_encoded", "N", "P", "K", "ideal_N", "ideal_P", "ideal_K"]
X = df[FEATURES]
y = df["label"]

label_encoder = LabelEncoder()
y_enc = label_encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
model.fit(X_train_scaled, y_train)

y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, target_names=label_encoder.classes_, zero_division=0)

print(f"Test Accuracy: {acc*100:.2f}%\n")
print(report)

with open("fertilizer_model_report.txt", "w") as f:
    f.write("Fertilizer Condition Classifier \u2014 Random Forest\n")
    f.write(f"Test Accuracy: {acc*100:.2f}%\n\n")
    f.write(report)

joblib.dump(model, "fertilizer_model.joblib")
joblib.dump(label_encoder, "fertilizer_label_encoder.joblib")
joblib.dump(crop_encoder, "fertilizer_crop_encoder.joblib")
joblib.dump(scaler, "fertilizer_scaler.joblib")

print("Saved: fertilizer_model.joblib, fertilizer_label_encoder.joblib, fertilizer_crop_encoder.joblib, fertilizer_scaler.joblib")
