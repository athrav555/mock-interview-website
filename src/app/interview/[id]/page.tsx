'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
  Pause,
  Edit3,
} from 'lucide-react';
import { db } from '@/lib/db';
import { FullSessionData, Question, UserResponse } from '@/types';

const FILLER_WORDS = [
  'um',
  'uh',
  'like',
  'you know',
  'basically',
  'actually',
  'literally',
  'sort of',
  'kind of',
  'i mean',
];

export default function InterviewStudioPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  // Session & question state
  const [sessionData, setSessionData] = useState<FullSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Audio Interviewer (TTS) state
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);

  // Live Speech-to-Text (STT) state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [sttSupported, setSttSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);

  // Pacing & Metrics
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState(0);
  const [speakingPaceWpm, setSpeakingPaceWpm] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio / Media references
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load Session Data
  useEffect(() => {
    async function loadSession() {
      try {
        const data = await db.getSessionById(sessionId);
        if (!data) {
          router.push('/dashboard');
          return;
        }

        // If session is already completed, go to report
        if (data.session.completion_status === 'completed') {
          router.push(`/interview/${sessionId}/report`);
          return;
        }

        setSessionData(data);

        // Find first unanswered question
        const firstUnansweredIndex = data.items.findIndex((item) => !item.response);
        if (firstUnansweredIndex >= 0) {
          setCurrentQuestionIndex(firstUnansweredIndex);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId, router]);

  const currentItem = sessionData?.items[currentQuestionIndex];
  const currentQuestion = currentItem?.question;

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
        setTotalSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Compute live WPM and filler words
  useEffect(() => {
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Calculate WPM
    if (timerSeconds > 5 && wordCount > 0) {
      const wpm = Math.round((wordCount / timerSeconds) * 60);
      setSpeakingPaceWpm(wpm);
    } else if (wordCount === 0) {
      setSpeakingPaceWpm(0);
    }

    // Calculate filler words
    const lower = transcript.toLowerCase();
    let fillers = 0;
    FILLER_WORDS.forEach((fw) => {
      const regex = new RegExp(`\\b${fw}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) fillers += matches.length;
    });
    setFillerCount(fillers);
  }, [transcript, timerSeconds]);

  // Auto-speak question when current question changes
  useEffect(() => {
    if (currentQuestion && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speakQuestion(currentQuestion.ai_question_prompt);
    }
  }, [currentQuestionIndex, currentQuestion?.id]);

  // AI TTS Speech Synthesis
  const speakQuestion = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsSupported(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  };

  // Web Speech STT & Mic setup
  const startRecording = async () => {
    setMicError(null);
    stopSpeaking();

    // Check SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSttSupported(false);
      setMicError('Speech recognition is not supported in this browser. You can type your response below.');
      return;
    }

    try {
      // Setup Web Audio Analyser for live volume wave
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let currentAccumulated = transcript;

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentAccumulated += (currentAccumulated ? ' ' : '') + event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(interim ? `${currentAccumulated} ${interim}` : currentAccumulated);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicError('Microphone permission denied. Please allow microphone access or type your answer.');
          stopRecording();
        }
      };

      recognition.onend = () => {
        // If still flagged as recording, restart (keeps listening)
        if (isRecording) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setMicError('Could not access microphone: ' + (err.message || 'Permission denied'));
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setMicVolume(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Submit Answer & Progression
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      alert('Please speak or type your response before submitting.');
      return;
    }

    stopRecording();
    stopSpeaking();
    setIsSubmitting(true);

    try {
      if (!currentQuestion) return;

      const duration = Math.max(15, timerSeconds);
      const wpm = speakingPaceWpm > 0 ? speakingPaceWpm : Math.round((transcript.split(/\s+/).length / duration) * 60);

      // 1. Save response to database
      await db.saveResponse({
        questionId: currentQuestion.id,
        sessionId,
        verbatimTranscript: transcript.trim(),
        duration,
        speakingPaceWpm: wpm,
        fillerWordCount: fillerCount,
      });

      // 2. Check if this is the last question
      const totalQuestions = sessionData?.items.length || 0;
      const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

      if (!isLastQuestion) {
        // Advance to next question
        setTranscript('');
        setTimerSeconds(0);
        setSpeakingPaceWpm(0);
        setFillerCount(0);
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsSubmitting(false);
      } else {
        // Final question! Run full Gemini evaluation on all items
        const updatedSession = await db.getSessionById(sessionId);
        if (!updatedSession) throw new Error('Session not found');

        let totalScoreSum = 0;
        let evaluatedCount = 0;

        for (const item of updatedSession.items) {
          const resp = item.response;
          const q = item.question;
          if (resp) {
            // Call Gemini evaluate endpoint
            const evalRes = await fetch('/api/interview/evaluate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                questionPrompt: q.ai_question_prompt,
                category: q.competency_category,
                transcript: resp.verbatim_transcript,
                targetRole: updatedSession.session.target_role,
                seniority: updatedSession.session.difficulty,
                durationSeconds: resp.duration,
                speakingPaceWpm: resp.speaking_pace_wpm,
                fillerWordCount: resp.filler_word_count,
              }),
            });

            if (evalRes.ok) {
              const evalData = await evalRes.json();
              const evalObj = evalData.evaluation;

              await db.saveEvaluation({
                id:
                  typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : 'eval-' + Math.random().toString(36).substring(2, 9),
                session_id: sessionId,
                question_id: q.id,
                category_scores: evalObj.categoryScores,
                star_adherence: evalObj.starAdherence,
                strengths: evalObj.strengths,
                improvements: evalObj.improvements,
                ideal_answer: evalObj.idealAnswer,
                created_at: new Date().toISOString(),
              });

              totalScoreSum += evalObj.overallScore || 85;
              evaluatedCount++;
            }
          }
        }

        const finalOverallScore = evaluatedCount > 0 ? Math.round(totalScoreSum / evaluatedCount) : 88;

        // Complete session in DB
        await db.completeSession(sessionId, finalOverallScore, Math.max(60, totalSessionSeconds));

        // Navigate to final feedback report
        router.push(`/interview/${sessionId}/report`);
      }
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      alert('Could not process submission: ' + (err.message || 'Unknown error'));
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !sessionData) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Initializing interview studio...</p>
        </div>
      </div>
    );
  }

  const totalQuestions = sessionData.items.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Studio Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {sessionData.session.difficulty.toUpperCase()} •{' '}
              {sessionData.session.interview_type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{sessionData.session.target_role}</h2>
        </div>

        {/* Question Stepper & Progress */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className="w-32 bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Card: AI Interviewer & Question Prompt */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        {/* AI Interviewer Avatar & Speaking Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-300 ${
                  isAiSpeaking
                    ? 'bg-indigo-600 shadow-lg shadow-indigo-300 scale-105'
                    : 'bg-slate-800'
                }`}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              {isAiSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Executive AI Bar Raiser</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Live TTS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAiSpeaking ? 'Speaking question aloud...' : 'Listening & calibrating response'}
              </p>
            </div>
          </div>

          {/* AI Voice Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isAiSpeaking) {
                  stopSpeaking();
                } else if (currentQuestion) {
                  speakQuestion(currentQuestion.ai_question_prompt);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition"
              title="Replay or pause question speech"
            >
              {isAiSpeaking ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-indigo-600" /> Pause Audio
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-indigo-600" /> Read Question
                </>
              )}
            </button>

            <button
              onClick={() => {
                stopSpeaking();
                if (currentQuestion) speakQuestion(currentQuestion.ai_question_prompt);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 transition"
              title="Replay question from start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Question Text & Competency Tag */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
            Competency: {currentQuestion?.competency_category}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
            "{currentQuestion?.ai_question_prompt}"
          </h2>
        </div>

        {/* Live Audio Visualizer & Waveform Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
                }`}
              />
              {isRecording ? 'Microphone Active • Listening' : 'Microphone Paused'}
            </span>
            <span className="font-mono text-slate-300">
              Timer: {formatTimer(timerSeconds)}
            </span>
          </div>

          {/* Equalizer Waveform */}
          <div className="h-10 flex items-center justify-center gap-1.5 px-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(
              (bar) => {
                const heightPercent = isRecording
                  ? Math.max(15, Math.min(100, micVolume * (0.5 + ((bar * 7) % 10) / 10)))
                  : 15;
                return (
                  <div
                    key={bar}
                    className="w-1.5 bg-indigo-400 rounded-full transition-all duration-75"
                    style={{
                      height: `${heightPercent}%`,
                      opacity: isRecording ? 0.9 : 0.3,
                    }}
                  />
                );
              }
            )}
          </div>
        </div>

        {/* Real-time Executive Speech Analytics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
              Speaking Cadence
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900">{speakingPaceWpm}</span>
              <span className="text-xs text-slate-500">WPM</span>
            </div>
            <span className="text-[10px] text-slate-400">Target: 130–160</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
              Vocal Fillers
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`text-lg font-bold ${
                  fillerCount > 3 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {fillerCount}
              </span>
              <span className="text-xs text-slate-500">detected</span>
            </div>
            <span className="text-[10px] text-slate-400">Target: ≤ 2</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
              Word Count
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900">
                {transcript.trim().split(/\s+/).filter(Boolean).length}
              </span>
              <span className="text-xs text-slate-500">words</span>
            </div>
            <span className="text-[10px] text-slate-400">Target: 100–300</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
              Response Time
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono">
                {formatTimer(timerSeconds)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Recommended: ~2–3m</span>
          </div>
        </div>

        {/* Live Verbatim Transcript Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              Live Transcript & Response Editor
            </label>
            <span className="text-xs text-slate-400">
              Speak or manually edit text before submission
            </span>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Click 'Start Voice Capture' below to speak your answer, or type your response directly..."
            rows={6}
            className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm leading-relaxed text-slate-900 bg-slate-50/40"
          />

          {micError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              {micError}
            </div>
          )}
        </div>

        {/* Control Actions Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Mic Toggle Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition transform active:scale-95 ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-100'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 animate-pulse" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Voice Capture
              </>
            )}
          </button>

          {/* Submit & Next Button */}
          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={isSubmitting || !transcript.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {currentQuestionIndex >= totalQuestions - 1
                  ? 'Compiling Executive Report...'
                  : 'Saving Response...'}
              </>
            ) : currentQuestionIndex >= totalQuestions - 1 ? (
              <>
                Submit & Complete Interview
                <Award className="w-4 h-4 text-indigo-400" />
              </>
            ) : (
              <>
                Save & Proceed to Next Question
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
