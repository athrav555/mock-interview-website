'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Save,
  FileText,
  Briefcase,
  CheckCircle2,
  Sparkles,
  UploadCloud,
  Shield,
  Layers,
} from 'lucide-react';
import { db } from '@/lib/db';
import { UserProfile } from '@/types';

const SAMPLE_EXECUTIVE_RESUME = `SARAH JENKINS, LEAD SYSTEMS ARCHITECT
San Francisco, CA • sarah.jenkins@executive-candidate.io • (555) 019-2834

EXECUTIVE PROFILE:
Senior Engineering Leader with 9+ years delivering Tier-0 distributed systems, real-time transaction engines (sub-15ms p99), and leading 35+ engineers across platform, SRE, and product teams. Architected cloud migrations reducing annual cloud expenditure by $1.8M while maintaining 99.995% uptime SLA. Specialized in high-scale distributed consensus, CAP-theorem trade-offs, and executive cross-functional leadership.

CORE EXPERTISE:
- Distributed Systems Architecture (Kafka, gRPC, Raft, CockroachDB, Redis Cluster)
- Cloud Infrastructure & Scalability (AWS, GCP, Kubernetes, Terraform)
- Executive Leadership & Alignment (OKRs, headcount planning, engineering culture, SOC2 audit governance)
- Performance & Reliability (High-throughput 500k+ RPS, chaos engineering, latency tuning)

PROFESSIONAL EXPERIENCE:
Lead Systems Architect | CloudFin Systems (2021 – Present)
- Architected a globally distributed ledger processing $12B+ in annual transaction volume with zero double-spend anomalies.
- Led 4 engineering squads (28 engineers) across North America and Europe, establishing quarterly engineering RFC forums.
- Reduced p99 API latency from 180ms to 24ms by introducing partitioned in-memory caching and connection pooling.

Senior Distributed Infrastructure Engineer | Apex Data Labs (2018 – 2021)
- Managed multi-region Kubernetes clusters handling 400M daily events with 99.99% availability.
- Spearheaded SOC2 Type II compliance re-architecture 3 weeks ahead of scheduled audit.`;

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [yearsOfExp, setYearsOfExp] = useState(8);
  const [industry, setIndustry] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const u = await db.getCurrentUser();
        setProfile(u);
        setName(u.name || '');
        setEmail(u.email || '');
        setCurrentRole(u.current_role || '');
        setYearsOfExp(u.years_of_experience || 8);
        setIndustry(u.industry || '');
        setTargetRole(u.target_role || '');
        setResumeText(u.resume_text || '');
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await db.updateUserProfile({
        name,
        email,
        current_role: currentRole,
        years_of_experience: Number(yearsOfExp),
        industry,
        target_role: targetRole,
        resume_text: resumeText,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Error updating profile in database.');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSampleResume = () => {
    setResumeText(SAMPLE_EXECUTIVE_RESUME);
    if (!currentRole) setCurrentRole('Senior Engineering Lead');
    if (!targetRole) setTargetRole('Director of Engineering / Principal Systems Architect');
    if (!industry) setIndustry('FinTech & High-Frequency Cloud Infrastructure');
    setYearsOfExp(9);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setResumeText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5" />
          Candidate Credentials & Grounding
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Executive Profile & Resume
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Save your experience details to calibrate the AI interviewer with authentic past career context.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Attributes */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Candidate Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Current Role
              </label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="e.g. Senior Engineering Lead"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Years of Professional Experience
              </label>
              <input
                type="number"
                min="0"
                max="45"
                value={yearsOfExp}
                onChange={(e) => setYearsOfExp(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Industry Domain
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Enterprise Cloud Platforms & FinTech"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Executive Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Director of Engineering / Principal Systems Architect"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                required
              />
            </div>
          </div>
        </div>

        {/* Resume Grounding Text */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Resume & Career Grounding Text
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The AI analyzes this background to synthesize realistic counter-questions and trade-offs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition">
                <UploadCloud className="w-3.5 h-3.5" />
                Upload .txt / .md
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleLoadSampleResume}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample Executive Resume
              </button>
            </div>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your executive resume text, notable architectural projects, team scope, and quantified metrics here..."
            rows={12}
            className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs font-mono leading-relaxed text-slate-900 bg-slate-50/50"
          />

          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Character count: {resumeText.length}</span>
            <span>Saved directly to Supabase cloud profile</span>
          </div>
        </div>

        {/* Success toast */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Executive profile and resume successfully saved to database!
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition transform active:scale-95 disabled:opacity-60"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating Database...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
