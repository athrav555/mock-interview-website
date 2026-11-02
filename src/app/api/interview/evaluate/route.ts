import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswer } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questionPrompt,
      category,
      transcript,
      targetRole,
      seniority,
      durationSeconds,
      speakingPaceWpm,
      fillerWordCount,
    } = body;

    if (!questionPrompt || !transcript) {
      return NextResponse.json(
        { error: 'Missing questionPrompt or transcript' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateAnswer({
      questionPrompt,
      category: category || 'Executive Competency',
      transcript,
      targetRole: targetRole || 'Senior Professional',
      seniority: seniority || 'senior',
      durationSeconds: Number(durationSeconds) || 60,
      speakingPaceWpm: Number(speakingPaceWpm) || 135,
      fillerWordCount: Number(fillerWordCount) || 0,
    });

    return NextResponse.json({ evaluation });
  } catch (err: any) {
    console.error('API evaluate error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to evaluate interview answer' },
      { status: 500 }
    );
  }
}
