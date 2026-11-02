'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  Shield,
  FileCheck,
  Zap,
} from 'lucide-react';
import { db } from '@/lib/db';
import { AnalyticsSummary, UserProfile } from '@/types';
import MetricsCards from '@/components/dashboard/MetricsCards';
import CompetencyBreakdown from '@/components/dashboard/CompetencyBreakdown';
import RecentSessionsList from '@/components/dashboard/RecentSessionsList';

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const u = await db.getCurrentUser();
        setUser(u);
        const s = await db.getAnalyticsSummary(u?.id);
        setSummary(s);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading executive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Executive Calibration Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Elevate Your Executive Narrative,{' '}
            <span className="text-indigo-300">{user?.name?.split(' ')[0] || 'Candidate'}</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Calibrate your responses against high-stakes Director, Staff, and Principal engineering benchmarks. Experience realistic AI voice-driven scenarios, structured STAR analysis, and instant rubric feedback.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/interview/new"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-900/50 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Start New Interview
            </Link>

            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium border border-white/10 backdrop-blur transition"
            >
              <FileCheck className="w-4 h-4 text-slate-300" />
              Update Resume Context
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Cards */}
      <MetricsCards summary={summary} />

      {/* Analytics Breakdown & Recent Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Competency Breakdown & Score Trend */}
        <div className="lg:col-span-5 space-y-8">
          <CompetencyBreakdown summary={summary} />

          {/* Quick Target Role Profile Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Candidate Profile
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Target Role</span>
                <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">
                  {user?.target_role}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Industry</span>
                <span className="font-semibold text-slate-900">{user?.industry}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Experience</span>
                <span className="font-semibold text-slate-900">
                  {user?.years_of_experience} Years
                </span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Resume Grounding</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {user?.resume_text ? 'Synced' : 'Not Loaded'}
                </span>
              </div>
            </div>

            <Link
              href="/profile"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 block text-center pt-2 transition"
            >
              Modify Executive Grounding & Resume →
            </Link>
          </div>
        </div>

        {/* Right Column: Live Recent Sessions & Reports */}
        <div className="lg:col-span-7">
          <RecentSessionsList sessions={summary.recentSessions} />
        </div>
      </div>
    </div>
  );
}
