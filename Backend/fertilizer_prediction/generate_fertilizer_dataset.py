"""
Generates a fertilizer recommendation dataset.

For each crop, we know its IDEAL N-P-K range (same agronomic profiles used
in the crop_recommendation module). This script simulates many possible
"current soil NPK" scenarios for each crop (some deficient in N, some in P,
some in K, some balanced, some excess) and labels each scenario with the
correct fertilizer recommendation — both a primary chemical fertilizer
name and an organic alternative.

Output: Fertilizer_recommendation.csv
Columns: crop, N, P, K, ideal_N, ideal_P, ideal_K, label
  label = the dominant deficiency/condition class, e.g. "N_deficient",
          "P_deficient", "K_deficient", "NP_deficient", "balanced", etc.
"""
import numpy as np
import pandas as pd

np.random.seed(42)

# Same ideal NPK profiles as crop_recommendation module (kept consistent)
crop_npk_ideal = {
    "rice":        (80, 50, 40),
    "maize":       (80, 48, 20),
    "chickpea":    (45, 68, 85),
    "kidneybeans": (28, 68, 20),
    "pigeonpeas":  (28, 68, 20),
    "mothbeans":   (25, 50, 20),
    "mungbean":    (25, 50, 20),
    "blackgram":   (40, 68, 20),
    "lentil":      (20, 68, 20),
    "pomegranate": (25, 25, 40),
    "banana":      (100, 85, 50),
    "mango":       (25, 28, 30),
    "grapes":      (25, 128, 200),
    "watermelon":  (95, 25, 50),
    "muskmelon":   (95, 25, 50),
    "apple":       (28, 133, 200),
    "orange":      (25, 18, 18),
    "papaya":      (53, 58, 50),
    "coconut":     (25, 18, 30),
    "cotton":      (120, 50, 20),
    "jute":        (80, 50, 40),
    "coffee":      (100, 28, 30),
}

# Fertilizer reference table: condition -> (chemical_fertilizer, organic_alternative)
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

TOLERANCE_PCT = 12  # +/- tolerance band before flagging deficient/excess

def classify_condition(n, p, k, ideal_n, ideal_p, ideal_k, tol=TOLERANCE_PCT):
    def status(val, ideal):
        gap = ((val - ideal) / ideal) * 100
        if gap < -tol:
            return "low"
        elif gap > tol:
            return "high"
        return "ok"

    sN, sP, sK = status(n, ideal_n), status(p, ideal_p), status(k, ideal_k)
    low_set = {x for x, s in zip("NPK", [sN, sP, sK]) if s == "low"}
    high_set = {x for x, s in zip("NPK", [sN, sP, sK]) if s == "high"}

    if len(low_set) == 0 and len(high_set) == 0:
        return "balanced"
    if len(high_set) >= 2 and len(low_set) == 0:
        return "excess"
    if low_set == {"N", "P", "K"}:
        return "NPK_deficient"
    if low_set == {"N", "P"}:
        return "NP_deficient"
    if low_set == {"N", "K"}:
        return "NK_deficient"
    if low_set == {"P", "K"}:
        return "PK_deficient"
    if low_set == {"N"}:
        return "N_deficient"
    if low_set == {"P"}:
        return "P_deficient"
    if low_set == {"K"}:
        return "K_deficient"
    return "balanced"  # fallback (e.g. mixed low/high cancels out)


rows = []
for crop, (ideal_n, ideal_p, ideal_k) in crop_npk_ideal.items():
    for _ in range(150):
        # simulate a realistic range of "current soil" values around the ideal,
        # including deficient, balanced, and excess scenarios
        n = max(0, np.random.normal(ideal_n, ideal_n * 0.35))
        p = max(0, np.random.normal(ideal_p, ideal_p * 0.35))
        k = max(0, np.random.normal(ideal_k, ideal_k * 0.35))

        label = classify_condition(n, p, k, ideal_n, ideal_p, ideal_k)

        rows.append([
            crop, round(n, 2), round(p, 2), round(k, 2),
            ideal_n, ideal_p, ideal_k, label
        ])

df = pd.DataFrame(rows, columns=["crop", "N", "P", "K", "ideal_N", "ideal_P", "ideal_K", "label"])
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df.to_csv("Fertilizer_recommendation.csv", index=False)

print(df.shape)
print(df["label"].value_counts())
