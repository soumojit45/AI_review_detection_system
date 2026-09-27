import os
import torch
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from training.config import OUTPUT_DIR, MAX_LENGTH
from training.dataset import load_and_split_data

def evaluate_test_set():
    if not os.path.exists(OUTPUT_DIR):
        raise FileNotFoundError(f"Model directory '{OUTPUT_DIR}' not found. Please run train.py first.")

    print(f"Loading fine-tuned model from: {OUTPUT_DIR}")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(OUTPUT_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(OUTPUT_DIR).to(device)
    model.eval()

    # Load the held-out test split
    _, _, test_df = load_and_split_data()
    
    texts = test_df['review'].tolist()
    y_true = test_df['label'].tolist()
    
    print(f"Running evaluation on {len(texts)} test samples...")
    
    y_pred = []
    
    # Predict in batches to prevent memory spikes
    batch_size = 16
    with torch.no_grad():
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            inputs = tokenizer(batch_texts, padding=True, truncation=True, max_length=MAX_LENGTH, return_tensors="pt")
            inputs = {k: v.to(device) for k, v in inputs.items()}
            outputs = model(**inputs)
            preds = torch.argmax(outputs.logits, dim=-1).cpu().numpy()
            y_pred.extend(preds)

    print("
" + "="*50)
    print("         TEST SET EVALUATION RESULTS")
    print("="*50)
    print("
--- Classification Report ---")
    print(classification_report(y_true, y_pred, target_names=["GENUINE (0)", "FAKE (1)"], digits=4))
    
    print("--- Confusion Matrix ---")
    cm = confusion_matrix(y_true, y_pred)
    cm_df = pd.DataFrame(cm, index=["Actual GENUINE", "Actual FAKE"], columns=["Pred GENUINE", "Pred FAKE"])
    print(cm_df)
    print("="*50)

if __name__ == "__main__":
    evaluate_test_set()
