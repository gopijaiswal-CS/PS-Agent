import { type FC, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = mode === 'register'
        ? await authApi.register(email.trim(), password, name.trim() || undefined)
        : await authApi.login(email.trim(), password);

      const { accessToken, user } = response.data.data;
      setAuth(user, accessToken);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo & branding */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-6 glow-brand">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="url(#logo-gradient)" />
              <path d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z" fill="#0f172a" />
              <path d="M16 11L19 12.75V16.25L16 18L13 16.25V12.75L16 11Z" fill="url(#logo-gradient-inner)" />
              <defs>
                <linearGradient id="logo-gradient" x1="4" y1="2" x2="28" y2="30">
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
                <linearGradient id="logo-gradient-inner" x1="13" y1="11" x2="19" y2="18">
                  <stop stopColor="#a5b4fc" />
                  <stop offset="1" stopColor="#e9d5ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-surface-50 mb-2">
            Tech<span className="text-gradient">Prep</span> Pro
          </h1>
          <p className="text-surface-400 text-sm max-w-xs mx-auto">
            AI-powered interview preparation for Staff Engineers, Architects & AI Engineers
          </p>
        </div>

        {/* Login card */}
        <div className="glass-card p-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-semibold text-surface-100 mb-1">Welcome back</h2>
          <p className="text-sm text-surface-500 mb-8">Sign in to continue your preparation journey</p>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setError('OAuth is not wired yet. Use email/password sign in below.')}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium text-sm rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-white/5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => setError('OAuth is not wired yet. Use email/password sign in below.')}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-surface-800 hover:bg-surface-700 text-surface-100 font-medium text-sm rounded-lg border border-surface-600/50 transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-900/60 px-3 text-surface-500">or continue with email</span>
            </div>
          </div>

          {/* Email form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-900/60 p-1">
              <button
                onClick={() => setMode('login')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-200'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${mode === 'register' ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-200'}`}
              >
                Create Account
              </button>
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5" htmlFor="login-name">Name</label>
                <input
                  id="login-name"
                  type="text"
                  placeholder="Your name"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@company.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
              />
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <Button
              variant="primary"
              className="w-full"
              loading={isLoading}
              onClick={handleSubmit}
            >
              {mode === 'register' ? 'Create Account' : 'Sign In'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-surface-600 mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
