import { type FC, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const MOCK_QUESTIONS = [
  { _id: '1', title: 'Design a URL Shortener', track: 'hld', difficulty: 3, isPublished: true, attemptCount: 45, avgScore: 6.8, tags: ['Hashing', 'Cache'] },
  { _id: '2', title: 'Design Twitter Feed', track: 'hld', difficulty: 4, isPublished: true, attemptCount: 32, avgScore: 5.9, tags: ['Fan-out', 'Timeline'] },
  { _id: '3', title: 'Design a Parking Lot', track: 'lld', difficulty: 2, isPublished: true, attemptCount: 28, avgScore: 7.2, tags: ['OOP'] },
  { _id: '4', title: 'LRU Cache', track: 'dsa', difficulty: 2, isPublished: false, attemptCount: 0, avgScore: 0, tags: ['HashMap', 'LinkedList'] },
];

export const QuestionEditor: FC = () => {
  const [questions] = useState(MOCK_QUESTIONS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', track: 'hld', difficulty: 3, tags: '', hints: ['', '', ''], isPublished: true });

  const handleEdit = (q: any) => {
    setEditingId(q._id);
    setFormData({ title: q.title, description: '', track: q.track, difficulty: q.difficulty, tags: q.tags.join(', '), hints: ['', '', ''], isPublished: q.isPublished });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Questions</h1>
          <p className="text-sm text-surface-500 mt-1">Manage interview questions across all tracks</p>
        </div>
        <Button variant="primary" onClick={() => setEditingId('new')}>+ New Question</Button>
      </div>

      {/* Editor Form */}
      {editingId && (
        <div className="glass-card p-6 mb-8 animate-slide-down">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">{editingId === 'new' ? 'Create Question' : 'Edit Question'}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-xs font-medium text-surface-400 mb-1">Title</label><input className="input-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-surface-400 mb-1">Track</label><select className="input-field" value={formData.track} onChange={(e) => setFormData({ ...formData, track: e.target.value })}><option value="hld">HLD</option><option value="lld">LLD</option><option value="dsa">DSA</option><option value="ai-ml">AI/ML</option><option value="behavioral">Behavioral</option></select></div>
              <div><label className="block text-xs font-medium text-surface-400 mb-1">Difficulty (1-5)</label><input type="range" min="1" max="5" className="w-full mt-2" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })} /><span className="text-xs text-surface-400 block text-center">{formData.difficulty}</span></div>
            </div>
          </div>
          <div className="mb-4"><label className="block text-xs font-medium text-surface-400 mb-1">Description</label><textarea className="input-field h-24 resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className="mb-4"><label className="block text-xs font-medium text-surface-400 mb-1">Tags (comma separated)</label><input className="input-field" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} /></div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-surface-400 mb-2">Hints (3 levels)</label>
            {formData.hints.map((hint, i) => (<input key={i} className="input-field mb-2" placeholder={`Level ${i + 1} hint...`} value={hint} onChange={(e) => { const hints = [...formData.hints]; hints[i] = e.target.value; setFormData({ ...formData, hints }); }} />))}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={() => setEditingId(null)}>Save Question</Button>
            <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
            <label className="flex items-center gap-2 ml-auto text-sm text-surface-400"><input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="rounded" />Published</label>
          </div>
        </div>
      )}

      {/* Questions table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-surface-800/50"><th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Title</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Track</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Difficulty</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Attempts</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Avg Score</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q._id} className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors">
                <td className="px-4 py-3 text-sm text-surface-200 font-medium">{q.title}</td>
                <td className="px-4 py-3 text-center"><Badge variant="brand">{q.track.toUpperCase()}</Badge></td>
                <td className="px-4 py-3 text-center text-sm text-surface-300">{q.difficulty}/5</td>
                <td className="px-4 py-3 text-center"><Badge variant={q.isPublished ? 'success' : 'warning'}>{q.isPublished ? 'LIVE' : 'DRAFT'}</Badge></td>
                <td className="px-4 py-3 text-center text-sm text-surface-400">{q.attemptCount}</td>
                <td className="px-4 py-3 text-center text-sm text-surface-400">{q.avgScore > 0 ? q.avgScore.toFixed(1) : '—'}</td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => handleEdit(q)}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
