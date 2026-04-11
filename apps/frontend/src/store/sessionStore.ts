import { create } from 'zustand';
import type { Question } from '@techprep/shared';

interface SessionState {
  activeQuestion: Question | null;
  diagramJSON: Record<string, unknown>;
  voiceTranscript: string;
  isSessionActive: boolean;
  hintsUsed: number;
  sessionId: string | null;
  timeRemaining: number;
  setActiveQuestion: (question: Question) => void;
  setDiagramJSON: (json: Record<string, unknown>) => void;
  setVoiceTranscript: (transcript: string) => void;
  setSessionActive: (active: boolean) => void;
  setHintsUsed: (count: number) => void;
  setSessionId: (id: string) => void;
  setTimeRemaining: (time: number) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeQuestion: null,
  diagramJSON: {},
  voiceTranscript: '',
  isSessionActive: false,
  hintsUsed: 0,
  sessionId: null,
  timeRemaining: 0,
  setActiveQuestion: (question) => set({ activeQuestion: question, timeRemaining: question.timeLimitSeconds }),
  setDiagramJSON: (json) => set({ diagramJSON: json }),
  setVoiceTranscript: (transcript) => set({ voiceTranscript: transcript }),
  setSessionActive: (active) => set({ isSessionActive: active }),
  setHintsUsed: (count) => set({ hintsUsed: count }),
  setSessionId: (id) => set({ sessionId: id }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  resetSession: () =>
    set({
      activeQuestion: null,
      diagramJSON: {},
      voiceTranscript: '',
      isSessionActive: false,
      hintsUsed: 0,
      sessionId: null,
      timeRemaining: 0,
    }),
}));
