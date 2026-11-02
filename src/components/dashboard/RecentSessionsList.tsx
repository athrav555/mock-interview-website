'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Session } from '@/types';

interface RecentSessionsListProps {
  sessions: Session[];
}

export default function RecentSessionsList({ sessions }: RecentSessionsListProps) {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'executive':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'staff':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'senior':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'behavioral':
        return 'Behavioral & Leadership';
      case 'system_design':
        return 'System Architecture';
      case 'technical':
        return 'Technical Depth';
      default:
        return type;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Interview History & Reports
          </h3>
          <p className="text-xs text-slate-500">Live sessions stored in database with AI scoring</p>
        </div>
        <Link
          href="/history"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
        >
          View All History <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">No Interview Sessions Yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Configure your target executive role and start your first simulated interview with live audio.
          </p>
          <Link
            href="/interview/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Start First Interview
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sessions.map((session) => {
            const isCompleted = session.completion_status === 'completed';
            return (
              <div
                key={session.id}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{session.target_role}</span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getDifficultyBadge(
                        session.difficulty
                      )}`}
                    >
                      {session.difficulty.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {getTypeLabel(session.interview_type)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {session.duration > 0 ? formatDuration(session.duration) : 'In progress'}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(session.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  {isCompleted ? (
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-xl font-extrabold text-slate-900">
                          {session.overall_score}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      <AlertCircle className="w-3 h-3" /> In Progress
                    </span>
                  )}

                  <Link
                    href={
                      isCompleted
                        ? `/interview/${session.id}/report`
                        : `/interview/${session.id}`
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition"
                  >
                    {isCompleted ? 'View Report' : 'Resume'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
