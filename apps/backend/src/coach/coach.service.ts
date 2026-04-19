import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { CoachSession, CoachSessionDocument } from '../database/schemas/coach.schema';
import { Question, QuestionDocument } from '../database/schemas/question.schema';
import { User, UserDocument } from '../database/schemas/user.schema';
import { AiRatingService } from '../ai/ai-rating.service';
import { COACH_PERSONAS, PersonaSlug } from './personas';
import { buildCoachPrompt } from './build-coach-prompt';

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);
  private anthropic: Anthropic | null = null;

  constructor(
    @InjectModel(CoachSession.name) private coachSessionModel: Model<CoachSessionDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private aiRatingService: AiRatingService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey && apiKey !== 'your-anthropic-api-key') {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  // ── Session lifecycle ───────────────────────────────────────

  async startSession(userId: string, questionId: string, coachPersona = 'marcus') {
    const question = await this.questionModel.findById(questionId).lean();
    if (!question) throw new NotFoundException('Question not found');

    const persona = COACH_PERSONAS[coachPersona as PersonaSlug] || COACH_PERSONAS.marcus;

    const session = await this.coachSessionModel.create({
      userId,
      questionId,
      coachPersona: persona.slug,
    });

    return {
      sessionId: session._id.toString(),
      persona: {
        slug: persona.slug,
        name: persona.name,
        role: persona.role,
        company: persona.company,
        emoji: persona.emoji,
        color: persona.color,
        tagline: persona.tagline,
        sampleQuote: persona.sampleQuote,
      },
      question: {
        _id: question._id,
        title: question.title,
        track: question.track,
        difficulty: question.difficulty,
        description: question.description,
        timeLimitSeconds: question.timeLimitSeconds,
      },
    };
  }

  async getSession(sessionId: string) {
    const session = await this.coachSessionModel
      .findById(sessionId)
      .populate('questionId', 'title track difficulty description timeLimitSeconds')
      .lean();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getReport(sessionId: string) {
    const session = await this.coachSessionModel
      .findById(sessionId)
      .populate('questionId', 'title track difficulty description')
      .lean();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.coachSessionModel
        .find({ userId, isCompleted: true })
        .populate('questionId', 'title track difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.coachSessionModel.countDocuments({ userId, isCompleted: true }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async endSession(sessionId: string, userId: string) {
    const session = await this.coachSessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Session not found');

    // Mark as complete immediately — scores computed async
    session.isCompleted = false; // will flip to true when scoring finishes
    await session.save();

    // Fire and forget the score computation
    this.computeAndSaveScores(sessionId, userId).catch((err) =>
      this.logger.error(`Score computation failed for ${sessionId}`, err),
    );

    return { success: true, message: 'Session ended. Report is being generated...' };
  }

  // ── Real-time helpers (called from gateway) ─────────────────

  async appendTranscript(sessionId: string, chunk: string) {
    await this.coachSessionModel.findByIdAndUpdate(sessionId, {
      $set: { fullTranscript: chunk }, // gateway sends accumulated transcript
    });
  }

  async appendEmotionSnapshot(
    sessionId: string,
    emotion: string,
    confidence: number,
    eyeContact: number,
  ) {
    await this.coachSessionModel.findByIdAndUpdate(sessionId, {
      $push: {
        emotionTimeline: { timestamp: Date.now(), emotion, confidence, eyeContact },
      },
    });
  }

  async updateVoiceAnalytics(sessionId: string, avgWPM: number, hesitationCount: number) {
    await this.coachSessionModel.findByIdAndUpdate(sessionId, {
      $set: { avgWPM, hesitationCount },
    });
  }

  // ── Claude streaming response ──────────────────────────────

  async streamCoachResponse(
    sessionId: string,
    userMessage: string,
    context: {
      emotion: { current: string; confidence: number };
      eyeContact: number;
      avgWPM: number;
      hesitationCount: number;
      diagramJSON?: object;
    },
  ): Promise<AsyncIterable<string>> {
    const session = await this.coachSessionModel
      .findById(sessionId)
      .populate('questionId')
      .lean();
    if (!session) throw new NotFoundException('Session not found');

    const user = await this.userModel.findById(session.userId).lean();
    const question = session.questionId as any;
    const persona = COACH_PERSONAS[session.coachPersona as PersonaSlug] || COACH_PERSONAS.marcus;

    const sessionMinutes = Math.floor(session.sessionDurationSeconds / 60);

    const prompt = buildCoachPrompt({
      personaSlug: session.coachPersona as PersonaSlug,
      question: {
        title: question.title,
        track: question.track,
        difficulty: question.difficulty,
        description: question.description || '',
      },
      transcript: session.fullTranscript || userMessage,
      emotion: context.emotion || { current: 'neutral', confidence: 0.5 },
      eyeContact: context.eyeContact || 0.5,
      hesitationCount: context.hesitationCount || 0,
      avgWPM: context.avgWPM || 130,
      diagramJSON: context.diagramJSON,
      hintsUsed: session.hintsUsed,
      userProfile: {
        targetRole: (user as any)?.targetRole || '',
        targetCompanies: (user as any)?.targetCompanies || [],
        timeline: (user as any)?.timeline || '',
      },
      sessionMinutes,
    });

    if (!this.anthropic) {
      // Graceful mock when no API key
      return this.mockStreamResponse(persona.name);
    }

    const stream = await this.anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: prompt,
      messages: [{ role: 'user', content: userMessage || 'Please continue the interview.' }],
    });

    return this.anthropicStreamToAsyncIterable(stream);
  }

  // ── Score computation (fires after endSession) ───────────────

  private async computeAndSaveScores(sessionId: string, userId: string) {
    const session = await this.coachSessionModel
      .findById(sessionId)
      .populate('questionId')
      .lean();
    if (!session) return;

    const question = session.questionId as any;
    const persona = COACH_PERSONAS[session.coachPersona as PersonaSlug] || COACH_PERSONAS.marcus;

    // Emotion summary
    const emotionCounts: Record<string, number> = {};
    session.emotionTimeline.forEach((e) => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    const totalSnapshots = session.emotionTimeline.length || 1;
    const avgEyeContact =
      session.emotionTimeline.reduce((s, e) => s + e.eyeContact, 0) / totalSnapshots;

    // Communication score
    const paceScore =
      session.avgWPM >= 110 && session.avgWPM <= 160
        ? 10
        : session.avgWPM < 80 || session.avgWPM > 200
          ? 5
          : 7;
    const hesitationPenalty = Math.min(session.hesitationCount * 0.5, 3);
    const fillerPenalty = Math.min(session.fillerWordCount * 0.2, 2);
    const communicationScore = Math.max(paceScore - hesitationPenalty - fillerPenalty, 0);

    // Confidence score from emotion distribution
    const confidentPct = (emotionCounts['confident'] || 0) / totalSnapshots;
    const nervousPct = (emotionCounts['nervous'] || 0) / totalSnapshots;
    const confidenceScore = Math.min(10, confidentPct * 12 - nervousPct * 5 + 5);

    // Eye contact score
    const eyeContactScore = Math.min(avgEyeContact * 12, 10);

    // Technical score from Claude
    let technicalRating;
    try {
      technicalRating = await this.aiRatingService.rateDesign({
        questionTitle: question?.title || 'Unknown',
        rubric: persona.rubricWeights,
        diagramJSON: session.diagramJSON || {},
        voiceTranscript: session.fullTranscript || '',
        hintsUsed: session.hintsUsed,
      });
    } catch {
      technicalRating = { overall: 6, strengths: [], improvements: [], nextSteps: '' };
    }

    const overall =
      technicalRating.overall * 0.4 +
      communicationScore * 0.2 +
      confidenceScore * 0.15 +
      eyeContactScore * 0.15 +
      paceScore * 0.1 -
      session.hintsUsed * 0.5;

    const coachQuote = await this.generateCoachQuote(session.coachPersona, technicalRating);

    await this.coachSessionModel.findByIdAndUpdate(sessionId, {
      isCompleted: true,
      scores: {
        technical: technicalRating.overall || 6,
        communication: Math.round(communicationScore * 10) / 10,
        confidence: Math.round(confidenceScore * 10) / 10,
        eyeContact: Math.round(eyeContactScore * 10) / 10,
        paceClarity: paceScore,
        overall: Math.max(0, Math.round(overall * 10) / 10),
      },
      aiFeedback: {
        strengths: technicalRating.strengths || [],
        improvements: technicalRating.improvements || [],
        coachQuote,
        nextTopicSlug: technicalRating.nextSteps || '',
      },
    });
  }

  private async generateCoachQuote(personaSlug: string, rating: any): Promise<string> {
    const persona = COACH_PERSONAS[personaSlug as PersonaSlug] || COACH_PERSONAS.marcus;
    if (!this.anthropic) return persona.sampleQuote;

    try {
      const score = rating.overall || 6;
      const tone = score >= 8 ? 'encouraging' : score >= 5 ? 'constructive' : 'direct and challenging';

      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        system: `You are ${persona.name}. Write one short, memorable sentence of post-interview feedback in ${tone} tone. Be specific, in character, no more than 25 words.`,
        messages: [{ role: 'user', content: `The candidate scored ${score}/10. Write your closing quote.` }],
      });
      return response.content[0].type === 'text' ? response.content[0].text : persona.sampleQuote;
    } catch {
      return persona.sampleQuote;
    }
  }

  private async *mockStreamResponse(personaName: string): AsyncIterable<string> {
    const responses = [
      `Interesting approach. `,
      `What happens when this system `,
      `needs to scale to 10x the load?`,
    ];
    for (const chunk of responses) {
      await new Promise((r) => setTimeout(r, 100));
      yield chunk;
    }
  }

  private async *anthropicStreamToAsyncIterable(stream: any): AsyncIterable<string> {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}
