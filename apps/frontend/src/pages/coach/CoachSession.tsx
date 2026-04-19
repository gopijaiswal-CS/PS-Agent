import { type FC, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { coachApi } from '@/api/coach.api';
import { Button } from '@/components/ui/Button';
import { FaceAnalyzer } from '@/components/emotion/FaceAnalyzer';
import { VoiceVisualizer } from '@/components/voice/VoiceVisualizer';
import { usePaceAnalyzer } from '@/components/voice/usePaceAnalyzer';
import type { CoachSession as CoachSessionType, Question } from '@/types';
import { COACH_PERSONAS } from '@/components/coach/CoachSelector';
import { Whiteboard } from '@/components/ui/Whiteboard';
import Editor from '@monaco-editor/react';

// For Web Speech API transcription
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface Props {
  session: CoachSessionType;
}

type WorkspaceTab = 'question' | 'whiteboard' | 'code';

export const CoachSession: FC<Props> = ({ session }) => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activePersonaId, setActivePersonaId] = useState(session.coachPersona || 'priya');
  
  // Question detail resolving
  const question: Question | undefined = typeof session.questionId === 'object' ? session.questionId as Question : undefined;
  
  const defaultTab: WorkspaceTab = question?.track === 'hld' ? 'whiteboard' : (question?.track === 'dsa' || question?.track === 'lld') ? 'code' : 'question';
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(defaultTab);

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [chatLog, setChatLog] = useState<{role: 'user' | 'coach', text: string}[]>([]);
  const [coachTypingChunk, setCoachTypingChunk] = useState('');
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const [codeValue, setCodeValue] = useState('// Write your solution here\n\n');
  
  // Refs
  const fullTranscriptRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const emotionRef = useRef({ current: 'neutral', confidence: 0.5 });
  const eyeContactRef = useRef(1.0);

  const { avgWPM, hesitationCount, analyzeTranscript } = usePaceAnalyzer();

  const activePersona = COACH_PERSONAS.find(p => p.id === activePersonaId) || COACH_PERSONAS[0];

  // Socket Setup
  useEffect(() => {
    const s = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001/coach', {
      transports: ['websocket'],
    });

    s.on('connect', () => console.log('Coach socket connected'));
    
    s.on('coach:chunk', (data: { text: string }) => {
      setCoachTypingChunk(prev => prev + data.text);
      setIsCoachSpeaking(true);
    });

    s.on('coach:done', (data: { fullText: string }) => {
      setChatLog(prev => [...prev, { role: 'coach', text: data.fullText }]);
      setCoachTypingChunk('');
      setIsCoachSpeaking(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
        chatBottomRef.current.scrollTop = chatBottomRef.current.scrollHeight;
    }
  }, [chatLog, coachTypingChunk]);

  // Handle Emotion updates
  const handleEmotionUpdate = useCallback((emotion: string, confidence: number, eyeContact: number) => {
    emotionRef.current = { current: emotion, confidence };
    eyeContactRef.current = eyeContact;

    if (socket?.connected) {
      socket.emit('coach:emotion', {
        sessionId: session._id,
        emotion,
        confidence,
        eyeContact,
      });
    }
  }, [socket, session._id]);

  // Speech Recognition Setup
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      let finalSegment = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSegment += event.results[i][0].transcript + ' ';
        }
      }

      if (finalSegment) {
        fullTranscriptRef.current += finalSegment;
        analyzeTranscript(fullTranscriptRef.current);
        
        if (socket?.connected) {
          socket.emit('coach:transcript', {
            sessionId: session._id,
            fullTranscript: fullTranscriptRef.current,
            avgWPM,
            hesitationCount,
          });
        }
      }
    };

    recognitionRef.current = recognition;
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [socket, session._id, analyzeTranscript, avgWPM, hesitationCount]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try { recognitionRef.current?.start(); } catch {}
    }
    setIsRecording(!isRecording);
  };

  const [inputValue, setInputValue] = useState('');
  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;
    
    setChatLog(prev => [...prev, { role: 'user', text: inputValue }]);
    fullTranscriptRef.current += inputValue + '\n';
    
    socket.emit('coach:message', {
      sessionId: session._id,
      text: inputValue,
      emotion: emotionRef.current,
      eyeContact: eyeContactRef.current,
      avgWPM,
      hesitationCount,
    });
    setInputValue('');
  };

  const endSession = async () => {
    if (socket) socket.emit('coach:end', { sessionId: session._id, userId: user?._id });
    await coachApi.endSession(session._id);
    window.location.href = `/coach/report/${session._id}`;
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-theme-bg overflow-hidden text-theme">
      {/* Top Navigation */}
      <header className="h-16 border-b border-theme/10 bg-surface-900 flex flex-shrink-0 items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg hidden sm:block">{question?.title || 'Live Interview Session'}</h1>
            {question && (
               <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-brand-500/20 text-brand-400">
                  {question.track}
               </span>
            )}
        </div>
        <div className="flex items-center gap-4">
            <div className="flex bg-surface-800 rounded-lg p-1 border border-theme/10">
                <button onClick={() => setActiveTab('question')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'question' ? 'bg-surface-700 text-white shadow-sm' : 'text-theme-muted hover:text-theme'}`}>Details</button>
                <button onClick={() => setActiveTab('whiteboard')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${activeTab === 'whiteboard' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-theme-muted hover:text-theme'}`}>✏️ Whiteboard</button>
                <button onClick={() => setActiveTab('code')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${activeTab === 'code' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-theme-muted hover:text-theme'}`}>💻 Code</button>
            </div>
            <div className="font-mono text-xl font-bold text-theme-muted tracking-wider hidden md:block">
                {formatTime(elapsed)}
            </div>
            <Button variant="primary" onClick={endSession} className="bg-rose-500 hover:bg-rose-600 text-white border-none py-1.5 h-auto">
                End Interview
            </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
          {/* Workspace Area (Code / Design / Question Details) */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e] border-r border-theme-border/20 z-10 w-full overflow-hidden">
                <div className="flex-1 relative overflow-hidden bg-black/20">
                     {activeTab === 'whiteboard' && (
                         <div className="absolute inset-0 z-10">
                            <Whiteboard track="hld" persistenceKey={`coach-${session._id}-whiteboard`} />
                         </div>
                     )}
                     
                     {activeTab === 'code' && (
                         <div className="absolute inset-0 z-10 pt-2">
                             <Editor
                                height="100%"
                                theme="vs-dark"
                                defaultLanguage="javascript"
                                value={codeValue}
                                onChange={(v) => setCodeValue(v || '')}
                                options={{ minimap: { enabled: false }, fontSize: 14 }}
                             />
                         </div>
                     )}

                     {activeTab === 'question' && (
                         <div className="absolute inset-0 z-10 p-8 overflow-y-auto custom-scrollbar">
                             <div className="max-w-3xl mx-auto">
                                <h2 className="text-2xl font-bold mb-4">{question?.title}</h2>
                                <p className="text-lg text-theme-muted mb-8 leading-relaxed whitespace-pre-wrap">{question?.description}</p>
                                
                                <div className="glass-card p-6 bg-surface-800">
                                    <h3 className="font-bold text-lg mb-4 text-theme">Interview Notes (STAR)</h3>
                                    <textarea className="w-full h-64 bg-black/30 border border-theme/20 rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:border-brand-500" placeholder="Use this space to outline your thoughts..."></textarea>
                                </div>
                             </div>
                         </div>
                     )}
                </div>
          </div>

          {/* Right Sidebar - Coach & Interaction */}
          <div className="w-[380px] flex-shrink-0 flex flex-col bg-surface-900 relative z-20 shadow-2xl transition-all duration-300">
              
              {/* Coach Avatar Header */}
              <div className="p-4 border-b border-theme/10 bg-surface-800 relative overflow-hidden flex flex-col items-center">
                  <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${activePersona.color} pointer-events-none`} />
                  
                  {/* Selector */}
                  <select 
                      value={activePersonaId} 
                      onChange={e => setActivePersonaId(e.target.value)}
                      className="absolute top-2 right-2 text-[10px] bg-black/40 text-theme-muted rounded px-2 py-1 border border-theme-border/30 focus:outline-none focus:border-brand-500 z-30"
                  >
                      {COACH_PERSONAS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>

                  <div className="relative mt-2 mb-3">
                      <div className={`w-28 h-28 rounded-full overflow-hidden border-4 shadow-xl transition-all duration-300 ${isCoachSpeaking ? 'border-brand-500 shadow-brand-500/20' : 'border-surface-700'}`}>
                          {activePersona.avatarUrl ? (
                              <img src={activePersona.avatarUrl} alt={activePersona.name} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full bg-surface-700 flex items-center justify-center text-4xl">{activePersona.emoji}</div>
                          )}
                      </div>
                      
                      {/* Pulse effect if speaking */}
                      {isCoachSpeaking && (
                          <div className="absolute inset-0 rounded-full border-2 border-brand-500 animate-ping opacity-50" />
                      )}
                  </div>

                  <h3 className="font-bold text-lg z-10">{activePersona.name}</h3>
                  <p className="text-xs text-theme-muted font-medium mb-3 z-10">{activePersona.role}</p>

                  <div className="h-4 pb-2 z-10">
                     {isCoachSpeaking && <VoiceVisualizer isSpeaking={true} colorClass="bg-brand-500" />}
                  </div>
              </div>

              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4" ref={chatBottomRef}>
                  {chatLog.map((msg, i) => (
                    <div key={i} className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 px-1 ${msg.role === 'user' ? 'text-zinc-400' : 'text-brand-400'}`}>
                        {msg.role === 'user' ? 'You' : activePersona.name}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-zinc-800 text-white rounded-br-none shadow-sm border border-zinc-700/50' 
                          : 'bg-brand-500/10 text-theme border border-brand-500/20 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {coachTypingChunk && (
                    <div className="flex flex-col max-w-[90%] mr-auto items-start">
                      <div className="text-[10px] uppercase font-bold tracking-wider mb-1 px-1 text-brand-400">{activePersona.name}</div>
                      <div className="p-3 rounded-2xl text-sm leading-relaxed bg-brand-500/10 text-theme border border-brand-500/20 rounded-tl-none shadow-sm">
                        {coachTypingChunk}
                        <span className="inline-block w-1.5 h-3 ml-1 bg-brand-500 animate-pulse align-middle" />
                      </div>
                    </div>
                  )}
              </div>

              {/* Bottom Controls panel */}
              <div className="p-4 border-t border-theme/10 bg-surface-900 pb-6 relative z-30">
                  
                  {/* PiP Camera */}
                  <div className="absolute bottom-full mb-4 right-4 w-28 h-20 rounded-xl overflow-hidden border border-theme-border/20 shadow-xl bg-black z-40 transform origin-bottom-right transition-transform duration-300">
                      <div className="w-full h-full scale-[1.3] origin-center -translate-y-2">
                        <FaceAnalyzer onEmotionUpdate={handleEmotionUpdate} isActive={true} />
                      </div>
                      <div className="absolute bottom-1 left-1 right-1 text-center flex justify-center">
                         <span className="text-[7px] uppercase tracking-wider font-bold text-white/70 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur inline-block">
                             {isRecording ? 'LIVE' : 'MUTED'}
                         </span>
                      </div>
                  </div>

                  <form onSubmit={submitText} className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder={isRecording ? "Listening..." : "Type manually or use Mic"}
                      className="flex-1 bg-surface-800 border border-theme-border/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-theme-muted/50"
                    />
                    <button type="submit" disabled={!inputValue.trim()} className="w-8 flex flex-shrink-0 items-center justify-center rounded-lg bg-surface-700 text-white disabled:opacity-50 hover:bg-surface-600 transition-colors">
                      ↗
                    </button>
                  </form>
                  
                  <Button 
                      variant="primary" 
                      onClick={toggleRecording}
                      className={`w-full flex gap-2 justify-center py-2 shadow-md border-0 transition-colors ${
                          isRecording 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                            : 'bg-brand-600 hover:bg-brand-500 text-white'
                      }`}
                  >
                      <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
                      {isRecording ? 'Disable Mic' : 'Enable Mic'}
                  </Button>
              </div>

          </div>
      </div>
    </div>
  );
};
