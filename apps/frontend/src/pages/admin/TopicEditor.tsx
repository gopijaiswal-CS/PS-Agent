import { type FC, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const MOCK_TOPICS = [
  { _id: '1', name: 'Consistent Hashing', category: 'Hashing', track: 'hld', estimatedReadMinutes: 8, isPublished: true },
  { _id: '2', name: 'CAP Theorem', category: 'Distributed Systems', track: 'hld', estimatedReadMinutes: 12, isPublished: true },
  { _id: '3', name: 'Rate Limiting', category: 'API Design', track: 'hld', estimatedReadMinutes: 6, isPublished: false },
  { _id: '4', name: 'Observer Pattern', category: 'Design Patterns', track: 'lld', estimatedReadMinutes: 5, isPublished: true },
];

export const TopicEditor: FC = () => {
  const [topics] = useState(MOCK_TOPICS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '', track: 'hld', estimatedReadMinutes: 5, isPublished: true });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Topics</h1>
          <p className="text-sm text-surface-500 mt-1">Manage prerequisite content for interview questions</p>
        </div>
        <Button variant="primary" onClick={() => setEditingId('new')}>+ New Topic</Button>
      </div>

      {editingId && (
        <div className="glass-card p-6 mb-8 animate-slide-down">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">{editingId === 'new' ? 'Create Topic' : 'Edit Topic'}</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Form fields */}
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-surface-400 mb-1">Name</label><input className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><label className="block text-xs font-medium text-surface-400 mb-1">Category</label><input className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} /></div>
              <div><label className="block text-xs font-medium text-surface-400 mb-1">Track</label><select className="input-field" value={formData.track} onChange={(e) => setFormData({ ...formData, track: e.target.value })}><option value="hld">HLD</option><option value="lld">LLD</option><option value="dsa">DSA</option><option value="ai-ml">AI/ML</option></select></div>
              <div><label className="block text-xs font-medium text-surface-400 mb-1">Est. Read Time (min)</label><input type="number" className="input-field" value={formData.estimatedReadMinutes} onChange={(e) => setFormData({ ...formData, estimatedReadMinutes: parseInt(e.target.value) })} /></div>
              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={() => setEditingId(null)}>Save</Button>
                <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
            {/* Right: TipTap editor placeholder */}
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1">Content Editor</label>
              <div className="border border-surface-700/50 rounded-lg overflow-hidden">
                <div className="bg-surface-800/50 px-3 py-2 flex items-center gap-1 border-b border-surface-700/50">
                  {['H1', 'H2', 'B', 'I', 'Code', 'Image', 'List'].map((btn) => (
                    <button key={btn} className="px-2 py-1 text-xs text-surface-400 hover:text-surface-100 hover:bg-surface-700/50 rounded transition-colors">{btn}</button>
                  ))}
                </div>
                <div className="p-4 min-h-[200px] text-sm text-surface-400">
                  <p className="text-surface-500">TipTap rich text editor renders here...</p>
                  <p className="text-surface-600 text-xs mt-2">Supports headings, bold, italic, code blocks, images, and lists.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-surface-800/50"><th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Topic</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Category</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Track</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Read Time</th><th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t._id} className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors">
                <td className="px-4 py-3 text-sm text-surface-200 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-sm text-surface-400">{t.category}</td>
                <td className="px-4 py-3 text-center"><Badge variant="brand">{t.track.toUpperCase()}</Badge></td>
                <td className="px-4 py-3 text-center text-sm text-surface-400">{t.estimatedReadMinutes} min</td>
                <td className="px-4 py-3 text-center"><Badge variant={t.isPublished ? 'success' : 'warning'}>{t.isPublished ? 'LIVE' : 'DRAFT'}</Badge></td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => { setEditingId(t._id); setFormData({ name: t.name, category: t.category, track: t.track, estimatedReadMinutes: t.estimatedReadMinutes, isPublished: t.isPublished }); }}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
