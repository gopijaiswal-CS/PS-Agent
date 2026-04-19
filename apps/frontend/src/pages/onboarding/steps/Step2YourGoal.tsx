import { type FC } from 'react';
import { useOnboardingStore } from '../onboardingStore';

export const Step2YourGoal: FC = () => {
  const { profile, setProfile } = useOnboardingStore();

  const handleCompaniesChange = (val: string) => {
    const list = val.split(',').map(s => s.trim()).filter(Boolean);
    setProfile({ targetCompanies: list });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-extrabold text-theme mb-2">What are you aiming for?</h2>
      <p className="text-theme-muted mb-8">This helps your AI coach tailor the difficulty and evaluation rubric.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">Target Role / Level</label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="E.g. Staff Engineer L6"
            value={profile.targetRole || ''}
            onChange={(e) => setProfile({ targetRole: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1">Target Companies</label>
          <input
            type="text"
            className="input-field w-full"
            placeholder="E.g. Google, Meta, Stripe (comma separated)"
            value={(profile.targetCompanies || []).join(', ')}
            onChange={(e) => handleCompaniesChange(e.target.value)}
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-theme-secondary mb-1">When is your interview?</label>
           <select
             className="input-field w-full appearance-none"
             value={profile.timeline}
             onChange={(e) => setProfile({ timeline: e.target.value })}
           >
             <option value="">Select a timeline...</option>
             <option value="ASAP (within 2 weeks)">ASAP (within 2 weeks)</option>
             <option value="1 month">1 month</option>
             <option value="2-3 months">2-3 months</option>
             <option value="Just casually preparing">Just casually preparing</option>
           </select>
        </div>
      </div>
    </div>
  );
};
