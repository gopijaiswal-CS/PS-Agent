import { type FC } from 'react';

export const COACH_PERSONAS = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    role: 'Staff Engineer @ Google',
    style: 'Direct & Challenging',
    tagline: 'High-bar L6 style. No hand-holding.',
    emoji: '👩‍💻',
    avatarUrl: 'https://i.pravatar.cc/150?u=priya_sharma_techprep',
    color: 'from-violet-500 to-purple-600',
    borderColor: 'border-purple-500/50',
    bgLight: 'bg-purple-500/10',
    quote: '"That\'s too vague. Give me a specific threshold and justify it with numbers."',
  },
  {
    id: 'marcus',
    name: 'Marcus Kim',
    role: 'Principal Engineer @ Meta',
    style: 'Socratic',
    tagline: 'Helps you discover answers yourself.',
    emoji: '👨‍💻',
    avatarUrl: 'https://i.pravatar.cc/150?u=marcus_kim_techprep',
    color: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-500/50',
    bgLight: 'bg-blue-500/10',
    quote: '"Interesting. What happens to that approach if a user has 100M followers instead of 1M?"',
  },
  {
    id: 'aisha',
    name: 'Aisha Volkov',
    role: 'ML Architect @ Anthropic',
    style: 'Specialist',
    tagline: 'AI/ML systems. Expects MLOps depth.',
    emoji: '🧠',
    avatarUrl: 'https://i.pravatar.cc/150?u=aisha_volkov_techprep',
    color: 'from-rose-500 to-pink-600',
    borderColor: 'border-rose-500/50',
    bgLight: 'bg-rose-500/10',
    quote: '"How would you handle context window limits in your RAG pipeline at 10B tokens/day?"',
  },
  {
    id: 'ryan',
    name: 'Ryan Chen',
    role: 'Eng Manager @ Stripe',
    style: 'Managerial',
    tagline: 'Tests leadership signals alongside technical depth.',
    emoji: '🎯',
    avatarUrl: 'https://i.pravatar.cc/150?u=ryan_chen_techprep',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/50',
    bgLight: 'bg-emerald-500/10',
    quote: '"If your PM asked you to ship this in 2 weeks instead of 2 months, what would you cut first?"',
  },
];

interface CoachSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CoachSelector: FC<CoachSelectorProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {COACH_PERSONAS.map((c) => {
        const isSelected = selectedId === c.id;
        return (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group ${
              isSelected ? c.borderColor : 'border-theme/10 hover:border-theme/30'
            } ${isSelected ? c.bgLight : 'bg-theme-elevated/20 hover:bg-theme-elevated/40'}`}
          >
            {/* Background gradient if selected */}
            {isSelected && (
              <div className={`absolute top-0 right-0 -m-8 w-24 h-24 bg-gradient-to-br ${c.color} opacity-20 blur-xl pointer-events-none`} />
            )}

            <div className="flex items-start gap-4 mb-3 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${isSelected ? 'bg-theme-bg' : 'bg-theme-bg/50 group-hover:bg-theme-bg'}`}>
                {c.emoji}
              </div>
              <div>
                <h3 className="font-bold text-theme">{c.name}</h3>
                <p className="text-xs text-theme-muted font-medium">{c.role}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${isSelected ? 'bg-theme-bg' : 'bg-theme-bg/50'}`}>
                  {c.style}
                </span>
              </div>
            </div>

            <p className="text-sm text-theme-secondary mb-4 relative z-10">{c.tagline}</p>
            
            <div className={`p-3 rounded-lg text-xs italic border relative z-10 ${isSelected ? 'bg-theme-bg/50 border-theme/20 text-theme' : 'bg-theme-bg/30 border-theme/10 text-theme-muted'}`}>
              {c.quote}
            </div>

            {/* Selection ring */}
            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? c.borderColor : 'border-theme/20'}`}>
              {isSelected && <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${c.color}`} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
