import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicsApi } from '@/api/topics.api';
import type { Topic } from '@/types';
import { Badge } from '@/components/ui/Badge';

export const TopicsPage: FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await topicsApi.getAll();
        setTopics(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-3 text-theme">Study Topics</h1>
        <p className="text-theme-muted max-w-2xl mx-auto">
          Deep-dive into system design concepts, design patterns, and core algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 w-full" />)
        ) : topics.length === 0 ? (
          <div className="col-span-full py-12 text-center text-theme-muted glass-card">
            No topics available yet. Check back soon.
          </div>
        ) : (
          topics.map((t) => (
            <div key={t._id} className="glass-card-hover p-6 flex flex-col cursor-pointer group" onClick={() => navigate(`/topics/${t._id}`)}>
              <div className="flex justify-between items-start mb-4">
                <Badge variant="brand">{t.category}</Badge>
                <span className="text-2xs text-theme-muted">{t.estimatedReadMinutes} min read</span>
              </div>
              <h3 className="text-xl font-bold text-theme mb-2 group-hover:text-theme-accent transition-colors">
                {t.name}
              </h3>
              <p className="text-sm text-theme-secondary flex-1 line-clamp-3">
                {t.content?.content?.[0]?.content?.[0]?.text || 'No description available.'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
