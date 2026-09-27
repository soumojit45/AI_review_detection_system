/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, Layers, ShieldCheck, Cpu, BarChart3, CheckCircle } from 'lucide-react';
import { PageRoute } from '../types';
import { ActionButton } from './ActionButton';

interface HeroProps {
  onNavigate: (page: PageRoute) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Subtle Background Visual Grid & Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        {/* Soft radial glow */}
        <div className="absolute h-[420px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -top-20 right-1/4 h-[300px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />

        {/* Minimal geometric grid pattern */}
        <svg
          className="absolute inset-0 h-full w-full stroke-white/[0.03] [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hero-grid-pattern"
              width="48"
              height="48"
              x="50%"
              y="-1"
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 48V.5H48" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-grid-pattern)" />
        </svg>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8 sm:space-y-10">
        {/* Top Tag / Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#263247] bg-[#151D2E]/90 px-4 py-1.5 text-xs font-medium text-[#94A3B8] shadow-sm">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span>Transformer-Based NLP Linguistic Classifier</span>
        </div>

        {/* Main Heading */}
        <h1
          id="main-hero-heading"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.12]"
        >
          <span className="text-indigo-400">AI</span> Fake Review <br className="hidden sm:inline" />
          Detection System
        </h1>

        {/* Subtitle (constrained ~650-750px) */}
        <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-[#94A3B8] leading-relaxed font-normal">
          Detect potentially fake and suspicious reviews using advanced AI and
          Transformer-based language models.
        </p>

        {/* Two Large Action Buttons (Side-by-side on desktop/tablet, stacked on mobile) */}
        <div className="mx-auto max-w-2xl pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <ActionButton
              id="hero-single-review-btn"
              variant="primary"
              title="Analyze Single Review"
              subtitle="Paste text to inspect credibility"
              icon={FileText}
              onClick={() => onNavigate('single-review')}
            />

            <ActionButton
              id="hero-multiple-reviews-btn"
              variant="secondary"
              title="Analyze Multiple Reviews"
              subtitle="Upload CSV dataset for batch audit"
              icon={Layers}
              onClick={() => onNavigate('multiple-reviews')}
            />
          </div>
        </div>

        {/* Trust & Architecture Indicators */}
        <div className="pt-10 border-t border-[#263247]/60 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="rounded-xl border border-[#263247]/80 bg-[#111827]/50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Cpu className="h-3.5 w-3.5" />
                <span>Transformer NLP</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Evaluates lexical hyperbole, syntax repetition, and semantic anomalies.
              </p>
            </div>

            <div className="rounded-xl border border-[#263247]/80 bg-[#111827]/50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Confidence Scoring</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Calibrated probability metrics for each individual classified review.
              </p>
            </div>

            <div className="rounded-xl border border-[#263247]/80 bg-[#111827]/50 p-4 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Explainable AI</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Linguistic reasonings behind every prediction for full audit transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
