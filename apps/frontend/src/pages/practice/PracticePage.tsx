import { type FC, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Timer } from '@/components/ui/Timer';
import { AiChatPanel } from '@/components/chat/AiChatPanel';
import { VoicePanel } from '@/components/voice/VoicePanel';
import { RatingModal } from '@/components/rating/RatingModal';
import type { AiRating } from '@/types';

const MOCK_QUESTIONS = {
  hld: [
    { id: '1', title: 'Design a URL Shortener', difficulty: 3, tags: ['Hashing', 'Cache', 'NoSQL'], completed: false, description: 'Design a system that takes long URLs and converts them into short, unique URLs. The system should handle millions of URL shortenings per day, redirect users to the original URL when they visit the short link, and provide analytics on link usage. Consider scalability, availability, and data consistency.', timeLimitSeconds: 2400 },
    { id: '2', title: 'Design Twitter/X Feed', difficulty: 4, tags: ['Fan-out', 'Pub/Sub', 'Timeline'], completed: false, description: 'Design the home feed system for Twitter/X. Users should see tweets from accounts they follow, ordered by relevance and recency. Consider the fan-out problem, real-time delivery, and how to handle celebrity accounts with millions of followers.', timeLimitSeconds: 2400 },
    { id: '3', title: 'Design Uber/Lyft', difficulty: 5, tags: ['Geospatial', 'Matching', 'Real-time'], completed: false, description: 'Design a ride-sharing platform like Uber. Include the driver-rider matching algorithm, location tracking, pricing engine, and trip management. Consider real-time requirements and geographical distribution.', timeLimitSeconds: 3600 },
    { id: '4', title: 'Design Netflix Streaming', difficulty: 4, tags: ['CDN', 'Video', 'Adaptive'], completed: false, description: 'Design a video streaming platform like Netflix. Handle video encoding, content delivery via CDN, adaptive bitrate streaming, and the recommendation engine. Consider global scale and varying network conditions.', timeLimitSeconds: 2400 },
  ],
  lld: [
    { id: '5', title: 'Design a Parking Lot', difficulty: 2, tags: ['OOP', 'Strategy'], completed: false, description: 'Design an object-oriented parking lot system. Support multiple levels, different vehicle sizes (motorcycle, car, bus), and multiple entry/exit points. Track availability and calculate parking fees.', timeLimitSeconds: 1800 },
    { id: '6', title: 'Design a Chess Game', difficulty: 3, tags: ['State Machine', 'Observer'], completed: false, description: 'Design a chess game with proper piece movement rules, check/checkmate detection, castling, en passant, and pawn promotion. Use appropriate design patterns.', timeLimitSeconds: 2400 },
  ],
  dsa: [
    { id: '7', title: 'LRU Cache', difficulty: 2, tags: ['Hash Map', 'Linked List'], completed: false, description: 'Implement a Least Recently Used (LRU) cache with O(1) get and put operations. The cache should evict the least recently used item when capacity is reached.', timeLimitSeconds: 1800 },
    { id: '8', title: 'Serialize Binary Tree', difficulty: 3, tags: ['Tree', 'BFS/DFS'], completed: false, description: 'Design an algorithm to serialize and deserialize a binary tree. The serialized format should preserve the tree structure and allow reconstruction.', timeLimitSeconds: 1800 },
  ],
};

const TRACK_LABELS: Record<string, { name: string; icon: string }> = {
  hld: { name: 'High-Level Design', icon: '🏗️' },
  lld: { name: 'Low-Level Design', icon: '⚙️' },
  dsa: { name: 'DSA', icon: '🧮' },
  'ai-ml': { name: 'AI / ML', icon: '🤖' },
  behavioral: { name: 'Behavioral', icon: '💬' },
};

const DifficultyDots: FC<{ level: number }> = ({ level }) => (
  <div className="difficulty-dots">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className={`difficulty-dot ${i <= level ? 'filled' : 'empty'}`} />
    ))}
  </div>
);

const MOCK_RATING: AiRating = {
  scalability: 8,
  correctness: 7,
  completeness: 6,
  clarity: 9,
  overall: 7.4,
  voiceScore: 7,
  strengths: ['Good use of consistent hashing for URL distribution', 'Correct cache invalidation strategy with write-through pattern'],
  improvements: ['Missing rate limiting layer for abuse prevention', 'DB sharding strategy not fully explained', 'Analytics pipeline could use stream processing'],
  nextSteps: 'Study rate limiting patterns (token bucket, sliding window) and stream processing with Kafka.',
};

export const PracticePage: FC = () => {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({ hld: true, lld: true, dsa: true });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);

  const toggleTrack = (track: string) => {
    setExpandedTracks((prev) => ({ ...prev, [track]: !prev[track] }));
  };

  const selectedQ = Object.values(MOCK_QUESTIONS).flat().find((q) => q.id === selectedQuestion);

  const handleStartSolving = useCallback(() => {
    setIsSessionActive(true);
    setHintsUsed(0);
    setCurrentHint(null);
  }, []);

  const handleGetHint = useCallback(() => {
    const hints = [
      'What happens when two users submit the same long URL at the same time?',
      'Consider using a key-value store like Redis for fast lookups. You might need base62 encoding with a distributed counter.',
      'A complete solution would include: Load Balancer → App Servers → Cache (Redis) → Database (DynamoDB/Cassandra). Use a Zookeeper-based counter for unique ID generation, then base62-encode it.',
    ];
    const nextLevel = Math.min(hintsUsed + 1, 3);
    setHintsUsed(nextLevel);
    setCurrentHint(hints[nextLevel - 1]);
  }, [hintsUsed]);

  const handleTranscriptReady = useCallback((transcript: string) => {
    console.log('Transcript saved:', transcript.slice(0, 100));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* Top bar */}
      <div className="h-14 border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost px-2 py-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="w-7 h-7 rounded-md bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="url(#tp-logo2)" /><defs><linearGradient id="tp-logo2" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#818cf8" /><stop offset="1" stopColor="#c084fc" /></linearGradient></defs></svg>
          </div>
          <span className="text-sm font-semibold text-surface-200">TechPrep Pro</span>
        </div>
        <div className="flex items-center gap-3">
          {isSessionActive && selectedQ && (
            <Timer initialSeconds={selectedQ.timeLimitSeconds} isRunning={isSessionActive} />
          )}
          {selectedQ && <Badge variant="brand">{selectedQ.tags[0]?.toUpperCase()}</Badge>}
        </div>
      </div>

      {/* Three panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="w-72 border-r border-surface-800/50 bg-surface-950/50 flex flex-col flex-shrink-0">
          <div className="p-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input type="text" placeholder="Search questions..." value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)} className="input-field pl-10 py-2 text-xs" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {Object.entries(MOCK_QUESTIONS).map(([track, questions]) => {
              const trackInfo = TRACK_LABELS[track];
              const filteredQs = questions.filter((q) => q.title.toLowerCase().includes(sidebarSearch.toLowerCase()));
              if (filteredQs.length === 0 && sidebarSearch) return null;
              return (
                <div key={track} className="mb-1">
                  <button onClick={() => toggleTrack(track)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider hover:text-surface-200 transition-colors">
                    <svg className={`w-3 h-3 transition-transform ${expandedTracks[track] ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="currentColor"><path d="M9 18l6-6-6-6" /></svg>
                    <span>{trackInfo?.icon}</span>
                    <span>{trackInfo?.name}</span>
                    <span className="ml-auto text-surface-600 text-2xs">{questions.length}</span>
                  </button>
                  {expandedTracks[track] && (
                    <div className="space-y-0.5 ml-2">
                      {filteredQs.map((q) => (
                        <button key={q.id} onClick={() => { setSelectedQuestion(q.id); setIsSessionActive(false); setCurrentHint(null); setHintsUsed(0); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                            selectedQuestion === q.id ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500' : 'text-surface-300 hover:bg-surface-800/50 hover:text-surface-100'
                          }`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${q.completed ? 'bg-accent-emerald' : 'bg-surface-600'}`} />
                            <span className="truncate">{q.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 ml-3.5"><DifficultyDots level={q.difficulty} /></div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {selectedQ ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Badge variant="brand">{selectedQ.tags[0]?.toUpperCase() || 'HLD'}</Badge>
                    <DifficultyDots level={selectedQ.difficulty} />
                    <span className="text-xs text-surface-500">{selectedQ.timeLimitSeconds / 60} min</span>
                  </div>
                  <h2 className="text-2xl font-bold text-surface-50 mb-3">{selectedQ.title}</h2>
                  <p className="text-surface-400 text-sm leading-relaxed">{selectedQ.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">{selectedQ.tags.map((tag) => (<Badge key={tag} variant="neutral">{tag}</Badge>))}</div>

                {/* Hint display */}
                {currentHint && (
                  <div className="glass-card p-4 mb-4 border-accent-amber/20 bg-accent-amber/5 animate-slide-up">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💡</span>
                      <div>
                        <p className="text-xs font-semibold text-accent-amber mb-1">Hint Level {hintsUsed}</p>
                        <p className="text-sm text-surface-300">{currentHint}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <Button variant="secondary" size="sm" icon={<span>📖</span>}>Read Topics</Button>
                  <Button variant="secondary" size="sm" icon={<span>💡</span>} onClick={handleGetHint} disabled={hintsUsed >= 3}>Hint ({hintsUsed}/3)</Button>
                  {!isSessionActive ? (
                    <Button variant="primary" size="sm" icon={<span>▶</span>} onClick={handleStartSolving}>Start Solving</Button>
                  ) : (
                    <Button variant="primary" size="sm" icon={<span>⭐</span>} onClick={() => setShowRating(true)}>Rate My Design</Button>
                  )}
                </div>

                {/* Voice Panel */}
                {isSessionActive && (
                  <div className="mb-6 animate-slide-up">
                    <VoicePanel onTranscriptReady={handleTranscriptReady} />
                  </div>
                )}

                {/* AI Chat */}
                <div className="border-t border-surface-800/50 pt-6">
                  <AiChatPanel sessionId={null} questionTitle={selectedQ.title} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-surface-200 mb-2">Select a question</h3>
                <p className="text-sm text-surface-500 max-w-xs">Browse the questions in the sidebar and select one to begin your practice session.</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Whiteboard */}
        <div className="w-[40%] border-l border-surface-800/50 bg-surface-900/30 flex flex-col flex-shrink-0">
          <div className="h-12 border-b border-surface-800/50 flex items-center justify-between px-4">
            <span className="text-xs font-medium text-surface-400">Whiteboard</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowVoice(!showVoice)}>🎤 Explain</Button>
              <Button variant="primary" size="sm" onClick={() => setShowRating(true)} disabled={!isSessionActive}>⭐ Rate Design</Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center bg-white/[0.02]">
            {isSessionActive ? (
              <div className="text-center p-6">
                <div className="w-full max-w-sm mx-auto glass-card p-6">
                  <div className="text-4xl mb-3">🎨</div>
                  <h4 className="text-sm font-medium text-surface-200 mb-2">Draw Your Design</h4>
                  <p className="text-xs text-surface-500 mb-4">Excalidraw canvas loads here. Draw your system architecture diagram — boxes, arrows, labels for all components.</p>
                  <div className="grid grid-cols-4 gap-2 mb-4">{['📦 Service', '🗄️ DB', '💾 Cache', '⚡ Queue', '🌐 LB', '📡 CDN', '👤 Client', '🔒 Auth'].map((item) => (
                    <div key={item} className="bg-surface-800/50 rounded-md px-2 py-1.5 text-2xs text-surface-400 text-center hover:bg-surface-700/50 cursor-pointer transition-colors">{item}</div>
                  ))}</div>
                </div>
              </div>
            ) : (
              <div className="text-center animate-fade-in">
                <div className="text-4xl mb-3">✏️</div>
                <h4 className="text-sm font-medium text-surface-300 mb-1">Excalidraw Whiteboard</h4>
                <p className="text-xs text-surface-500 max-w-xs">Select a question and click "Start Solving" to begin drawing your system design.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        rating={MOCK_RATING}
        onStudyTopic={() => { setShowRating(false); }}
        onTryAnother={() => { setShowRating(false); setSelectedQuestion(null); setIsSessionActive(false); }}
      />
    </div>
  );
};
