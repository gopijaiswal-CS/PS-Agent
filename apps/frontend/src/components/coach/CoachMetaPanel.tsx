import { type FC } from 'react';
import { Badge } from '@/components/ui/Badge';
import { VoiceVisualizer } from '@/components/voice/VoiceVisualizer';
import { COACH_PERSONAS } from './CoachSelector';

interface CoachMetaPanelProps {
  personaId: string;
  isCoachSpeaking: boolean;
  question: any;
  elapsedSeconds: number;
}

const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const CoachMetaPanel: FC<CoachMetaPanelProps> = ({ 
  personaId, 
  isCoachSpeaking, 
  question,
  elapsedSeconds
}) => {
  const persona = COACH_PERSONAS.find(p => p.id === personaId) || COACH_PERSONAS[1];

  return (
    <div className="w-80 flex-shrink-0 bg-surface-900 border-r border-theme/10 flex flex-col h-full z-10 transition-transform">
      <div className={`h-1.5 w-full bg-gradient-to-r ${persona.color}`} />
      
      <div className="p-6 border-b border-theme/10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md bg-theme-bg/50 border border-theme/10">
            {persona.emoji}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface-800 text-brand-400 font-mono text-sm shadow-inner tracking-wider">
            {formatTime(elapsedSeconds)}
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-theme">{persona.name}</h2>
        <p className="text-sm text-theme-muted mb-4">{persona.role}</p>
        
        <div className="flex flex-col gap-2">
          <Badge variant="neutral" className="w-fit scale-90 origin-left border-theme/10">{persona.style}</Badge>
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 mt-1 border border-theme/5">
             <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider">AI Voice</span>
             <VoiceVisualizer isSpeaking={isCoachSpeaking} colorClass={personaId === 'aisha' ? 'bg-rose-500' : personaId === 'priya' ? 'bg-purple-500' : personaId === 'ryan' ? 'bg-emerald-500' : 'bg-brand-500'} />
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-bold text-theme-secondary uppercase tracking-widest mb-3">Current Question</h3>
        <p className="font-semibold text-theme mb-2 leading-relaxed">{question?.title}</p>
        <div className="flex gap-2 mb-6">
           <Badge variant="neutral" className="text-[10px] uppercase bg-black/20">{question?.track}</Badge>
           <Badge variant={question?.difficulty > 3 ? 'warning' : 'success'} className="text-[10px]">
             Lvl {question?.difficulty}
           </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-theme-elevated/20 border border-theme/10 text-sm text-theme-secondary leading-relaxed">
            <h4 className="font-semibold text-theme mb-2 text-xs uppercase opacity-70">Focus Areas</h4>
            <ul className="space-y-2 list-disc list-inside marker:text-theme/20">
              <li>Scalability & Tradeoffs</li>
              <li>Edge cases & Bottlenecks</li>
              <li>Structured communication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
