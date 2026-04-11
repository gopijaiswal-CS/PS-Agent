import { type FC, useEffect, useState } from 'react';
import { formatTime } from '@/utils/formatTime';

interface TimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onTimeUp?: () => void;
  className?: string;
}

export const Timer: FC<TimerProps> = ({ initialSeconds, isRunning, onTimeUp, className = '' }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 0) {
          onTimeUp?.();
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);

  const isLow = seconds < 300;
  const isCritical = seconds < 60;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-surface-500">⏱</span>
      <span
        className={`font-mono text-sm font-medium ${
          isCritical ? 'text-accent-rose animate-pulse-soft' : isLow ? 'text-accent-amber' : 'text-surface-300'
        }`}
      >
        {formatTime(seconds)}
      </span>
    </div>
  );
};
