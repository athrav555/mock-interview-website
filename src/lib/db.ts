import { supabase, isSupabaseConfigured } from './supabase/client';
import {
  UserProfile,
  Session,
  Question,
  UserResponse,
  Evaluation,
  FullSessionData,
  AnalyticsSummary,
  InterviewType,
  SeniorityLevel,
} from '@/types';

// Default Demo User Profile (matching seed.sql)
const DEFAULT_USER: UserProfile = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@executive-candidate.io',
  current_role: 'Senior Engineering Lead',
  years_of_experience: 9,
  industry: 'FinTech & High-Frequency Cloud Infrastructure',
  target_role: 'Director of Engineering / Principal Systems Architect',
  resume_text:
    'Senior Engineering Leader with 9+ years delivering Tier-0 distributed systems, real-time transaction engines (sub-15ms p99), and leading 35+ engineers across platform, SRE, and product teams. Architected cloud migrations reducing annual cloud expenditure by $1.8M while maintaining 99.995% uptime SLA.',
  created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

// Initial Seed Data for immediate full functional operation
const SEED_SESSIONS: Session[] = [
  {
    id: 'b1c2d3e4-f5a6-7b8c-9d0e-2f3a4b5c6d7e',
    user_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    target_role: 'Principal Systems Architect',
    interview_type: 'system_design',
    difficulty: 'staff',
    duration: 1850,
    overall_score: 92.0,
    completion_status: 'completed',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'c1d2e3f4-a5b6-7c8d-9e0f-3a4b5c6d7e8f',
    user_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    target_role: 'Director of Engineering',
    interview_type: 'behavioral',
    difficulty: 'executive',
    duration: 1420,
    overall_score: 88.5,
    completion_status: 'completed',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const SEED_QUESTIONS: Question[] = [
  {
    id: 'd1e2f3a4-b5c6-7d8e-9f0a-4b5c6d7e8f9a',
    session_id: 'b1c2d3e4-f5a6-7b8c-9d0e-2f3a4b5c6d7e',
    sequence_number: 1,
    ai_question_prompt:
      'Design a globally distributed payment ledger supporting idempotency, exactly-once processing semantics, and 20,000 writes per second with sub-50ms latency across regions.',
    competency_category: 'High-Scale Distributed Systems',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'e1f2a3b4-c5d6-7e8f-9a0b-5c6d7e8f9a0b',
    session_id: 'b1c2d3e4-f5a6-7b8c-9d0e-2f3a4b5c6d7e',
    sequence_number: 2,
    ai_question_prompt:
      'How would you handle a split-brain scenario during a cross-oceanic fiber cut while transactions are actively hitting both US-East and EU-West regions?',
    competency_category: 'Consensus & Fault Tolerance',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'f1a2b3c4-d5e6-7f8a-9b0c-6d7e8f9a0b1c',
    session_id: 'c1d2e3f4-a5b6-7c8d-9e0f-3a4b5c6d7e8f',
    sequence_number: 1,
    ai_question_prompt:
      'Describe a time when you had to align executive stakeholders who had fundamentally conflicting priorities on a major multi-million dollar infrastructure overhaul.',
    competency_category: 'Executive Stakeholder Management & Influence',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const SEED_RESPONSES: UserResponse[] = [
  {
    id: 'resp-1',
    question_id: 'd1e2f3a4-b5c6-7d8e-9f0a-4b5c6d7e8f9a',
    session_id: 'b1c2d3e4-f5a6-7b8c-9d0e-2f3a4b5c6d7e',
    verbatim_transcript:
      'To achieve 20k writes per second with strict idempotency and exactly-once semantics, I would separate ingestion from consensus. At the API boundary, each request carries a cryptographically hashed client idempotency key stored in a distributed Redis cluster with TTLs. For the storage layer, I would utilize a partitioned Raft-based consensus log like Spanner or CockroachDB with localized leader leases. Write operations are routed to the account owner shard, eliminating multi-shard two-phase commits for 95% of standard transactions. Read replicas handle audit queries asynchronously with bounded staleness.',
    duration: 210,
    speaking_pace_wpm: 142.5,
    filler_word_count: 1,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'resp-2',
    question_id: 'e1f2a3b4-c5d6-7e8f-9a0b-5c6d7e8f9a0b',
    session_id: 'b1c2d3e4-f5a6-7b8c-9d0e-2f3a4b5c6d7e',
    verbatim_transcript:
      'During a cross-ocean partition, CAP theorem dictates we must prioritize Consistency over Availability for financial transfers. In a Raft or Paxos cluster with an odd quorum (e.g. 5 nodes: 2 in US, 2 in EU, 1 witness in a neutral region like Ireland or central US), only the partition retaining the majority quorum can accept writes. The minority partition immediately degrades to read-only mode for verified cache states and returns 503 retry-after headers for mutation requests. This strictly prevents divergence or double-spend anomalies.',
    duration: 195,
    speaking_pace_wpm: 138.0,
    filler_word_count: 2,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'resp-3',
    question_id: 'f1a2b3c4-d5e6-7f8a-9b0c-6d7e8f9a0b1c',
    session_id: 'c1d2e3f4-a5b6-7c8d-9e0f-3a4b5c6d7e8f',
    verbatim_transcript:
      'At my previous company, our Chief Commercial Officer wanted immediate feature velocity for an enterprise RFP, while our VP of Security insisted on halting releases for a comprehensive cloud SOC2 compliance re-architecture. I recognized that neither could afford failure. I arranged a quantitative risk-matrix workshop. Instead of debating technical details, I framed the trade-off in business metrics: enterprise revenue at risk versus compliance liability costs. We developed a phased migration strategy where high-value RFP capabilities were containerized in the target compliant VPC first. This unblocked $4.2M in pipeline while completing 100% of audit requirements 3 weeks ahead of schedule.',
    duration: 185,
    speaking_pace_wpm: 144.0,
    filler_word_count: 0,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const SEED_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-1',
    session_id: 'b1c2d3e4-f5a6-7b8c-9d0e-2f3a4b5c6d7e',
    question_id: 'd1e2f3a4-b5c6-7d8e-9f0a-4b5c6d7e8f9a',
    category_scores: {
      technical_depth: 95,
      system_scalability: 94,
      communication: 90,
      tradeoff_analysis: 91,
    },
    star_adherence: {
      situation: 'Identified high-frequency distributed ledger requirements.',
      task: 'Architected ingestion, routing, and consensus layers.',
      action: 'Selected Raft-based partitioned datastore with client idempotency hash keys.',
      result: 'Guaranteed zero double-spend with sub-50ms localized p99.',
      score: 93,
    },
    strengths: [
      'Crisp articulation of the separation between API idempotency and storage consensus',
      'Accurate trade-off evaluation between 2PC and single-shard ownership routing',
      'Explicit consideration of bounded staleness for read replicas',
    ],
    improvements: [
      'Detail cold-start recovery mechanisms if the Redis idempotency cache experiences eviction bursts',
      'Elaborate on write amplification and LSM-tree compaction under continuous 20k writes',
    ],
    ideal_answer:
      'An executive-level answer starts by defining SLA boundaries and data volume (20,000 RPS * 1KB payload = ~20MB/s ingestion). It establishes a dual-tier architecture: edge load balancers verifying Bloom filters for rapid deduplication, an in-memory distributed log (e.g., Apache Pulsar) persisting transactional intent, and a partitioned multi-leader transactional store utilizing Paxos-based deterministic locking. By sharding by customer tenant ID, cross-node distributed transactions are minimized to under 3% of global volume.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'eval-2',
    session_id: 'b1c2d3e4-f5a6-7b8c-9d0e-2f3a4b5c6d7e',
    question_id: 'e1f2a3b4-c5d6-7e8f-9a0b-5c6d7e8f9a0b',
    category_scores: {
      technical_depth: 92,
      system_scalability: 91,
      communication: 92,
      tradeoff_analysis: 93,
    },
    star_adherence: {
      situation: 'Fiber cut severance between transatlantic regions.',
      task: 'Maintain financial safety and prevent ledger divergence.',
      action: 'Odd quorum Raft routing with automated degraded read-only mode for isolated nodes.',
      result: 'Zero split-brain state with automated 503 backoff.',
      score: 91,
    },
    strengths: [
      'Decisive invocation of CAP theorem prioritizing CP over AP for financial records',
      'Use of witness node in neutral region to ensure clean quorum determination',
    ],
    improvements: [
      'Discuss client-side retry exponential backoff strategies to prevent thundering herd when connectivity restores',
    ],
    ideal_answer:
      'For high-value financial transactions, Consistency always supersedes Availability during network partitions. Using an odd-numbered five-member Paxos consensus group across three regions (2 in US, 2 in EU, 1 in Ireland) guarantees one region forms majority quorum. Minority nodes flip to read-only gracefully and issue HTTP 429/503 headers with jittered Retry-After headers, while automated alerting activates traffic re-routing.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'eval-3',
    session_id: 'c1d2e3f4-a5b6-7c8d-9e0f-3a4b5c6d7e8f',
    question_id: 'f1a2b3c4-d5e6-7f8a-9b0c-6d7e8f9a0b1c',
    category_scores: {
      leadership: 92,
      stakeholder_management: 90,
      strategic_clarity: 88,
      executive_presence: 89,
    },
    star_adherence: {
      situation: 'CCO and VP Security in deadlock over enterprise sales velocity vs SOC2 security audit freeze.',
      task: 'Align executive stakeholders without compromising either compliance or revenue.',
      action: 'Built quantitative risk matrix and architected phased VPC rollout for priority features.',
      result: 'Unlocked $4.2M pipeline and finished compliance 3 weeks ahead of schedule.',
      score: 94,
    },
    strengths: [
      'Exemplary STAR structure with quantified business impact ($4.2M pipeline)',
      'Framed engineering constraints in executive business terms (revenue at risk vs liability)',
      'Zero filler words, steady professional pacing',
    ],
    improvements: [
      'Mention ongoing executive governance rituals instituted to prevent similar bottlenecks in future quarters',
    ],
    ideal_answer:
      'An exceptional executive response highlights strategic empathy: acknowledging both business drivers (revenue momentum) and fiduciary risk (regulatory exposure). It outlines the synthesis of differing viewpoints through data-driven options (Option A: Speed with quantified risk, Option B: Full freeze with delayed ARR, Option C: Phased hybrid with isolated blast radiuses). The candidate demonstrates poise, cross-functional leadership, and measurable top-line outcomes.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// In-Memory Storage for server / local state
class LocalStore {
  user: UserProfile = { ...DEFAULT_USER };
  sessions: Session[] = [...SEED_SESSIONS];
  questions: Question[] = [...SEED_QUESTIONS];
  responses: UserResponse[] = [...SEED_RESPONSES];
  evaluations: Evaluation[] = [...SEED_EVALUATIONS];

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('vantage_user');
        if (u) this.user = JSON.parse(u);
        const s = localStorage.getItem('vantage_sessions');
        if (s) this.sessions = JSON.parse(s);
        const q = localStorage.getItem('vantage_questions');
        if (q) this.questions = JSON.parse(q);
        const r = localStorage.getItem('vantage_responses');
        if (r) this.responses = JSON.parse(r);
        const e = localStorage.getItem('vantage_evaluations');
        if (e) this.evaluations = JSON.parse(e);
      } catch (err) {
        console.warn('Could not load from localStorage:', err);
      }
    }
  }

  saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vantage_user', JSON.stringify(this.user));
        localStorage.setItem('vantage_sessions', JSON.stringify(this.sessions));
        localStorage.setItem('vantage_questions', JSON.stringify(this.questions));
        localStorage.setItem('vantage_responses', JSON.stringify(this.responses));
        localStorage.setItem('vantage_evaluations', JSON.stringify(this.evaluations));
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }
    }
  }
}

// Global singleton
const localStore = new LocalStore();

export const db = {
  isCloudConnected(): boolean {
    return isSupabaseConfigured();
  },

  async getCurrentUser(): Promise<UserProfile> {
    if (isSupabaseConfigured() && supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data && !error) {
          return data as UserProfile;
        }

        // If user is in auth but not in users table yet, create profile
        const newProfile: UserProfile = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Executive Candidate',
          email: session.user.email || '',
          current_role: 'Senior Engineering Professional',
          years_of_experience: 8,
          industry: 'Technology',
          target_role: 'Director of Engineering',
          resume_text: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('users').upsert(newProfile);
        return newProfile;
      }
    }

    return localStore.user;
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured() && supabase) {
      const currentUser = await this.getCurrentUser();
      const updated = {
        ...currentUser,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(updated)
        .select()
        .single();

      if (!error && data) {
        return data as UserProfile;
      }
    }

    localStore.user = {
      ...localStore.user,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStore.saveToLocalStorage();
    return localStore.user;
  },

  async getSessions(userId?: string): Promise<Session[]> {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('sessions').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Session[];
      }
    }

    return [...localStore.sessions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async getSessionById(sessionId: string): Promise<FullSessionData | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data: sessionData, error: sessionErr } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionData && !sessionErr) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionData.user_id)
          .single();

        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('session_id', sessionId)
          .order('sequence_number', { ascending: true });

        const { data: responsesData } = await supabase
          .from('responses')
          .select('*')
          .eq('session_id', sessionId);

        const { data: evaluationsData } = await supabase
          .from('evaluations')
          .select('*')
          .eq('session_id', sessionId);

        const items: FullSessionData['items'] = (questionsData || []).map((q) => {
          const resp = responsesData?.find((r) => r.question_id === q.id);
          const evalItem = evaluationsData?.find((e) => e.question_id === q.id);
          return {
            question: q as Question,
            response: resp as UserResponse | undefined,
            evaluation: evalItem as Evaluation | undefined,
          };
        });

        return {
          session: sessionData as Session,
          user: (userProfile as UserProfile) || localStore.user,
          items,
        };
      }
    }

    const session = localStore.sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    const questions = localStore.questions
      .filter((q) => q.session_id === sessionId)
      .sort((a, b) => a.sequence_number - b.sequence_number);

    const items = questions.map((q) => {
      const response = localStore.responses.find((r) => r.question_id === q.id);
      const evaluation = localStore.evaluations.find((e) => e.question_id === q.id);
      return { question: q, response, evaluation };
    });

    return {
      session,
      user: localStore.user,
      items,
    };
  },

  async createSession(params: {
    userId: string;
    targetRole: string;
    interviewType: InterviewType;
    difficulty: SeniorityLevel;
    questions: { prompt: string; category: string }[];
  }): Promise<{ session: Session; questions: Question[] }> {
    const sessionId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'sess-' + Math.random().toString(36).substring(2, 9);

    const newSession: Session = {
      id: sessionId,
      user_id: params.userId,
      target_role: params.targetRole,
      interview_type: params.interviewType,
      difficulty: params.difficulty,
      duration: 0,
      overall_score: null,
      completion_status: 'in_progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newQuestions: Question[] = params.questions.map((q, idx) => ({
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `q-${sessionId}-${idx + 1}`,
      session_id: sessionId,
      sequence_number: idx + 1,
      ai_question_prompt: q.prompt,
      competency_category: q.category,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('sessions').insert(newSession);
        await supabase.from('questions').insert(newQuestions);
      } catch (err) {
        console.error('Supabase createSession error:', err);
      }
    }

    localStore.sessions.unshift(newSession);
    localStore.questions.push(...newQuestions);
    localStore.saveToLocalStorage();

    return { session: newSession, questions: newQuestions };
  },

  async saveResponse(params: {
    questionId: string;
    sessionId: string;
    verbatimTranscript: string;
    duration: number;
    speakingPaceWpm: number;
    fillerWordCount: number;
  }): Promise<UserResponse> {
    const responseId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'resp-' + Math.random().toString(36).substring(2, 9);

    const newResponse: UserResponse = {
      id: responseId,
      question_id: params.questionId,
      session_id: params.sessionId,
      verbatim_transcript: params.verbatimTranscript,
      duration: params.duration,
      speaking_pace_wpm: params.speakingPaceWpm,
      filler_word_count: params.fillerWordCount,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('responses').insert(newResponse);
      } catch (err) {
        console.error('Supabase saveResponse error:', err);
      }
    }

    // Replace if exists for question or push
    const existingIndex = localStore.responses.findIndex(
      (r) => r.question_id === params.questionId
    );
    if (existingIndex >= 0) {
      localStore.responses[existingIndex] = newResponse;
    } else {
      localStore.responses.push(newResponse);
    }
    localStore.saveToLocalStorage();

    return newResponse;
  },

  async saveEvaluation(evaluation: Evaluation): Promise<Evaluation> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('evaluations').insert(evaluation);
      } catch (err) {
        console.error('Supabase saveEvaluation error:', err);
      }
    }

    const existingIdx = localStore.evaluations.findIndex(
      (e) => e.question_id === evaluation.question_id
    );
    if (existingIdx >= 0) {
      localStore.evaluations[existingIdx] = evaluation;
    } else {
      localStore.evaluations.push(evaluation);
    }
    localStore.saveToLocalStorage();

    return evaluation;
  },

  async completeSession(
    sessionId: string,
    overallScore: number,
    durationSeconds: number
  ): Promise<Session> {
    const updates = {
      overall_score: overallScore,
      duration: durationSeconds,
      completion_status: 'completed' as const,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('sessions')
          .update(updates)
          .eq('id', sessionId)
          .select()
          .single();
        if (data) return data as Session;
      } catch (err) {
        console.error('Supabase completeSession error:', err);
      }
    }

    const sess = localStore.sessions.find((s) => s.id === sessionId);
    if (sess) {
      sess.overall_score = overallScore;
      sess.duration = durationSeconds;
      sess.completion_status = 'completed';
      sess.updated_at = new Date().toISOString();
      localStore.saveToLocalStorage();
      return sess;
    }

    throw new Error('Session not found: ' + sessionId);
  },

  async getAnalyticsSummary(userId?: string): Promise<AnalyticsSummary> {
    const sessions = await this.getSessions(userId);
    const completedSessions = sessions.filter(
      (s) => s.completion_status === 'completed' && s.overall_score !== null
    );

    const totalSessions = sessions.length;
    const completedCount = completedSessions.length;

    const totalScore = completedSessions.reduce((acc, s) => acc + (s.overall_score || 0), 0);
    const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

    const totalPracticeSeconds = completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalPracticeTimeMinutes = Math.round(totalPracticeSeconds / 60);

    // Compute average WPM across responses
    const allResponses = localStore.responses;
    const totalWpm = allResponses.reduce((acc, r) => acc + (r.speaking_pace_wpm || 0), 0);
    const averageWpm = allResponses.length > 0 ? Math.round(totalWpm / allResponses.length) : 140;

    // Competency breakdown
    const competencyMap: Record<string, { total: number; count: number }> = {
      'Strategic Leadership': { total: 91, count: 1 },
      'High-Scale Architecture': { total: 94, count: 1 },
      'Communication & Delivery': { total: 89, count: 1 },
      'Problem Solving & Trade-offs': { total: 92, count: 1 },
      'Executive Presence': { total: 88, count: 1 },
    };

    localStore.evaluations.forEach((ev) => {
      if (ev.category_scores) {
        Object.entries(ev.category_scores).forEach(([key, val]) => {
          const formattedKey = key
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          if (!competencyMap[formattedKey]) {
            competencyMap[formattedKey] = { total: 0, count: 0 };
          }
          competencyMap[formattedKey].total += val;
          competencyMap[formattedKey].count += 1;
        });
      }
    });

    const competencyScores = Object.entries(competencyMap).map(([category, val]) => ({
      category,
      score: Math.round(val.total / Math.max(1, val.count)),
    }));

    const scoreTrend = completedSessions
      .slice(0, 7)
      .reverse()
      .map((s) => ({
        date: new Date(s.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        score: s.overall_score || 0,
        title: s.target_role,
      }));

    return {
      totalSessions,
      completedSessions: completedCount,
      averageScore,
      totalPracticeTimeMinutes,
      averageWpm,
      competencyScores,
      recentSessions: sessions.slice(0, 5),
      scoreTrend,
    };
  },
};
