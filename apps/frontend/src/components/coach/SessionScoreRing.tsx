import { type FC, useEffect, useState } from 'react';

interface SessionScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const SessionScoreRing: FC<SessionScoreRingProps> = ({ score, size = 120, strokeWidth = 10 }) => {
  const [progress, setProgress] = useState(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      setProgress(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const currentOffset = circumference - ((progress / 10) * circumference);

  // Gradient selection
  const isHigh = score > 7;
  const isMed = score >= 5 && score <= 7;
  const colors = isHigh 
    ? { start: '#10b981', end: '#059669' } // emerald
    : isMed 
      ? { start: '#f59e0b', end: '#d97706' } // amber
      : { start: '#f43f5e', end: '#e11d48' }; // rose

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${score})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={currentOffset}
          strokeLinecap="round"
          className="transition-all duration-1500 ease-out"
        />
      </svg>
      
      {/* Score Text */}
      <div className="absolute flex flex-col items-center justify-center fade-in delay-500">
        <span className="text-4xl font-extrabold text-theme tracking-tighter" style={{ color: colors.start }}>
          {progress.toFixed(1)}
        </span>
        <span className="text-xs uppercase tracking-widest font-bold text-theme-muted mt-1">/ 10</span>
      </div>
    </div>
  );
};
