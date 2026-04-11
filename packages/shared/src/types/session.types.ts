export interface AiRating {
  scalability: number;
  correctness: number;
  completeness: number;
  clarity: number;
  overall: number;
  strengths: string[];
  improvements: string[];
  nextSteps: string;
  voiceScore: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Session {
  _id: string;
  userId: string;
  questionId: string;
  diagramJSON: Record<string, unknown>;
  voiceTranscript: string;
  aiRating: AiRating | null;
  hintsUsed: number;
  timeTakenSeconds: number;
  isCompleted: boolean;
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
