import { NextRequest, NextResponse } from 'next/server';
import { generateAdaptiveQuestions } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetRole, seniority, interviewType, resumeText, questionCount } = body;

    if (!targetRole || !seniority || !interviewType) {
      return NextResponse.json(
        { error: 'Missing required parameters: targetRole, seniority, interviewType' },
        { status: 400 }
      );
    }

    const questions = await generateAdaptiveQuestions({
      targetRole,
      seniority,
      interviewType,
      resumeText,
      questionCount: Number(questionCount) || 3,
    });

    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error('API generate-questions error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate interview questions' },
      { status: 500 }
    );
  }
}
