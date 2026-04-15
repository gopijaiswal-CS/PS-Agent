import { type FC, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Timer } from '@/components/ui/Timer';
import { AiChatPanel } from '@/components/chat/AiChatPanel';
import { VoicePanel } from '@/components/voice/VoicePanel';
import { RatingModal } from '@/components/rating/RatingModal';
import { Whiteboard } from '@/components/ui/Whiteboard';
import { CodeWorkspace } from '@/components/ui/CodeWorkspace';
import { ClassDesignWorkspace } from '@/components/ui/ClassDesignWorkspace';
import { questionsApi } from '@/api/questions.api';
import type { Question, AiRating } from '@/types';
import { sessionsApi } from '@/api/sessions.api';

const TRACK_LABELS: Record<string, { name: string; icon: string }> = {
  hld: { name: 'High-Level Design', icon: '🏗️' },
  lld: { name: 'Low-Level Design', icon: '⚙️' },
  dsa: { name: 'Data Structures', icon: '🧮' },
  'ai-ml': { name: 'AI / ML Design', icon: '🤖' },
  behavioral: { name: 'Behavioral', icon: '💬' },
};

const DifficultyDots: FC<{ level: number }> = ({ level }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <div 
        key={i} 
        className={`w-1.5 h-1.5 rounded-full transition-all ${
          i <= level 
            ? level >= 4 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' 
              : level >= 3 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
            : 'bg-theme-border opacity-50'
        }`} 
      />
    ))}
  </div>
);

export const PracticePage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionId } = useParams<{ questionId?: string }>();
  const routeState = location.state as { trackId?: string; selectedQuestionId?: string } | null;
  
  const [groupedQuestions, setGroupedQuestions] = useState<Record<string, Question[]>>({});
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({ hld: true, lld: true, dsa: true, 'ai-ml': true, behavioral: true });
  
  // Real active session integration
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const [showRating, setShowRating] = useState(false);
  const [ratingData, setRatingData] = useState<AiRating | null>(null);
  const [isRating, setIsRating] = useState(false);
  
  const [showVoice, setShowVoice] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await questionsApi.getGrouped();
        setGroupedQuestions(res.data.data);
      } catch (e) {
        console.error('Failed to load questions', e);
      }
    }
    loadData();
  }, []);

  const toggleTrack = (track: string) => setExpandedTracks((prev) => ({ ...prev, [track]: !prev[track] }));

  // Find the selected question across all tracks
  const selectedQ = useMemo(() => {
    if (!questionId) return null;
    for (const trackQs of Object.values(groupedQuestions)) {
      const q = trackQs.find(q => q._id === questionId);
      if (q) return q;
    }
    return null;
  }, [questionId, groupedQuestions]);

  const activeTrack = routeState?.trackId || selectedQ?.track || 'hld';
  const visibleQuestions = groupedQuestions[activeTrack] || [];
  const selectedTrackLabel = TRACK_LABELS[activeTrack]?.name || 'Selected Track';

  const handleStartSolving = useCallback(async () => {
    if (!selectedQ) return;
    try {
      const res = await sessionsApi.create(selectedQ._id);
      setCurrentSessionId(res.data.data._id);
      setIsSessionActive(true);
      setHintsUsed(0);
      setCurrentHint(null);
    } catch (err) {
      console.error('Failed to initialize session on server.', err);
      // Fallback local mode
      setIsSessionActive(true);
    }
  }, [selectedQ]);

  const handleGetHint = useCallback(() => {
    if (!selectedQ || !selectedQ.hints) return;
    const nextLevel = Math.min(hintsUsed + 1, selectedQ.hints.length);
    if (nextLevel > 0) {
      setHintsUsed(nextLevel);
      setCurrentHint(selectedQ.hints[nextLevel - 1]);
    }
  }, [hintsUsed, selectedQ]);

  const handleTranscriptReady = useCallback((t: string) => {
    setTranscript(prev => prev + ' ' + t);
  }, []);

  const handleRateDesign = async () => {
    if (!currentSessionId) {
      alert("No active session tracked by server.");
      return;
    }
    setIsRating(true);
    try {
      if (transcript) await sessionsApi.updateTranscript(currentSessionId, transcript);
      const res = await sessionsApi.rate(currentSessionId);
      setRatingData(res.data.data);
      setShowRating(true);
    } catch (err) {
      console.error('Failed to rate design:', err);
      alert('Failed to rate design. Check Claude proxy or token.');
    } finally {
      setIsRating(false);
    }
  };

  const onQuestionSelect = (id: string) => {
    navigate(`/practice/q/${id}`, { state: { trackId: activeTrack } });
    setIsSessionActive(false);
    setCurrentHint(null);
    setHintsUsed(0);
  };

  useEffect(() => {
    if (!questionId && routeState?.selectedQuestionId) {
      navigate(`/practice/q/${routeState.selectedQuestionId}`, {
        replace: true,
        state: { trackId: routeState.trackId },
      });
    }
  }, [navigate, questionId, routeState]);

  return (
    <div className="h-full flex flex-col bg-surface-950">
      {/* Top bar */}
      <div className="h-14 border-b border-theme/30 bg-theme flex flex-col justify-center px-4 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className="text-sm font-semibold text-theme">
               Interactive Practice
             </span>
             <span className="text-xs text-theme-muted hidden sm:inline">
               {selectedTrackLabel}
             </span>
          </div>
          <div className="flex items-center gap-3">
            {isSessionActive && selectedQ && (
              <Timer initialSeconds={selectedQ.timeLimitSeconds} isRunning={isSessionActive} />
            )}
            {selectedQ && <Badge variant="brand">{selectedQ.tags[0]?.toUpperCase()}</Badge>}
          </div>
        </div>
      </div>

      {/* Three panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - BEAUTIFIED */}
        <div className="w-80 border-r border-theme/20 bg-theme-elevated/40 flex flex-col flex-shrink-0 backdrop-blur-xl">
          <div className="p-4 border-b border-theme/20 bg-theme/30">
            <div className="relative group">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-brand-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input 
                type="text" 
                placeholder="Search questions..." 
                value={sidebarSearch} 
                onChange={(e) => setSidebarSearch(e.target.value)} 
                className="w-full bg-theme/50 border border-theme/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-theme placeholder:text-theme-muted/50 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all" 
              />
            </div>
          </div>
          
          <div className="px-4 py-3 border-b border-theme/20 bg-theme/20">
            <p className="text-2xs uppercase tracking-[0.24em] text-theme-muted mb-1">Focused Track</p>
            <h3 className="text-sm font-semibold text-theme">{selectedTrackLabel}</h3>
            <p className="text-xs text-theme-muted mt-1">
              Browse only the questions for this category while you practice.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
            {Object.entries(groupedQuestions).filter(([track]) => track === activeTrack).map(([track, questions]) => {
              const trackInfo = TRACK_LABELS[track];
              const filteredQs = questions.filter((q) => q.title.toLowerCase().includes(sidebarSearch.toLowerCase()));
              if (filteredQs.length === 0 && sidebarSearch) return null;
              
              return (
                <div key={track} className="mb-4">
                  <button 
                    onClick={() => toggleTrack(track)} 
                    className="w-full flex items-center justify-between px-2 py-2 mb-1 group"
                  >
                    <div className="flex items-center gap-2">
                       <span className="text-base grayscale group-hover:grayscale-0 transition-all">{trackInfo?.icon}</span>
                       <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest group-hover:text-theme transition-colors">{trackInfo?.name || track}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-medium px-1.5 py-0.5 rounded-md bg-theme/30 text-theme-muted">{questions.length}</span>
                      <svg className={`w-3.5 h-3.5 text-theme-muted transition-transform duration-300 ${expandedTracks[track] ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                    </div>
                  </button>
                  
                  <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${expandedTracks[track] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {filteredQs.map((q) => {
                      const isSelected = questionId === q._id;
                      return (
                        <button 
                          key={q._id} 
                          onClick={() => onQuestionSelect(q._id)}
                          className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                            isSelected 
                              ? 'bg-gradient-to-r from-brand-500/10 to-transparent border-l-2 border-brand-500 shadow-sm' 
                              : 'hover:bg-theme-elevated/80 border-l-2 border-transparent'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className={`text-sm font-medium leading-snug line-clamp-2 pr-2 ${isSelected ? 'text-theme' : 'text-theme-secondary group-hover:text-theme'}`}>
                              {q.title}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <DifficultyDots level={q.difficulty} />
                            <span className="text-2xs text-theme-muted font-medium bg-theme/40 px-1.5 rounded">
                              {q.timeLimitSeconds ? Math.floor(q.timeLimitSeconds / 60) : 45}m
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#06080F]">
          {selectedQ ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Custom header area with gradient background */}
              <div className="relative pt-8 pb-6 px-8 border-b border-theme/10">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
                <div className="relative max-w-4xl">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <Badge variant="brand" className="backdrop-blur-sm bg-brand-500/10 border-brand-500/20">{selectedQ.tags[0]?.toUpperCase() || 'HLD'}</Badge>
                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-theme/30 border border-theme/10 backdrop-blur-sm">
                          <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Difficulty</span>
                          <DifficultyDots level={selectedQ.difficulty} />
                        </div>
                        <span className="text-xs font-semibold text-theme-muted flex items-center gap-1.5 px-2 py-1 rounded bg-theme/30 border border-theme/10 backdrop-blur-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {Math.floor(selectedQ.timeLimitSeconds / 60)} min
                        </span>
                      </div>
                      <h2 className="text-3xl font-extrabold text-theme tracking-tight leading-tight">{selectedQ.title}</h2>
                      <p className="text-sm text-theme-muted mt-3 max-w-2xl">
                        Read the full prompt, sketch on the canvas, then start the session when you are ready to talk through the solution.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedQ.tags.slice(1).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded border border-theme/20 text-theme-muted bg-theme/5"># {tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-8 relative">
                <div className="max-w-4xl">
                  <div className="glass-card p-6 md:p-8 mb-8 border border-theme/20 shadow-xl">
                    <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                      <div>
                        <p className="text-2xs uppercase tracking-[0.22em] text-theme-muted mb-1">Question Brief</p>
                        <h3 className="text-lg font-semibold text-theme">What you need to solve</h3>
                      </div>
                      <Badge variant="neutral">{selectedTrackLabel}</Badge>
                    </div>
                    <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: selectedQ.description || '' }} />
                    </div>
                  </div>

                  {/* Hint display */}
                  {currentHint && (
                    <div className="glass-card p-5 mb-8 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-500/5 animate-scale-in shadow-xl shadow-amber-500/5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/20 text-amber-500 shadow-inner">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 15v1"/><path d="M4 12V6a8 8 0 0 1 16 0v6c0 2-1 3-2 5H6c-1-2-2-3-2-5Z"/></svg>
                        </div>
                        <div className="flex-1 mt-0.5">
                          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Hint Level {hintsUsed}</p>
                          <p className="text-sm text-theme-secondary font-medium leading-relaxed">{currentHint}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center flex-wrap gap-3 mb-8 p-4 rounded-2xl bg-theme-elevated/40 border border-theme/20 backdrop-blur-xl">
                    <Button variant="secondary" onClick={() => navigate('/topics')} className="shrink-0 bg-theme-elevated hover:bg-theme/80 border-theme/20">
                      <span className="mr-2">📖</span> Review Topics
                    </Button>
                    <Button variant="secondary" onClick={handleGetHint} disabled={hintsUsed >= (selectedQ.hints?.length || 0)} className="shrink-0 bg-theme-elevated hover:bg-theme/80 border-theme/20">
                      <span className="mr-2">💡</span> Need a Hint? ({hintsUsed}/{selectedQ.hints?.length || 0})
                    </Button>
                    
                    <div className="flex-1"></div>
                    
                    {!isSessionActive ? (
                      <Button variant="primary" onClick={handleStartSolving} className="shrink-0 shadow-lg shadow-brand-500/20">
                        <span className="mr-2">▶</span> Begin Session
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={handleRateDesign} loading={isRating} className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 border-none shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
                        <span className="mr-2">⭐</span> Evaluate My Design
                      </Button>
                    )}
                  </div>

                  {/* Voice Panel */}
                  {isSessionActive && (
                    <div className="mb-8 animate-slide-up">
                      <VoicePanel onTranscriptReady={handleTranscriptReady} />
                    </div>
                  )}

                  {/* AI Chat */}
                  <div className="mb-20">
                    <AiChatPanel sessionId={null} questionTitle={selectedQ.title} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
              <div className="absolute w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-3xl" />
              
              <div className="text-center animate-fade-in relative z-10 glass-card p-10 max-w-md">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-theme-elevated to-theme/50 border border-theme/20 flex items-center justify-center mb-6 shadow-xl">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-theme-muted"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <h3 className="text-xl font-bold text-theme mb-3">Ready to Practice?</h3>
                <p className="text-sm text-theme-muted leading-relaxed mb-6">
                  Select a question from the {selectedTrackLabel.toLowerCase()} list to begin. Your session will be evaluated by our AI engine for architecture, correctness, and clarity.
                </p>
                <Button variant="primary" onClick={() => {
                  const firstQ = visibleQuestions[0];
                  if (firstQ) onQuestionSelect(firstQ._id);
                }}>
                  Start First Question
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Whiteboard */}
        <div className="w-[45%] flex flex-col flex-shrink-0 transition-colors relative bg-theme-elevated">
          <div className="absolute left-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-theme/30 to-transparent z-10" />
          
          <div className="h-14 border-b border-theme/30 flex items-center justify-between px-6 bg-theme/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-theme-muted">
                {activeTrack === 'dsa' ? 'Code Workspace' : activeTrack === 'lld' ? 'Class Design Studio' : 'Canvas'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowVoice(!showVoice)} className="text-xs">
                <span className="mr-2">🎤</span> Explain
              </Button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative p-4 bg-[#0a0d14]">
            {isSessionActive && selectedQ ? (
              activeTrack === 'dsa' ? (
                <CodeWorkspace question={selectedQ} />
              ) : activeTrack === 'lld' ? (
                <ClassDesignWorkspace question={selectedQ} />
              ) : (
                <Whiteboard track={activeTrack} />
              )
              
            ) : (
              <div className="w-full h-full rounded-2xl border border-theme/10 bg-theme/5 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                <div className="text-center animate-fade-in z-10 p-8 glass-card border border-theme/20 shadow-2xl max-w-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500" />
                  <div className="text-5xl mb-4 opacity-80">🎨</div>
                  <h4 className="text-lg font-bold text-theme mb-2">
                    {activeTrack === 'dsa' ? 'Editor Locked' : activeTrack === 'lld' ? 'Studio Locked' : 'Canvas Locked'}
                  </h4>
                  <p className="text-sm text-theme-muted">
                    {activeTrack === 'dsa'
                      ? 'Select a DSA problem and begin your session to unlock the coding workspace.'
                      : activeTrack === 'lld'
                        ? 'Select an LLD problem and begin your session to unlock the diagram and class design studio.'
                      : 'Select a problem and begin your session to unlock the interactive whiteboard.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {ratingData && (
        <RatingModal
          isOpen={showRating}
          onClose={() => setShowRating(false)}
          rating={ratingData}
          onStudyTopic={() => { setShowRating(false); navigate('/topics'); }}
          onTryAnother={() => { setShowRating(false); navigate('/practice'); setIsSessionActive(false); }}
        />
      )}
    </div>
  );
};
