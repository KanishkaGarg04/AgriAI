"""
Simple rule-based fertilizer recommendation, layered on top of the crop
prediction. Compares the user's soil N-P-K against the ideal average
N-P-K for the recommended crop (derived from the training dataset) and
suggests what's deficient or excess.

This is intentionally rule-based (not a separate ML model) since fertilizer
guidance in real agronomy is reference-table-driven, not typically a
classifier problem on these few features. Keeps it explainable for judges.
"""
import os
import pandas as pd

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_DEFAULT_DATA_PATH = os.path.join(_THIS_DIR, "Crop_recommendation.csv")

FERTILIZER_TIPS = {
    "N": {
        "low": "Nitrogen is low. Apply Urea or Ammonium Sulphate to boost leafy growth.",
        "high": "Nitrogen is excess. Reduce nitrogen-based fertilizer to avoid excess vegetative growth and lodging."
    },
    "P": {
        "low": "Phosphorus is low. Apply DAP (Di-Ammonium Phosphate) or Single Super Phosphate to support root and flower development.",
        "high": "Phosphorus is excess. Avoid further phosphate fertilizer; excess P can lock out micronutrients like zinc and iron."
    },
    "K": {
        "low": "Potassium is low. Apply Muriate of Potash (MOP) to improve fruit quality and disease resistance.",
        "high": "Potassium is excess. Reduce potash application; very high K can interfere with magnesium and calcium uptake."
    }
}

def get_ideal_npk(crop_label, dataset_path=_DEFAULT_DATA_PATH):
    """Returns the average N, P, K for a given crop from the training dataset."""
    df = pd.read_csv(dataset_path)
    crop_df = df[df["label"] == crop_label]
    return {
        "N": round(crop_df["N"].mean(), 1),
        "P": round(crop_df["P"].mean(), 1),
        "K": round(crop_df["K"].mean(), 1),
    }

def recommend_fertilizer(user_npk, crop_label, dataset_path=_DEFAULT_DATA_PATH, tolerance=10):
    """
    user_npk: dict with keys N, P, K (the soil values the user entered)
    crop_label: the predicted crop name
    tolerance: percentage tolerance band around the ideal value before
               flagging as low/high
    Returns: dict with ideal values, gaps, and human-readable suggestions.
    """
    ideal = get_ideal_npk(crop_label, dataset_path)
    suggestions = []
    gaps = {}

    for nutrient in ["N", "P", "K"]:
        user_val = user_npk[nutrient]
        ideal_val = ideal[nutrient]
        gap_pct = ((user_val - ideal_val) / ideal_val) * 100 if ideal_val else 0
        gaps[nutrient] = round(gap_pct, 1)

        if gap_pct < -tolerance:
            suggestions.append(FERTILIZER_TIPS[nutrient]["low"])
        elif gap_pct > tolerance:
            suggestions.append(FERTILIZER_TIPS[nutrient]["high"])

    if not suggestions:
        suggestions.append(f"Soil N-P-K levels are well balanced for {crop_label}. No major fertilizer correction needed.")

    return {
        "crop": crop_label,
        "ideal_npk": ideal,
        "user_npk": user_npk,
        "gap_percent": gaps,
        "suggestions": suggestions
    }

if __name__ == "__main__":
    # quick standalone test
    test_result = recommend_fertilizer({"N": 40, "P": 80, "K": 20}, "rice")
    import json
    print(json.dumps(test_result, indent=2))