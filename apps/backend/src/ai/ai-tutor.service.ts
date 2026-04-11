import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiTutorService {
  private readonly logger = new Logger(AiTutorService.name);
  private client: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey && apiKey !== 'your-anthropic-api-key') {
      this.client = new Anthropic({ apiKey });
    }
  }

  async *streamChat(params: {
    questionTitle: string;
    track: string;
    difficulty: number;
    diagramSummary: string;
    transcript: string;
    chatHistory: { role: string; content: string }[];
    userMessage: string;
  }) {
    if (!this.client) {
      yield 'AI tutor is not configured. Please set the ANTHROPIC_API_KEY environment variable to enable AI features.';
      return;
    }

    const systemPrompt = `You are a senior staff engineer interviewer at a top tech company.
The candidate is solving: "${params.questionTitle}"
Track: ${params.track} | Difficulty: ${params.difficulty}/5

Current diagram (Excalidraw JSON summary): ${params.diagramSummary || 'No diagram yet'}
Voice transcript so far: ${params.transcript || 'No verbal explanation yet'}

Your role:
- Ask ONE focused follow-up question at a time
- Never give away the answer directly
- Probe for depth: scalability, failure modes, tradeoffs
- If the candidate is stuck, ask a leading question not a hint
- Keep responses under 3 sentences
- Match the tone of a real technical interview`;

    const messages = [
      ...params.chatHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: params.userMessage },
    ];

    try {
      const stream = await this.client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }
    } catch (error) {
      this.logger.error('AI tutor stream error', error);
      yield 'Sorry, I encountered an error. Please try again.';
    }
  }
}
