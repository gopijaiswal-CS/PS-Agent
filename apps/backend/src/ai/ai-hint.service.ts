import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiHintService {
  private readonly logger = new Logger(AiHintService.name);
  private client: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey && apiKey !== 'your-anthropic-api-key') {
      this.client = new Anthropic({ apiKey });
    }
  }

  async generateHint(params: {
    questionTitle: string;
    level: number;
    diagramSummary: string;
  }): Promise<string> {
    if (!this.client) {
      const fallbackHints = [
        'Think about what happens when the system needs to handle 10x the traffic.',
        'Consider how you would partition the data and what trade-offs that introduces.',
        'You might want to add a caching layer between the client and the database, and think about how to handle cache invalidation.',
      ];
      return fallbackHints[Math.min(params.level - 1, 2)];
    }

    const systemPrompt = `Question: "${params.questionTitle}"
Hint level requested: ${params.level} (1=gentle nudge, 2=concrete direction, 3=partial solution)
Candidate's current diagram: ${params.diagramSummary || 'No diagram yet'}

Give a level-${params.level} hint. 
Level 1: Ask a question that points them in the right direction (1 sentence).
Level 2: Name the concept or component they are missing (2 sentences max).
Level 3: Describe how that component fits into the solution (3 sentences max).
Never give the full answer. Never mention that you are giving a hint.`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: 'Please help me.' }],
        system: systemPrompt,
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      this.logger.error('AI hint error', error);
      return 'Consider the scalability aspects of your design.';
    }
  }
}
