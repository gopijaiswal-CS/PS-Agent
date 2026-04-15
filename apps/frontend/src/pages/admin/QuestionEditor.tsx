import { type FC, useEffect, useState } from 'react';
import { questionsApi } from '@/api/questions.api';
import type { Question } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RichEditor } from '@/components/ui/RichEditor';

export const QuestionEditor: FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ title: '', description: '', track: 'hld', difficulty: 3, tags: '', hints: ['', '', ''], status: 'DRAFT', reviewNotes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionsApi.getAll({ limit: 100, status: 'ALL' });
      setQuestions(res.data.data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q: Question) => {
    setEditingId(q._id);
    setFormData({ 
      title: q.title, 
      description: q.description || '', 
      track: q.track, 
      difficulty: q.difficulty, 
      tags: q.tags?.join(', ') || '', 
      hints: q.hints?.length === 3 ? q.hints : [q.hints?.[0] || '', q.hints?.[1] || '', q.hints?.[2] || ''], 
      status: q.status || (q.isPublished ? 'LIVE' : 'DRAFT'),
      reviewNotes: q.reviewNotes || ''
    });
  };

  const handleSave = async (targetStatus: string) => {
    setSaving(true);
    try {
      const payload: Partial<Question> = {
        title: formData.title,
        description: formData.description,
        track: formData.track as any,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        hints: formData.hints.filter(Boolean),
        status: targetStatus,
      };

      if (editingId === 'new') {
        const defaultRubric = {
          scalability: { weight: 1, description: 'Scales well' },
          correctness: { weight: 1, description: 'Correct logic' },
          completeness: { weight: 1, description: 'Complete' },
          clarity: { weight: 1, description: 'Clear' }
        };
        await questionsApi.create({ ...payload, rubric: defaultRubric });
      } else {
        await questionsApi.update(editingId!, payload);
      }
      
      setEditingId(null);
      loadQuestions();
    } catch (err) {
      console.error('Failed to save question:', err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string, isPublished?: boolean) => {
    const finalStatus = status || (isPublished ? 'LIVE' : 'DRAFT');
    if (finalStatus === 'LIVE') return <Badge variant="success">LIVE</Badge>;
    if (finalStatus === 'PENDING') return <Badge variant="warning">IN REVIEW</Badge>;
    return <Badge variant="neutral">DRAFT</Badge>;
  };

  return (
    <div className="p-4 sm:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-theme">Question Bank</h1>
          <p className="text-sm text-theme-muted mt-1">Design multi-track technical interview challenges</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingId('new'); setFormData({ title: '', description: '', track: 'hld', difficulty: 3, tags: '', hints: ['', '', ''], status: 'DRAFT', reviewNotes: '' }); }}>+ New Question</Button>
      </div>

      {/* Editor Form */}
      {editingId && (
        <div className="glass-card p-6 mb-8 animate-slide-down border-l-4 border-l-theme-accent">
          {formData.reviewNotes && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <h4 className="text-xs font-bold uppercase mb-1 flex items-center gap-2">⚠️ Reviewer Feedback</h4>
              <p className="text-sm font-medium">{formData.reviewNotes}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6 border-b border-theme/20 pb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-theme">{editingId === 'new' ? 'Launch New Question' : 'Refine Question Details'}</h3>
              {editingId !== 'new' && getStatusBadge(formData.status)}
            </div>
            <div className="flex gap-2 items-center flex-wrap">
               <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
               {formData.status !== 'LIVE' && (
                 <Button variant="secondary" onClick={() => handleSave('DRAFT')} loading={saving}>Save as Draft</Button>
               )}
               <Button variant="primary" onClick={() => handleSave('PENDING')} loading={saving} className="bg-amber-500 hover:bg-amber-600 text-white border-none">Submit for Approval</Button>
               {/* Note: Admin approval queue explicitly pushes it to LIVE */}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
             <div className="space-y-4">
               <div><label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Title</label><input className="input-field border border-theme/30 focus:border-theme-accent" placeholder="e.g. Design a URL Shortener" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
               <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Track Boundary</label><select className="input-field border border-theme/30 focus:border-theme-accent" value={formData.track} onChange={(e) => setFormData({ ...formData, track: e.target.value })}><option value="hld">System Design (HLD)</option><option value="lld">Object Oriented (LLD)</option><option value="dsa">DSA</option><option value="ai-ml">AI & ML</option><option value="behavioral">Behavioral</option></select></div>
                 <div><label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Difficulty ({formData.difficulty}/5)</label><input type="range" min="1" max="5" className="w-full mt-2 accent-theme-accent" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })} /></div>
               </div>
               <div><label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Tags (Comma Separated)</label><input className="input-field mb-2 border border-theme/30 focus:border-theme-accent" placeholder="Distributed Systems, Caching, Databases..." value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} /></div>

               <div className="bg-theme-elevated/20 p-4 rounded-lg border-2 border-dashed border-theme/30 hover:border-theme-accent/50 transition-colors">
                 <label className="block text-xs font-semibold text-theme-muted uppercase mb-3 text-center">Progressive Hints (Optional)</label>
                 {formData.hints.map((hint, i) => (<input key={i} className="input-field bg-theme-bg mb-2 border border-theme/40 focus:border-theme-accent focus:ring-1 focus:ring-theme-accent/50 transition-all" placeholder={`Level ${i + 1} Hint...`} value={hint} onChange={(e) => { const hints = [...formData.hints]; hints[i] = e.target.value; setFormData({ ...formData, hints }); }} />))}
               </div>
             </div>

             <div className="flex flex-col h-full bg-theme-elevated/10 p-4 rounded-lg border border-theme/20 shadow-inner">
                <label className="block text-xs font-semibold text-theme-muted uppercase mb-3">Question Prompt & Description</label>
                <div className="flex-1 min-h-[400px]">
                   <RichEditor 
                     content={formData.description}
                     onChange={(html) => setFormData(p => ({ ...p, description: html }))}
                     placeholder="Outline the main system requirements, constraints, and limitations..."
                   />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Questions table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-theme-accent border-theme-bg animate-spin" /></div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-theme/30 bg-theme-elevated/20">
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase">Title</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Track</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Difficulty</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Attempts</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Avg Score</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q._id} className="border-b border-theme/20 hover:bg-theme-elevated/10 transition-colors">
                  <td className="px-4 py-3 text-sm text-theme font-semibold">{q.title}</td>
                  <td className="px-4 py-3 text-center"><Badge variant="brand">{q.track.toUpperCase()}</Badge></td>
                  <td className="px-4 py-3 text-center text-sm text-theme-muted">{q.difficulty}/5</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(q.status, q.isPublished)}</td>
                  <td className="px-4 py-3 text-center text-sm text-theme-muted">{q.attemptCount || 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-theme-muted">{q.avgScore > 0 ? `${(q.avgScore * 10).toFixed(0)}%` : '—'}</td>
                  <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => handleEdit(q)}>Edit</Button></td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-theme-muted">No questions found. Launch one above.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
