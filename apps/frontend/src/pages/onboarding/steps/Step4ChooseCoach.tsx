import { type FC } from 'react';
import { useOnboardingStore } from '../onboardingStore';
import { CoachSelector } from '@/components/coach/CoachSelector';

export const Step4ChooseCoach: FC = () => {
  const { profile, setProfile } = useOnboardingStore();

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <h2 className="text-3xl font-extrabold text-theme mb-2">Choose your Coach</h2>
      <p className="text-theme-muted mb-8">Who do you want to conduct your practice interviews?</p>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <CoachSelector
          selectedId={profile.coachPersona || 'marcus'}
          onSelect={(id) => setProfile({ coachPersona: id })}
        />
      </div>
    </div>
  );
};
