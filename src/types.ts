/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PredictionLabel = 'FAKE' | 'GENUINE';

export interface LinguisticFeature {
  name: string;
  score: number; // 0 to 100
  description: string;
  flagged: boolean;
}

export interface SalientToken {
  token: string;
  label: 'SUSPICIOUS' | 'GENUINE_INDICATOR';
  category: string;
  reason: string;
}

export interface PredictionResult {
  id: string;
  text: string;
  prediction: PredictionLabel;
  confidence: number; // 0 to 100
  explanation: string;
  linguisticFeatures?: LinguisticFeature[];
  salientTokens?: SalientToken[];
  sentiment?: {
    polarity: 'Positive' | 'Neutral' | 'Negative';
    intensity: 'High' | 'Moderate' | 'Low';
  };
  analyzedAt: string;
}

export interface BatchAnalysisSummary {
  totalReviews: number;
  fakeReviews: number;
  genuineReviews: number;
  fakePercentage: number;
  averageConfidence: number;
  processedAt: string;
  fileName: string;
  fileSizeBytes: number;
}

export interface BatchReviewItem {
  id: string;
  reviewText: string;
  productCategory?: string;
  rating?: number;
  prediction: PredictionLabel;
  confidence: number;
  explanation: string;
  highlightedTokens?: string[];
  linguisticFeatures?: LinguisticFeature[];
  salientTokens?: SalientToken[];
}

export interface BatchAnalysisResult {
  summary: BatchAnalysisSummary;
  items: BatchReviewItem[];
}

export type PageRoute = 'home' | 'single-review' | 'multiple-reviews';

export interface FilterOptions {
  searchQuery: string;
  status: 'ALL' | 'FAKE' | 'GENUINE';
  minConfidence: number;
  sortBy: 'confidence-desc' | 'confidence-asc' | 'id-asc';
}
