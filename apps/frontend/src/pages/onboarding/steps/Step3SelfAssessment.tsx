import { type FC } from 'react';
import { useOnboardingStore } from '../onboardingStore';

const SELF_ASSESSMENT = [
  {
    id: 'hld',
    question: 'How confident are you designing distributed systems from scratch?',
    options: [
      { label: 'Not at all — I avoid these', score: 2 },
      { label: 'I know the basics but struggle with scale', score: 4 },
      { label: 'Comfortable with most patterns', score: 6 },
      { label: 'Very confident, can go deep on tradeoffs', score: 8 },
      { label: 'I have built production distributed systems', score: 10 },
    ],
  },
  {
    id: 'lld',
    question: 'How comfortable are you with object-oriented design and design patterns?',
    options: [
      { label: 'I barely use them', score: 2 },
      { label: 'Familiar with concepts, weak at application', score: 4 },
      { label: 'Can write clean, modular code', score: 6 },
      { label: 'Confident with complex class hierarchies', score: 8 },
      { label: 'Expert at writing extensible frameworks', score: 10 },
    ],
  },
  {
    id: 'dsa',
    question: 'How well do you solve algorithm problems under time pressure?',
    options: [
      { label: 'Struggle with easy problems', score: 2 },
      { label: 'Can do easy, struggle with medium', score: 4 },
      { label: 'Can reliably solve medium problems', score: 6 },
      { label: 'Comfortable with hard problems', score: 8 },
      { label: 'Competitive programmer level', score: 10 },
    ],
  },
  {
    id: 'behavioral',
    question: 'How confident are you explaining past experiences in STAR format?',
    options: [
      { label: 'I ramble and lack structure', score: 2 },
      { label: 'I know STAR but often forget details', score: 4 },
      { label: 'I can give structured answers clearly', score: 6 },
      { label: 'I have great impact stories ready', score: 8 },
      { label: 'I excel at leadership interviews', score: 10 },
    ],
  },
];

export const Step3SelfAssessment: FC = () => {
  const { profile, setSelfAssessment } = useOnboardingStore();
  const currentScores = profile.selfAssessment || {};

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-extrabold text-theme mb-2">Self Assessment</h2>
      <p className="text-theme-muted mb-8">We use this to build your initial weakness map.</p>

      <div className="space-y-8 overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
        {SELF_ASSESSMENT.map((item) => (
          <div key={item.id} className="bg-theme-elevated/30 p-5 rounded-xl border border-theme/20">
            <h3 className="font-semibold text-theme mb-4">{item.question}</h3>
            <div className="space-y-2">
              {item.options.map((opt, i) => {
                const isSelected = currentScores[item.id] === opt.score;
                return (
                  <label
                    key={i}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-brand-500/10 border-brand-500/50 text-brand-300' 
                        : 'border-theme/10 hover:bg-theme-elevated/50 text-theme-secondary hover:text-theme'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`assess-${item.id}`}
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => setSelfAssessment(item.id, opt.score)}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? 'border-brand-500' : 'border-theme-muted/50'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                    </div>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
