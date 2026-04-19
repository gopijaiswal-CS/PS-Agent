import { useRef, useCallback, useState } from 'react';

export function usePaceAnalyzer() {
  const [avgWPM, setAvgWPM] = useState(130);
  const [hesitationCount, setHesitationCount] = useState(0);
  const [fillerWordCount, setFillerWordCount] = useState(0);

  const wordTimestamps = useRef<number[]>([]);
  const lastSpeechTime = useRef<number>(Date.now());
  const transcriptRef = useRef('');

  const analyzeTranscript = useCallback((newText: string) => {
    const now = Date.now();
    const pauseDuration = now - lastSpeechTime.current;
    
    // Check for hesitations (pauses longer than 3 seconds)
    // Only count if they have already started speaking at some point
    if (pauseDuration > 3000 && wordTimestamps.current.length > 0) {
      setHesitationCount(prev => prev + 1);
    }
    
    // Get newly added words
    const oldWords = transcriptRef.current.split(' ').length;
    const newWords = newText.split(' ').length;
    const addedWordsCount = Math.max(0, newWords - oldWords);

    if (addedWordsCount > 0) {
      for (let i = 0; i < addedWordsCount; i++) {
        wordTimestamps.current.push(now);
      }
      lastSpeechTime.current = now;
      transcriptRef.current = newText;
    }

    // Calculate WPM over a rolling 30-second window
    const thirtySecondsAgo = now - 30000;
    wordTimestamps.current = wordTimestamps.current.filter(t => t > thirtySecondsAgo);

    // If we have less than 5 seconds of data, use default 130 WPM to avoid crazy spikes
    if (wordTimestamps.current.length > 5) {
      // words per 30 seconds * 2 = words per minute
      const currentWPM = wordTimestamps.current.length * 2;
      setAvgWPM(currentWPM);
    }

    // Check for filler words in the difference
    const diff = newText.slice(transcriptRef.current.length).toLowerCase();
    const fillers = ['um', 'uh', 'like', 'you know', 'sort of'];
    let newFillers = 0;
    fillers.forEach(f => {
      // simple match - not perfect, but works for demo
      if (diff.includes(` ${f} `)) newFillers++;
    });

    if (newFillers > 0) {
      setFillerWordCount(prev => prev + newFillers);
    }
  }, []);

  return { avgWPM, hesitationCount, fillerWordCount, analyzeTranscript };
}
