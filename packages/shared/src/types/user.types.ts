export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  CONTENT_ADMIN = 'content-admin',
  PRO = 'pro',
  FREE = 'free',
}

export enum UserPlan {
  FREE = 'free',
  PRO = 'pro',
}

export interface User {
  _id: string;
  email: string;
  supabaseId?: string;
  role: UserRole;
  plan: UserPlan;
  name: string;
  avatar: string;
  weaknessMap: Record<string, number>;
  sessionCount: number;
  questionsAttempted: number;
  completedQuestionIds: string[];
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}
