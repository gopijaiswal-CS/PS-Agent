import { type FC } from 'react';
import { Button } from '@/components/ui/Button';
import type { AiRating } from '@/types';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rating: AiRating | null;
  onStudyTopic?: () => void;
  onTryAnother?: () => void;
}

const ScoreBar: FC<{ label: string; score: number; maxScore?: number }> = ({ label, score, maxScore = 10 }) => {
  const percentage = (score / maxScore) * 100;
  const getColor = (s: number) => {
    if (s >= 8) return 'from-emerald-500 to-teal-500';
    if (s >= 6) return 'from-brand-500 to-violet-500';
    if (s >= 4) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-surface-400 w-28 text-right">{label}</span>
      <div className="flex-1 h-2.5 bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor(score)} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-mono font-medium text-surface-200 w-12">{score}/10</span>
    </div>
  );
};

export const RatingModal: FC<RatingModalProps> = ({ isOpen, onClose, rating, onStudyTopic, onTryAnother }) => {
  if (!isOpen || !rating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card w-full max-w-lg mx-4 p-0 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-surface-800/50">
          <h2 className="text-lg font-semibold text-surface-100">Your Design Rating</h2>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-200 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Overall score */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-brand-500/30 mb-3">
              <div>
                <span className="text-3xl font-bold text-gradient-brand">{(rating.overall ?? 0).toFixed(1)}</span>
                <span className="text-surface-500 text-sm block">/ 10</span>
              </div>
            </div>
            <p className="text-sm text-surface-400">Overall Score</p>
          </div>

          {/* Dimension scores */}
          <div className="space-y-3">
            <ScoreBar label="Scalability" score={rating.scalability ?? 0} />
            <ScoreBar label="Correctness" score={rating.correctness ?? 0} />
            <ScoreBar label="Completeness" score={rating.completeness ?? 0} />
            <ScoreBar label="Clarity" score={rating.clarity ?? 0} />
            <ScoreBar label="Voice Quality" score={rating.voiceScore ?? 0} />
          </div>

          {/* Strengths */}
          {(rating.strengths?.length ?? 0) > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-accent-emerald mb-2 flex items-center gap-2">
                <span>✓</span> Strengths
              </h3>
              <ul className="space-y-1.5">
                {rating.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                    <span className="text-accent-emerald mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {(rating.improvements?.length ?? 0) > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-accent-amber mb-2 flex items-center gap-2">
                <span>△</span> Improvements
              </h3>
              <ul className="space-y-1.5">
                {rating.improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                    <span className="text-accent-amber mt-0.5">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next steps */}
          {rating.nextSteps && (
            <div className="glass-card p-4 bg-brand-500/5 border-brand-500/20">
              <p className="text-sm text-surface-300">
                <span className="font-semibold text-brand-400">Next: </span>
                {rating.nextSteps}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-800/50 flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onStudyTopic}>
            Study Topic →
          </Button>
          <Button variant="primary" size="sm" onClick={onTryAnother}>
            Try Another Q →
          </Button>
        </div>
      </div>
    </div>
  );
};
