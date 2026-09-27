from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid
import io
import pandas as pd

from backend.schemas.responses import (
    SingleReviewRequest, SinglePredictionResponse, 
    BatchAnalysisResponse, BatchSummary, BatchReviewItem, 
    LinguisticFeature, SalientToken
)
from backend.model.predictor import predictor
from backend.model.text_features import analyze_linguistics, extract_salient_tokens
from backend.model.xai import generate_explanation

app = FastAPI(title="AI Fake Review Detection API")

# Configure CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict", response_model=SinglePredictionResponse)
async def predict_single(request: SingleReviewRequest):
    # 1. Get DistilBERT prediction
    prediction, confidence = predictor.predict(request.text)
    
    # 2. Extract linguistic features and salient tokens separately
    raw_features = analyze_linguistics(request.text)
    raw_tokens = extract_salient_tokens(request.text)
    
    # 3. Generate combined explanation
    explanation = generate_explanation(prediction, confidence, raw_features, raw_tokens)
    
    # Map raw dictionaries to Pydantic models
    feature_models = [LinguisticFeature(**f) for f in raw_features]
    token_models = [SalientToken(**t) for t in raw_tokens]
    
    return SinglePredictionResponse(
        id=str(uuid.uuid4())[:8],
        text=request.text,
        prediction=prediction,
        confidence=confidence,
        explanation=explanation,
        linguisticFeatures=feature_models,
        salientTokens=token_models,
        analyzedAt=datetime.now().isoformat()
    )

@app.post("/predict-batch", response_model=BatchAnalysisResponse)
async def predict_batch(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # Determine the column containing review text from the uploaded CSV
    # Handles both 'reviewText' and 'review'
    text_col = 'reviewText' if 'reviewText' in df.columns else 'review'
    cat_col = 'category' if 'category' in df.columns else None
    
    items = []
    fake_count = 0
    genuine_count = 0
    total_confidence = 0
    
    for _, row in df.iterrows():
        text = str(row[text_col]) if text_col in df.columns else ""
        if not text.strip():
            continue
            
        category = str(row[cat_col]) if cat_col and pd.notna(row[cat_col]) else "General"
        
        prediction, confidence = predictor.predict(text)
        features = analyze_linguistics(text)
        tokens = extract_salient_tokens(text)
        explanation = generate_explanation(prediction, confidence, features, tokens)
        
        if prediction == "FAKE":
            fake_count += 1
        else:
            genuine_count += 1
            
        total_confidence += confidence
        
        items.append(BatchReviewItem(
            id=str(uuid.uuid4())[:8],
            reviewText=text,
            productCategory=category,
            prediction=prediction,
            confidence=confidence,
            explanation=explanation,
            linguisticFeatures=[LinguisticFeature(**f) for f in features],
            salientTokens=[SalientToken(**t) for t in tokens]
        ))
    
    total = fake_count + genuine_count
    avg_conf = total_confidence / total if total > 0 else 0
    fake_pct = (fake_count / total * 100) if total > 0 else 0

    # Serially interleave as 1- Fake, 2- Genuine in all reviews section
    fake_list = [item for item in items if item.prediction == "FAKE"]
    genuine_list = [item for item in items if item.prediction == "GENUINE"]
    ordered_items = []
    max_len = max(len(fake_list), len(genuine_list))
    serial_idx = 1
    for i in range(max_len):
        if i < len(fake_list):
            f_item = fake_list[i]
            f_item.id = str(serial_idx)
            ordered_items.append(f_item)
            serial_idx += 1
        if i < len(genuine_list):
            g_item = genuine_list[i]
            g_item.id = str(serial_idx)
            ordered_items.append(g_item)
            serial_idx += 1

    final_items = ordered_items if ordered_items else items
    
    summary = BatchSummary(
        totalReviews=total,
        fakeReviews=fake_count,
        genuineReviews=genuine_count,
        fakePercentage=round(fake_pct, 1),
        averageConfidence=round(avg_conf, 1),
        processedAt=datetime.now().isoformat(),
        fileName=file.filename,
        fileSizeBytes=len(contents)
    )
    
    return BatchAnalysisResponse(summary=summary, items=final_items)
