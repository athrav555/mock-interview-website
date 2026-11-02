import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'ExecutivePrep AI | Production AI Mock Interview Studio',
  description:
    'Distraction-free AI mock interview web application designed for working professionals. Real voice-to-text, Gemini rubric grading, and Supabase cloud persistence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <main className="pb-16">{children}</main>
      </body>
    </html>
  );
}
