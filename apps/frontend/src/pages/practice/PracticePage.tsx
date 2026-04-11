import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock data for the initial scaffold - will be replaced with API calls
const MOCK_QUESTIONS = {
  hld: [
    { id: '1', title: 'Design a URL Shortener', difficulty: 3, tags: ['Hashing', 'Cache', 'NoSQL'], completed: false },
    { id: '2', title: 'Design Twitter/X Feed', difficulty: 4, tags: ['Fan-out', 'Pub/Sub', 'Timeline'], completed: false },
    { id: '3', title: 'Design Uber/Lyft', difficulty: 5, tags: ['Geospatial', 'Matching', 'Real-time'], completed: false },
    { id: '4', title: 'Design Netflix Streaming', difficulty: 4, tags: ['CDN', 'Video', 'Adaptive'], completed: false },
  ],
  lld: [
    { id: '5', title: 'Design a Parking Lot', difficulty: 2, tags: ['OOP', 'Strategy'], completed: false },
    { id: '6', title: 'Design a Chess Game', difficulty: 3, tags: ['State Machine', 'Observer'], completed: false },
  ],
  dsa: [
    { id: '7', title: 'LRU Cache', difficulty: 2, tags: ['Hash Map', 'Linked List'], completed: false },
    { id: '8', title: 'Serialize Binary Tree', difficulty: 3, tags: ['Tree', 'BFS/DFS'], completed: false },
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

export const PracticePage: FC = () => {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({ hld: true, lld: true, dsa: true });

  const toggleTrack = (track: string) => {
    setExpandedTracks((prev) => ({ ...prev, [track]: !prev[track] }));
  };

  const selectedQ = Object.values(MOCK_QUESTIONS)
    .flat()
    .find((q) => q.id === selectedQuestion);

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost px-2 py-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="w-7 h-7 rounded-md bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="url(#tp-logo)" />
              <defs>
                <linearGradient id="tp-logo" x1="4" y1="2" x2="28" y2="30">
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-sm font-semibold text-surface-200">TechPrep Pro</span>
        </div>
        <div className="flex items-center gap-3">
          {selectedQ && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-surface-500">⏱</span>
              <span className="font-mono text-surface-300 text-sm">40:00</span>
            </div>
          )}
          <Badge variant="brand">HLD</Badge>
          <Badge variant="success">PRO</Badge>
        </div>
      </div>

      {/* Three panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Question Sidebar */}
        <div className="w-72 border-r border-surface-800/50 bg-surface-950/50 flex flex-col flex-shrink-0">
          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search questions..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="input-field pl-10 py-2 text-xs"
              />
            </div>
          </div>

          {/* Question list */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {Object.entries(MOCK_QUESTIONS).map(([track, questions]) => {
              const trackInfo = TRACK_LABELS[track];
              const filteredQs = questions.filter((q) =>
                q.title.toLowerCase().includes(sidebarSearch.toLowerCase())
              );
              if (filteredQs.length === 0 && sidebarSearch) return null;

              return (
                <div key={track} className="mb-1">
                  <button
                    onClick={() => toggleTrack(track)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider hover:text-surface-200 transition-colors"
                  >
                    <svg
                      className={`w-3 h-3 transition-transform ${expandedTracks[track] ? 'rotate-90' : ''}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    <span>{trackInfo?.icon}</span>
                    <span>{trackInfo?.name}</span>
                    <span className="ml-auto text-surface-600 text-2xs">{questions.length}</span>
                  </button>

                  {expandedTracks[track] && (
                    <div className="space-y-0.5 ml-2">
                      {filteredQs.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQuestion(q.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                            selectedQuestion === q.id
                              ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                              : 'text-surface-300 hover:bg-surface-800/50 hover:text-surface-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${q.completed ? 'bg-accent-emerald' : 'bg-surface-600'}`} />
                            <span className="truncate">{q.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 ml-3.5">
                            <DifficultyDots level={q.difficulty} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: Question Detail + AI Chat */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {selectedQ ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl">
                {/* Question header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Badge variant="brand">HLD</Badge>
                    <DifficultyDots level={selectedQ.difficulty} />
                    <span className="text-xs text-surface-500">40 min</span>
                  </div>
                  <h2 className="text-2xl font-bold text-surface-50 mb-3">{selectedQ.title}</h2>
                  <p className="text-surface-400 text-sm leading-relaxed">
                    Design a system that takes long URLs and converts them into short, unique URLs. The system should handle
                    millions of URL shortenings per day, redirect users to the original URL when they visit the short link,
                    and provide analytics on link usage. Consider scalability, availability, and data consistency.
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedQ.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">{tag}</Badge>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 mb-8">
                  <Button variant="secondary" size="sm" icon={<span>📖</span>}>
                    Read Topics
                  </Button>
                  <Button variant="secondary" size="sm" icon={<span>💡</span>}>
                    Hint (1/3)
                  </Button>
                  <Button variant="primary" size="sm" icon={<span>▶</span>}>
                    Start Solving
                  </Button>
                </div>

                {/* AI Tutor section */}
                <div className="border-t border-surface-800/50 pt-6">
                  <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-brand-600/20 flex items-center justify-center text-xs">🤖</span>
                    AI Tutor
                  </h3>
                  <div className="glass-card p-4 mb-4">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs flex-shrink-0">AI</div>
                      <div>
                        <p className="text-sm text-surface-300 leading-relaxed">
                          Welcome! I'm your AI interviewer. When you're ready, start explaining your approach for <strong className="text-surface-100">{selectedQ.title}</strong>. 
                          I'll ask follow-up questions just like a real interview.
                        </p>
                        <p className="text-xs text-surface-500 mt-2">Just now</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your response..."
                      className="input-field flex-1"
                    />
                    <Button variant="primary" size="sm">Send</Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-surface-200 mb-2">Select a question</h3>
                <p className="text-sm text-surface-500 max-w-xs">
                  Browse the questions in the sidebar and select one to begin your practice session.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Whiteboard */}
        <div className="w-[45%] border-l border-surface-800/50 bg-surface-900/30 flex flex-col flex-shrink-0">
          {/* Whiteboard toolbar */}
          <div className="h-12 border-b border-surface-800/50 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-surface-400">Whiteboard</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                🎤 Explain
              </Button>
              <Button variant="primary" size="sm">
                ⭐ Rate Design
              </Button>
            </div>
          </div>
          {/* Whiteboard canvas placeholder */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center animate-fade-in">
              <div className="text-4xl mb-3">✏️</div>
              <h4 className="text-sm font-medium text-surface-300 mb-1">Excalidraw Whiteboard</h4>
              <p className="text-xs text-surface-500 max-w-xs">
                The interactive whiteboard will render here with Excalidraw.
                <br />Select a question and click "Start Solving" to begin drawing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
