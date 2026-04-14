import { type FC, useEffect, useState } from 'react';
import { questionsApi } from '@/api/questions.api';
import { topicsApi } from '@/api/topics.api';
import type { Question, Topic } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type UnifiedItem = {
  _id: string;
  type: 'question' | 'topic';
  title: string;
  track: string;
  categoryOrDifficulty: string | number;
  updatedAt: string;
  reviewNotes: string;
  original: Question | Topic;
};

export const ApprovalQueue: FC = () => {
  const [pendingItems, setPendingItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingQueue();
  }, []);

  const loadPendingQueue = async () => {
    setLoading(true);
    try {
      const [questionsRes, topicsRes] = await Promise.all([
        questionsApi.getAll({ limit: 100, status: 'PENDING' }),
        topicsApi.getAll({ limit: 100, status: 'PENDING' })
      ]);

      const questionsList = questionsRes.data.data.filter((q: any) => q.status === 'PENDING').map(q => ({
        _id: q._id,
        type: 'question' as const,
        title: q.title,
        track: q.track,
        categoryOrDifficulty: `${q.difficulty}/5`,
        updatedAt: q.updatedAt,
        reviewNotes: q.reviewNotes || '',
        original: q
      }));

      const topicsList = topicsRes.data.data.filter((t: any) => t.status === 'PENDING').map(t => ({
        _id: t._id,
        type: 'topic' as const,
        title: t.name,
        track: t.track,
        categoryOrDifficulty: t.category,
        updatedAt: t.updatedAt,
        reviewNotes: t.reviewNotes || '',
        original: t
      }));

      const combined = [...questionsList, ...topicsList].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setPendingItems(combined);
    } catch (err) {
      console.error('Failed to load pending queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (item: UnifiedItem, action: 'LIVE' | 'DRAFT') => {
    if (action === 'DRAFT' && !reviewNotes.trim()) {
      alert("Please provide review notes when rejecting to Draft.");
      return;
    }

    setProcessing(true);
    try {
      if (item.type === 'question') {
        await questionsApi.update(item._id, {
          status: action,
          reviewNotes: action === 'DRAFT' ? reviewNotes : '',
        });
      } else {
        await topicsApi.update(item._id, {
          status: action,
          reviewNotes: action === 'DRAFT' ? reviewNotes : '',
        });
      }

      setReviewingId(null);
      setReviewNotes('');
      loadPendingQueue();
    } catch (err) {
      console.error(`Failed to process action ${action}`, err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-theme">Approval Queue</h1>
          <p className="text-sm text-theme-muted mt-1">Review and approve questions and topics submitted by editors.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-theme-accent border-theme-bg animate-spin" /></div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-theme/30 bg-theme-elevated/20">
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase">Title</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Track</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Cat / Diff</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Submitted At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingItems.map((item) => (
                <tr key={`${item.type}-${item._id}`} className="border-b border-theme/20 hover:bg-theme-elevated/10 transition-colors">
                  <td className="px-4 py-3">
                    <Badge variant={item.type === 'question' ? 'brand' : 'success'}>
                      {item.type.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-theme font-semibold">{item.title}</td>
                  <td className="px-4 py-3 text-center"><Badge variant="neutral">{item.track.toUpperCase()}</Badge></td>
                  <td className="px-4 py-3 text-center text-sm text-theme-muted">{item.categoryOrDifficulty}</td>
                  <td className="px-4 py-3 text-center text-sm text-theme-muted">{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {reviewingId === item._id ? (
                        <div className="flex flex-col gap-2 p-3 bg-surface-900 rounded-lg shadow-xl shadow-black/40 border border-theme/20 animate-scale-in text-left">
                           <label className="text-xs font-semibold uppercase text-theme-muted">Review Notes (Feedback)</label>
                           <textarea className="input-field min-h-[80px]" placeholder="Explain what needs to change..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
                           <div className="flex gap-2 justify-end mt-2">
                             <Button size="sm" variant="secondary" onClick={() => setReviewingId(null)}>Cancel</Button>
                             <Button size="sm" variant="secondary" className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/40" onClick={() => handleReviewAction(item, 'DRAFT')} loading={processing}>Reject to Draft</Button>
                             <Button size="sm" variant="primary" className="bg-emerald-500 text-white hover:bg-emerald-600 border-none" onClick={() => handleReviewAction(item, 'LIVE')} loading={processing}>Approve & Live</Button>
                           </div>
                        </div>
                    ) : (
                        <Button variant="ghost" size="sm" onClick={() => { setReviewNotes(item.reviewNotes || ''); setReviewingId(item._id); }}>Review</Button>
                    )}
                  </td>
                </tr>
              ))}
              {pendingItems.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-theme-muted font-medium">No items pending approval 🎉</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
