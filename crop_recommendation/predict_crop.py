"""
AgriNova AI — Crop Recommendation Module
==========================================
Predicts the best crop to grow given soil & weather conditions, and gives
a fertilizer suggestion on top of it.

Two ways to run:
  1. Interactive (manual entry):
       python3 predict_crop.py
     -> prompts you for N, P, K, temperature, humidity, ph, rainfall

  2. Auto-fill demo mode (instant, no typing — good for live hackathon demo):
       python3 predict_crop.py --demo
     -> picks a random realistic sample and shows the prediction instantly

  3. Programmatic / from your web dashboard (import this module):
       from predict_crop import predict_crop
       result = predict_crop(N=90, P=40, K=40, temperature=24, humidity=80, ph=6.5, rainfall=200)
"""
import argparse
import random
import joblib
import numpy as np
import pandas as pd
from fertilizer_advisor import recommend_fertilizer

MODEL_PATH = "crop_model.joblib"
ENCODER_PATH = "label_encoder.joblib"
SCALER_PATH = "feature_scaler.joblib"
DATA_PATH = "Crop_recommendation.csv"

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

_model = joblib.load(MODEL_PATH)
_encoder = joblib.load(ENCODER_PATH)
_scaler = joblib.load(SCALER_PATH)


def predict_crop(N, P, K, temperature, humidity, ph, rainfall, top_n=3):
    """
    Returns the top_n predicted crops with confidence scores, plus a
    fertilizer suggestion for the top prediction.
    """
    input_df = pd.DataFrame([[N, P, K, temperature, humidity, ph, rainfall]], columns=FEATURES)
    input_scaled = _scaler.transform(input_df)

    probs = _model.predict_proba(input_scaled)[0]
    top_indices = np.argsort(probs)[::-1][:top_n]

    top_predictions = [
        {"crop": _encoder.inverse_transform([idx])[0], "confidence": round(probs[idx] * 100, 2)}
        for idx in top_indices
    ]

    best_crop = top_predictions[0]["crop"]
    fertilizer_info = recommend_fertilizer({"N": N, "P": P, "K": K}, best_crop, dataset_path=DATA_PATH)

    return {
        "input": {
            "N": N, "P": P, "K": K,
            "temperature": temperature, "humidity": humidity,
            "ph": ph, "rainfall": rainfall
        },
        "top_predictions": top_predictions,
        "recommended_crop": best_crop,
        "confidence": top_predictions[0]["confidence"],
        "fertilizer_advice": fertilizer_info
    }


def print_result(result):
    print("\n" + "=" * 55)
    print("  AgriNova AI — Crop Recommendation Result")
    print("=" * 55)
    print(f"\nInput conditions:")
    for k, v in result["input"].items():
        print(f"   {k:12s}: {v}")

    print(f"\nTop {len(result['top_predictions'])} recommended crops:")
    for i, pred in enumerate(result["top_predictions"], 1):
        marker = "  <-- BEST MATCH" if i == 1 else ""
        print(f"   {i}. {pred['crop']:15s} ({pred['confidence']}% confidence){marker}")

    fert = result["fertilizer_advice"]
    print(f"\nFertilizer advice for {fert['crop']}:")
    print(f"   Ideal N-P-K for this crop : N={fert['ideal_npk']['N']}, P={fert['ideal_npk']['P']}, K={fert['ideal_npk']['K']}")
    print(f"   Your soil N-P-K           : N={fert['user_npk']['N']}, P={fert['user_npk']['P']}, K={fert['user_npk']['K']}")
    for s in fert["suggestions"]:
        print(f"   - {s}")
    print("=" * 55 + "\n")


def get_manual_input():
    print("Enter soil and weather conditions:\n")
    N = float(input("Nitrogen (N) content in soil (kg/ha)         : "))
    P = float(input("Phosphorus (P) content in soil (kg/ha)       : "))
    K = float(input("Potassium (K) content in soil (kg/ha)        : "))
    temperature = float(input("Temperature (°C)                            : "))
    humidity = float(input("Relative humidity (%)                       : "))
    ph = float(input("Soil pH (0-14)                              : "))
    rainfall = float(input("Rainfall (mm)                               : "))
    return dict(N=N, P=P, K=K, temperature=temperature, humidity=humidity, ph=ph, rainfall=rainfall)


def get_autofill_input():
    """Picks a random real sample from the dataset for instant demo purposes."""
    df = pd.read_csv(DATA_PATH)
    sample = df.sample(1).iloc[0]
    print(f"[DEMO MODE] Auto-filled sample (true label was: '{sample['label']}' — let's see if the model agrees)\n")
    return dict(
        N=sample["N"], P=sample["P"], K=sample["K"],
        temperature=sample["temperature"], humidity=sample["humidity"],
        ph=sample["ph"], rainfall=sample["rainfall"]
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriNova AI Crop Recommendation")
    parser.add_argument("--demo", action="store_true", help="Auto-fill a random realistic sample instead of manual entry")
    args = parser.parse_args()

    if args.demo:
        inputs = get_autofill_input()
    else:
        inputs = get_manual_input()

    result = predict_crop(**inputs)
    print_result(result)
