/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import { PredictionResult, SalientToken } from '../types';
import { ConfidenceBar } from './ConfidenceBar';
import { extractSalientTokens } from '../data/mockReviews';

interface ResultCardProps {
  result: PredictionResult;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(true);

  const isFake = result.prediction === 'FAKE';

  const handleCopy = async () => {
    const textToCopy = `AI Fake Review Analysis:
Status: ${isFake ? 'POTENTIALLY FAKE' : 'LIKELY GENUINE'}
Confidence: ${result.confidence}%
Explanation: ${result.explanation}
Review Text: "${result.text}"`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  return (
    <div
      id="single-review-result-card"
      className="w-full rounded-2xl border border-[#263247] bg-[#151D2E] p-6 sm:p-8 shadow-xl shadow-black/40 transition-all duration-300"
    >
      {/* Header with Title and Copy / Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#263247] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-[#F8FAFC]">Analysis Result</h2>
          <span className="font-mono text-xs text-[#94A3B8] border border-[#263247] px-2 py-0.5 rounded bg-[#111827]">
            {result.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-result-button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-[#263247] bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B4B68] transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
            title="Copy analysis summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            id="reset-analysis-button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg border border-[#263247] bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B4B68] transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Analyze Another</span>
          </button>
        </div>
      </div>

      {/* Main Prediction Banner */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-xl p-5 sm:p-6 border border-[#263247] bg-[#111827]/80">
        {/* Classification Badge */}
        <div className="md:col-span-6 flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
              isFake
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isFake ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
              Classification
            </div>
            <div
              className={`text-2xl sm:text-3xl font-bold tracking-tight mt-0.5 ${
                isFake ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isFake ? 'Potentially Fake' : 'Likely Genuine'}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              {isFake
                ? 'High probability of incentivized, bot, or fabricated review pattern.'
                : 'High probability of authentic, organic consumer review behavior.'}
            </p>
          </div>
        </div>

        {/* Confidence Score Bar */}
        <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-[#263247] pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
              Model Confidence
            </span>
            <span
              className={`font-mono text-2xl font-bold ${
                isFake ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {result.confidence}%
            </span>
          </div>
          <ConfidenceBar
            confidence={result.confidence}
            prediction={result.prediction}
            showPercentage={false}
            size="lg"
          />
          <div className="flex justify-between text-[11px] text-[#64748B] mt-1.5">
            <span>50% (Uncertain)</span>
            <span>75% (Moderate)</span>
            <span>100% (High Certainty)</span>
          </div>
        </div>
      </div>

      {/* AI Explanation Section */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
            AI Explanation & Linguistic Insights
          </h3>
        </div>
        <div className="rounded-xl border border-[#263247] bg-[#0F172A] p-4 sm:p-5 text-sm leading-relaxed text-[#E2E8F0]">
          <p>{result.explanation}</p>
        </div>
      </div>

      {/* Key Indicator Words & Phrases (xAI Evidence) */}
      {(() => {
        const tokens = result.salientTokens && result.salientTokens.length > 0 
          ? result.salientTokens 
          : extractSalientTokens(result.text);
        if (tokens.length === 0) return null;

        return (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-indigo-400" />
                Key Words / Phrases Present (xAI Evidence)
              </span>
              <span className="text-[11px] text-[#64748B]">
                {tokens.length} indicators found
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tokens.map((tokenItem, idx) => {
                const isSuspicious = tokenItem.label === 'SUSPICIOUS';
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 space-y-1.5 ${
                      isSuspicious
                        ? 'border-rose-500/20 bg-rose-500/5'
                        : 'border-emerald-500/20 bg-emerald-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                          isSuspicious
                            ? 'text-rose-300 bg-rose-500/20 border-rose-500/30'
                            : 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30'
                        }`}
                      >
                        "{tokenItem.token}"
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isSuspicious
                            ? 'text-rose-400/90 bg-rose-950/60 border-rose-500/20'
                            : 'text-emerald-400/90 bg-emerald-950/60 border-emerald-500/20'
                        }`}
                      >
                        {tokenItem.category}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] leading-normal ${
                        isSuspicious ? 'text-rose-200/80' : 'text-emerald-200/80'
                      }`}
                    >
                      <strong>{isSuspicious ? 'Why suspicious:' : 'Why authentic:'}</strong> {tokenItem.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Linguistic Feature Indicators */}
      {result.linguisticFeatures && result.linguisticFeatures.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex w-full items-center justify-between rounded-lg border border-[#263247] bg-[#111827] px-4 py-2.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Transformer NLP Feature Breakdown</span>
            </span>
            {showTechnicalDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.linguisticFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#263247] bg-[#111827]/60 p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F8FAFC]">{feat.name}</span>
                    <span
                      className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-medium ${
                        feat.flagged
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      {feat.score}%
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-normal">{feat.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Review Quote Snippet */}
      <div className="mt-6 border-t border-[#263247] pt-5">
        <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider block mb-2">
          Analyzed Text Content
        </span>
        <div className="rounded-lg border border-[#1E293B] bg-[#0B1020] p-3.5 text-xs text-[#94A3B8] font-mono leading-relaxed max-h-32 overflow-y-auto">
          "{result.text}"
        </div>
      </div>
    </div>
  );
};
