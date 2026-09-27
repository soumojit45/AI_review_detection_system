import os

# Define the absolute path to your future fine-tuned model directory.
# This assumes the 'models' directory is at the root of your project, side-by-side with 'backend'.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models", "fake_review_distilbert")
