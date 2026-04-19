import { useState, useCallback, useRef } from 'react';

// Emotion is roughly inferred from specific landmark distances (eyebrows inner/outer, lip corners).
// MediaPipe gives us Z-coordinates, but for basic web emotion we use 2D ratios.
// Without an external ML model like face-api.js, a lightweight heuristic via FaceMesh landmarks works well enough for demo/practice purposes.

export function useEmotionDetection() {
  const [emotionState, setEmotionState] = useState({ current: 'neutral', confidence: 0.8 });
  const recentHistory = useRef<string[]>([]);

  const analyzeFaceMeshLandmarks = useCallback((landmarks: any) => {
    if (!landmarks || landmarks.length === 0) return;

    // These are heuristic approximations of facial expressions.
    // E.g. Lip corner distance (landmarks 61 to 291)
    // Eyebrow distance (landmarks 107 to 336)
    const lipsWidth = calculateDistance(landmarks[61], landmarks[291]);
    const lipsHeight = calculateDistance(landmarks[13], landmarks[14]);
    const eyebrowInnerDist = calculateDistance(landmarks[107], landmarks[336]);

    let detected = 'neutral';
    
    // Heuristic logic
    if (eyebrowInnerDist < 0.05) {
      detected = 'focused'; // or confused/nervous depending on other factors
      if (lipsWidth < 0.1) detected = 'nervous';
    } else if (lipsWidth > 0.12 && lipsHeight > 0.01) {
      detected = 'confident'; // slight smile / assertive speaking
    } else if (lipsWidth < 0.08) {
      detected = 'nervous'; // pursed lips
    }

    recentHistory.current.push(detected);
    if (recentHistory.current.length > 30) recentHistory.current.shift(); // rolling window

    // Find the most common emotion in the recent window
    const counts: Record<string, number> = {};
    let maxEm = 'neutral';
    let maxCt = 0;
    
    recentHistory.current.forEach(em => {
      counts[em] = (counts[em] || 0) + 1;
      if (counts[em] > maxCt) {
        maxCt = counts[em];
        maxEm = em;
      }
    });

    const confidence = maxCt / recentHistory.current.length;

    // Only update state if reasonably sure or if it's been a while
    setEmotionState(prev => {
       if (prev.current === maxEm) return prev;
       // Avoid noisy toggles
       if (confidence < 0.4) return prev;
       return { current: maxEm, confidence };
    });
  }, []);

  return { emotionState, analyzeFaceMeshLandmarks };
}

function calculateDistance(pt1: any, pt2: any) {
  if (!pt1 || !pt2) return 0;
  return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
}
