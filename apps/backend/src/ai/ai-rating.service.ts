import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiRatingService {
  private readonly logger = new Logger(AiRatingService.name);
  private client: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey && apiKey !== 'your-anthropic-api-key') {
      this.client = new Anthropic({ apiKey });
    }
  }

  async rateDesign(params: {
    questionTitle: string;
    rubric: any;
    hintsUsed: number;
    diagramJSON: Record<string, any>;
    voiceTranscript: string;
  }) {
    if (!this.client) {
      // Return mock rating when API key is not configured
      return this.getMockRating();
    }

    const w = params.rubric || { scalability: { weight: 25 }, correctness: { weight: 25 }, completeness: { weight: 25 }, clarity: { weight: 25 } };

    const systemPrompt = `You are a principal engineer evaluating a system design interview response.

Question: "${params.questionTitle}"
Rubric weights: scalability=${w.scalability?.weight || 25}, correctness=${w.correctness?.weight || 25}, completeness=${w.completeness?.weight || 25}, clarity=${w.clarity?.weight || 25}
Hints used by candidate: ${params.hintsUsed} (deduct 0.5 points per hint from overall)

Diagram analysis (Excalidraw elements): ${JSON.stringify(params.diagramJSON).slice(0, 2000)}
Verbal explanation transcript: ${params.voiceTranscript || 'No verbal explanation provided'}

Evaluate and respond ONLY with this JSON (no other text):
{
  "scalability": <1-10>,
  "correctness": <1-10>,
  "completeness": <1-10>,
  "clarity": <1-10>,
  "overall": <weighted average minus hint penalty>,
  "voiceScore": <1-10, rate verbal explanation quality>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "nextSteps": "<one sentence on what to study next>"
}`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: 'Please evaluate this design.' }],
        system: systemPrompt,
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return this.getMockRating();
    } catch (error) {
      this.logger.error('AI rating error', error);
      return this.getMockRating();
    }
  }

  private getMockRating() {
    return {
      scalability: 7,
      correctness: 6,
      completeness: 5,
      clarity: 8,
      overall: 6.5,
      voiceScore: 7,
      strengths: ['Good understanding of core concepts', 'Clear communication'],
      improvements: ['Add caching layer', 'Consider failure modes', 'Discuss data partitioning'],
      nextSteps: 'Study distributed caching patterns and consistent hashing.',
    };
  }
}
