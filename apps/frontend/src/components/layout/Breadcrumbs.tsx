import { type FC } from 'react';
import { useLocation, Link } from 'react-router-dom';

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  practice: 'Practice',
  topics: 'Topics',
  admin: 'Admin',
  questions: 'Questions',
  users: 'Users',
  analytics: 'Analytics',
  track: 'Track',
  hld: 'High-Level Design',
  lld: 'Low-Level Design',
  dsa: 'DSA',
  'ai-ml': 'AI / ML',
  behavioral: 'Behavioral',
};

export const Breadcrumbs: FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Hide on dashboard home or login
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  // Hide on practice session for full immersion
  if (location.pathname === '/practice') {
    return null;
  }

  return (
    <nav className="flex px-6 py-3 border-b border-theme bg-theme-elevated/20 backdrop-blur-sm">
      <ol className="flex items-center space-x-2 text-xs font-medium text-theme-muted">
        <li>
          <Link to="/dashboard" className="hover:text-theme-accent transition-colors flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          // Skip the "track" segment itself, it's just a URL component
          if (value === 'track') return null;

          const label = LABEL_MAP[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

          return (
            <li key={to} className="flex items-center space-x-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40"><polyline points="9 18 15 12 9 6"></polyline></svg>
              {isLast ? (
                <span className="text-theme font-semibold">{label}</span>
              ) : (
                <Link to={to} className="hover:text-theme-accent transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
