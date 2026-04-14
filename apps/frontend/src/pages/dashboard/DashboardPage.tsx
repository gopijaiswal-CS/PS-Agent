import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';

import { questionsApi } from '@/api/questions.api';

const TRACK_META: Record<string, { name: string; icon: string; color: string; desc: string }> = {
  hld: { name: 'High-Level Design', icon: '🏗️', color: 'from-brand-500 to-violet-500', desc: 'Design scalable, distributed systems' },
  lld: { name: 'Low-Level Design', icon: '⚙️', color: 'from-emerald-500 to-teal-500', desc: 'Object-oriented design & patterns' },
  dsa: { name: 'DSA', icon: '🧮', color: 'from-amber-500 to-orange-500', desc: 'Algorithms, trees, graphs, DP' },
  'ai-ml': { name: 'AI / ML', icon: '🤖', color: 'from-sky-500 to-cyan-500', desc: 'ML system design & deployment' },
  behavioral: { name: 'Behavioral', icon: '💬', color: 'from-rose-500 to-pink-500', desc: 'Leadership & conflict resolution' },
};

export const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userName = user?.name ? user.name.split(' ')[0] : 'Engineer';

  const [trackCounts, setTrackCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    questionsApi.getGrouped().then(res => {
      const counts: Record<string, number> = {};
      Object.entries(res.data.data).forEach(([track, qs]) => {
        counts[track] = qs.length;
      });
      setTrackCounts(counts);
    }).catch(console.error);
  }, []);

  // Dynamic user data logic
  const STATS = [
    { label: 'Questions Solved', value: user?.questionsAttempted || '0', icon: '📝' },
    { label: 'Sessions', value: user?.sessionCount || '0', icon: '⏱️' },
    { label: 'Points', value: user?.points || '0', icon: '🏆' },
    { label: 'Streak', value: `${user?.streak || 0} days`, icon: '🔥' },
  ];

  return (
    <div className="min-h-full">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome section */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold text-theme mb-2">
            Welcome back, <span className="text-theme-accent">{userName}</span>
          </h1>
          <p className="text-theme-muted max-w-lg">
            Pick up where you left off. Practice system design, data structures, and behavioral interviews with AI.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="glass-card p-5 animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-xs font-medium text-theme-muted uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-theme">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-theme">Interview Tracks</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/practice')}>
            View all questions →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {Object.entries(TRACK_META).map(([id, meta], i) => {
            const count = trackCounts[id] || 0;
            const progress = user?.trackProgress?.[id] || 0;
            return (
              <div
                key={id}
                className="glass-card-hover p-6 cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${0.2 + i * 0.05}s` }}
                onClick={() => navigate(`/practice/track/${id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {meta.icon}
                  </div>
                  <Badge variant="neutral">{count} Qs</Badge>
                </div>
                <h3 className="text-lg font-semibold text-theme mb-1 group-hover:text-theme-accent transition-colors">
                  {meta.name}
                </h3>
                <p className="text-sm text-theme-secondary">
                  {meta.desc}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 progress-bar bg-theme-elevated/50 h-2 rounded-full overflow-hidden">
                    <div className="progress-bar-fill bg-theme-accent h-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-2xs text-theme-muted font-bold">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick start CTA */}
        <div className="glass-card p-8 text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-theme-accent/20 border border-theme-accent/30 mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-xl font-semibold text-theme mb-2">Ready to start practicing?</h3>
          <p className="text-theme-muted mb-6 max-w-md mx-auto">
            Jump into a practice session. Complete your whiteboard design, explain it verbally, and get instant true AI feedback.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/practice')}>
            Start Practice Session
          </Button>
        </div>
      </main>
    </div>
  );
};
