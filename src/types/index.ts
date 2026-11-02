export type InterviewType = 'behavioral' | 'technical' | 'system_design' | 'leadership';
export type SeniorityLevel = 'mid_level' | 'senior' | 'staff' | 'executive';
export type CompletionStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  current_role: string;
  years_of_experience: number;
  industry: string;
  target_role: string;
  resume_text: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  target_role: string;
  interview_type: InterviewType;
  difficulty: SeniorityLevel;
  duration: number; // in seconds
  overall_score: number | null; // 0 - 100
  completion_status: CompletionStatus;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  session_id: string;
  sequence_number: number;
  ai_question_prompt: string;
  competency_category: string;
  created_at: string;
}

export interface UserResponse {
  id: string;
  question_id: string;
  session_id: string;
  verbatim_transcript: string;
  duration: number; // in seconds
  speaking_pace_wpm: number;
  filler_word_count: number;
  created_at: string;
}

export interface StarAdherence {
  situation: string;
  task: string;
  action: string;
  result: string;
  score: number; // 0 - 100
}

export interface Evaluation {
  id: string;
  session_id: string;
  question_id: string;
  category_scores: Record<string, number>;
  star_adherence: StarAdherence;
  strengths: string[];
  improvements: string[];
  ideal_answer: string;
  created_at: string;
}

export interface DetailedQuestionSession {
  question: Question;
  response?: UserResponse;
  evaluation?: Evaluation;
}

export interface FullSessionData {
  session: Session;
  user: UserProfile;
  items: DetailedQuestionSession[];
}

export interface AnalyticsSummary {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalPracticeTimeMinutes: number;
  averageWpm: number;
  competencyScores: {
    category: string;
    score: number;
  }[];
  recentSessions: Session[];
  scoreTrend: {
    date: string;
    score: number;
    title: string;
  }[];
}
