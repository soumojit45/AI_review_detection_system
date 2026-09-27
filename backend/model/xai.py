def generate_explanation(prediction: str, confidence: int, features: list, tokens: list = None) -> str:
    '''
    Combines the BERT prediction, stylometric features, and extracted salient tokens
    into a scientifically defensible explainable AI (xAI) narrative.
    '''
    base_explanation = f"Our fine-tuned DistilBERT model classified this review as {prediction} with {confidence}% confidence based on contextual transformer embeddings. "
    
    flagged_features = [f["name"].lower() for f in features if f.get("flagged")]
    
    if flagged_features:
        reasons_str = ", ".join(flagged_features)
        base_explanation += f"Linguistic heuristics flagged anomalies in: {reasons_str}. "
    
    if tokens:
        suspicious_words = [t["token"] for t in tokens if t.get("label") == "SUSPICIOUS"]
        genuine_words = [t["token"] for t in tokens if t.get("label") == "GENUINE_INDICATOR"]
        
        if prediction == "FAKE" and suspicious_words:
            unique_words = list(dict.fromkeys(suspicious_words))[:3]
            words_joined = ", ".join([f'"{w}"' for w in unique_words])
            base_explanation += f"Key trigger phrases detected: {words_joined}."
        elif prediction == "GENUINE" and genuine_words:
            unique_words = list(dict.fromkeys(genuine_words))[:3]
            words_joined = ", ".join([f'"{w}"' for w in unique_words])
            base_explanation += f"Authentic indicators observed: {words_joined}."
    
    return base_explanation
