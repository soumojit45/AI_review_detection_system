import os
import torch

# Base project paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Dataset paths
DEFAULT_DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "cleaned_reviews.csv")
DATA_PATH = os.environ.get("DATA_PATH", DEFAULT_DATA_PATH)

# Function to dynamically resolve dataset path if default doesn't exist
def get_resolved_data_path():
    if os.path.exists(DATA_PATH):
        return DATA_PATH
    
    # Check alternate common locations
    candidates = [
        os.path.join(BASE_DIR, "data", "processed", "clean_reviews.csv"),
        os.path.join(BASE_DIR, "data", "processed", "cleaned_reviews.csv"),
        os.path.join(BASE_DIR, "data", "clean_reviews.csv"),
        os.path.join(BASE_DIR, "data", "cleaned_reviews.csv"),
        os.path.join(BASE_DIR, "data", "processed_data.csv"),
        os.path.join(BASE_DIR, "data", "reviews.csv"),
        os.path.join(BASE_DIR, "sampleTest.csv"),
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate
            
    # Check any csv in data/processed or data/
    for folder in [os.path.join(BASE_DIR, "data", "processed"), os.path.join(BASE_DIR, "data")]:
        if os.path.isdir(folder):
            csvs = [os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".csv")]
            if csvs:
                return csvs[0]

    return DATA_PATH

# Output model directory
OUTPUT_DIR = os.path.join(BASE_DIR, "models", "fake_review_distilbert")

# Training hyperparameters (Optimized for RTX 2050 4GB VRAM)
MODEL_CHECKPOINT = "distilbert-base-uncased"
MAX_LENGTH = 256          # Truncate at 256 tokens to prevent CUDA Out-Of-Memory on 4GB VRAM
BATCH_SIZE = 8            # Conservative batch size for RTX 2050
EPOCHS = 3                # 3-4 epochs is standard for fine-tuning DistilBERT
LEARNING_RATE = 2e-5      # Standard AdamW learning rate for transformers
WEIGHT_DECAY = 0.01

# Hardware setup
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
USE_FP16 = torch.cuda.is_available()  # Enable mixed precision training if GPU is available
