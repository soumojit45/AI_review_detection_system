/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#263247] bg-[#0B1020] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span className="font-semibold text-sm text-[#F8FAFC]">
            AI Fake Review Detection System
          </span>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Transformer-based AI system for detecting potentially fake reviews.
        </p>
      </div>
    </footer>
  );
};
