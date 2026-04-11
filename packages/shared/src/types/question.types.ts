export enum QuestionTrack {
  HLD = 'hld',
  LLD = 'lld',
  DSA = 'dsa',
  AI_ML = 'ai-ml',
  BEHAVIORAL = 'behavioral',
}

export enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  MEDIUM_HARD = 3,
  HARD = 4,
  EXPERT = 5,
}

export interface RubricDimension {
  weight: number;
  description: string;
}

export interface Rubric {
  scalability: RubricDimension;
  correctness: RubricDimension;
  completeness: RubricDimension;
  clarity: RubricDimension;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  track: QuestionTrack;
  difficulty: number;
  topics: string[];
  rubric: Rubric;
  hints: string[];
  timeLimitSeconds: number;
  sampleAnswerOutline?: string;
  isPublished: boolean;
  tags: string[];
  attemptCount: number;
  avgScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedQuestions {
  [track: string]: Question[];
}
