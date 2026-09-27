/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
  Loader2,
  FileCheck2,
  Sparkles,
  Download,
  Info,
} from 'lucide-react';

interface UploadZoneProps {
  onAnalyzeFile: (file: File) => Promise<void>;
  onLoadDemoData: () => void;
  isLoading: boolean;
  progress?: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onAnalyzeFile,
  onLoadDemoData,
  isLoading,
  progress = 0,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a valid .csv file format.');
      setSelectedFile(null);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      // 20MB limit
      setError('File size exceeds the 20MB limit for bulk processing.');
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      setError('Please choose or drop a CSV file first.');
      return;
    }
    onAnalyzeFile(selectedFile);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadSampleTemplate = () => {
    const csvContent = `id,review_text,category,rating
1,"THIS IS THE BEST PRODUCT IN THE WORLD!! 1000/10 MUST BUY NOW!!",Electronics,5
2,"Tested the noise-cancelling headphones for 2 weeks on daily commute. Solid battery life.",Audio,4
3,"Very nice quality fast shipping seller good A+ five stars will buy again.",Beauty,5
4,"The mechanical keyboard keycaps are sturdy, but spacebar has slight wobble.",Peripherals,4
5,"Miracle product solved all my problems immediately. Buy it now!",Wellness,5
6,"Assembly took 30 mins with included hex tool. Clear manual and durable metal frame.",Home,4`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_reviews_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* Quick Demo Dataset Trigger Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[#263247] bg-[#111827]/70 p-4">
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="h-4 w-4 text-indigo-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-[#F8FAFC]">Instant Demo Dataset Available</div>
            <div className="text-[11px] text-[#94A3B8]">
              Test bulk dashboard metrics and classification without uploading your own file.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            id="download-sample-csv-btn"
            onClick={handleDownloadSampleTemplate}
            className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg border border-[#263247] bg-[#151D2E] px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B4B68] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Sample CSV</span>
          </button>

          <button
            type="button"
            id="load-demo-batch-btn"
            onClick={onLoadDemoData}
            disabled={isLoading}
            className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Demo Batch</span>
          </button>
        </div>
      </div>

      {/* Main Drag and Drop Area */}
      <div
        id="csv-dropzone-container"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-indigo-400 bg-indigo-950/30 shadow-inner'
            : 'border-[#263247] bg-[#151D2E]/80 hover:border-indigo-500/50 hover:bg-[#151D2E]'
        } ${selectedFile ? 'cursor-default' : ''}`}
      >
        <input
          ref={fileInputRef}
          id="csv-file-input"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center space-y-3 pointer-events-none">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-sm">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-semibold text-[#F8FAFC]">
                Drop your CSV here
              </p>
              <p className="text-sm text-[#94A3B8]">
                or <span className="text-indigo-400 underline underline-offset-4 font-medium">click to browse files</span>
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#263247] bg-[#111827] px-3 py-1 text-xs text-[#64748B]">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              <span>Supported format: CSV (Up to 20MB / 10,000+ reviews)</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 w-full max-w-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileCheck2 className="h-8 w-8" />
            </div>

            <div className="space-y-1 text-center w-full">
              <p className="text-base font-semibold text-[#F8FAFC] truncate px-4" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="text-xs text-[#94A3B8] font-mono">
                {formatBytes(selectedFile.size)} • Ready for inference
              </p>
            </div>

            {!isLoading && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="remove-selected-csv-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove File</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading / Progress Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#0B1020]/90 backdrop-blur-sm p-6 space-y-4">
            <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
            <div className="space-y-1.5 text-center">
              <p className="text-sm font-semibold text-[#F8FAFC]">
                Running Transformer Batch Classification...
              </p>
              <p className="text-xs text-[#94A3B8]">
                Parsing review rows & calculating linguistic credibility metrics
              </p>
            </div>
            {progress > 0 && (
              <div className="w-48 bg-[#1E293B] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          id="upload-error-banner"
          className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analyze Action Bar */}
      {selectedFile && !isLoading && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            id="analyze-batch-submit-btn"
            onClick={handleAnalyze}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Analyze CSV Dataset</span>
          </button>
        </div>
      )}
    </div>
  );
};
