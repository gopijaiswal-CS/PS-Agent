import { type FC, useEffect, useState } from 'react';

interface VoiceVisualizerProps {
  isSpeaking: boolean;
  colorClass?: string; 
}

export const VoiceVisualizer: FC<VoiceVisualizerProps> = ({ 
  isSpeaking, 
  colorClass = 'bg-brand-500' 
}) => {
  const [bars, setBars] = useState<number[]>(Array(5).fill(20));

  useEffect(() => {
    let interval: any;
    if (isSpeaking) {
      interval = setInterval(() => {
        setBars(Array(5).fill(0).map(() => 40 + Math.random() * 60)); // Random height 40-100%
      }, 100);
    } else {
      setBars(Array(5).fill(15)); // Flat rest state
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <div className="flex items-center gap-1.5 h-8">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-100 ease-in-out ${colorClass} ${
            isSpeaking ? 'opacity-80' : 'opacity-30'
          }`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
};
