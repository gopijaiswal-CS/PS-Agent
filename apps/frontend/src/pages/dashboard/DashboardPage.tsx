import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const TRACKS = [
  { id: 'hld', name: 'High-Level Design', icon: '🏗️', count: 12, color: 'from-brand-500 to-violet-500' },
  { id: 'lld', name: 'Low-Level Design', icon: '⚙️', count: 8, color: 'from-emerald-500 to-teal-500' },
  { id: 'dsa', name: 'DSA', icon: '🧮', count: 20, color: 'from-amber-500 to-orange-500' },
  { id: 'ai-ml', name: 'AI / ML', icon: '🤖', count: 6, color: 'from-sky-500 to-cyan-500' },
  { id: 'behavioral', name: 'Behavioral', icon: '💬', count: 10, color: 'from-rose-500 to-pink-500' },
];

const STATS = [
  { label: 'Questions Solved', value: '0', icon: '📝' },
  { label: 'Sessions', value: '0', icon: '⏱️' },
  { label: 'Avg Score', value: '—', icon: '📊' },
  { label: 'Streak', value: '0 days', icon: '🔥' },
];

export const DashboardPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Top navigation */}
      <nav className="sticky top-0 z-50 border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="url(#nav-logo)" />
                <defs>
                  <linearGradient id="nav-logo" x1="4" y1="2" x2="28" y2="30">
                    <stop stopColor="#818cf8" />
                    <stop offset="1" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-bold text-surface-100">
              Tech<span className="text-brand-400">Prep</span> Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="brand">FREE PLAN</Badge>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
              U
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome section */}
        <div className="mb-10 animate-slide-up">
          <h1 className="text-3xl font-bold text-surface-50 mb-2">
            Welcome to <span className="text-gradient">TechPrep Pro</span>
          </h1>
          <p className="text-surface-400 max-w-lg">
            Practice system design, data structures, and behavioral interviews with AI-powered feedback tailored for senior engineers.
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
                <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-surface-100">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-surface-100">Interview Tracks</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/practice')}>
            View all questions →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {TRACKS.map((track, i) => (
            <div
              key={track.id}
              className="glass-card-hover p-6 cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${0.2 + i * 0.05}s` }}
              onClick={() => navigate('/practice')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {track.icon}
                </div>
                <Badge variant="neutral">{track.count} Qs</Badge>
              </div>
              <h3 className="text-lg font-semibold text-surface-100 mb-1 group-hover:text-brand-400 transition-colors">
                {track.name}
              </h3>
              <p className="text-sm text-surface-500">
                {track.id === 'hld' && 'Design scalable, distributed systems'}
                {track.id === 'lld' && 'Object-oriented design & patterns'}
                {track.id === 'dsa' && 'Algorithms, trees, graphs, DP'}
                {track.id === 'ai-ml' && 'ML system design & deployment'}
                {track.id === 'behavioral' && 'Leadership & conflict resolution'}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 progress-bar">
                  <div className="progress-bar-fill" style={{ width: '0%' }} />
                </div>
                <span className="text-2xs text-surface-500">0%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick start CTA */}
        <div className="glass-card p-8 text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-xl font-semibold text-surface-100 mb-2">Ready to start practicing?</h3>
          <p className="text-surface-400 mb-6 max-w-md mx-auto">
            Jump into a practice session. Draw your system design, explain it verbally, and get instant AI feedback.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/practice')}>
            Start Practice Session
          </Button>
        </div>
      </main>
    </div>
  );
};
