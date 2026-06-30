# AgriNova AI — Fertilizer Prediction Module

Predicts the right fertilizer for a crop based on current soil N-P-K
levels, suggests both a chemical and organic option, and (on request)
calculates the exact quantity (in kg) needed for the farmer's land area.

## What is this, in simple terms?

You give it a crop name and your soil's current N-P-K readings. It tells
you:
1. **What's wrong with your soil** — e.g. "low in Nitrogen," "low in
   Phosphorus and Potassium," "balanced," or "too much fertilizer already"
2. **What fertilizer to use** — one chemical option (e.g. Urea) and one
   organic option (e.g. Vermicompost), so the farmer can choose
3. **How much to use** — if they want exact numbers, it calculates real
   kilograms needed for their actual field size, not just "use more"

This mirrors a two-step flow on purpose: show the recommendation first
(fast, simple), and only calculate exact dosage if the user clicks for it
(since that needs one more input — land area).

## How does it work?

- A model was trained on ~3,300 examples covering 22 crops and 9 possible
  soil conditions (e.g. N-deficient, balanced, NPK-deficient, excess). It
  learned to recognize the *pattern* of a soil reading compared to what
  that specific crop ideally needs — about 90% accurate on test data.
- The dosage math is **not** AI — it's a real agronomic formula:
  `kg of fertilizer needed = (nutrient shortfall × land area) ÷ (% nutrient content of that fertilizer)`
  Every fertilizer bag prints its nutrient %, e.g. Urea = 46% Nitrogen —
  that's the same number used here.

## Files

| File                                  | Purpose                                                          |
|----------------------------------------|-------------------------------------------------------------------|
| `Fertilizer_recommendation.csv`        | Training dataset — 3,300 rows, 22 crops, 9 condition classes    |
| `generate_fertilizer_dataset.py`       | Regenerates the dataset (optional)                               |
| `train_fertilizer_model.py`            | Trains the condition classifier, saves model + encoders         |
| `dosage_calculator.py`                 | Rule-based kg calculator (chemical + organic fertilizers)        |
| `predict_fertilizer.py`                | Main script — run this for predictions                          |
| `fertilizer_model.joblib`              | Trained model (ready to use, no retraining needed)               |
| `fertilizer_label_encoder.joblib`      | Maps condition names <-> internal labels                        |
| `fertilizer_crop_encoder.joblib`       | Maps crop names <-> internal labels                              |
| `fertilizer_scaler.joblib`             | Feature scaler used at prediction time                          |
| `fertilizer_model_report.txt`          | Accuracy + classification report (for your pitch deck)           |

## Quick start

```bash
pip install scikit-learn pandas numpy joblib

# Manual entry
python3 predict_fertilizer.py

# Demo mode (instant, auto-fills a real sample)
python3 predict_fertilizer.py --demo

# With exact dosage for a 2-hectare field
python3 predict_fertilizer.py --demo --dosage 2

# Same, but organic fertilizer dosage instead of chemical
python3 predict_fertilizer.py --demo --dosage 2 --organic
```

## Using it from your dashboard / integrating with crop_recommendation

```python
from predict_fertilizer import predict_fertilizer, get_dosage_for_recommendation

# Step 1: get the recommendation (always shown first)
result = predict_fertilizer(crop="rice", N=40, P=80, K=20)
print(result["condition"])             # e.g. "NK_deficient"
print(result["chemical_fertilizer"])   # e.g. "Urea + MOP combination"
print(result["organic_alternative"])   # e.g. "FYM + Wood Ash"

# Step 2: ONLY if the user clicks "show me exact quantity"
dosage = get_dosage_for_recommendation(result, land_area_ha=2, use_organic=False)
print(dosage["dosage_plan"])
# -> [{'fertilizer': 'Urea', 'total_kg_needed': 173.91, ...}, {...}]
```

**Reusing the crop already predicted by `crop_recommendation`:** since that
module already outputs `result["recommended_crop"]`, just pass that
straight in as the `crop` argument here — no need to ask the farmer to
type the crop name twice.

```python
from predict_crop import predict_crop
from predict_fertilizer import predict_fertilizer

crop_result = predict_crop(N=90, P=42, K=43, temperature=25, humidity=82, ph=6.5, rainfall=210)
fert_result = predict_fertilizer(crop=crop_result["recommended_crop"], N=90, P=42, K=43)
```

## Model details (for pitch / Q&A)

- **Algorithm:** Random Forest Classifier (200 trees), same family as the
  crop recommendation model, for consistency across modules
- **Test accuracy:** ~90% across 9 condition classes
- **Why lower than the 99.5% crop model?** This is a harder problem —
  9 overlapping classes (e.g. "balanced" vs "excess" can be genuinely
  close calls) vs 22 well-separated crop classes. 90% on a 9-class
  agronomic classification problem is a solid, honest number — don't
  inflate this if asked.
- **Why dosage is rule-based, not ML:** dosage is a deterministic formula
  in real agronomy (it's literally printed math on fertilizer packaging),
  not a pattern-recognition problem — using ML here would add complexity
  without improving accuracy, so a transparent formula is the right
  engineering choice. This is a good answer if a judge asks "why not ML
  for everything?"

## Honest note on the dataset

Like the crop recommendation dataset, this was constructed from published
agronomic NPK requirement ranges per crop, with simulated soil readings
covering deficient/balanced/excess scenarios — not scraped from a single
external source. The fertilizer-to-nutrient-% mapping (Urea=46% N, DAP=46%
P, MOP=60% K, etc.) are standard, real, publicly documented values used
in Indian agricultural extension materials.
