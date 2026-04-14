import { type FC, useEffect, useState } from 'react';
import { topicsApi } from '@/api/topics.api';
import type { Topic } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RichEditor } from '@/components/ui/RichEditor';

export const TopicEditor: FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Real Form Data mapping dynamically to JSON based topics
  const [formData, setFormData] = useState({ name: '', category: '', track: 'hld', estimatedReadMinutes: 5, status: 'DRAFT', reviewNotes: '', contentHTML: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const res = await topicsApi.getAll({ limit: 100, status: 'ALL' });
      setTopics(res.data.data);
    } catch (err) {
      console.error('Failed to grab topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (targetStatus: string) => {
    setSaving(true);
    try {
      // Content must map to the structured document schema our nested JSON needs,
      // Or we can save it as an abstract HTML body under the first content node.
      const payload: Partial<Topic> = {
        name: formData.name,
        category: formData.category,
        track: formData.track,
        estimatedReadMinutes: formData.estimatedReadMinutes,
        status: targetStatus,
        content: {
          content: [
            { type: 'html', content: [{ text: formData.contentHTML }] }
          ]
        }
      };

      if (editingId === 'new') {
        await topicsApi.create(payload);
      } else {
        await topicsApi.update(editingId!, payload);
      }

      setEditingId(null);
      loadTopics();
    } catch (err) {
      console.error('Failed to save topic:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-theme">Content Master</h1>
          <p className="text-sm text-theme-muted mt-1">Manage platform prerequisite read modules and topics</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingId('new'); setFormData({ name: '', category: '', track: 'hld', estimatedReadMinutes: 5, status: 'DRAFT', reviewNotes: '', contentHTML: '' }); }}>+ New Topic</Button>
      </div>

      {editingId && (
        <div className="glass-card p-6 mb-8 animate-slide-down border-l-4 border-l-theme-accent">
          {formData.reviewNotes && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <h4 className="text-xs font-bold uppercase mb-1 flex items-center gap-2">⚠️ Reviewer Feedback</h4>
              <p className="text-sm font-medium">{formData.reviewNotes}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6 border-b border-theme/20 pb-4">
            <h3 className="text-lg font-bold text-theme">{editingId === 'new' ? 'Craft New Topic' : 'Edit Existing Topic'}</h3>
            <div className="flex gap-2">
               <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
               {formData.status !== 'LIVE' && (
                 <Button variant="secondary" onClick={() => handleSave('DRAFT')} loading={saving}>Save as Draft</Button>
               )}
               <Button variant="primary" onClick={() => handleSave('PENDING')} loading={saving} className="bg-amber-500 hover:bg-amber-600 text-white border-none">Submit for Approval</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-5 lg:col-span-1">
              <div><label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Name</label><input className="input-field" placeholder="e.g. Rate Limiting" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Category</label><input className="input-field" placeholder="e.g. API Design" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} /></div>
              <div><label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Track Boundary</label><select className="input-field" value={formData.track} onChange={(e) => setFormData({ ...formData, track: e.target.value })}><option value="hld">System Design (HLD)</option><option value="lld">Object Oriented (LLD)</option><option value="dsa">DSA</option><option value="ai-ml">AI & ML</option><option value="behavioral">Behavioral</option></select></div>
              <div><label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Est. Read Time (min)</label><input type="number" min="1" className="input-field" value={formData.estimatedReadMinutes} onChange={(e) => setFormData({ ...formData, estimatedReadMinutes: parseInt(e.target.value) || 1 })} /></div>
            </div>
            
            <div className="lg:col-span-2 flex flex-col h-full">
              <label className="block text-xs font-semibold text-theme-muted uppercase mb-1">Rich Content Delivery</label>
              <div className="flex-1 min-h-[300px]">
                 <RichEditor 
                   content={formData.contentHTML}
                   onChange={(html) => setFormData(p => ({ ...p, contentHTML: html }))}
                   placeholder="Upload PDFs here, write equations, insert architecture diagrams..."
                 />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-theme-accent border-theme-bg animate-spin" /></div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-theme/30 bg-theme-elevated/20">
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase">Topic Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Track</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Time</th>
                <th className="px-4 py-3 text-xs font-semibold text-theme-muted uppercase text-center">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => {
                const htmlContent = t.content?.content?.[0]?.content?.[0]?.text || '';
                const finalStatus = t.status || (t.isPublished ? 'LIVE' : 'DRAFT');
                
                const renderBadge = () => {
                  if (finalStatus === 'LIVE') return <Badge variant="success">LIVE</Badge>;
                  if (finalStatus === 'PENDING') return <Badge variant="warning">IN REVIEW</Badge>;
                  return <Badge variant="neutral">DRAFT</Badge>;
                };
                
                return (
                  <tr key={t._id} className="border-b border-theme/20 hover:bg-theme-elevated/10 transition-colors">
                    <td className="px-4 py-3 text-sm text-theme font-semibold">{t.name}</td>
                    <td className="px-4 py-3 text-xs text-theme-secondary">{t.category}</td>
                    <td className="px-4 py-3 text-center"><Badge variant="brand">{t.track.toUpperCase()}</Badge></td>
                    <td className="px-4 py-3 text-center text-xs text-theme-muted">{t.estimatedReadMinutes}m</td>
                    <td className="px-4 py-3 text-center">{renderBadge()}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => { 
                        setEditingId(t._id); 
                        setFormData({ name: t.name, category: t.category, track: t.track as any, estimatedReadMinutes: t.estimatedReadMinutes, status: finalStatus, reviewNotes: t.reviewNotes || '', contentHTML: htmlContent }); 
                      }}>Edit</Button>
                    </td>
                  </tr>
                );
              })}
              {topics.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-theme-muted">No topics created. Start by adding one above.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
