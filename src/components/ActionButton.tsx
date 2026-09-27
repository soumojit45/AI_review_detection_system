/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ActionButtonProps {
  id: string;
  variant: 'primary' | 'secondary';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  onClick: () => void;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  id,
  variant,
  title,
  subtitle,
  icon: Icon,
  onClick,
  className = '',
}) => {
  const isPrimary = variant === 'primary';

  return (
    <button
      id={id}
      onClick={onClick}
      className={`group relative flex w-full sm:w-auto items-center justify-between gap-6 rounded-2xl p-5 sm:p-6 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-[#0B1020] active:scale-[0.98] ${
        isPrimary
          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 border border-indigo-400/30'
          : 'bg-[#151D2E] hover:bg-[#1A2438] text-[#F8FAFC] border border-[#263247] hover:border-[#374765] shadow-md shadow-black/30 hover:-translate-y-0.5'
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
            isPrimary
              ? 'bg-white/15 text-white border border-white/20'
              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/15'
          }`}
        >
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-semibold tracking-tight leading-snug">
            {title}
          </div>
          {subtitle && (
            <div
              className={`text-xs sm:text-sm mt-0.5 ${
                isPrimary ? 'text-indigo-100/80' : 'text-[#94A3B8]'
              }`}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
          isPrimary
            ? 'bg-white/10 text-white group-hover:translate-x-1 group-hover:bg-white/20'
            : 'bg-[#111827] text-[#94A3B8] border border-[#263247] group-hover:text-indigo-300 group-hover:translate-x-1 group-hover:border-indigo-500/30'
        }`}
      >
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
};
