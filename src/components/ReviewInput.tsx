/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Trash2,
  AlertCircle,
  Loader2,
  FileCheck2,
  HelpCircle,
  Quote,
} from 'lucide-react';
import { SAMPLE_SUSPICIOUS_REVIEWS, SAMPLE_GENUINE_REVIEWS } from '../data/mockReviews';

interface ReviewInputProps {
  onAnalyze: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const ReviewInput: React.FC<ReviewInputProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please paste or type a review before running analysis.');
      return;
    }
    setError(null);
    onAnalyze(text.trim());
  };

  const handleClear = () => {
    setText('');
    setError(null);
  };

  const loadSample = (sampleText: string) => {
    setText(sampleText);
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Sample Quick Fill Buttons */}
      <div className="rounded-xl border border-[#263247] bg-[#111827]/70 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
            <Quote className="h-3.5 w-3.5 text-indigo-400" />
            <span>Test with Pre-Configured Samples</span>
          </div>
          <span className="text-[11px] text-[#64748B]">Click any sample to fill input</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            id="load-fake-sample-btn"
            onClick={() => loadSample(SAMPLE_SUSPICIOUS_REVIEWS[0].text)}
            className="flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2 text-left text-xs font-medium text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
          >
            <span className="truncate">🚨 Suspicious / Exaggerated Sample</span>
            <span className="shrink-0 text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-200 ml-2">
              Fake
            </span>
          </button>

          <button
            type="button"
            id="load-genuine-sample-btn"
            onClick={() => loadSample(SAMPLE_GENUINE_REVIEWS[0].text)}
            className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2 text-left text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors"
          >
            <span className="truncate">✅ Balanced Organic Review Sample</span>
            <span className="shrink-0 text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-200 ml-2">
              Genuine
            </span>
          </button>
        </div>
      </div>

      {/* Main Text Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-2xl border border-[#263247] bg-[#151D2E] p-1 shadow-lg shadow-black/30 focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <textarea
            id="review-text-input"
            rows={7}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste your review here (e.g., from Amazon, Yelp, Google Maps, App Store, or Trustpilot)..."
            disabled={isLoading}
            className="w-full resize-y rounded-xl bg-transparent p-4 sm:p-5 text-sm sm:text-base text-[#F8FAFC] placeholder-[#64748B] focus:outline-none disabled:opacity-50"
          />

          {/* Bottom Bar inside Input Area: Stats + Clear Action */}
          <div className="flex items-center justify-between border-t border-[#263247]/60 bg-[#111827]/40 px-4 py-2.5 rounded-b-xl text-xs text-[#94A3B8]">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-[#F8FAFC] font-mono">{characterCount}</strong> chars
              </span>
              <span>
                <strong className="text-[#F8FAFC] font-mono">{wordCount}</strong> words
              </span>
            </div>

            {text && (
              <button
                type="button"
                id="clear-review-input-btn"
                onClick={handleClear}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-rose-400 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Validation Error Message */}
        {error && (
          <div
            id="input-validation-error"
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs sm:text-sm text-rose-300 animate-in fade-in duration-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Analyzed with fine-tuned Transformer linguistic feature extraction</span>
          </div>

          <button
            type="submit"
            id="analyze-single-review-submit-btn"
            disabled={isLoading || !text.trim()}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Model Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze Review</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
