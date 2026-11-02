'use client';

import React from 'react';
import { Award, Clock, Activity, CheckCircle, TrendingUp } from 'lucide-react';
import { AnalyticsSummary } from '@/types';

interface MetricsCardsProps {
  summary: AnalyticsSummary;
}

export default function MetricsCards({ summary }: MetricsCardsProps) {
  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Top 5% Executive', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 80) return { label: 'Senior Qualified', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    return { label: 'Developing Readiness', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  const badge = getScoreBadge(summary.averageScore);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Average Score */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Score
          </span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.averageScore > 0 ? `${summary.averageScore}` : '--'}
          </span>
          <span className="text-sm font-medium text-slate-400">/ 100</span>
        </div>
        <div className="mt-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Completed Sessions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sessions Completed
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.completedSessions}
          </span>
          <span className="text-sm font-medium text-slate-500">
            of {summary.totalSessions} started
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500 flex items-center gap-1 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          Full rubric evaluated & saved
        </p>
      </div>

      {/* Total Practice Time */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Practice Time
          </span>
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalPracticeTimeMinutes}
          </span>
          <span className="text-sm font-medium text-slate-500">minutes</span>
        </div>
        <p className="mt-3 text-xs text-slate-500 font-medium">
          Live speaking & response recording
        </p>
      </div>

      {/* Speaking Cadence (WPM) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Speaking Pace
          </span>
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.averageWpm}
          </span>
          <span className="text-sm font-medium text-slate-500">WPM</span>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            {summary.averageWpm >= 120 && summary.averageWpm <= 160
              ? 'Optimal Executive Cadence'
              : summary.averageWpm < 120
              ? 'Deliberate & Measured'
              : 'Rapid Delivery'}
          </span>
        </div>
      </div>
    </div>
  );
}
