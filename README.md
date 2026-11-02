# ExecutivePrep AI — Enterprise AI Mock Interview Studio

A complete, production-ready, full-stack AI Mock Interview web application engineered for working professionals. Calibrated for Director, Staff, and Principal engineering and product leadership roles.

---

## 🌟 Key Architecture & Capabilities

1. **Framework & Modern Stack**:
   - **Next.js 14 (App Router)** with React 18, TypeScript, Tailwind CSS, and Lucide icons.
   - Fully optimized production build with zero broken links or dummy states.

2. **Cloud Database (Supabase PostgreSQL + RLS)**:
   - Complete Row-Level Security (RLS) schema (`supabase/schema.sql`) and rich seed script (`supabase/seed.sql`).
   - Tables:
     - `public.users` (id, name, email, current_role, years_of_experience, industry, target_role, resume_text, timestamps)
     - `public.sessions` (id, user_id, target_role, interview_type, difficulty, duration, overall_score, completion_status)
     - `public.questions` (id, session_id, sequence_number, ai_question_prompt, competency_category)
     - `public.responses` (id, question_id, session_id, verbatim_transcript, duration, speaking_pace_wpm, filler_word_count)
     - `public.evaluations` (id, session_id, question_id, category_scores, star_adherence, strengths, improvements, ideal_answer)
   - Dual-mode architecture: Connects directly to Supabase cloud when credentials are configured in `.env.local` or operates with persistent client/server repository with instant zero-crash fallback.

3. **Google Gemini AI Engine**:
   - Adaptive Questioning (`/api/interview/generate-questions`): Generates demanding, realistic multi-step questions tailored by seniority, category, and candidate's uploaded resume context.
   - Structured Rubric Grading (`/api/interview/evaluate`): Evaluates candidate responses against the **STAR framework** (Situation, Task, Action, Result), analyzes speaking pace (WPM), flags vocal fillers, extracts key strengths, identifies growth areas, and generates an AI model executive answer.

4. **Audio & Voice Studio**:
   - **Text-to-Speech (TTS)**: Web Speech API (`SpeechSynthesis`) powers the AI interviewer voice with natural cadence, pause/play controls, and speaking pulse animations.
   - **Speech-to-Text (STT)**: Web Speech API (`SpeechRecognition`) provides live continuous transcription as the user speaks.
   - **Web Audio API**: Real-time microphone frequency analyzer rendering responsive equalizer waveform bars.
   - **Real-Time Analytics**: Live speaking cadence (Words Per Minute), vocal filler detector ("um", "uh", "like", "you know"), response timer, and editable verbatim transcript.

5. **Distraction-Free Executive Design System**:
   - Off-white canvas (`#F8FAFC`), pure white cards (`#FFFFFF`), deep slate typography (`#0F172A`), subtle borders (`#E2E8F0`), and deep indigo accents (`#4F46E5`).

---

## 🚀 Quick Start Guide

### 1. Installation & Local Development
```bash
# Clone or navigate to the repository
cd "mock interview"

# Install dependencies
npm install

# Run the development server
npm run dev

# Or build and launch the production server
npm run build
npm run start
```
Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### 2. Database Setup (Supabase)

1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Paste and run the schema file:
   ```sql
   -- Found at: supabase/schema.sql
   ```
4. Optional: Run the seed script to load sample executive records:
   ```sql
   -- Found at: supabase/seed.sql
   ```
5. Copy your project URL and Anon key into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   GEMINI_API_KEY=AIzaSy...
   ```

---

## 📂 Application Pages

- `/dashboard`: Live database analytics, competency radar breakdown, practice time, and session history.
- `/interview/new`: Configure target role, seniority level (Mid-level to Executive), category (Behavioral, System Architecture, Technical Depth), and resume grounding.
- `/interview/[id]`: The live Audio Interview Studio with speech synthesis, mic audio analyzer, WPM calculator, and transcript editor.
- `/interview/[id]/report`: Detailed Executive Feedback Report with STAR adherence scoring, filler word counts, strengths, areas for improvement, and ideal benchmark answers.
- `/profile`: Candidate credentials, years of experience, industry, target role, and executive resume text grounding.
- `/history`: Searchable and filterable archive of all completed and in-progress interview sessions.
- `/auth/login`: Authentication with email/password, OAuth providers, and 1-click demo access.
