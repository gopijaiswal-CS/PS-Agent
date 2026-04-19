import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from './onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { onboardingApi } from '@/api/onboarding.api';
import { Button } from '@/components/ui/Button';

// Steps
import { Step1WhoYouAre } from './steps/Step1WhoYouAre';
import { Step2YourGoal } from './steps/Step2YourGoal';
import { Step3SelfAssessment } from './steps/Step3SelfAssessment';
import { Step4ChooseCoach } from './steps/Step4ChooseCoach';

export const OnboardingPage: FC = () => {
  const navigate = useNavigate();
  const { currentStep, profile, nextStep, prevStep } = useOnboardingStore();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  // If already onboarded, redirect out
  useEffect(() => {
    if (user && (user as any).onboardingComplete) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await onboardingApi.saveProfile(profile);
      // Let auth store know user is updated (ideally, by reloading me or forcibly reloading the page)
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { title: 'Who you are', component: Step1WhoYouAre },
    { title: 'Your goals', component: Step2YourGoal },
    { title: 'Self-assessment', component: Step3SelfAssessment },
    { title: 'Choose AI Coach', component: Step4ChooseCoach },
  ];

  const CurrentComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`text-xs font-semibold ${currentStep > i ? 'text-brand-400' : 'text-theme-muted'}`}
              >
                Step {i + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-surface-800 h-2 rounded-full overflow-hidden flex">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 border-r border-theme-bg/50 transition-colors duration-300 ${
                  currentStep > i ? 'bg-brand-500' : 'bg-surface-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="glass-card p-8 md:p-12 min-h-[500px] flex flex-col relative overflow-hidden">
          {/* Animated Background Blob */}
          <div className="absolute top-0 right-0 -m-32 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full point-events-none" />

          <div className="flex-1 z-10">
            <CurrentComponent />
          </div>

          {/* Footer Controls */}
          <div className="mt-12 flex justify-between items-center border-t border-theme/20 pt-6 z-10">
            {currentStep > 1 ? (
              <Button variant="ghost" onClick={prevStep}>
                ← Back
              </Button>
            ) : (
              <div /> // placeholder for spacing
            )}

            {currentStep < steps.length ? (
              <Button variant="primary" onClick={nextStep} className="px-8">
                Continue →
              </Button>
            ) : (
              <Button variant="primary" onClick={handleFinish} loading={submitting} className="px-8 bg-brand-600 hover:bg-brand-500 text-white border-0">
                Finish Setup 🎉
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
