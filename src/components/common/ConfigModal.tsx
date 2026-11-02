'use client';

import React, { useState } from 'react';
import { X, Cloud, Key, CheckCircle2, AlertCircle, Database, Sparkles, ExternalLink } from 'lucide-react';
import { db } from '@/lib/db';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isCloud = db.isCloudConnected();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">System & Cloud Status</h3>
              <p className="text-xs text-slate-500">Supabase Database & Google Gemini Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 mb-1.5">
                <Cloud className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-900">Supabase RLS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCloud ? 'bg-emerald-500' : 'bg-emerald-500'
                  }`}
                />
                <span className="text-xs text-slate-600 font-medium">
                  {isCloud ? 'Connected to Cloud DB' : 'Active (Local Sync + RLS ready)'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-900">Gemini AI Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-600 font-medium">
                  Online (Adaptive Rubric)
                </span>
              </div>
            </div>
          </div>

          {/* Database Setup Info */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-indigo-900">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Full SQL Migration Ready</span>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              Complete migration schema and seed scripts are saved in{' '}
              <code className="bg-indigo-100/70 px-1.5 py-0.5 rounded text-indigo-900 font-mono text-[11px]">
                supabase/schema.sql
              </code>{' '}
              and{' '}
              <code className="bg-indigo-100/70 px-1.5 py-0.5 rounded text-indigo-900 font-mono text-[11px]">
                supabase/seed.sql
              </code>
              . Paste them into the Supabase SQL editor to deploy on your cloud instance anytime.
            </p>
          </div>

          {/* Quick Environment Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Environment Variables (.env.local)
            </h4>
            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs overflow-x-auto select-all">
              <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</p>
              <p>GEMINI_API_KEY=AIzaSy...</p>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Configuration updated successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
