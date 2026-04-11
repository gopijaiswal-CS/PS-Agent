import { type FC, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface VoicePanelProps {
  onTranscriptReady: (transcript: string) => void;
  className?: string;
}

export const VoicePanel: FC<VoicePanelProps> = ({ onTranscriptReady, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(20).fill(4));

  // Animate waveform when listening
  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setWaveHeights(Array(20).fill(0).map(() => 4 + Math.random() * 28));
    }, 100);
    return () => clearInterval(interval);
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      if (transcript) {
        onTranscriptReady(transcript);
      }
    } else {
      setIsListening(true);
      setTranscript('');
      // Simulate speech recognition
      const phrases = [
        'So for this URL shortener, ',
        'I would start with a load balancer ',
        'distributing requests across multiple application servers. ',
        'For generating short URLs, I would use base62 encoding ',
        'with a counter stored in a distributed key-value store like Redis. ',
        'The main database would be a NoSQL store like DynamoDB ',
        'for fast lookups by short URL key.',
      ];
      
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < phrases.length) {
          setTranscript((prev) => prev + phrases[i]);
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 1500);

      return () => clearInterval(typeInterval);
    }
  }, [isListening, transcript, onTranscriptReady]);

  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-surface-300 flex items-center gap-2">
          🎤 Voice Explanation
        </h4>
        <Button
          variant={isListening ? 'danger' : 'primary'}
          size="sm"
          onClick={toggleListening}
        >
          {isListening ? '⏹ Stop' : '▶ Start Recording'}
        </Button>
      </div>

      {/* Waveform */}
      {isListening && (
        <div className="flex items-center justify-center gap-0.5 h-10 mb-3">
          {waveHeights.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-brand-500 rounded-full transition-all duration-100"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="bg-surface-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
          <p className="text-sm text-surface-300 leading-relaxed">
            {transcript}
            {isListening && <span className="inline-block w-0.5 h-3.5 bg-brand-400 ml-0.5 animate-pulse-soft" />}
          </p>
        </div>
      )}

      {!transcript && !isListening && (
        <p className="text-xs text-surface-500">
          Click "Start Recording" to explain your design verbally. Your explanation will be transcribed and used for AI evaluation.
        </p>
      )}
    </div>
  );
};
