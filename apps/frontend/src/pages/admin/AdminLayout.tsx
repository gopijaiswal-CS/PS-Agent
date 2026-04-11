import { type FC } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';

const NAV_ITEMS = [
  { path: '/admin/questions', label: 'Questions', icon: '📝' },
  { path: '/admin/topics', label: 'Topics', icon: '📖' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📊' },
];

export const AdminLayout: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Admin sidebar */}
      <div className="w-64 border-r border-surface-800/50 bg-surface-950/80 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-surface-800/50">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 mb-4 group">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-500 group-hover:text-surface-300"><path d="M15 18l-6-6 6-6" /></svg>
            <span className="text-xs text-surface-500 group-hover:text-surface-300">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="url(#admin-logo)" /><defs><linearGradient id="admin-logo" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#818cf8" /><stop offset="1" stopColor="#c084fc" /></linearGradient></defs></svg>
            </div>
            <div>
              <span className="text-sm font-bold text-surface-100 block">Admin CMS</span>
              <Badge variant="brand" className="mt-0.5">ADMIN</Badge>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
