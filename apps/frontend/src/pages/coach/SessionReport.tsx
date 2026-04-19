import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coachApi } from '@/api/coach.api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SessionScoreRing } from '@/components/coach/SessionScoreRing';
import type { CoachSession } from '@/types';

export const SessionReport: FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<CoachSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    
    let pollInterval: any;
    
    const loadSession = async () => {
      try {
        const res = await coachApi.getReport(sessionId);
        const data = res.data.data;
        
        if (data.isCompleted) {
          setSession(data);
          setLoading(false);
          setIsPolling(false);
          clearInterval(pollInterval);
        } else {
          // Keep polling if not complete
          if (!isPolling) setIsPolling(true);
        }
      } catch (err) {
        console.error('Failed to load session report', err);
        navigate('/dashboard');
      }
    };
    
    loadSession();
    pollInterval = setInterval(loadSession, 3000);
    
    return () => clearInterval(pollInterval);
  }, [sessionId, navigate, isPolling]);

  if (loading || isPolling) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-theme-bg p-6 text-center animate-pulse">
        <div className="w-16 h-16 rounded-full border-4 border-theme/20 border-t-amber-500 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-theme mb-2">Analyzing your session</h2>
        <p className="text-theme-muted max-w-md">Your AI Coach is reviewing your technical design, analyzing your voice tone, and assessing your confident signals...</p>
      </div>
    );
  }

  if (!session || !session.scores || !session.aiFeedback) return null;

  const { scores, aiFeedback } = session;
  const question: any = session.questionId;

  const renderDimensionBar = (label: string, score: number) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5 hover:text-theme transition-colors cursor-default group">
        <span className="font-medium text-theme-secondary group-hover:text-theme">{label}</span>
        <span className="font-bold text-theme">{score.toFixed(1)}/10</span>
      </div>
      <div className="w-full h-2.5 bg-surface-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-theme-accent to-brand-500 transition-all duration-1000 ease-out"
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm">
          ← Back to Dashboard
        </Button>
        <Badge variant={scores.overall >= 7 ? 'success' : scores.overall >= 5 ? 'warning' : 'neutral'}>
          {scores.overall >= 7 ? 'Strong Hire' : scores.overall >= 5 ? 'Lean Hire' : 'Not Ready'}
        </Badge>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-theme tracking-tight mb-3">Interview Report</h1>
        <p className="text-theme-muted max-w-xl mx-auto">
          Detailed breakdown for "{question.title}" ({question.track.toUpperCase()})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Scores */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-6">Overall Assessment</h3>
            <SessionScoreRing score={scores.overall} size={180} />
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="neutral">⏱️ {Math.floor(session.sessionDurationSeconds / 60)} min</Badge>
              <Badge variant="neutral">🗣️ {session.avgWPM} WPM</Badge>
              <Badge variant="neutral">💡 {session.hintsUsed} Hints</Badge>
            </div>
          </div>
          
          <div className="glass-card p-6 border-l-4 border-l-brand-500">
            <h3 className="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-6">Signals</h3>
            {renderDimensionBar("Technical Design", scores.technical)}
            {renderDimensionBar("Communication", scores.communication)}
            {renderDimensionBar("Confidence", scores.confidence)}
            {renderDimensionBar("Eye Contact", scores.eyeContact)}
          </div>
          
        </div>

        {/* Right Column - Feedback */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Coach Quote */}
          <div className="glass-card bg-surface-900 border-theme/20 p-8 relative overflow-hidden">
            <div className="absolute -top-4 -left-4 text-7xl text-theme/5 font-serif leading-none select-none">"</div>
            <div className="flex gap-4 relative z-10 items-start">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm bg-theme-bg/50">
                {session.coachPersona === 'priya' ? '👩‍💻' : session.coachPersona === 'marcus' ? '👨‍💻' : session.coachPersona === 'aisha' ? '🧠' : '🎯'}
              </div>
              <div className="flex-1">
                <p className="text-xl font-medium text-theme italic leading-relaxed">
                  "{aiFeedback.coachQuote}"
                </p>
                <p className="text-sm text-theme-muted mt-2">— Your AI Coach</p>
              </div>
            </div>
          </div>
          
          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/20">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                ⭐ What went well
              </h3>
              <ul className="space-y-3">
                {aiFeedback.strengths.map((s, i) => (
                  <li key={i} className="flex gap-3 text-emerald-300 text-sm leading-relaxed">
                    <span className="mt-0.5 text-emerald-500">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="glass-card p-6 bg-rose-500/5 border-rose-500/20">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                📈 Areas to improve
              </h3>
              <ul className="space-y-3">
                {aiFeedback.improvements.map((s, i) => (
                  <li key={i} className="flex gap-3 text-rose-300 text-sm leading-relaxed">
                    <span className="mt-0.5 text-rose-500">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <div>
              <h3 className="font-semibold text-theme">Ready for the next challenge?</h3>
              <p className="text-sm text-theme-muted">Based on this session, you should review: {aiFeedback.nextTopicSlug}</p>
            </div>
            <Button variant="primary" onClick={() => navigate('/practice')}>
              Practice Another
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
};
