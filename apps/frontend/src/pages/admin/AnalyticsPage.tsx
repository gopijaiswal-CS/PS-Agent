import { type FC } from 'react';

export const AnalyticsPage: FC = () => {
  const stats = [
    { label: 'Total Sessions', value: '142', change: '+12%', icon: '📊' },
    { label: 'Avg Score', value: '6.8', change: '+0.3', icon: '⭐' },
    { label: 'Completion Rate', value: '73%', change: '+5%', icon: '✅' },
    { label: 'Active Users (7d)', value: '34', change: '+8', icon: '👥' },
  ];

  const trackStats = [
    { track: 'HLD', sessions: 68, avgScore: 6.5, topQuestion: 'URL Shortener' },
    { track: 'LLD', sessions: 32, avgScore: 7.1, topQuestion: 'Parking Lot' },
    { track: 'DSA', sessions: 28, avgScore: 6.2, topQuestion: 'LRU Cache' },
    { track: 'AI/ML', sessions: 8, avgScore: 5.8, topQuestion: 'ML Pipeline' },
    { track: 'Behavioral', sessions: 6, avgScore: 7.5, topQuestion: 'Conflict Resolution' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-surface-50 mb-2">Analytics</h1>
      <p className="text-sm text-surface-500 mb-8">Platform performance and usage metrics</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{s.icon}</span>
              <span className="text-xs font-medium text-accent-emerald">{s.change}</span>
            </div>
            <p className="text-2xl font-bold text-surface-100 mb-1">{s.value}</p>
            <p className="text-xs text-surface-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-surface-100 mb-4">Track Breakdown</h2>
        <div className="space-y-4">
          {trackStats.map((t) => (
            <div key={t.track} className="flex items-center gap-4">
              <span className="w-20 text-sm font-medium text-surface-300">{t.track}</span>
              <div className="flex-1 h-3 bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full" style={{ width: `${(t.sessions / 70) * 100}%` }} />
              </div>
              <span className="text-sm text-surface-400 w-16 text-right">{t.sessions} sessions</span>
              <span className="text-sm text-surface-400 w-16 text-right">{t.avgScore} avg</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
