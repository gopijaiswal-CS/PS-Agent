import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PracticePage } from '@/pages/practice/PracticePage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { QuestionEditor } from '@/pages/admin/QuestionEditor';
import { TopicEditor } from '@/pages/admin/TopicEditor';
import { UserManager } from '@/pages/admin/UserManager';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/practice" element={<PracticePage />} />
        
        {/* Admin CMS Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/questions" replace />} />
          <Route path="questions" element={<QuestionEditor />} />
          <Route path="topics" element={<TopicEditor />} />
          <Route path="users" element={<UserManager />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
