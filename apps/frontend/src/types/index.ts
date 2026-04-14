// Re-export everything from the shared package
// These types mirror @techprep/shared but work without the workspace link being resolved

export interface User {
  _id: string;
  email: string;
  supabaseId?: string;
  role: 'super-admin' | 'content-admin' | 'pro' | 'free';
  plan: 'free' | 'pro';
  name: string;
  avatar?: string;
  weaknessMap: Record<string, number>;
  sessionCount: number;
  questionsAttempted: number;
  completedQuestionIds: string[];
  trackProgress?: Record<string, number>;
  points?: number;
  streak?: number;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  track: 'hld' | 'lld' | 'dsa' | 'ai-ml' | 'behavioral';
  difficulty: number;
  topics: string[];
  rubric: {
    scalability: { weight: number; description: string };
    correctness: { weight: number; description: string };
    completeness: { weight: number; description: string };
    clarity: { weight: number; description: string };
  };
  hints: string[];
  timeLimitSeconds: number;
  sampleAnswerOutline?: string;
  isPublished: boolean;
  status: string;
  reviewNotes?: string;
  tags: string[];
  attemptCount: number;
  avgScore: number;
  createdAt: string;
  updatedAt: string;
}

export type GroupedQuestions = Record<string, Question[]>;

export interface Topic {
  _id: string;
  name: string;
  category: string;
  track: string;
  content: Record<string, any>;
  images: string[];
  prerequisites: string[];
  nextTopics: string[];
  order: number;
  estimatedReadMinutes: number;
  isPublished: boolean;
  status: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiRating {
  scalability: number;
  correctness: number;
  completeness: number;
  clarity: number;
  overall: number;
  voiceScore: number;
  strengths: string[];
  improvements: string[];
  nextSteps: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Session {
  _id: string;
  userId: string;
  questionId: string | Question;
  diagramJSON: Record<string, any>;
  voiceTranscript: string;
  aiRating: AiRating | null;
  hintsUsed: number;
  timeTakenSeconds: number;
  isCompleted: boolean;
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
