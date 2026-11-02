'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mic,
  BarChart3,
  PlusCircle,
  User,
  History,
  ShieldCheck,
  Settings,
  Sparkles,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { db } from '@/lib/db';
import { UserProfile } from '@/types';
import ConfigModal from '@/components/common/ConfigModal';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    db.getCurrentUser().then((u) => setUser(u));
    setIsCloudConnected(db.isCloudConnected());
  }, [pathname]);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/interview/new', label: 'New Interview', icon: PlusCircle },
    { href: '/history', label: 'Session History', icon: History },
    { href: '/profile', label: 'Profile & Resume', icon: User },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-lg tracking-tight">ExecutivePrep</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Enterprise Mock Interview Studio</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-100 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls & Profile */}
          <div className="flex items-center gap-3">
            {/* Cloud & AI Sync Pill */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              title="Click to view Supabase & Gemini API connection status"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCloudConnected ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
              />
              <span className="text-slate-600">
                {isCloudConnected ? 'Supabase Cloud' : 'Local Persistence'}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Profile Avatar Pill */}
            <Link
              href="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                {user?.name ? user.name.charAt(0) : 'E'}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.name || 'Candidate'}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {user?.current_role || 'Executive'}
                </p>
              </div>
            </Link>

            {/* Mobile Nav Menu Button */}
            <Link
              href="/interview/new"
              className="md:hidden p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-2 flex justify-around">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 text-[11px] ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Settings / Cloud Modal */}
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </>
  );
}
