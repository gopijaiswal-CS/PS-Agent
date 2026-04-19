import { COACH_PERSONAS, PersonaSlug } from './personas';

export function buildCoachPrompt(input: {
  personaSlug: PersonaSlug;
  question: { title: string; track: string; difficulty: number; description: string };
  transcript: string;
  emotion: { current: string; confidence: number };
  eyeContact: number;
  hesitationCount: number;
  avgWPM: number;
  diagramJSON?: object;
  hintsUsed: number;
  userProfile: { targetRole: string; targetCompanies: string[]; timeline: string };
  sessionMinutes: number;
}): string {
  const {
    personaSlug,
    question,
    transcript,
    emotion,
    eyeContact,
    hesitationCount,
    avgWPM,
    diagramJSON,
    hintsUsed,
    userProfile,
    sessionMinutes,
  } = input;

  const persona = COACH_PERSONAS[personaSlug];
  const w = persona.rubricWeights;

  return `You are ${persona.name}, ${persona.role} at ${persona.company}.
${persona.systemPromptExtra}

CURRENT INTERVIEW CONTEXT:
Question: "${question.title}" (${question.track.toUpperCase()}, difficulty ${question.difficulty}/5)
Problem: ${question.description.slice(0, 300)}

CANDIDATE BEHAVIORAL SIGNALS (use these to adapt your response):
- Detected emotion: ${emotion.current} (confidence: ${Math.round(emotion.confidence * 100)}%)
- Eye contact: ${Math.round(eyeContact * 100)}% of session
- Speaking pace: ${avgWPM} WPM ${avgWPM < 100 ? '(too slow — candidate may be hesitant)' : avgWPM > 180 ? '(too fast — may be nervous)' : '(good pace)'}
- Hesitation events (pauses > 4s): ${hesitationCount}
- Hints used: ${hintsUsed}
- Session time: ${sessionMinutes} minutes

CANDIDATE PROFILE:
- Target role: ${userProfile.targetRole || 'Not specified'}
- Target companies: ${userProfile.targetCompanies?.join(', ') || 'Not specified'}
- Timeline: ${userProfile.timeline || 'Not specified'}

TRANSCRIPT SO FAR:
${transcript || '(candidate has not spoken yet — ask them to begin)'}

${diagramJSON ? `DIAGRAM STATE (Excalidraw elements): ${JSON.stringify(diagramJSON).slice(0, 400)}` : ''}

RUBRIC WEIGHTS for ${persona.companyCalibration}:
Scalability ${w.scalability * 100}% · Correctness ${w.correctness * 100}% · Completeness ${w.completeness * 100}% · Clarity ${w.clarity * 100}%

Respond as ${persona.name} would in a real interview. One focused response. Max 3 sentences.
Do not mention you are an AI. Do not break character. Adapt your tone to the candidate's current emotion.`;
}
