import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

DATASET_PATH = "/plantvillage dataset/color"
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 10

print("Loading dataset...")

train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True
)

train_generator = train_datagen.flow_from_directory(
    DATASET_PATH,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training"
)

val_generator = train_datagen.flow_from_directory(
    DATASET_PATH,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation"
)

NUM_CLASSES = len(train_generator.class_indices)

print(f"Classes Found: {NUM_CLASSES}")

# Save class names
import json

os.makedirs("../models", exist_ok=True)

with open("../models/class_names.json", "w") as f:
    json.dump(
        list(train_generator.class_indices.keys()),
        f,
        indent=4
    )

# Model
base_model = EfficientNetB0(
    weights="imagenet",
    include_top=False,
    input_shape=(224, 224, 3)
)

base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(256, activation="relu"),
    layers.Dense(NUM_CLASSES, activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

print("Training started...")

history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS
)

# Save model
model.save("../models/crop_disease_model.keras")

print("Model saved successfully!")