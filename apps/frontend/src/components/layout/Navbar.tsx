import { type FC, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { useUiStore, type AppTheme } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { formatRelativeTime } from '@/utils/formatTime';
import { authApi } from '@/api/auth.api';

const THEMES: { id: AppTheme; name: string; colors: string; accent: string }[] = [
  { id: 'midnight', name: 'Operator', colors: 'from-cyan-400 to-violet-500', accent: '#70f0ff' },
  { id: 'aurora', name: 'Neon Terminal', colors: 'from-emerald-300 to-cyan-400', accent: '#43e9c7' },
  { id: 'ember', name: 'Incident', colors: 'from-orange-400 to-amber-300', accent: '#ff7849' },
  { id: 'ocean', name: 'Deep Stack', colors: 'from-sky-400 to-cyan-300', accent: '#4ea8ff' },
  { id: 'forest', name: 'Kernel', colors: 'from-green-400 to-lime-300', accent: '#6cff96' },
];

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/practice', label: 'Practice', icon: '✏️' },
  { path: '/topics', label: 'Topics', icon: '📖' },
  { path: '/admin/questions', label: 'Admin', icon: '⚙️', adminOnly: true },
];

export const Navbar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, profileDropdownOpen, setProfileDropdownOpen, notificationsOpen, setNotificationsOpen, notifications, markAllRead, markNotificationRead } = useUiStore();
  const { user, logout } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [setProfileDropdownOpen, setNotificationsOpen]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const userName = user?.name || 'Guest User';
  const userInitial = userName[0]?.toUpperCase() || 'U';

  return (
    <nav className="sticky top-0 z-50 border-b border-theme" style={{ background: `rgba(var(--theme-bg-primary), 0.85)`, backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo + Links */}
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `rgba(var(--theme-accent), 0.2)`, border: `1px solid rgba(var(--theme-accent), 0.3)` }}>
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="currentColor" style={{ color: `rgb(var(--theme-accent))` }} /></svg>
            </div>
            <span className="font-bold text-theme hidden sm:inline">
              Tech<span className="text-gradient">Prep</span> Pro
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.filter(l => !l.adminOnly || (user?.role && ['super-admin', 'content-admin'].includes(user.role))).map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith(link.path)
                    ? 'text-theme' : 'text-theme-muted hover:text-theme-secondary'
                }`}
                style={location.pathname.startsWith(link.path) ? { background: `rgba(var(--theme-accent), 0.1)` } : {}}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Picker */}
          <div className="hidden sm:flex items-center gap-1 mr-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.name}
                className={`w-5 h-5 rounded-full transition-all duration-200 ${theme === t.id ? 'ring-2 ring-offset-1 scale-110' : 'opacity-50 hover:opacity-80'}`}
                style={{ background: t.accent, '--tw-ring-color': t.accent, '--tw-ring-offset-color': `rgb(var(--theme-bg-primary))` } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-theme-muted hover:text-theme-secondary transition-colors"
              style={{ background: notificationsOpen ? `rgba(var(--theme-accent), 0.1)` : 'transparent' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-2xs flex items-center justify-center text-white font-bold" style={{ background: `rgb(var(--theme-accent))` }}>{unreadCount}</span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 glass-card overflow-hidden animate-slide-down z-50">
                <div className="p-3 border-b border-theme flex items-center justify-between">
                  <span className="text-sm font-semibold text-theme">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-2xs font-medium hover:underline" style={{ color: `rgb(var(--theme-accent))` }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full text-left px-3 py-3 border-b border-theme hover:bg-theme-elevated/30 transition-colors ${n.read ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: `rgb(var(--theme-accent))` }} />}
                        <div className={n.read ? 'ml-4' : ''}>
                          <p className="text-sm font-medium text-theme">{n.title}</p>
                          <p className="text-xs text-theme-muted mt-0.5">{n.message}</p>
                          <p className="text-2xs text-theme-muted mt-1">{formatRelativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Plan badge */}
          <Badge variant={user?.plan === 'pro' ? 'success' : 'brand'}>
            {user?.plan === 'pro' ? 'PRO' : 'FREE'} PLAN
          </Badge>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-theme-elevated/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, rgb(var(--theme-accent)), rgb(var(--theme-accent-secondary)))` }}>
                {userInitial}
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-theme-muted"><path d="M6 9l6 6 6-6" /></svg>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-12 w-56 glass-card overflow-hidden animate-slide-down z-50">
                <div className="p-3 border-b border-theme">
                  <p className="text-sm font-semibold text-theme">{userName}</p>
                  <p className="text-xs text-theme-muted">{user?.email || 'guest@techprep.io'}</p>
                </div>
                <div className="p-1">
                  <button onClick={() => { navigate('/dashboard'); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-md text-theme-secondary hover:text-theme hover:bg-theme-elevated/50 transition-colors">🏠 Dashboard</button>
                  <button onClick={() => { navigate('/practice'); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-md text-theme-secondary hover:text-theme hover:bg-theme-elevated/50 transition-colors">✏️ Practice</button>
                  <button onClick={() => { navigate('/topics'); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-md text-theme-secondary hover:text-theme hover:bg-theme-elevated/50 transition-colors">📖 Topics</button>
                  {user?.role && ['super-admin', 'content-admin'].includes(user.role) && (
                    <button onClick={() => { navigate('/admin'); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-md text-theme-secondary hover:text-theme hover:bg-theme-elevated/50 transition-colors">⚙️ Admin Panel</button>
                  )}
                  <div className="border-t border-theme my-1" />
                  {/* Theme picker mobile */}
                  <div className="px-3 py-2 sm:hidden">
                    <p className="text-xs font-medium text-theme-muted mb-2">Theme</p>
                    <div className="flex gap-1.5">
                      {THEMES.map((t) => (
                        <button key={t.id} onClick={() => setTheme(t.id)} className={`w-6 h-6 rounded-full ${theme === t.id ? 'ring-2 ring-offset-1' : 'opacity-50'}`} style={{ background: t.accent }} />
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-theme my-1 sm:hidden" />
                  <button onClick={async () => { try { await authApi.logout(); } catch {} logout(); setProfileDropdownOpen(false); navigate('/login'); }} className="w-full text-left px-3 py-2 text-sm rounded-md text-rose-400 hover:bg-rose-500/10 transition-colors">🚪 Log out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-theme md:hidden" style={{ background: `rgba(var(--theme-bg-primary), 0.95)`, backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-around h-14">
          {[
            { path: '/dashboard', label: 'Home', icon: '🏠' }, 
            { path: '/practice', label: 'Practice', icon: '✏️' }, 
            { path: '/topics', label: 'Topics', icon: '📖' },
            { path: '/admin', label: 'Admin', icon: '⚙️', adminOnly: true }
          ].filter(l => !l.adminOnly || (user?.role && ['super-admin', 'content-admin'].includes(user.role))).map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                location.pathname.startsWith(link.path) ? 'text-theme' : 'text-theme-muted'
              }`}
              style={location.pathname.startsWith(link.path) ? { color: `rgb(var(--theme-accent))` } : {}}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-2xs font-medium">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
