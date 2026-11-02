'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Github,
  Chrome,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { db } from '@/lib/db';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSupabaseConfigured() && supabase) {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });
          if (error) throw error;
          setMessage({
            type: 'success',
            text: 'Account created successfully! Redirecting to dashboard...',
          });
          setTimeout(() => router.push('/dashboard'), 1000);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          setMessage({
            type: 'success',
            text: 'Signed in successfully. Redirecting...',
          });
          setTimeout(() => router.push('/dashboard'), 800);
        }
      } else {
        // Local persistence fallback
        await db.updateUserProfile({
          name: fullName || email.split('@')[0] || 'Executive Candidate',
          email: email || 'executive@candidate.io',
        });
        setMessage({
          type: 'success',
          text: 'Connected via local secure profile. Redirecting to dashboard...',
        });
        setTimeout(() => router.push('/dashboard'), 800);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Authentication error. Please verify credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      }
    } else {
      setMessage({
        type: 'success',
        text: `OAuth simulation for ${provider} active. Logging in...`,
      });
      setTimeout(() => router.push('/dashboard'), 800);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setMessage({
      type: 'success',
      text: 'Signing in as Sarah Jenkins (Lead Systems Architect)...',
    });
    setTimeout(() => {
      router.push('/dashboard');
    }, 700);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200 mb-2">
            <Mic className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isSignUp ? 'Create Candidate Account' : 'Executive Candidate Sign In'}
          </h1>
          <p className="text-xs text-slate-500">
            {isSignUp
              ? 'Join working professionals practicing with adaptive AI bar-raisers'
              : 'Enter your credentials to access your interview recordings and reports'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              {message.text}
            </div>
          )}

          {/* 1-Click Demo Login Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-indigo-950">Instant Evaluator Access</p>
              <p className="text-[11px] text-indigo-800">
                Log in as demo Executive Candidate with saved records
              </p>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition"
            >
              Quick Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 bg-slate-50/50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition transform active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : isSignUp ? (
                'Create Executive Account'
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Social OAuth Buttons */}
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] uppercase font-bold text-slate-400">
                Or Continue With
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                <Chrome className="w-4 h-4 text-slate-700" />
                Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                <Github className="w-4 h-4 text-slate-700" />
                GitHub
              </button>
            </div>
          </div>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage(null);
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              {isSignUp
                ? 'Already have an executive profile? Sign In'
                : "Don't have an account yet? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
