'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  Volume2,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Briefcase,
  Users,
  Cpu,
  Compass,
  Check,
  FileText,
} from 'lucide-react';
import { db } from '@/lib/db';
import { UserProfile, InterviewType, SeniorityLevel } from '@/types';

export default function NewInterviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [targetRole, setTargetRole] = useState('');
  const [seniority, setSeniority] = useState<SeniorityLevel>('staff');
  const [interviewType, setInterviewType] = useState<InterviewType>('system_design');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [mode, setMode] = useState<'voice' | 'hybrid'>('voice');
  const [useResumeGrounding, setUseResumeGrounding] = useState(true);

  const POPULAR_ROLES = [
    'Director of Engineering',
    'Principal Distributed Systems Engineer',
    'Staff Backend Architect',
    'VP of Technology',
    'Engineering Manager (Platform & Core)',
    'Principal Technical Product Manager',
  ];

  useEffect(() => {
    async function initUser() {
      try {
        const u = await db.getCurrentUser();
        setUser(u);
        if (u?.target_role) {
          setTargetRole(u.target_role);
        } else {
          setTargetRole('Principal Distributed Systems Engineer');
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoadingUser(false);
      }
    }
    initUser();
  }, []);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      setErrorMsg('Please specify a target executive role.');
      return;
    }

    setGenerating(true);
    setErrorMsg('');

    try {
      // 1. Call Gemini to generate adaptive tailored questions
      const res = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          seniority,
          interviewType,
          resumeText: useResumeGrounding && user?.resume_text ? user.resume_text : '',
          questionCount,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate interview questions. Please try again.');
      }

      const data = await res.json();
      const generatedQuestions = data.questions || [];

      // 2. Save session and questions directly to database
      const { session } = await db.createSession({
        userId: user?.id || 'demo-user',
        targetRole,
        interviewType,
        difficulty: seniority,
        questions: generatedQuestions,
      });

      // 3. Navigate directly to the Interview Studio
      router.push(`/interview/${session.id}`);
    } catch (err: any) {
      console.error('Start interview error:', err);
      setErrorMsg(err.message || 'Unable to start interview. Check connectivity.');
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Adaptive Executive Calibration
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Configure Your Mock Interview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tailor the simulation parameters to your target seniority level and focus competencies.
        </p>
      </div>

      <form onSubmit={handleStartInterview} className="space-y-8">
        {/* Step 1: Target Executive Role */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <label className="block text-sm font-bold text-slate-900">
            1. Target Executive Role
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Director of Engineering / Staff Systems Architect"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm font-medium text-slate-900 bg-slate-50/50"
            required
          />

          {/* Quick Preset Pills */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">Quick selection for working professionals:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    targetRole === role
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Seniority Level */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <label className="block text-sm font-bold text-slate-900">
            2. Seniority Level Calibration
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'mid_level',
                title: 'Mid-Level',
                desc: '2–5 yrs • Core execution, implementation depth & clean delivery',
              },
              {
                id: 'senior',
                title: 'Senior Specialist',
                desc: '5–8 yrs • Independent domain ownership, project leadership & mentorship',
              },
              {
                id: 'staff',
                title: 'Staff / Principal',
                desc: '8–12 yrs • Multi-team architecture, trade-off rigor & high-scale strategy',
              },
              {
                id: 'executive',
                title: 'Director / Executive',
                desc: '12+ yrs • Organizational influence, capital allocation & C-level alignment',
              },
            ].map((lvl) => {
              const isSelected = seniority === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSeniority(lvl.id as SeniorityLevel)}
                  className={`p-4 rounded-xl border text-left transition flex items-start justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{lvl.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{lvl.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Interview Category */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <label className="block text-sm font-bold text-slate-900">
            3. Interview Category
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'behavioral',
                title: 'Behavioral & Leadership',
                icon: Users,
                desc: 'STAR framework, cross-functional conflicts & high-stakes decisions',
              },
              {
                id: 'system_design',
                title: 'System Architecture',
                icon: Cpu,
                desc: 'High-throughput scaling, fault tolerance, consensus & tradeoffs',
              },
              {
                id: 'technical',
                title: 'Technical Depth',
                icon: Compass,
                desc: 'Algorithmic rigor, data consistency, caching & resilience',
              },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = interviewType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setInterviewType(cat.id as InterviewType)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{cat.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Mode & Questions Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Question Count */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <label className="block text-sm font-bold text-slate-900">
              4. Session Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                    questionCount === num
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Estimated duration: ~{questionCount * 5} minutes with comprehensive evaluation
            </p>
          </div>

          {/* Audio / Voice Mode */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <label className="block text-sm font-bold text-slate-900">
              5. Interviewer Audio Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('voice')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  mode === 'voice'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                Live Voice TTS
              </button>
              <button
                type="button"
                onClick={() => setMode('hybrid')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  mode === 'hybrid'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                Text + Mic Only
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Uses Web Speech API for voice synthesis and microphone transcription.
            </p>
          </div>
        </div>

        {/* Resume Grounding Context */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Ground Simulation in Saved Profile Resume
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                {user?.resume_text
                  ? `AI will cross-examine scenarios based on your ${user.years_of_experience} years of background in ${user.industry}.`
                  : 'No resume text loaded yet. AI will generate standard industry benchmarks.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={useResumeGrounding}
              onChange={(e) => setUseResumeGrounding(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={generating}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Synthesizing Adaptive Questions...
              </>
            ) : (
              <>
                Launch Interview Studio
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
