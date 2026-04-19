import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coachApi } from '@/api/coach.api';
import { CoachSession } from './CoachSession';
import type { CoachSession as CoachSessionType } from '@/types';

export const CoachPage: FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<CoachSessionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    async function load() {
      try {
        const res = await coachApi.getSession(sessionId!);
        if (res.data.data.isCompleted) {
          navigate(`/coach/report/${sessionId}`, { replace: true });
          return;
        }
        setSession(res.data.data);
      } catch (err) {
        console.error('Failed to load session:', err);
        navigate('/practice');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-theme-bg">
        <div className="w-12 h-12 rounded-full border-4 border-theme/20 border-t-brand-500 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex-1 flex flex-col h-screen bg-theme-bg overflow-hidden animate-fade-in">
      <CoachSession session={session} />
    </div>
  );
};
