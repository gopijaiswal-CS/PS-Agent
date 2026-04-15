import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { questionsApi } from '@/api/questions.api';
import type { Question } from '@/types';

const TRACK_META: Record<string, { name: string; icon: string; desc: string; color: string }> = {
  hld: { name: 'High-Level Design', icon: '🏗️', desc: 'Design large-scale distributed systems, handle millions of users', color: 'from-indigo-500 to-violet-500' },
  lld: { name: 'Low-Level Design', icon: '⚙️', desc: 'Object-oriented programming, design patterns, scalable code', color: 'from-emerald-500 to-teal-500' },
  dsa: { name: 'Data Structures & Algorithms', icon: '🧮', desc: 'Trees, Graphs, DP, Arrays, optimal time/space complexity', color: 'from-amber-500 to-orange-500' },
  'ai-ml': { name: 'AI / ML System Design', icon: '🤖', desc: 'Model deployment, serving, data pipelines, MLOps', color: 'from-sky-500 to-cyan-500' },
  behavioral: { name: 'Behavioral & Leadership', icon: '💬', desc: 'Conflict resolution, past experiences, Amazon LPs', color: 'from-rose-500 to-pink-500' }
};

export const TrackDetailPage: FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const meta = trackId ? TRACK_META[trackId] : null;

  useEffect(() => {
    async function load() {
      if (!trackId) return;
      try {
        setLoading(true);
        // We fetch grouped, and pick the required track
        const res = await questionsApi.getGrouped();
        setQuestions(res.data.data[trackId] || []);
      } catch (err) {
        console.error('Failed to load track questions', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trackId]);

  if (!meta) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Track not found</h2>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="btn-ghost mb-8 text-sm">
        ← Back to Dashboard
      </button>

      {/* Hero Banner */}
      <div className="glass-card overflow-hidden relative mb-12 border-none">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${meta.color}`} />
        <div className="relative p-10 flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-4xl shadow-xl mb-6`}>
            {meta.icon}
          </div>
          <h1 className="text-4xl font-extrabold mb-3">{meta.name}</h1>
          <p className="text-lg text-theme-muted max-w-2xl">{meta.desc}</p>
          
          <div className="flex gap-4 mt-8">
            <div className="flex flex-col items-center bg-theme-elevated/50 px-6 py-3 rounded-xl border border-theme">
              <span className="text-3xl font-bold">{questions.length}</span>
              <span className="text-xs uppercase tracking-wider text-theme-muted font-medium">Challenges</span>
            </div>
            <div className="flex flex-col items-center bg-theme-elevated/50 px-6 py-3 rounded-xl border border-theme">
              <span className="text-3xl font-bold text-emerald-400">0%</span>
              <span className="text-xs uppercase tracking-wider text-theme-muted font-medium">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme">Available Challenges</h2>
          <p className="text-sm text-theme-muted mt-1">Switch between card and list view depending on how you want to browse this track.</p>
        </div>
        <div className="inline-flex rounded-xl border border-theme/20 bg-theme-elevated/40 p-1">
          <Button size="sm" variant={viewMode === 'card' ? 'primary' : 'ghost'} onClick={() => setViewMode('card')} className={viewMode === 'card' ? 'border-none' : ''}>
            Card View
          </Button>
          <Button size="sm" variant={viewMode === 'list' ? 'primary' : 'ghost'} onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'border-none' : ''}>
            List View
          </Button>
        </div>
      </div>
      <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="skeleton h-32 w-full" />)
        ) : questions.length === 0 ? (
          <div className="col-span-full py-12 text-center text-theme-muted glass-card">
            No questions available in this track yet.
          </div>
        ) : (
          questions.map((q) => {
            const difficultyLabel = q.difficulty > 3 ? 'Hard' : q.difficulty > 2 ? 'Medium' : 'Easy';

            if (viewMode === 'list') {
              return (
                <div key={q._id} className="glass-card-hover border border-theme/20 px-5 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-lg font-semibold text-theme">{q.title}</h3>
                        <Badge variant={q.difficulty > 3 ? 'error' : q.difficulty > 2 ? 'warning' : 'success'}>
                          {difficultyLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-theme-muted line-clamp-2">{q.description}</p>
                    </div>
                    <div className="flex items-center gap-3 justify-between lg:justify-end lg:min-w-[260px]">
                      <div className="text-xs text-theme-muted text-right">
                        <div>⏱️ {q.timeLimitSeconds ? Math.floor(q.timeLimitSeconds / 60) : 30} min</div>
                        <div className="mt-1">⭐ {(q.avgScore || 0).toFixed(1)} avg</div>
                      </div>
                      <Button variant="primary" onClick={() => navigate(`/practice/q/${q._id}`, { state: { trackId } })}>
                        Practice
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={q._id} className="glass-card-hover p-6 flex flex-col border border-theme relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${meta.color} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500`} />
                
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h3 className="text-lg font-bold text-theme">
                    {q.title}
                  </h3>
                  <Badge variant={q.difficulty > 3 ? 'error' : q.difficulty > 2 ? 'warning' : 'success'}>
                    {difficultyLabel}
                  </Badge>
                </div>
                
                <p className="text-sm text-theme-muted line-clamp-3 mb-6 flex-1">
                  {q.description}
                </p>
                
                <div className="flex justify-between items-center mt-auto border-t border-theme pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-theme-muted">
                    <span className="opacity-80">⏱️ {q.timeLimitSeconds ? Math.floor(q.timeLimitSeconds / 60) : 30} min</span>
                    <span>•</span>
                    <span className="opacity-80">⭐ {(q.avgScore || 0).toFixed(1)} avg</span>
                  </div>
                  
                  <Button variant="primary" onClick={() => navigate(`/practice/q/${q._id}`, { state: { trackId } })}>
                    Start Solving
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
