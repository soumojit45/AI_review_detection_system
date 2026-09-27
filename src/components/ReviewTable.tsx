/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Sparkles,
  ArrowUpDown,
  Tag,
  Activity,
  FileText,
  ShieldCheck,
  Flame,
  Info,
} from 'lucide-react';
import { BatchReviewItem, SalientToken, LinguisticFeature } from '../types';
import { ConfidenceBar } from './ConfidenceBar';
import { extractSalientTokens, generateLinguisticFeatures } from '../data/mockReviews';

interface ReviewTableProps {
  items: BatchReviewItem[];
}

export const ReviewTable: React.FC<ReviewTableProps> = ({ items }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FAKE' | 'GENUINE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedReview, setSelectedReview] = useState<BatchReviewItem | null>(null);
  const [sortOrder, setSortOrder] = useState<'serial' | 'desc' | 'asc'>('serial');
  const [highlightMode, setHighlightMode] = useState<boolean>(true);

  // Helper to interleave items serially: 1- fake, 2- genuine
  const interleaveSerially = (list: BatchReviewItem[]) => {
    const fakes = list.filter((item) => item.prediction === 'FAKE');
    const genuines = list.filter((item) => item.prediction === 'GENUINE');
    const result: BatchReviewItem[] = [];
    const maxLen = Math.max(fakes.length, genuines.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < fakes.length) result.push(fakes[i]);
      if (i < genuines.length) result.push(genuines[i]);
    }
    return result;
  };

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    const base = items.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.prediction === statusFilter;
      const matchesSearch =
        item.reviewText.toLowerCase().includes(search.toLowerCase()) ||
        (item.productCategory && item.productCategory.toLowerCase().includes(search.toLowerCase())) ||
        item.id.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    if (sortOrder === 'serial') {
      if (statusFilter === 'ALL') {
        return interleaveSerially(base);
      }
      return base;
    }
    if (sortOrder === 'desc') {
      return [...base].sort((a, b) => b.confidence - a.confidence);
    }
    if (sortOrder === 'asc') {
      return [...base].sort((a, b) => a.confidence - b.confidence);
    }
    return base;
  }, [items, search, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleFilterChange = (filter: 'ALL' | 'FAKE' | 'GENUINE') => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  // Compute tokens and features for selected review if not already cached
  const inspectionTokens: SalientToken[] = useMemo(() => {
    if (!selectedReview) return [];
    if (selectedReview.salientTokens && selectedReview.salientTokens.length > 0) {
      return selectedReview.salientTokens;
    }
    return extractSalientTokens(selectedReview.reviewText);
  }, [selectedReview]);

  const inspectionFeatures: LinguisticFeature[] = useMemo(() => {
    if (!selectedReview) return [];
    if (selectedReview.linguisticFeatures && selectedReview.linguisticFeatures.length > 0) {
      return selectedReview.linguisticFeatures;
    }
    return generateLinguisticFeatures(selectedReview.prediction === 'FAKE', selectedReview.reviewText);
  }, [selectedReview]);

  // Render text with highlighted token badges
  const renderHighlightedText = (text: string, tokens: SalientToken[]) => {
    if (!highlightMode || !tokens || tokens.length === 0) {
      return <span>"{text}"</span>;
    }

    const uniqueTokens = Array.from(new Set(tokens.map((t) => t.token))).sort(
      (a, b) => b.length - a.length
    );

    if (uniqueTokens.length === 0) {
      return <span>"{text}"</span>;
    }

    const escaped = uniqueTokens
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    try {
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = text.split(regex);

      return (
        <span className="leading-relaxed">
          "
          {parts.map((part, index) => {
            const matchedToken = tokens.find(
              (t) => t.token.toLowerCase() === part.toLowerCase()
            );

            if (!matchedToken) {
              return <span key={index}>{part}</span>;
            }

            const isSuspicious = matchedToken.label === 'SUSPICIOUS';

            return (
              <mark
                key={index}
                title={`${matchedToken.category}: ${matchedToken.reason}`}
                className={`mx-0.5 inline-block rounded px-1.5 py-0.5 text-xs font-semibold tracking-wide cursor-help transition-all ${
                  isSuspicious
                    ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40 underline decoration-rose-400 decoration-wavy underline-offset-2'
                    : 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/40 underline decoration-emerald-400 decoration-wavy underline-offset-2'
                }`}
              >
                {part}
              </mark>
            );
          })}
          "
        </span>
      );
    } catch {
      return <span>"{text}"</span>;
    }
  };

  const suspiciousTokens = inspectionTokens.filter((t) => t.label === 'SUSPICIOUS');
  const genuineTokens = inspectionTokens.filter((t) => t.label === 'GENUINE_INDICATOR');

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            id="table-search-input"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search reviews by keyword, category, or ID..."
            className="w-full rounded-xl border border-[#263247] bg-[#151D2E] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:border-indigo-500/70 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs & Sort */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center rounded-xl border border-[#263247] bg-[#151D2E] p-1 text-xs">
            {(['ALL', 'FAKE', 'GENUINE'] as const).map((filter) => {
              const active = statusFilter === filter;
              return (
                <button
                  key={filter}
                  id={`filter-btn-${filter.toLowerCase()}`}
                  onClick={() => handleFilterChange(filter)}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]'
                  }`}
                >
                  {filter === 'ALL' ? 'All Reviews' : filter === 'FAKE' ? 'Flagged Fake' : 'Genuine'}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="sort-serial-btn"
              onClick={() => setSortOrder('serial')}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                sortOrder === 'serial'
                  ? 'border-indigo-500/60 bg-indigo-600/20 text-indigo-300 font-semibold shadow-sm'
                  : 'border-[#263247] bg-[#151D2E] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
              title="Serial order: 1-Fake, 2-Genuine"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Serial: 1-Fake, 2-Genuine</span>
            </button>

            <button
              id="sort-conf-btn"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                sortOrder !== 'serial'
                  ? 'border-indigo-500/60 bg-indigo-600/20 text-indigo-300 font-semibold shadow-sm'
                  : 'border-[#263247] bg-[#151D2E] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
              title="Toggle Confidence Sorting"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>{sortOrder === 'asc' ? 'Lowest Conf' : 'Highest Conf'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Reviews Table */}
      <div className="overflow-hidden rounded-2xl border border-[#263247] bg-[#151D2E] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[#263247] bg-[#111827]/80 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              <tr>
                <th scope="col" className="py-3.5 px-4 sm:px-6">S.No & ID</th>
                <th scope="col" className="py-3.5 px-4 sm:px-6">Review Content</th>
                <th scope="col" className="py-3.5 px-4 sm:px-6">Classification</th>
                <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Confidence</th>
                <th scope="col" className="py-3.5 px-4 sm:px-6 text-center">Inspect xAI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263247]/60">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#94A3B8]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter className="h-6 w-6 text-[#64748B]" />
                      <p className="text-sm">No reviews found matching the current search or filters.</p>
                      <button
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('ALL');
                          setSortOrder('serial');
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                  const isFake = item.prediction === 'FAKE';
                  const serialNum = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#1E293B]/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedReview(item)}
                    >
                      {/* S.No & ID & Category */}
                      <td className="py-4 px-4 sm:px-6 font-mono text-xs text-[#94A3B8] whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`inline-flex items-center justify-center min-w-[30px] h-7 px-1.5 rounded-lg text-xs font-bold border ${
                              isFake
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}
                            title={`Serial #${serialNum} - ${isFake ? 'Fake' : 'Genuine'}`}
                          >
                            #{serialNum}
                          </span>
                          <div>
                            <div className="font-semibold text-[#F8FAFC]">
                              {item.id.startsWith('REV-') ? item.id : `REV-${item.id.padStart(3, '0')}`}
                            </div>
                            {item.productCategory && (
                              <div className="text-[10px] text-[#64748B]">{item.productCategory}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Review Text Snippet */}
                      <td className="py-4 px-4 sm:px-6 text-[#E2E8F0] max-w-md">
                        <p className="line-clamp-2 leading-relaxed text-xs sm:text-sm">
                          "{item.reviewText}"
                        </p>
                      </td>

                      {/* Prediction Badge */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                            isFake
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {isFake ? (
                            <AlertTriangle className="h-3 w-3 text-rose-400" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          )}
                          <span>{isFake ? 'Fake' : 'Genuine'}</span>
                        </span>
                      </td>

                      {/* Confidence Meter */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="w-28 sm:w-32 ml-auto space-y-1">
                          <div className="flex justify-end">
                            <span
                              className={`font-mono text-xs font-bold ${
                                isFake ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {item.confidence}%
                            </span>
                          </div>
                          <ConfidenceBar
                            confidence={item.confidence}
                            prediction={item.prediction}
                            showPercentage={false}
                            size="sm"
                          />
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReview(item);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#263247] bg-[#111827] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-colors mx-auto"
                          title="Inspect AI Explanation & Key Words"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#263247] bg-[#111827]/40 px-4 sm:px-6 py-3.5 text-xs text-[#94A3B8]">
          <div>
            Showing{' '}
            <strong className="text-[#F8FAFC]">
              {filteredItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-[#F8FAFC]">
              {Math.min(currentPage * pageSize, filteredItems.length)}
            </strong>{' '}
            of <strong className="text-[#F8FAFC]">{filteredItems.length}</strong> reviews
          </div>

          <div className="flex items-center gap-2">
            <button
              id="prev-page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-[#263247] bg-[#151D2E] px-2.5 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-xs text-[#F8FAFC] px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              id="next-page-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-[#263247] bg-[#151D2E] px-2.5 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Review Inspection Modal with Explainable AI & Token Metrics */}
      {selectedReview && (
        <div
          id="review-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#263247] bg-[#151D2E] p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#263247] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC]">xAI Review Inspection & Token Analysis</h3>
                  <div className="font-mono text-xs text-[#94A3B8]">
                    Review ID: {selectedReview.id} • Category: {selectedReview.productCategory || 'General'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#263247] bg-[#111827] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Prediction Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#263247] bg-[#111827] p-4.5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                    selectedReview.prediction === 'FAKE'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {selectedReview.prediction === 'FAKE' ? (
                    <Flame className="h-5 w-5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                    Transformer Classification
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      selectedReview.prediction === 'FAKE' ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedReview.prediction === 'FAKE' ? 'Flagged Deceptive (Fake)' : 'Verified Organic (Genuine)'}
                  </span>
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 border-[#263247] pt-2 sm:pt-0">
                <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Model Confidence
                </span>
                <span className="font-mono text-2xl font-bold text-[#F8FAFC]">
                  {selectedReview.confidence}%
                </span>
              </div>
            </div>

            {/* Review Text with Inline Highlighting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  Review Content with Detected Evidence
                </span>
                <button
                  type="button"
                  onClick={() => setHighlightMode((prev) => !prev)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  {highlightMode ? 'Show Raw Text' : 'Highlight Indicator Words'}
                </button>
              </div>

              <div className="rounded-xl border border-[#263247] bg-[#0F172A] p-4 text-xs sm:text-sm text-[#F8FAFC] leading-relaxed max-h-48 overflow-y-auto shadow-inner">
                {renderHighlightedText(selectedReview.reviewText, inspectionTokens)}
              </div>
            </div>

            {/* Key Indicator Words & Academic Rationale */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-indigo-400" />
                  Key Indicator Words / Phrases Present
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {inspectionTokens.length} token signals detected
                </span>
              </div>

              {inspectionTokens.length === 0 ? (
                <div className="rounded-xl border border-[#263247] bg-[#111827] p-3 text-xs text-[#94A3B8] text-center">
                  No extreme keyword anomalies found. Classification relies primarily on contextual DistilBERT sentence embeddings.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Suspicious Tokens */}
                  {suspiciousTokens.map((tokenItem, idx) => (
                    <div
                      key={`susp-${idx}`}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded">
                          "{tokenItem.token}"
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400/90 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/20">
                          {tokenItem.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-200/80 leading-normal">
                        <strong className="text-rose-300">Why flagged:</strong> {tokenItem.reason}
                      </p>
                    </div>
                  ))}

                  {/* Genuine Tokens */}
                  {genuineTokens.map((tokenItem, idx) => (
                    <div
                      key={`gen-${idx}`}
                      className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded">
                          "{tokenItem.token}"
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {tokenItem.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80 leading-normal">
                        <strong className="text-emerald-300">Why genuine:</strong> {tokenItem.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantitative Stylometric & Linguistic Metrics */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                Linguistic & Stylometric NLP Metrics
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inspectionFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#263247] bg-[#111827] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#F8FAFC]">{feat.name}</span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          feat.flagged ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {feat.score}/100
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-[#1F293D] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          feat.flagged ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, feat.score))}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#94A3B8] leading-tight">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Linguistic Assessment Narrative */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-indigo-400" />
                Explainable AI (xAI) Assessment Narrative
              </span>
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs sm:text-sm text-indigo-200 leading-relaxed">
                {selectedReview.explanation}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-[#263247] pt-4">
              <div className="text-[11px] text-[#64748B]">
                Decoupled PyTorch Transformer + Heuristic NLP Pipeline
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
