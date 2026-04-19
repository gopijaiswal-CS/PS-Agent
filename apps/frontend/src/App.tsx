import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PracticePage } from '@/pages/practice/PracticePage';
import { TrackDetailPage } from '@/pages/practice/TrackDetailPage';
import { TopicsPage } from '@/pages/practice/TopicsPage';
import { TopicDetailPage } from '@/pages/practice/TopicDetailPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { QuestionEditor } from '@/pages/admin/QuestionEditor';
import { TopicEditor } from '@/pages/admin/TopicEditor';
import { UserManager } from '@/pages/admin/UserManager';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { ApprovalQueue } from '@/pages/admin/ApprovalQueue';
import { MainLayout } from '@/components/layout/MainLayout';
import { PrivateRoute, AdminRoute } from '@/components/auth/PrivateRoute';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { authApi } from '@/api/auth.api';

// Add to top imports
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { CoachPage } from '@/pages/coach/CoachPage';
import { SessionReport } from '@/pages/coach/SessionReport';

function App() {
  const { setAuth, setToken, logout, setLoading } = useAuthStore();
  const theme = useUiStore(state => state.theme);
  const authBootstrapGen = useRef(0);

  useEffect(() => {
    const myGen = ++authBootstrapGen.current;
    setLoading(true);

    (async () => {
      try {
        const refreshRes = await authApi.refresh();
        const accessToken = refreshRes.data.data.accessToken;

        if (!accessToken) {
          if (authBootstrapGen.current === myGen) logout();
          return;
        }

        setToken(accessToken);
        const meRes = await authApi.getMe();

        if (authBootstrapGen.current === myGen) {
          setAuth(meRes.data.data, accessToken);
        }
      } catch {
        if (authBootstrapGen.current === myGen) logout();
      } finally {
        // Only the latest bootstrap pass may clear loading (avoids StrictMode stale runs leaving isLoading stuck)
        if (authBootstrapGen.current === myGen) setLoading(false);
      }
    })();

    return () => {
      authBootstrapGen.current += 1;
    };
  }, [logout, setAuth, setLoading, setToken]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Onboarding route (unprotected but handles its own logic) */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected routes - require auth */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/q/:questionId" element={<PracticePage />} />
            <Route path="/practice/track/:trackId" element={<TrackDetailPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/:topicId" element={<TopicDetailPage />} />
          </Route>
          
          {/* Coach Routes */}
          <Route path="/coach/:sessionId" element={<CoachPage />} />
          <Route path="/coach/report/:sessionId" element={<SessionReport />} />

          {/* Admin routes - require admin role */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/questions" replace />} />
              <Route path="questions" element={<QuestionEditor />} />
              <Route path="topics" element={<TopicEditor />} />
              <Route path="approvals" element={<ApprovalQueue />} />
              <Route path="users" element={<UserManager />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Redirect everything else to dashboard (which will redirect to login if not auth'd) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
