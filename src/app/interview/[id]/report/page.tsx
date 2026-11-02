'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Clock,
  Activity,
  ArrowLeft,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  AlertCircle,
  Lightbulb,
  FileText,
  RotateCcw,
  Check,
  TrendingUp,
} from 'lucide-react';
import { db } from '@/lib/db';
import { FullSessionData, DetailedQuestionSession } from '@/types';

export default function FeedbackReportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [sessionData, setSessionData] = useState<FullSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const data = await db.getSessionById(sessionId);
        if (!data) {
          router.push('/dashboard');
          return;
        }
        setSessionData(data);
        // Expand first question by default
        if (data.items.length > 0) {
          setExpandedQuestions({ [data.items[0].question.id]: true });
        }
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId, router]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading || !sessionData) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Generating executive feedback report...</p>
        </div>
      </div>
    );
  }

  const { session, user, items } = sessionData;
  const overallScore = session.overall_score || 85;

  const getScoreClassification = (score: number) => {
    if (score >= 90) return { title: 'Executive Ready • Top 5%', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 80) return { title: 'Senior Qualified • Strong Hire', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    return { title: 'Developing • Action Items Identified', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const classification = getScoreClassification(overallScore);

  // Calculate aggregates
  const totalDuration = session.duration || items.reduce((acc, it) => acc + (it.response?.duration || 0), 0);
  const totalFillers = items.reduce((acc, it) => acc + (it.response?.filler_word_count || 0), 0);
  const avgWpm =
    items.length > 0
      ? Math.round(
          items.reduce((acc, it) => acc + (it.response?.speaking_pace_wpm || 0), 0) / items.length
        )
      : 140;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      {/* Top Navigation & Print Actions */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>

          <Link
            href="/interview/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start Another Simulation
          </Link>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                {session.difficulty.toUpperCase()} • {session.interview_type.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${classification.color}`}>
                {classification.title}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Evaluation Report: {session.target_role}
            </h1>

            <p className="text-xs text-slate-500">
              Evaluated for {user.name} • {new Date(session.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Overall Big Score Dial */}
          <div className="flex items-center sm:flex-col items-end sm:items-center justify-between sm:justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 min-w-[140px]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall Score
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">{overallScore}</span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Calibrated
            </span>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Total Duration
            </span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {Math.floor(totalDuration / 60)}m {totalDuration % 60}s
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              Speaking Pace
            </span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {avgWpm} <span className="text-xs font-normal text-slate-500">WPM</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              Total Vocal Fillers
            </span>
            <p
              className={`text-lg font-bold mt-1 ${
                totalFillers > 5 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {totalFillers} <span className="text-xs font-normal text-slate-500">fillers</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Questions Covered
            </span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {items.length} <span className="text-xs font-normal text-slate-500">prompts</span>
            </p>
          </div>
        </div>
      </div>

      {/* Question-by-Question Deep Dive */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Question-by-Question Rubric Evaluation
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            STAR framework & model answers
          </span>
        </div>

        {items.map((item, idx) => {
          const q = item.question;
          const resp = item.response;
          const evalItem = item.evaluation;
          const isExpanded = !!expandedQuestions[q.id];

          return (
            <div
              key={q.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition"
            >
              {/* Question Collapsible Header */}
              <button
                type="button"
                onClick={() => toggleQuestion(q.id)}
                className="w-full p-6 text-left hover:bg-slate-50/60 transition flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600">Question {idx + 1}</span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {q.competency_category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {q.ai_question_prompt}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {evalItem?.star_adherence?.score && (
                    <span className="text-sm font-black text-slate-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl">
                      {evalItem.star_adherence.score}% STAR
                    </span>
                  )}
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-6 pt-0 border-t border-slate-100 space-y-6">
                  {/* Candidate Verbatim Transcript */}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Candidate Spoken Transcript
                      </span>
                      {resp && (
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{resp.duration}s duration</span>
                          <span>•</span>
                          <span>{resp.speaking_pace_wpm} WPM</span>
                          <span>•</span>
                          <span>{resp.filler_word_count} fillers</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans">
                      {resp?.verbatim_transcript || (
                        <span className="italic text-slate-400">No response recorded.</span>
                      )}
                    </div>
                  </div>

                  {/* STAR Adherence Breakdown */}
                  {evalItem?.star_adherence && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          STAR Method Alignment Analysis
                        </span>
                        <span className="text-xs font-semibold text-indigo-600">
                          Score: {evalItem.star_adherence.score}/100
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                          <span className="text-xs font-bold text-slate-900 block mb-1">
                            S — Situation
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {evalItem.star_adherence.situation}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                          <span className="text-xs font-bold text-slate-900 block mb-1">
                            T — Task
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {evalItem.star_adherence.task}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                          <span className="text-xs font-bold text-slate-900 block mb-1">
                            A — Action
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {evalItem.star_adherence.action}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                          <span className="text-xs font-bold text-slate-900 block mb-1">
                            R — Result
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {evalItem.star_adherence.result}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strengths & Improvements Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Executive Strengths
                      </div>
                      <ul className="space-y-1.5 text-xs text-emerald-800 leading-relaxed">
                        {evalItem?.strengths?.map((str, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        Actionable Areas to Elevate
                      </div>
                      <ul className="space-y-1.5 text-xs text-amber-800 leading-relaxed">
                        {evalItem?.improvements?.map((imp, iIdx) => (
                          <li key={iIdx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Crafted Ideal Executive Standard Answer */}
                  {evalItem?.ideal_answer && (
                    <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        AI Benchmark Model Answer (Top 1% Standard)
                      </div>
                      <p className="text-xs text-indigo-900 leading-relaxed font-sans">
                        {evalItem.ideal_answer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
