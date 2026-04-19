import client from './client';

export interface OnboardingProfile {
  name: string;
  currentRole?: string;
  yearsExperience?: number;
  companyType?: string;
  targetRole?: string;
  targetCompanies?: string[];
  timeline?: string;
  selfAssessment?: Record<string, number>;
  coachPersona?: string;
  feedbackStyle?: string;
}

export const onboardingApi = {
  saveProfile: (data: OnboardingProfile) =>
    client.post('/api/onboarding/profile', data),

  getStatus: () =>
    client.get('/api/onboarding/status'),
};
