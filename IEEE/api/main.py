from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import tensorflow as tf
import numpy as np
from PIL import Image
import json

app = FastAPI()

# Load model
model = tf.keras.models.load_model(
    "/models/crop_disease_model.keras"
)

# Load classes
with open("../models/class_names.json", "r") as f:
    class_names = json.load(f)

templates = Jinja2Templates(directory="../templates")

app.mount(
    "/static",
    StaticFiles(directory="../static"),
    name="static"
)

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    image = Image.open(file.file)

    image = image.convert("RGB")
    image = image.resize((224,224))

    img_array = np.array(image)/255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)

    class_index = np.argmax(predictions)

    disease = class_names[class_index]

    confidence = round(
        float(np.max(predictions))*100,
        2
    )

    health_score = round(confidence)

    return JSONResponse({
        "disease": disease,
        "confidence": confidence,
        "health_score": health_score
    })