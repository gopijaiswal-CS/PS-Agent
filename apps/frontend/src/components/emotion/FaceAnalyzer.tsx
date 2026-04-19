import { type FC, useEffect, useRef, useState } from 'react';
import { useEmotionDetection } from './useEmotionDetection';
import { useEyeContact } from './useEyeContact';
import { Badge } from '@/components/ui/Badge';

interface FaceAnalyzerProps {
  onEmotionUpdate: (emotion: string, confidence: number, eyeContact: number) => void;
  isActive: boolean;
}

export const FaceAnalyzer: FC<FaceAnalyzerProps> = ({ onEmotionUpdate, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { emotionState, analyzeFaceMeshLandmarks } = useEmotionDetection();
  const { eyeContactScore, calculateEyeContact } = useEyeContact();

  // Reference to the callback to avoid stale closures in mediapipe callback
  const onUpdateRef = useRef(onEmotionUpdate);
  useEffect(() => {
    onUpdateRef.current = onEmotionUpdate;
  }, [onEmotionUpdate]);

  useEffect(() => {
    if (!isActive) return;

    let camera: any;
    let faceMesh: any;

    async function initMediaPipe() {
      try {
        if (!(window as any).FaceMesh || !(window as any).Camera) {
          setError('MediaPipe not loaded yet. Retrying...');
          setTimeout(initMediaPipe, 1000);
          return;
        }

        setError(null);

        faceMesh = new (window as any).FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true, // Needed for lips/eyes accuracy
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results: any) => {
          if (!canvasRef.current || !videoRef.current) return;
          const canvasCtx = canvasRef.current.getContext('2d');
          if (!canvasCtx) return;

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            
            // Optional: draw landmarks for debug
            // (window as any).drawConnectors(canvasCtx, landmarks, (window as any).FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});

            // Analyze
            analyzeFaceMeshLandmarks(landmarks);
            calculateEyeContact(landmarks);
          }
          canvasCtx.restore();
        });

        if (videoRef.current) {
          camera = new (window as any).Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current) {
                await faceMesh.send({image: videoRef.current});
              }
            },
            width: 640,
            height: 480
          });
          camera.start();
          setIsReady(true);
        }
      } catch (err) {
        console.error('Face analyzer init failed', err);
        setError('Failed to access camera for analysis');
      }
    }

    initMediaPipe();

    return () => {
      if (camera) camera.stop();
      if (faceMesh) faceMesh.close();
    };
  }, [isActive, analyzeFaceMeshLandmarks, calculateEyeContact]);

  // Periodic report to parent (Socket Gateway)
  useEffect(() => {
    if (!isActive || !isReady) return;
    
    const interval = setInterval(() => {
      onUpdateRef.current(emotionState.current, emotionState.confidence, eyeContactScore);
    }, 3000); // every 3s
    
    return () => clearInterval(interval);
  }, [isActive, isReady, emotionState, eyeContactScore]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex-shrink-0 w-full mb-4 border border-theme/20 shadow-md">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-theme-muted z-10 flex-col gap-2">
           <div className="w-8 h-8 rounded-full border-2 border-theme/20 border-t-amber-500 animate-spin" />
           {error || 'Starting camera...'}
        </div>
      )}
      
      {/* Hidden raw video */}
      <video ref={videoRef} className="hidden" playsInline />
      
      {/* Rendered canvas showing the camera feed */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover transform -scale-x-100" 
        width={640} 
        height={480} 
      />

      {/* Overlay Stats */}
      <div className="absolute bottom-3 left-3 flex gap-2 z-20">
        <Badge variant="neutral" className="bg-black/60 backdrop-blur-sm border-white/10 text-white shadow-sm">
          {emotionState.current} ({Math.round(emotionState.confidence * 100)}%)
        </Badge>
        <Badge variant={eyeContactScore > 0.6 ? 'success' : 'warning'} className="bg-black/60 backdrop-blur-sm border-white/10 shadow-sm">
           Contact: {Math.round(eyeContactScore * 100)}%
        </Badge>
      </div>
    </div>
  );
};
