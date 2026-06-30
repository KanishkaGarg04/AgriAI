"""
AgriNova AI — Fertilizer Prediction Module
=============================================
Standalone module. Given a crop and current soil N-P-K, predicts:
  1. The soil condition (e.g. "N_deficient", "balanced", "PK_deficient")
  2. The recommended fertilizer (chemical) + organic alternative
  3. (Optional, on request) exact dosage in kg for the farmer's land area

Designed to be reusable from crop_recommendation too — once a crop is
predicted there, this module can be called directly with that crop name.

Usage
-----
CLI (manual entry):
    python3 predict_fertilizer.py

CLI (demo / auto-fill):
    python3 predict_fertilizer.py --demo

Programmatic:
    from predict_fertilizer import predict_fertilizer, get_dosage_for_recommendation

    result = predict_fertilizer(crop="rice", N=40, P=80, K=20)
    print(result["condition"])             # e.g. "N_deficient"
    print(result["chemical_fertilizer"])   # e.g. "Urea"
    print(result["organic_alternative"])   # e.g. "Vermicompost / Farmyard Manure (FYM)"

    # Then, only if the user clicks "show me exact quantity":
    dosage = get_dosage_for_recommendation(result, land_area_ha=2, use_organic=False)
"""
import argparse
import os
import sys
import joblib
import numpy as np
import pandas as pd

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.append(_THIS_DIR)

from dosage_calculator import get_dosage_plan

MODEL_PATH = os.path.join(_THIS_DIR, "fertilizer_model.joblib")
LABEL_ENCODER_PATH = os.path.join(_THIS_DIR, "fertilizer_label_encoder.joblib")
CROP_ENCODER_PATH = os.path.join(_THIS_DIR, "fertilizer_crop_encoder.joblib")
SCALER_PATH = os.path.join(_THIS_DIR, "fertilizer_scaler.joblib")
DATA_PATH = os.path.join(_THIS_DIR, "Fertilizer_recommendation.csv")

FERTILIZER_MAP = {
    "N_deficient":    ("Urea", "Vermicompost / Farmyard Manure (FYM)"),
    "P_deficient":    ("DAP (Di-Ammonium Phosphate)", "Bone Meal / Rock Phosphate"),
    "K_deficient":    ("MOP (Muriate of Potash)", "Wood Ash / Banana Peel Compost"),
    "NP_deficient":   ("Urea + DAP combination", "FYM + Bone Meal"),
    "NK_deficient":   ("Urea + MOP combination", "FYM + Wood Ash"),
    "PK_deficient":   ("DAP + MOP combination", "Bone Meal + Wood Ash"),
    "NPK_deficient":  ("NPK Complex Fertilizer (e.g. 19:19:19)", "Compost + FYM + Biofertilizer"),
    "balanced":       ("Maintenance dose only (light NPK top-up)", "Compost top-dressing"),
    "excess":         ("No fertilizer needed \u2014 reduce future application", "Switch to organic-only for next cycle"),
}

_model = joblib.load(MODEL_PATH)
_label_encoder = joblib.load(LABEL_ENCODER_PATH)
_crop_encoder = joblib.load(CROP_ENCODER_PATH)
_scaler = joblib.load(SCALER_PATH)
_data = pd.read_csv(DATA_PATH)


def _get_ideal_npk(crop):
    crop_rows = _data[_data["crop"] == crop]
    if crop_rows.empty:
        raise ValueError(f"Unknown crop '{crop}'. Known crops: {sorted(_data['crop'].unique())}")
    row = crop_rows.iloc[0]
    return float(row["ideal_N"]), float(row["ideal_P"]), float(row["ideal_K"])


def predict_fertilizer(crop, N, P, K):
    """
    Predicts soil condition + fertilizer recommendation (chemical + organic)
    for a given crop and current soil N, P, K readings.
    """
    crop = crop.lower().strip()
    ideal_n, ideal_p, ideal_k = _get_ideal_npk(crop)

    try:
        crop_encoded = _crop_encoder.transform([crop])[0]
    except ValueError:
        raise ValueError(f"Unknown crop '{crop}'. Known crops: {list(_crop_encoder.classes_)}")

    input_df = pd.DataFrame([[crop_encoded, N, P, K, ideal_n, ideal_p, ideal_k]],
                             columns=["crop_encoded", "N", "P", "K", "ideal_N", "ideal_P", "ideal_K"])
    input_scaled = _scaler.transform(input_df)

    probs = _model.predict_proba(input_scaled)[0]
    pred_idx = np.argmax(probs)
    condition = _label_encoder.inverse_transform([pred_idx])[0]
    confidence = round(probs[pred_idx] * 100, 2)

    chemical, organic = FERTILIZER_MAP.get(condition, ("Unknown", "Unknown"))

    nutrient_gap = {
        "N": round(max(0, ideal_n - N), 2),
        "P": round(max(0, ideal_p - P), 2),
        "K": round(max(0, ideal_k - K), 2),
    }

    return {
        "crop": crop,
        "input_npk": {"N": N, "P": P, "K": K},
        "ideal_npk": {"N": ideal_n, "P": ideal_p, "K": ideal_k},
        "nutrient_gap_kg_per_ha": nutrient_gap,
        "condition": condition,
        "confidence": confidence,
        "chemical_fertilizer": chemical,
        "organic_alternative": organic,
    }


def get_dosage_for_recommendation(prediction_result, land_area_ha, use_organic=False):
    """
    Step 2 — only called if the user explicitly asks "how much exactly?".
    Takes the dict returned by predict_fertilizer() and computes kg needed.

    For "balanced" or "excess" conditions, there's no real fertilizer
    product to dose (the recommendation is "don't add more"), so this
    returns a clean message instead of attempting a dosage calculation.
    """
    condition = prediction_result["condition"]

    if condition in ("balanced", "excess"):
        message = (
            "Soil nutrients are already balanced — only a light maintenance "
            "top-up is needed, no specific dosage required."
            if condition == "balanced" else
            "Soil nutrients are already in excess — no additional fertilizer "
            "needed. Reduce or pause application for the next cycle."
        )
        return {
            "crop": prediction_result["crop"],
            "land_area_ha": land_area_ha,
            "fertilizer_type": "organic" if use_organic else "chemical",
            "dosage_plan": [],
            "note": message
        }

    fertilizer_label = (
        prediction_result["organic_alternative"] if use_organic
        else prediction_result["chemical_fertilizer"]
    )
    gap = prediction_result["nutrient_gap_kg_per_ha"]
    plan = get_dosage_plan(gap, land_area_ha, fertilizer_label, use_organic=use_organic)
    return {
        "crop": prediction_result["crop"],
        "land_area_ha": land_area_ha,
        "fertilizer_type": "organic" if use_organic else "chemical",
        "dosage_plan": plan
    }


def print_result(result, dosage=None):
    print("\n" + "=" * 55)
    print("  AgriNova AI — Fertilizer Recommendation")
    print("=" * 55)
    print(f"\nCrop: {result['crop']}")
    print(f"Current soil N-P-K : N={result['input_npk']['N']}, P={result['input_npk']['P']}, K={result['input_npk']['K']}")
    print(f"Ideal soil N-P-K   : N={result['ideal_npk']['N']}, P={result['ideal_npk']['P']}, K={result['ideal_npk']['K']}")
    print(f"\nDetected condition : {result['condition']} ({result['confidence']}% confidence)")
    print(f"\nRecommended fertilizer (chemical) : {result['chemical_fertilizer']}")
    print(f"Organic alternative                : {result['organic_alternative']}")

    if dosage:
        print(f"\n--- Exact Dosage Plan ({dosage['fertilizer_type']}, {dosage['land_area_ha']} hectares) ---")
        if dosage.get("note"):
            print(f"   {dosage['note']}")
        for item in dosage["dosage_plan"]:
            if "error" in item:
                print(f"   {item['error']}")
                continue
            print(f"   {item['fertilizer']}: {item['total_kg_needed']} kg total for your field")
    print("=" * 55 + "\n")


def get_manual_input():
    print("Enter crop and current soil NPK:\n")
    crop = input("Crop name (e.g. rice, maize, cotton) : ").strip()
    N = float(input("Current Nitrogen (N) in soil (kg/ha) : "))
    P = float(input("Current Phosphorus (P) in soil (kg/ha) : "))
    K = float(input("Current Potassium (K) in soil (kg/ha) : "))
    return crop, N, P, K


def get_autofill_input():
    sample = _data.sample(1).iloc[0]
    print(f"[DEMO MODE] Auto-filled sample for crop '{sample['crop']}' (true condition was: '{sample['label']}')\n")
    return sample["crop"], sample["N"], sample["P"], sample["K"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriNova AI Fertilizer Prediction")
    parser.add_argument("--demo", action="store_true", help="Auto-fill a random sample instead of manual entry")
    parser.add_argument("--dosage", type=float, default=None,
                         help="Also compute exact dosage for this land area in hectares")
    parser.add_argument("--organic", action="store_true", help="Use organic alternative for dosage calculation")
    args = parser.parse_args()

    if args.demo:
        crop, N, P, K = get_autofill_input()
    else:
        crop, N, P, K = get_manual_input()

    result = predict_fertilizer(crop, N, P, K)

    dosage = None
    if args.dosage:
        dosage = get_dosage_for_recommendation(result, land_area_ha=args.dosage, use_organic=args.organic)

    print_result(result, dosage)