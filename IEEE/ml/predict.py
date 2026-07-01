import tensorflow as tf
import numpy as np
from PIL import Image
import json
import os

# Load Model
model = tf.keras.models.load_model(
    "/models/crop_disease_model.keras"
)

# Load Class Names
with open("../models/class_names.json", "r") as f:
    class_names = json.load(f)

def predict_image(image_path):

    # Open Image
    image = Image.open(image_path)

    # Convert to RGB
    image = image.convert("RGB")

    # Resize
    image = image.resize((224, 224))

    # Convert to Array
    img_array = np.array(image) / 255.0

    # Add Batch Dimension
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    predictions = model.predict(img_array)

    class_index = np.argmax(predictions)

    disease = class_names[class_index]

    confidence = float(
        np.max(predictions) * 100
    )

    return disease, confidence


# Test Image
TEST_IMAGE = "../test_images/test.jpg"

if os.path.exists(TEST_IMAGE):

    disease, confidence = predict_image(
        TEST_IMAGE
    )

    print("\nPrediction Result")
    print("------------------")
    print("Disease :", disease)
    print(
        "Confidence :",
        round(confidence, 2),
        "%"
    )

else:
    print(
        "Test image not found:",
        TEST_IMAGE
    )