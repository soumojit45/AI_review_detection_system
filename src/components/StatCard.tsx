/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  variant?: 'default' | 'fake' | 'genuine' | 'accent';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
}) => {
  const styles = {
    default: {
      bg: 'bg-[#151D2E]',
      border: 'border-[#263247]',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      valueColor: 'text-[#F8FAFC]',
    },
    fake: {
      bg: 'bg-[#151D2E]',
      border: 'border-rose-500/30',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      valueColor: 'text-rose-400',
    },
    genuine: {
      bg: 'bg-[#151D2E]',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      valueColor: 'text-emerald-400',
    },
    accent: {
      bg: 'bg-[#151D2E]',
      border: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      valueColor: 'text-indigo-300',
    },
  }[variant];

  return (
    <div
      id={id}
      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-md transition-all duration-200 hover:-translate-y-0.5 ${styles.bg} ${styles.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          {title}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${styles.iconBg}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${styles.valueColor}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && <span className="text-xs text-[#94A3B8]">{trend}</span>}
      </div>

      {subtitle && <p className="mt-1 text-xs text-[#94A3B8]">{subtitle}</p>}
    </div>
  );
};
