import { useState, useCallback, useRef } from 'react';

// Approximates eye contact.
// 0.0 = looking away completely, 1.0 = looking straight at camera
export function useEyeContact() {
  const [eyeContactScore, setEyeContactScore] = useState(1.0);
  const frameCount = useRef(0);
  const eyeContactSum = useRef(0);

  const calculateEyeContact = useCallback((landmarks: any) => {
    if (!landmarks || landmarks.length === 0) return;

    // A very simple approximation using the nose tip (landmark 1) and the bounding box of the face.
    // In a real robust system, we would calculate the pitch, yaw, and roll using a PnP solver with 3D model points.
    // For this prototype, if the nose tip x is roughly between the eyes x, and face is centered, it's high contact.

    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    // distance between eyes
    const eyeDist = rightEye.x - leftEye.x;
    if (eyeDist === 0) return;

    // relation of nose to eyes (should be ~0.5 if looking straight ahead)
    const noseRatio = (nose.x - leftEye.x) / eyeDist;
    
    // perfect ratio is 0.5. calculate deviation.
    const deviation = Math.abs(noseRatio - 0.5);
    
    // normalize deviation to a 0-1 score (0 deviation = 1 score)
    let score = 1.0 - (deviation * 4); // arbitrary multiplier to punish looking away
    if (score < 0) score = 0;
    if (score > 1) score = 1;

    frameCount.current += 1;
    eyeContactSum.current += score;

    // update state every 10 frames to avoid jitter
    if (frameCount.current % 10 === 0) {
      setEyeContactScore(eyeContactSum.current / 10);
      eyeContactSum.current = 0;
    }

  }, []);

  return { eyeContactScore, calculateEyeContact };
}
