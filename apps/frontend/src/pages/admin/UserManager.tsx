import { type FC, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const MOCK_USERS = [
  { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'pro', plan: 'pro', sessionsCount: 15, questionsAttempted: 8, lastActiveAt: '2026-04-10T10:00:00Z' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'free', plan: 'free', sessionsCount: 3, questionsAttempted: 2, lastActiveAt: '2026-04-09T14:00:00Z' },
  { _id: '3', name: 'Admin User', email: 'admin@techprep.io', role: 'super-admin', plan: 'pro', sessionsCount: 50, questionsAttempted: 30, lastActiveAt: '2026-04-11T08:00:00Z' },
  { _id: '4', name: 'Content Creator', email: 'content@techprep.io', role: 'content-admin', plan: 'pro', sessionsCount: 20, questionsAttempted: 15, lastActiveAt: '2026-04-11T06:00:00Z' },
];

const ROLE_COLORS: Record<string, 'brand' | 'success' | 'warning' | 'error'> = {
  'super-admin': 'error',
  'content-admin': 'warning',
  'pro': 'success',
  'free': 'neutral' as any,
};

export const UserManager: FC = () => {
  const [users] = useState(MOCK_USERS);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Users</h1>
          <p className="text-sm text-surface-500 mt-1">Manage user roles and plans</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input-field w-40"><option value="">All Roles</option><option value="super-admin">Super Admin</option><option value="content-admin">Content Admin</option><option value="pro">Pro</option><option value="free">Free</option></select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[{ label: 'Total Users', value: users.length, icon: '👥' }, { label: 'Pro Users', value: users.filter((u) => u.plan === 'pro').length, icon: '⭐' }, { label: 'Admins', value: users.filter((u) => u.role.includes('admin')).length, icon: '🛡️' }, { label: 'Active Today', value: 2, icon: '🟢' }].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2"><span>{s.icon}</span><span className="text-xs font-medium text-surface-500 uppercase">{s.label}</span></div>
            <p className="text-2xl font-bold text-surface-100">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-surface-800/50"><th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase">User</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Role</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Plan</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Sessions</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Questions</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">{u.name[0]}</div>
                    <div><p className="text-sm text-surface-200 font-medium">{u.name}</p><p className="text-xs text-surface-500">{u.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center"><Badge variant={ROLE_COLORS[u.role] || 'neutral'}>{u.role.toUpperCase()}</Badge></td>
                <td className="px-4 py-3 text-center"><Badge variant={u.plan === 'pro' ? 'success' : 'neutral'}>{u.plan.toUpperCase()}</Badge></td>
                <td className="px-4 py-3 text-center text-sm text-surface-400">{u.sessionsCount}</td>
                <td className="px-4 py-3 text-center text-sm text-surface-400">{u.questionsAttempted}</td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm">Manage</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
