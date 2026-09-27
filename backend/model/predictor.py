import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from backend.config import MODEL_DIR

class FakeReviewPredictor:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.is_loaded = False
        
        try:
            # This attempts to load YOUR locally fine-tuned model
            self.tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
            self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            print(f"Successfully loaded fine-tuned model from {MODEL_DIR}")
        except Exception as e:
            print(f"Warning: Fine-tuned model not found at {MODEL_DIR}. Error: {e}")
            print("The API will run in mock mode until training is complete.")

    def predict(self, text: str):
        if not self.is_loaded:
            # Fallback mock prediction for UI testing before model is trained
            pred = "FAKE" if "perfect" in text.lower() or "!" in text else "GENUINE"
            return pred, 75

        # Preprocess text
        inputs = self.tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            padding=True, 
            max_length=512
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Inference
        with torch.no_grad():
            outputs = self.model(**inputs)
            
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=-1)
        
        # NOTE: This assumes during training we map:
        # 0 -> GENUINE
        # 1 -> FAKE
        # Adjust index mapping if your training script uses the reverse!
        prob_genuine = probs[0][0].item()
        prob_fake = probs[0][1].item()
        
        if prob_fake > prob_genuine:
            return "FAKE", int(prob_fake * 100)
        else:
            return "GENUINE", int(prob_genuine * 100)

# Instantiate a global predictor singleton
predictor = FakeReviewPredictor()
