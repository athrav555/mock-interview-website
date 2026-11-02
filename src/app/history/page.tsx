'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  PlusCircle,
  Layers,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Session } from '@/types';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function loadSessions() {
      try {
        const list = await db.getSessions();
        setSessions(list);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.target_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.difficulty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || s.interview_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || s.completion_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading interview records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            Database Audit Records
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Session History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review past transcripts, AI evaluations, and progress benchmarks over time.
          </p>
        </div>

        <Link
          href="/interview/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Start New Simulation
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search role or difficulty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs font-medium text-slate-900 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">All Categories</option>
            <option value="system_design">System Architecture</option>
            <option value="behavioral">Behavioral & Leadership</option>
            <option value="technical">Technical Depth</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
      </div>

      {/* Sessions Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No matching sessions found</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or launch a new simulation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSessions.map((session) => {
              const isCompleted = session.completion_status === 'completed';
              return (
                <div
                  key={session.id}
                  className="p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        {session.target_role}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {session.difficulty.toUpperCase()}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {session.interview_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
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

                  <div className="flex items-center gap-6 self-end md:self-center">
                    {isCompleted ? (
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className="text-2xl font-black text-slate-900">
                            {session.overall_score}
                          </span>
                          <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> Evaluated
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5" /> In Progress
                      </span>
                    )}

                    <Link
                      href={
                        isCompleted
                          ? `/interview/${session.id}/report`
                          : `/interview/${session.id}`
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition"
                    >
                      {isCompleted ? 'View Full Report' : 'Resume Session'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
