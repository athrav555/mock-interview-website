'use client';

import React from 'react';
import { Target, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { AnalyticsSummary } from '@/types';

interface CompetencyBreakdownProps {
  summary: AnalyticsSummary;
}

export default function CompetencyBreakdown({ summary }: CompetencyBreakdownProps) {
  const getBarColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 80) return 'bg-indigo-600';
    if (score >= 70) return 'bg-blue-600';
    return 'bg-amber-500';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Executive Competency Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated performance scores evaluated across all interview transcripts
          </p>
        </div>
        <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Target: 85+ Benchmark
        </span>
      </div>

      <div className="space-y-4">
        {summary.competencyScores.map((item) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-800">{item.category}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{item.score}%</span>
                <span className="text-[11px] text-slate-400">
                  {item.score >= 90 ? 'Executive' : item.score >= 80 ? 'Proficient' : 'Improving'}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getBarColor(
                  item.score
                )}`}
                style={{ width: `${Math.min(100, Math.max(5, item.score))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insight banner */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">Executive Insight: </span>
          Your highest scoring area is{' '}
          <strong className="text-slate-900">
            {summary.competencyScores[0]?.category || 'High-Scale Architecture'}
          </strong>
          . For senior leadership roles, amplifying quantified financial outcomes in behavioral responses will yield the strongest boost.
        </div>
      </div>
    </div>
  );
}
