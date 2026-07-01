"""
AgriAI — Shared Backend API
"""
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(BASE_DIR, "crop_recommendation"))
sys.path.append(os.path.join(BASE_DIR, "fertilizer_prediction"))
sys.path.append(os.path.join(BASE_DIR, "irrigation_advisor"))

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

# Import existing modules
from predict_crop import predict_crop
from predict_fertilizer import predict_fertilizer, get_dosage_for_recommendation

app = Flask(__name__)
CORS(app)

# ====================== IRRIGATION MODEL ======================
irrigation_model = None
try:
    model_path = os.path.join(BASE_DIR, "irrigation_advisor", "model", "irrigation_model.joblib")
    if os.path.exists(model_path):
        irrigation_model = joblib.load(model_path)
        print("✅ Irrigation Model Loaded Successfully!")
except Exception as e:
    print(f"⚠️ Irrigation model error: {e}")

# ====================== ROUTES ======================

@app.route("/predict", methods=["POST"])
def predict_crop_route():
    data = request.json
    try:
        result = predict_crop(
            N=data["N"], P=data["P"], K=data["K"],
            temperature=data["temperature"], humidity=data["humidity"],
            ph=data["ph"], rainfall=data["rainfall"]
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict-fertilizer", methods=["POST"])
def predict_fertilizer_route():
    data = request.json
    try:
        result = predict_fertilizer(crop=data["crop"], N=data["N"], P=data["P"], K=data["K"])
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/fertilizer-dosage", methods=["POST"])
def fertilizer_dosage_route():
    data = request.json
    try:
        pred = predict_fertilizer(crop=data["crop"], N=data["N"], P=data["P"], K=data["K"])
        dosage = get_dosage_for_recommendation(
            pred, 
            land_area_ha=data["land_area_ha"], 
            use_organic=data.get("use_organic", False)
        )
        return jsonify(dosage)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/irrigation/predict", methods=["POST"])
def predict_irrigation():
    try:
        data = request.get_json(force=True)
        
        moisture = float(data.get('moisture', 40))
        humidity = float(data.get('humidity', 50))
        temp = float(data.get('temp', 28))
        et = float(data.get('et', 4.5))
        crop = data.get('crop', 'general').lower()
        
        # Placeholder for model prediction - ensure 'irrigation_model' is used here
        # prediction = irrigation_model.predict([[moisture, humidity, temp, et]])[0]
        prediction = 1 # Temporary placeholder

        water_need_mm = max(0, int((60 - moisture) * 1.5))
        drip_water_need = round(water_need_mm * 0.90, 1)

        # Advanced Crop & Soil Advice Database
        advice_db = {
            "rice": {"stage": "Vegetative", "tip": "Maintain 2-5 cm water layer", "risk": "Waterlogging high"},
            "maize": {"stage": "Tasseling", "tip": "Critical stage - do not let stress", "risk": "Drought sensitive"},
            "cotton": {"stage": "Flowering", "tip": "Drip at root zone best", "risk": "Low humidity stress"},
        }

        crop_info = advice_db.get(crop, {"stage": "General", "tip": "Monitor closely", "risk": "Normal"})

        if prediction == 1:
            recommendation = "Irrigate Now - Drip Recommended"
            urgency = "High" if moisture < 25 else "Medium"
        else:
            recommendation = "No Irrigation Needed"
            urgency = "Low"

        return jsonify({
            "recommendation": recommendation,
            "water_amount_mm": drip_water_need,
            "traditional_mm": water_need_mm,
            "urgency": urgency,
            "advice": f"{crop_info['tip']}. Apply through drip system for best results.",
            "growth_stage": crop_info['stage'],
            "insights": [
                f"Next irrigation in {2 if urgency == 'Low' else 1} days",
                f"Estimated water saving with drip: {int((water_need_mm - drip_water_need)/water_need_mm*100) if water_need_mm > 0 else 0}%"
            ],
            "practical_tips": [
                "Irrigate early morning (5-8 AM)",
                "Check drip emitters for clogging",
                "Mulch around plants to retain moisture",
                f"Monitor {crop.capitalize()} {crop_info['risk']}"
            ],
            "sustainability_score": 85 if drip_water_need < 30 else 65,
            "moisture": round(moisture, 1),
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)