/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Layers } from 'lucide-react';
import { PageRoute, BatchAnalysisResult } from '../types';
import { UploadZone } from '../components/UploadZone';
import { BatchResultsDashboard } from '../components/BatchResultsDashboard';
import { analyzeBatchFile, getSampleBatchResult } from '../services/api';

interface MultipleReviewsPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const MultipleReviewsPage: React.FC<MultipleReviewsPageProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BatchAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeFile = async (file: File) => {
    setIsLoading(true);
    setProgress(10);
    setError(null);
    try {
      const batchResult = await analyzeBatchFile(file, (p) => setProgress(p));
      setResult(batchResult);
    } catch (err: any) {
      setError(err?.message || 'Failed to process CSV file.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleLoadDemoData = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setResult(getSampleBatchResult());
      setIsLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb / Back Link */}
        <button
          id="multiple-reviews-back-btn"
          onClick={() => onNavigate('home')}
          className="group inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Overview</span>
        </button>

        {/* Page Header (when no result is displayed) */}
        {!result && (
          <div className="space-y-2 border-b border-[#263247] pb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="h-4 w-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
                Analyze Multiple Reviews
              </h1>
            </div>
            <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
              Upload a CSV file containing multiple reviews and analyze them in bulk.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Upload Zone or Batch Dashboard */}
        {!result ? (
          <div className="mx-auto max-w-3xl">
            <UploadZone
              onAnalyzeFile={handleAnalyzeFile}
              onLoadDemoData={handleLoadDemoData}
              isLoading={isLoading}
              progress={progress}
            />
          </div>
        ) : (
          <BatchResultsDashboard data={result} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};
