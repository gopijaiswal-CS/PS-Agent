import { type FC } from 'react';
import { useOnboardingStore } from '../onboardingStore';

export const Step1WhoYouAre: FC = () => {
  const { profile, setProfile } = useOnboardingStore();

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-extrabold text-theme mb-2">Welcome to TechPrep Pro</h2>
      <p className="text-theme-muted mb-8">Let's build your personalized AI coaching plan. Tell us about yourself.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">Your Full Name</label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="E.g. Alex Johnson"
            value={profile.name || ''}
            onChange={(e) => setProfile({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">Current Role</label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="E.g. Senior Software Engineer"
            value={profile.currentRole || ''}
            onChange={(e) => setProfile({ currentRole: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-1">Years of Experience</label>
            <input
              type="number"
              min="0"
              className="input-field w-full"
              placeholder="0"
              value={profile.yearsExperience || ''}
              onChange={(e) => setProfile({ yearsExperience: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-1">Company Type</label>
            <select
              className="input-field w-full appearance-none"
              value={profile.companyType}
              onChange={(e) => setProfile({ companyType: e.target.value })}
            >
              <option value="startup">Early-stage Startup</option>
              <option value="product">Growth/Product Company</option>
              <option value="enterprise">Big Tech / Enterprise (FAANG)</option>
              <option value="agency">Agency / Consulting</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
