import { type FC, useState, useEffect } from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { useUiStore } from '@/store/uiStore';
import { createPortal } from 'react-dom';

interface WhiteboardProps {
  track: string;
  initialData?: any;
  onChange?: (elements: any) => void;
  readOnly?: boolean;
}

export const Whiteboard: FC<WhiteboardProps> = ({ track, readOnly = false }) => {
  const { theme } = useUiStore();
  const [showNotes, setShowNotes] = useState(track === 'behavioral');
  const [notes, setNotes] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  // If track is behavioral, default to taking interview notes instead of drawing
  useEffect(() => {
    setShowNotes(track === 'behavioral');
  }, [track]);

  if (showNotes) {
    return (
      <div className="h-full flex flex-col p-6 bg-theme-elevated/30">
        <h3 className="text-lg font-bold text-theme mb-2">Interview Notes</h3>
        <p className="text-xs text-theme-muted mb-4">
          For behavioral questions, use this space to draft your situation, task, action, and result (STAR framework).
        </p>
        <textarea
          className="flex-1 input-field resize-none bg-theme/50 font-mono text-sm leading-relaxed"
          placeholder="S: Situation...&#10;T: Task...&#10;A: Action...&#10;R: Result..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          readOnly={readOnly}
        />
        {!readOnly && track !== 'behavioral' && (
          <button 
            onClick={() => setShowNotes(false)}
            className="mt-4 text-xs font-semibold text-theme-accent hover:underline self-end"
          >
            Switch to Drawing Canvas
          </button>
        )}
      </div>
    );
  }

  const canvasContent = (
    <div className={`h-full w-full relative group bg-theme/5 overflow-hidden transition-all duration-300 ${isMaximized ? 'rounded-none' : 'rounded-xl'}`}>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      <div className={`absolute inset-2 border border-theme/10 overflow-hidden shadow-2xl bg-[#121212] backdrop-blur-3xl transition-all duration-300 ${isMaximized ? 'rounded-none inset-0 border-0' : 'rounded-lg'} ${readOnly ? 'pointer-events-none' : ''}`}>
        <div className="tldraw-container h-full w-full custom-tldraw" data-color-mode="dark">
          {/* @ts-ignore - Some versions might differ on props */}
          <Tldraw persistenceKey="techprep-whiteboard" />
        </div>
      </div>
      
      {/* Controls Container */}
      <div className={`absolute right-6 flex flex-col gap-2 z-50 transition-all duration-300 ${isMaximized ? 'top-6' : 'top-6 opacity-0 group-hover:opacity-100'}`}>
        {!readOnly && track !== 'behavioral' && (
          <button 
            onClick={() => setShowNotes(true)}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 backdrop-blur-md transition-all hover:bg-indigo-500/20 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Developer Notes
          </button>
        )}
        <button 
          onClick={() => setIsMaximized(!isMaximized)}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-md transition-all hover:bg-emerald-500/20 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          {isMaximized ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3h-3m16 0h-3v-3m0 16v-3h3m-16 0h3v3"/></svg>
              Minimize Canvas
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              Maximize Canvas
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (isMaximized) {
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-theme/90 backdrop-blur-sm animate-fade-in">
        {canvasContent}
      </div>,
      document.body
    );
  }

  return canvasContent;
};
