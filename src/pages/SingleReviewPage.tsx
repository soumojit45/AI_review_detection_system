/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Sparkles, FileText } from 'lucide-react';
import { PageRoute, PredictionResult } from '../types';
import { ReviewInput } from '../components/ReviewInput';
import { ResultCard } from '../components/ResultCard';
import { analyzeSingleReview } from '../services/api';

interface SingleReviewPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const SingleReviewPage: React.FC<SingleReviewPageProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const prediction = await analyzeSingleReview(text);
      setResult(prediction);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb / Back Link */}
        <button
          id="single-review-back-btn"
          onClick={() => onNavigate('home')}
          className="group inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Overview</span>
        </button>

        {/* Page Header */}
        <div className="space-y-2 border-b border-[#263247] pb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
              Analyze a Single Review
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
            Paste a review below and analyze whether it appears genuine or potentially fake.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Form or Result View */}
        {!result ? (
          <ReviewInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            <ResultCard result={result} onReset={handleReset} />
          </div>
        )}
      </div>
    </div>
  );
};
