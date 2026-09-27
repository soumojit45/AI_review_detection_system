/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Percent,
  Download,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { BatchAnalysisResult } from '../types';
import { StatCard } from './StatCard';
import { ReviewTable } from './ReviewTable';

interface BatchResultsDashboardProps {
  data: BatchAnalysisResult;
  onReset: () => void;
}

export const BatchResultsDashboard: React.FC<BatchResultsDashboardProps> = ({
  data,
  onReset,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const { summary, items } = data;

  const handleExportCSV = () => {
    const headers = ['id', 'review_text', 'prediction', 'confidence_percent', 'explanation'];
    const rows = items.map((item) => [
      item.id,
      `"${item.reviewText.replace(/"/g, '""')}"`,
      item.prediction,
      item.confidence,
      `"${item.explanation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `classified_${summary.fileName || 'reviews'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Header Info & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#263247] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
              Batch Analysis Dashboard
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            File: <span className="font-mono text-[#F8FAFC]">{summary.fileName}</span> • Processed{' '}
            {new Date(summary.processedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            id="export-results-csv-btn"
            onClick={handleExportCSV}
            className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-[#263247] bg-[#151D2E] px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] hover:border-indigo-500/40 hover:bg-[#1A2438] transition-colors"
          >
            {downloaded ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Exported!</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-indigo-400" />
                <span>Export CSV Report</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="analyze-new-batch-btn"
            onClick={onReset}
            className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-[#263247] bg-[#111827] px-4 py-2.5 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B4B68] transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Upload New CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-total-reviews"
          title="Total Reviews"
          value={summary.totalReviews}
          subtitle="Total rows processed"
          icon={FileText}
          variant="default"
        />

        <StatCard
          id="stat-potentially-fake"
          title="Potentially Fake"
          value={summary.fakeReviews}
          subtitle={`${summary.fakePercentage}% flagged by model`}
          icon={AlertTriangle}
          variant="fake"
        />

        <StatCard
          id="stat-genuine-reviews"
          title="Likely Genuine"
          value={summary.genuineReviews}
          subtitle={`${(100 - summary.fakePercentage).toFixed(1)}% verified organic`}
          icon={CheckCircle2}
          variant="genuine"
        />

        <StatCard
          id="stat-fake-percentage"
          title="Fake Percentage"
          value={`${summary.fakePercentage}%`}
          subtitle={`Avg confidence: ${summary.averageConfidence}%`}
          icon={Percent}
          variant={summary.fakePercentage > 40 ? 'fake' : 'accent'}
        />
      </div>

      {/* Reviews Breakdown Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Individual Review Predictions
            </h3>
          </div>
          <span className="text-xs text-[#94A3B8]">
            Click any row to inspect NLP explanation
          </span>
        </div>

        <ReviewTable items={items} />
      </div>
    </div>
  );
};
