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
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { authApi } from '@/api/auth.api';

function App() {
  const { setAuth, setToken, logout, setLoading } = useAuthStore();
  const theme = useUiStore(state => state.theme);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      setLoading(true);
      try {
        const refreshRes = await authApi.refresh();
        const accessToken = refreshRes.data.data.accessToken;

        if (!accessToken) {
          if (!cancelled) logout();
          return;
        }

        setToken(accessToken);
        const meRes = await authApi.getMe();

        if (!cancelled) {
          setAuth(meRes.data.data, accessToken);
        }
      } catch {
        if (!cancelled) logout();
      }
    }

    bootstrapAuth();

    return () => {
      cancelled = true;
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
