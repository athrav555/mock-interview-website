import { GoogleGenerativeAI } from '@google/generative-ai';
import { Evaluation, StarAdherence } from '@/types';

const geminiApiKey = process.env.GEMINI_API_KEY || '';

export const isGeminiConfigured = () => {
  return typeof geminiApiKey === 'string' && geminiApiKey.trim().length > 10;
};

// Clean JSON extraction helper
function extractJsonFromText(text: string): any {
  try {
    const clean = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(clean);
  } catch (err) {
    // Attempt to slice between first { and last } or [ and ]
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      return JSON.parse(text.slice(firstBracket, lastBracket + 1));
    }
    throw err;
  }
}

export async function generateAdaptiveQuestions(params: {
  targetRole: string;
  seniority: string;
  interviewType: string;
  resumeText?: string;
  questionCount?: number;
}): Promise<{ prompt: string; category: string }[]> {
  const count = params.questionCount || 3;

  if (isGeminiConfigured()) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are an elite executive interviewer at a top-tier tech enterprise (Google, Meta, Apple, Stripe) conducting a high-stakes interview for working professionals.
Generate exactly ${count} demanding, realistic interview questions for a candidate with the following profile:
- Target Role: ${params.targetRole}
- Seniority Level: ${params.seniority}
- Interview Category: ${params.interviewType}
${params.resumeText ? `- Candidate Resume / Experience Background: ${params.resumeText.slice(0, 1000)}` : ''}

Guidelines:
1. Calibrate questions specifically to ${params.seniority} expectations. For executive/staff, probe trade-offs, architecture under real scale, multi-team influence, or catastrophic failure recovery.
2. If resume background is provided, synthesize realistic challenges relevant to their domain.
3. Return ONLY a valid JSON array of objects. No markdown formatting, no explanations.
Schema:
[
  {
    "prompt": "Detailed realistic question...",
    "category": "Competency Category (e.g. Distributed Consensus, Strategic Influence, Failure Resilience)"
  }
]`;

      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      const parsed = extractJsonFromText(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, count).map((item) => ({
          prompt: String(item.prompt),
          category: String(item.category || 'Executive Competency'),
        }));
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to intelligent generator:', err);
    }
  }

  // High-caliber deterministic generator tailored by role and type
  const role = params.targetRole.toLowerCase();
  const type = params.interviewType.toLowerCase();
  const seniority = params.seniority.toLowerCase();

  if (type.includes('system') || role.includes('architect') || role.includes('distributed')) {
    return [
      {
        prompt: `Design a high-throughput, low-latency financial transaction ledger for ${params.targetRole}. Address idempotency, distributed consensus across multi-region data centers, and mitigation for split-brain network partitions during peak load.`,
        category: 'High-Scale Distributed Consensus',
      },
      {
        prompt: `Walk through your strategy for isolating and recovering from a cascading database connection exhaustion event in a microservices ecosystem processing 100k+ events per second.`,
        category: 'Resilience & Fault Tolerance',
      },
      {
        prompt: `How would you architect data retention and automated compaction for a petabyte-scale event stream while adhering strictly to global data sovereignty (GDPR, SOC2) with zero system downtime?`,
        category: 'Data Governance & Storage Architecture',
      },
    ].slice(0, count);
  }

  if (type.includes('behavioral') || type.includes('leadership') || seniority === 'executive' || seniority === 'staff') {
    return [
      {
        prompt: `Describe a situation in your role as ${params.targetRole} where two key C-level or executive stakeholders held diametrically opposing views on a mission-critical strategic roadmap. How did you navigate this and what measurable outcome did you achieve?`,
        category: 'Executive Stakeholder Alignment',
      },
      {
        prompt: `Tell me about a high-visibility initiative where unforeseen technical debt or external shifts caused a significant schedule delay. How did you realign leadership expectations and guide the team through crisis?`,
        category: 'Crisis Management & Strategic Communication',
      },
      {
        prompt: `How do you balance fostering technical excellence and long-term architectural stability against aggressive business pressure for quarterly feature delivery? Give a concrete past example.`,
        category: 'Strategic Prioritization & Trade-offs',
      },
    ].slice(0, count);
  }

  // Technical Depth / Problem Solving
  return [
    {
      prompt: `In the context of ${params.targetRole}, describe a time you diagnosed and resolved an elusive concurrency bug or race condition that only manifested under heavy asynchronous load in production.`,
      category: 'Concurrency & Deep Technical Debugging',
    },
    {
      prompt: `Evaluate the trade-offs between optimistic locking versus distributed pessimistic leases for a multi-tenant resource reservation system. When would you choose one over the other?`,
      category: 'Data Consistency & Concurrency Control',
    },
    {
      prompt: `How do you approach refactoring a mission-critical legacy component without interrupting ongoing business SLA? Describe the deployment strategy and regression safety nets you put in place.`,
      category: 'Engineering Rigor & Safe Deployment',
    },
  ].slice(0, count);
}

export async function evaluateAnswer(params: {
  questionPrompt: string;
  category: string;
  transcript: string;
  targetRole: string;
  seniority: string;
  durationSeconds: number;
  speakingPaceWpm: number;
  fillerWordCount: number;
}): Promise<{
  categoryScores: Record<string, number>;
  starAdherence: StarAdherence;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
  overallScore: number;
}> {
  const wordCount = params.transcript.trim().split(/\s+/).filter(Boolean).length;

  if (isGeminiConfigured()) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const evaluationPrompt = `You are a Principal Bar Raiser evaluating a candidate for ${params.targetRole} (${params.seniority} level).
Evaluate the candidate's spoken response rigorously against the STAR framework and executive presence criteria.

Interview Context:
- Question Asked: "${params.questionPrompt}"
- Competency: ${params.category}
- Candidate Spoken Transcript: "${params.transcript}"
- Response Duration: ${params.durationSeconds} seconds
- Speaking Pace: ${params.speakingPaceWpm} WPM
- Filler Word Count: ${params.fillerWordCount}

Requirements:
Return ONLY valid JSON matching this schema:
{
  "categoryScores": {
    "communication": number (0-100),
    "technical_depth": number (0-100),
    "problem_solving": number (0-100),
    "executive_presence": number (0-100)
  },
  "starAdherence": {
    "situation": "Concise summary of their situation context or what was missing",
    "task": "Analysis of their defined challenge or role responsibility",
    "action": "Specific decisive actions they took",
    "result": "Quantifiable impact and business outcome achieved",
    "score": number (0-100)
  },
  "strengths": ["Clear strength 1", "Clear strength 2", "Clear strength 3"],
  "improvements": ["Actionable improvement 1", "Actionable improvement 2"],
  "idealAnswer": "A compelling, masterfully structured executive-level response demonstrating top 1% performance.",
  "overallScore": number (0-100)
}`;

      const result = await model.generateContent(evaluationPrompt);
      const text = result.response.text();
      const parsed = extractJsonFromText(text);

      if (parsed && parsed.categoryScores && parsed.starAdherence) {
        return {
          categoryScores: parsed.categoryScores,
          starAdherence: parsed.starAdherence,
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Structured response'],
          improvements: Array.isArray(parsed.improvements)
            ? parsed.improvements
            : ['Provide more quantified metrics'],
          idealAnswer: parsed.idealAnswer || 'Focus on quantifying outcomes and business impact.',
          overallScore: Number(parsed.overallScore) || 85,
        };
      }
    } catch (err) {
      console.warn('Gemini evaluation failed, using deterministic rubric grader:', err);
    }
  }

  // Rigorous deterministic rubric evaluation based on transcript substance, STAR structure, pacing, and length
  const lower = params.transcript.toLowerCase();

  // STAR indicators
  const hasSituation =
    lower.includes('when') || lower.includes('at my') || lower.includes('company') || lower.includes('project') || lower.includes('team');
  const hasTask =
    lower.includes('task') || lower.includes('goal') || lower.includes('objective') || lower.includes('needed to') || lower.includes('challenge');
  const hasAction =
    lower.includes('i architected') || lower.includes('i decided') || lower.includes('i implemented') || lower.includes('i led') || lower.includes('we deployed') || lower.includes('i organized');
  const hasResult =
    lower.includes('result') || lower.includes('percent') || lower.includes('%') || lower.includes('reduced') || lower.includes('increased') || lower.includes('delivered') || lower.includes('outcome');

  let baseScore = 75;
  if (wordCount > 60) baseScore += 5;
  if (wordCount > 120) baseScore += 5;
  if (hasAction) baseScore += 5;
  if (hasResult) baseScore += 7;
  if (params.fillerWordCount <= 2) baseScore += 3;
  if (params.speakingPaceWpm >= 120 && params.speakingPaceWpm <= 165) baseScore += 4;

  const boundedScore = Math.min(96, Math.max(50, baseScore));

  const commScore = Math.min(95, Math.max(60, boundedScore + (params.fillerWordCount > 4 ? -8 : 3)));
  const techScore = Math.min(97, Math.max(62, boundedScore + (hasAction ? 4 : -4)));
  const probScore = Math.min(94, Math.max(60, boundedScore + 1));
  const presenceScore = Math.min(95, Math.max(65, boundedScore + (hasResult ? 3 : -3)));

  const starScore = Math.min(
    95,
    Math.max(
      55,
      (hasSituation ? 20 : 10) +
        (hasTask ? 20 : 10) +
        (hasAction ? 30 : 15) +
        (hasResult ? 25 : 10)
    )
  );

  return {
    categoryScores: {
      communication: commScore,
      technical_depth: techScore,
      problem_solving: probScore,
      executive_presence: presenceScore,
    },
    starAdherence: {
      situation: hasSituation
        ? 'Well-framed business or technical context and clear setting of the problem space.'
        : 'Context was slightly abstract; clearly introduce the specific project and stakeholder constraints.',
      task: hasTask
        ? 'Articulated core objective and ownership responsibility decisively.'
        : 'Make the exact metric or critical deliverable explicitly quantified up front.',
      action: hasAction
        ? 'Decisive personal actions detailed with architectural rationale and team orchestration.'
        : 'Highlight specific choices you led rather than speaking generally about team efforts.',
      result: hasResult
        ? 'Strong quantified impact referencing business outcomes, uptime SLA, or performance metrics.'
        : 'Strengthen the finale by citing concrete metrics (e.g. % latency drop, cost saved, team velocity increase).',
      score: starScore,
    },
    strengths: [
      wordCount > 80
        ? 'Substantive response demonstrating authentic domain experience and technical maturity.'
        : 'Concise, focused communication without extraneous wandering.',
      params.speakingPaceWpm >= 120 && params.speakingPaceWpm <= 165
        ? `Commanding speaking cadence of ${Math.round(params.speakingPaceWpm)} WPM, matching executive interview standards.`
        : 'Maintained steady composure and structured flow.',
      params.fillerWordCount <= 2
        ? 'Exceptionally low filler word usage reflecting high cognitive clarity and confidence.'
        : 'Direct engagement with the core technical complexities.',
    ],
    improvements: [
      !hasResult
        ? 'Always anchor the final 20% of your response in verified business outcomes and quantified return on investment.'
        : 'Explicitly mention alternatives you considered and the technical trade-offs that guided your final architecture.',
      params.fillerWordCount > 3
        ? `Reduce subconscious vocal fillers (${params.fillerWordCount} detected); use intentional brief pauses to command executive room authority.`
        : 'Briefly touch upon long-term monitoring and operational maintainability after rollout.',
    ],
    idealAnswer: `When addressing this scenario for ${params.targetRole}, top executive candidates establish the strategic stakes immediately: "In my previous tenure, we faced this exact constraint when scaling to 150k active requests... My mandate was to guarantee zero data loss while reducing operational p99 latency." They systematically unpack the trade-offs considered (e.g., synchronous consistency vs eventual propagation), explain the consensus or delegation mechanisms chosen, and conclude with verified metrics: "The deployment achieved 99.995% uptime and unlocked $3.2M in annual cloud infrastructure savings."`,
    overallScore: boundedScore,
  };
}
