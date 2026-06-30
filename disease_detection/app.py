from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import os

app = Flask(__name__)
CORS(app)

# Load your model
model = YOLO('best.pt')

# IMPORTANT: Check your terminal after running this. 
# It will print the exact labels your model expects.
print(f"DEBUG: Model classes available: {model.names}")

# Ensure these keys match the output of model.names EXACTLY (case-sensitive)
DISEASE_INFO = {
    "coffees": {
        "cause": "Commonly affected by coffee leaf rust or fungal infections.",
        "solution": "Ensure proper drainage and apply organic fungicides."
    },
    "Blueberrys": {
        "cause": "Fungal or environmental stress affecting fruit.",
        "solution": "Ensure proper soil pH and consistent watering."
    },
    "tea": {
        "cause": "Common in tea leaves due to blight or pest infestation.",
        "solution": "Apply specific organic pesticides."
    }
}

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded', 'status': 'fail'}), 400
    
    file = request.files['file']
    file_path = os.path.join(os.getcwd(), f"temp_{file.filename}")
    file.save(file_path)
    
    try:
        results = model.predict(file_path, conf=0.1)
        
        # Check if detections exist
        if results and len(results[0].boxes) > 0:
            # Get the class ID of the first detection
            cls_id = int(results[0].boxes.cls[0].item())
            class_name = model.names[cls_id]
            
            print(f"DEBUG: Detected class_name: '{class_name}'")
            
            # Use .get() but provide a safe fallback
            info = DISEASE_INFO.get(class_name)
            
            if info:
                response = {
                    'disease': class_name, 
                    'cause': info['cause'],
                    'solution': info['solution'],
                    'status': 'success'
                }
            else:
                # This is likely why it was failing - your DICT key didn't match the model output!
                response = {
                    'error': f"Model detected '{class_name}', but it is not in your DISEASE_INFO dictionary.", 
                    'status': 'fail'
                }
        else:
            response = {'error': 'No disease detected', 'status': 'fail'}
            
    except Exception as e:
        print(f"Error: {e}")
        response = {'error': str(e), 'status': 'error'}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
    
    return jsonify(response)