"""
AgriAI — Shared Backend API
=============================
Single Flask server exposing all AI feature modules to the frontend.

Folder structure this expects:

    AgriAI/
    ├── Backend/
    │   ├── app.py                      <- this file
    │   ├── crop_recommendation/
    │   │   ├── predict_crop.py
    │   │   └── crop_model.joblib, etc.
    │   └── fertilizer_prediction/
    │       ├── predict_fertilizer.py
    │       ├── dosage_calculator.py
    │       └── fertilizer_model.joblib, etc.
    └── Frontend/

Run with:
    cd Backend
    python app.py

Server runs on http://localhost:5000 (Flask default), same as the
original crop-only app.py.

Routes
------
POST /predict                  -> crop recommendation (unchanged from original app.py)
POST /predict-fertilizer       -> fertilizer recommendation (condition + chemical/organic options)
POST /fertilizer-dosage        -> exact kg dosage, called only when user wants exact quantity
"""
import os
import sys

# Make module folders importable (crop_recommendation/, fertilizer_prediction/),
# which now live INSIDE this same Backend/ folder, not as siblings of it
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(BASE_DIR, "crop_recommendation"))
sys.path.append(os.path.join(BASE_DIR, "fertilizer_prediction"))

from flask import Flask, request, jsonify
from flask_cors import CORS

from predict_crop import predict_crop
from predict_fertilizer import predict_fertilizer, get_dosage_for_recommendation

app = Flask(__name__)
CORS(app)


@app.route("/predict", methods=["POST"])
def predict():
    """Crop recommendation — unchanged from the original standalone app.py."""
    data = request.json
    try:
        result = predict_crop(
            N=data["N"],
            P=data["P"],
            K=data["K"],
            temperature=data["temperature"],
            humidity=data["humidity"],
            ph=data["ph"],
            rainfall=data["rainfall"]
        )
        return jsonify(result)
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {e}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict-fertilizer", methods=["POST"])
def predict_fertilizer_route():
    """
    Fertilizer recommendation — step 1.
    Expects JSON: { "crop": "rice", "N": 40, "P": 80, "K": 20 }
    Returns: condition, chemical fertilizer, organic alternative, nutrient gap.
    Does NOT calculate dosage yet (that's a separate call, see /fertilizer-dosage).
    """
    data = request.json
    try:
        result = predict_fertilizer(
            crop=data["crop"],
            N=data["N"],
            P=data["P"],
            K=data["K"]
        )
        return jsonify(result)
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {e}"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/fertilizer-dosage", methods=["POST"])
def fertilizer_dosage_route():
    """
    Fertilizer dosage — step 2, called only when the user clicks
    "show exact quantity" after seeing the step-1 recommendation.

    Expects JSON:
    {
        "crop": "rice", "N": 40, "P": 80, "K": 20,
        "land_area_ha": 2,
        "use_organic": false
    }

    Frontend should already have the step-1 result, but to keep this
    endpoint independent and stateless, it re-runs predict_fertilizer()
    internally using the same N/P/K — so the frontend only needs to send
    the original soil values plus land area, not the whole step-1 response.
    """
    data = request.json
    try:
        prediction_result = predict_fertilizer(
            crop=data["crop"],
            N=data["N"],
            P=data["P"],
            K=data["K"]
        )
        dosage = get_dosage_for_recommendation(
            prediction_result,
            land_area_ha=data["land_area_ha"],
            use_organic=data.get("use_organic", False)
        )
        return jsonify(dosage)
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {e}"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)