import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicsApi } from '@/api/topics.api';
import type { Topic } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const TopicDetailPage: FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [nextTopics, setNextTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) return;
    async function load() {
      setLoading(true);
      try {
        const [topicRes, nextRes] = await Promise.all([
          topicsApi.getById(topicId!),
          topicsApi.getNext(topicId!).catch(() => ({ data: { data: [] } })),
        ]);
        setTopic(topicRes.data.data);
        setNextTopics(nextRes.data.data || []);
      } catch (err) {
        console.error('Failed to load topic:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [topicId]);

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-8 w-1/3" />
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-64 w-full mt-6" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-theme mb-2">Topic not found</h2>
          <Button variant="secondary" onClick={() => navigate('/topics')}>← Back to Topics</Button>
        </div>
      </div>
    );
  }

  // Render TipTap JSON content to HTML-like structure
  const renderContent = (node: any): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;

    if (node.type === 'text') {
      let text = node.text || '';
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          if (mark.type === 'bold') text = `<strong>${text}</strong>`;
          if (mark.type === 'italic') text = `<em>${text}</em>`;
          if (mark.type === 'code') text = `<code class="inline-code">${text}</code>`;
          if (mark.type === 'link') text = `<a href="${mark.attrs?.href}" class="text-brand-400 hover:underline" target="_blank">${text}</a>`;
        });
      }
      return text;
    }

    const children = (node.content || []).map(renderContent).join('');

    switch (node.type) {
      case 'doc': return children;
      case 'paragraph': return `<p class="mb-4 leading-relaxed text-theme-secondary">${children}</p>`;
      case 'heading': {
        const level = node.attrs?.level || 2;
        const sizes: Record<number, string> = { 1: 'text-2xl', 2: 'text-xl', 3: 'text-lg' };
        return `<h${level} class="${sizes[level] || 'text-lg'} font-bold text-theme mb-3 mt-8">${children}</h${level}>`;
      }
      case 'bulletList': return `<ul class="list-none space-y-2 mb-6 ml-1">${children}</ul>`;
      case 'orderedList': return `<ol class="list-decimal list-inside space-y-2 mb-6 text-theme-secondary">${children}</ol>`;
      case 'listItem': return `<li class="flex items-start gap-2 text-theme-secondary"><span class="text-brand-400 mt-1.5 text-xs">●</span><span>${children}</span></li>`;
      case 'codeBlock': return `<pre class="glass-card p-4 mb-6 overflow-x-auto"><code class="text-sm font-mono text-emerald-400">${children}</code></pre>`;
      case 'blockquote': return `<blockquote class="border-l-3 border-brand-500 pl-4 my-4 text-theme-muted italic">${children}</blockquote>`;
      case 'horizontalRule': return `<hr class="border-theme my-8" />`;
      default: return children;
    }
  };

  const htmlContent = renderContent(topic.content);

  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      {/* Back + Badge */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/topics')}>
          ← Topics
        </Button>
        <Badge variant="brand">{topic.category}</Badge>
        <Badge variant="neutral">{topic.track?.toUpperCase()}</Badge>
        <span className="text-xs text-theme-muted ml-auto">
          📖 {topic.estimatedReadMinutes || 5} min read
        </span>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-theme mb-4 tracking-tight">{topic.name}</h1>

      {/* Prerequisites */}
      {topic.prerequisites && topic.prerequisites.length > 0 && (
        <div className="glass-card p-4 mb-8 bg-amber-500/5 border-amber-500/20">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Prerequisites</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {topic.prerequisites.map((p: any, i: number) => {
              const label = typeof p === 'string' ? p : (p?.name || p?._id?.toString() || 'Unknown');
              const id = typeof p === 'string' ? null : p?._id?.toString();
              return (
                <span
                  key={id || i}
                  className={`px-2.5 py-1 text-xs rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 ${id ? 'cursor-pointer hover:bg-amber-500/20 transition-colors' : ''}`}
                  onClick={() => id && navigate(`/topics/${id}`)}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <article
        className="prose-custom text-theme-secondary leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Images */}
      {topic.images && topic.images.length > 0 && (
        <div className="mt-8 space-y-4">
          {topic.images.map((img, i) => (
            <img key={i} src={img} alt={`${topic.name} diagram ${i + 1}`} className="rounded-xl border border-theme max-w-full" />
          ))}
        </div>
      )}

      {/* Next topics */}
      {nextTopics.length > 0 && (
        <div className="mt-12 pt-8 border-t border-theme">
          <h3 className="text-lg font-bold text-theme mb-4">📚 Continue Learning</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextTopics.map((nt) => (
              <div
                key={nt._id}
                className="glass-card-hover p-5 cursor-pointer group"
                onClick={() => navigate(`/topics/${nt._id}`)}
              >
                <Badge variant="brand" className="mb-2">{nt.category}</Badge>
                <h4 className="text-base font-semibold text-theme group-hover:text-theme-accent transition-colors">{nt.name}</h4>
                <span className="text-xs text-theme-muted">{nt.estimatedReadMinutes || 5} min read</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
