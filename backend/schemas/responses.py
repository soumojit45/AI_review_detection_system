from pydantic import BaseModel
from typing import List, Optional

class LinguisticFeature(BaseModel):
    name: str
    score: int
    description: str
    flagged: bool

class SalientToken(BaseModel):
    token: str
    label: str  # 'SUSPICIOUS' | 'GENUINE_INDICATOR'
    category: str
    reason: str

class SingleReviewRequest(BaseModel):
    text: str

class SinglePredictionResponse(BaseModel):
    id: str
    text: str
    prediction: str
    confidence: int
    explanation: str
    linguisticFeatures: List[LinguisticFeature]
    salientTokens: Optional[List[SalientToken]] = []
    analyzedAt: str

class BatchReviewItem(BaseModel):
    id: str
    reviewText: str
    productCategory: Optional[str] = "General"
    prediction: str
    confidence: int
    explanation: str
    linguisticFeatures: Optional[List[LinguisticFeature]] = []
    salientTokens: Optional[List[SalientToken]] = []

class BatchSummary(BaseModel):
    totalReviews: int
    fakeReviews: int
    genuineReviews: int
    fakePercentage: float
    averageConfidence: float
    processedAt: str
    fileName: str
    fileSizeBytes: int

class BatchAnalysisResponse(BaseModel):
    summary: BatchSummary
    items: List[BatchReviewItem]
