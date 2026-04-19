import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingProfile } from '@/api/onboarding.api';

// Create a type where selfAssessment handles specific keys, so it's strongly typed, but we use OnboardingProfile underneath
type StoreProfile = OnboardingProfile;

interface OnboardingStore {
  profile: StoreProfile;
  currentStep: number;
  setProfile: (updates: Partial<StoreProfile>) => void;
  setSelfAssessment: (track: string, score: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const defaultProfile: StoreProfile = {
  name: '',
  currentRole: '',
  yearsExperience: 0,
  companyType: 'product',
  targetRole: '',
  targetCompanies: [],
  timeline: '',
  selfAssessment: {},
  coachPersona: 'marcus',
  feedbackStyle: 'socratic',
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      currentStep: 1,
      setProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      setSelfAssessment: (track, score) =>
        set((state) => ({
          profile: {
            ...state.profile,
            selfAssessment: {
              ...(state.profile.selfAssessment || {}),
              [track]: score,
            },
          },
        })),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      reset: () => set({ profile: defaultProfile, currentStep: 1 }),
    }),
    {
      name: 'techprep-onboarding',
    }
  )
);
