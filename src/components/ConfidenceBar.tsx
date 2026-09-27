/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PredictionLabel } from '../types';

interface ConfidenceBarProps {
  confidence: number;
  prediction: PredictionLabel;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  prediction,
  label = 'Model Confidence',
  showPercentage = true,
  size = 'md',
}) => {
  const isFake = prediction === 'FAKE';
  const clampedConfidence = Math.min(100, Math.max(0, Math.round(confidence)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  const barColor = isFake
    ? 'bg-rose-500 shadow-sm shadow-rose-500/20'
    : 'bg-emerald-500 shadow-sm shadow-emerald-500/20';

  const textColor = isFake ? 'text-rose-400' : 'text-emerald-400';
  const bgTrack = 'bg-[#1E293B]';

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#94A3B8]">{label}</span>
        {showPercentage && (
          <span className={`font-mono font-semibold ${textColor}`}>
            {clampedConfidence}%
          </span>
        )}
      </div>
      <div className={`w-full overflow-hidden rounded-full ${bgTrack} ${heightClasses}`}>
        <div
          className={`${heightClasses} rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${clampedConfidence}%` }}
          role="progressbar"
          aria-valuenow={clampedConfidence}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
