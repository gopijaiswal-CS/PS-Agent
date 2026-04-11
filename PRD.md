# TechPrep Pro — CLAUDE.md
# Master context file for Claude Code & Cursor
# Drop this in your project root. Update the "## Build status" section after each feature is done.

---

## 🧠 What is this project?

**TechPrep Pro** is a full-stack AI-powered interview preparation platform for senior tech professionals (Staff Engineers, Architects, AI Engineers) targeting FAANG, unicorns, and AI-first companies.

Users can:
- Browse interview questions by category (HLD, LLD, DSA, AI/ML, Behavioral)
- Read prerequisite topic content before solving
- Draw system designs on an Excalidraw whiteboard
- Explain their solution verbally (voice-to-text)
- Get rated by an AI on their diagram + verbal explanation
- Chat with an AI tutor that asks follow-up interview questions
- Get progressive hints (3 levels) without full answer reveals

Admins can:
- Create/edit/delete questions with rubrics, hints, topic links
- Write rich topic content with images, code blocks, headings (TipTap CMS)
- Manage categories, tracks, and user roles

---

## 📁 Monorepo structure

```
techprep-pro/
├── CLAUDE.md                        ← you are here
├── .cursorrules                     ← Cursor AI rules (same conventions)
├── package.json                     ← npm workspaces root
├── apps/
│   ├── frontend/                    ← React 18 + TypeScript + Vite
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── pages/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   └── CallbackPage.tsx
│   │   │   │   ├── practice/
│   │   │   │   │   └── PracticePage.tsx       ← main split-pane practice screen
│   │   │   │   ├── topics/
│   │   │   │   │   └── TopicPage.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── DashboardPage.tsx
│   │   │   │   └── admin/
│   │   │   │       ├── AdminLayout.tsx
│   │   │   │       ├── QuestionEditor.tsx
│   │   │   │       ├── TopicEditor.tsx
│   │   │   │       ├── CategoryManager.tsx
│   │   │   │       └── UserManager.tsx
│   │   │   ├── components/
│   │   │   │   ├── sidebar/
│   │   │   │   │   └── QuestionSidebar.tsx
│   │   │   │   ├── whiteboard/
│   │   │   │   │   └── Whiteboard.tsx         ← Excalidraw wrapper
│   │   │   │   ├── chat/
│   │   │   │   │   └── AiChatPanel.tsx        ← streaming AI tutor
│   │   │   │   ├── voice/
│   │   │   │   │   └── VoicePanel.tsx         ← react-speech-recognition
│   │   │   │   ├── rating/
│   │   │   │   │   └── RatingModal.tsx        ← AI score display
│   │   │   │   ├── topic/
│   │   │   │   │   └── TopicViewer.tsx        ← renders TipTap JSON
│   │   │   │   └── ui/                        ← shared primitives
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Badge.tsx
│   │   │   │       ├── Timer.tsx
│   │   │   │       └── LoadingSpinner.tsx
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts               ← Zustand: user, token
│   │   │   │   ├── sessionStore.ts            ← Zustand: active question, diagram, transcript
│   │   │   │   └── uiStore.ts                 ← Zustand: sidebar open, hint level
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useSession.ts
│   │   │   │   └── useStreamingChat.ts        ← SSE/WS streaming hook
│   │   │   ├── api/
│   │   │   │   ├── client.ts                  ← axios instance with interceptors
│   │   │   │   ├── auth.api.ts
│   │   │   │   ├── questions.api.ts
│   │   │   │   ├── topics.api.ts
│   │   │   │   ├── sessions.api.ts
│   │   │   │   └── admin.api.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts                   ← re-exports from @techprep/shared
│   │   │   └── utils/
│   │   │       ├── formatTime.ts
│   │   │       └── cn.ts                      ← tailwind classnames helper
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── backend/                     ← NestJS + TypeScript
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   │   ├── jwt-auth.guard.ts
│       │   │   │   └── roles.guard.ts
│       │   │   ├── decorators/
│       │   │   │   ├── roles.decorator.ts     ← @Roles('admin')
│       │   │   │   └── current-user.decorator.ts
│       │   │   ├── filters/
│       │   │   │   └── http-exception.filter.ts
│       │   │   ├── interceptors/
│       │   │   │   └── response.interceptor.ts ← wraps all responses in { data, error, meta }
│       │   │   └── pipes/
│       │   │       └── validation.pipe.ts
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── strategies/
│       │   │   │   ├── jwt.strategy.ts
│       │   │   │   └── supabase.strategy.ts
│       │   │   └── dto/
│       │   │       ├── login.dto.ts
│       │   │       └── refresh.dto.ts
│       │   ├── users/
│       │   │   ├── users.module.ts
│       │   │   ├── users.service.ts
│       │   │   ├── users.schema.ts
│       │   │   └── dto/update-user.dto.ts
│       │   ├── questions/
│       │   │   ├── questions.module.ts
│       │   │   ├── questions.controller.ts
│       │   │   ├── questions.service.ts
│       │   │   ├── questions.schema.ts
│       │   │   └── dto/
│       │   │       ├── create-question.dto.ts
│       │   │       └── update-question.dto.ts
│       │   ├── topics/
│       │   │   ├── topics.module.ts
│       │   │   ├── topics.controller.ts
│       │   │   ├── topics.service.ts
│       │   │   ├── topics.schema.ts
│       │   │   └── dto/
│       │   │       ├── create-topic.dto.ts
│       │   │       └── update-topic.dto.ts
│       │   ├── sessions/
│       │   │   ├── sessions.module.ts
│       │   │   ├── sessions.controller.ts
│       │   │   ├── sessions.service.ts
│       │   │   └── sessions.schema.ts
│       │   ├── ai/
│       │   │   ├── ai.module.ts
│       │   │   ├── ai-chat.gateway.ts         ← Socket.IO gateway
│       │   │   ├── ai-rating.service.ts       ← Claude API rating
│       │   │   ├── ai-tutor.service.ts        ← Claude API chat
│       │   │   └── ai-hint.service.ts         ← progressive hints
│       │   ├── upload/
│       │   │   ├── upload.module.ts
│       │   │   ├── upload.controller.ts
│       │   │   └── upload.service.ts          ← Supabase Storage
│       │   ├── admin/
│       │   │   ├── admin.module.ts
│       │   │   └── admin.controller.ts        ← protected admin endpoints
│       │   └── database/
│       │       └── database.module.ts         ← MongoDB connection
│       ├── test/
│       ├── nest-cli.json
│       └── tsconfig.json
│
└── packages/
    └── shared/
        ├── src/
        │   ├── types/
        │   │   ├── user.types.ts
        │   │   ├── question.types.ts
        │   │   ├── topic.types.ts
        │   │   ├── session.types.ts
        │   │   └── api.types.ts               ← ApiResponse<T> envelope
        │   └── index.ts
        └── package.json
```

---

## 🛠 Tech stack — exact versions

### Frontend (`apps/frontend`)
```json
{
  "react": "^18.3.0",
  "typescript": "^5.4.0",
  "vite": "^5.2.0",
  "tailwindcss": "^3.4.0",
  "zustand": "^4.5.0",
  "@tanstack/react-query": "^5.40.0",
  "react-router-dom": "^6.23.0",
  "axios": "^1.7.0",
  "@excalidraw/excalidraw": "^0.17.0",
  "react-speech-recognition": "^3.10.0",
  "react-audio-visualize": "^1.1.0",
  "@tiptap/react": "^2.4.0",
  "@tiptap/starter-kit": "^2.4.0",
  "@tiptap/extension-image": "^2.4.0",
  "@tiptap/extension-code-block-lowlight": "^2.4.0",
  "socket.io-client": "^4.7.0",
  "date-fns": "^3.6.0",
  "clsx": "^2.1.0"
}
```

### Backend (`apps/backend`)
```json
{
  "@nestjs/core": "^10.3.0",
  "@nestjs/common": "^10.3.0",
  "@nestjs/mongoose": "^10.0.6",
  "mongoose": "^8.4.0",
  "@nestjs/passport": "^10.0.3",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/platform-socket.io": "^10.3.0",
  "@nestjs/websockets": "^10.3.0",
  "socket.io": "^4.7.0",
  "@nestjs/bull": "^10.2.0",
  "bull": "^4.12.0",
  "ioredis": "^5.4.0",
  "@anthropic-ai/sdk": "^0.24.0",
  "class-validator": "^0.14.1",
  "class-transformer": "^0.5.1",
  "@supabase/supabase-js": "^2.43.0",
  "multer": "^1.4.5",
  "@nestjs/swagger": "^7.3.0"
}
```

---

## 🗄 MongoDB schemas — complete definitions

### User schema
```typescript
// users.schema.ts
export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  CONTENT_ADMIN = 'content-admin',
  PRO = 'pro',
  FREE = 'free',
}

export enum UserPlan {
  FREE = 'free',
  PRO = 'pro',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ unique: true, sparse: true })  supabaseId: string;
  @Prop({ default: UserRole.FREE, enum: UserRole }) role: UserRole;
  @Prop({ default: UserPlan.FREE, enum: UserPlan }) plan: UserPlan;
  @Prop({ default: '' }) name: string;
  @Prop({ default: '' }) avatar: string;
  @Prop({ type: Object, default: {} }) weaknessMap: Record<string, number>; // { 'caching': 3.2, 'consensus': 6.1 }
  @Prop({ default: 0 }) sessionCount: number;
  @Prop({ default: 0 }) questionsAttempted: number;
  @Prop({ type: [String], default: [] }) completedQuestionIds: string[];
  @Prop() refreshToken: string;
  @Prop() lastActiveAt: Date;
}
// Indexes: email (unique), supabaseId (unique sparse), role
```

### Question schema
```typescript
// questions.schema.ts
export enum QuestionTrack {
  HLD = 'hld',
  LLD = 'lld',
  DSA = 'dsa',
  AI_ML = 'ai-ml',
  BEHAVIORAL = 'behavioral',
}

export enum Difficulty {
  EASY = 1, MEDIUM = 2, MEDIUM_HARD = 3, HARD = 4, EXPERT = 5,
}

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;         // full problem statement
  @Prop({ required: true, enum: QuestionTrack }) track: QuestionTrack;
  @Prop({ required: true, min: 1, max: 5 }) difficulty: number;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Topic' }] }) topics: Types.ObjectId[];
  @Prop({
    type: {
      scalability:   { weight: Number, description: String },
      correctness:   { weight: Number, description: String },
      completeness:  { weight: Number, description: String },
      clarity:       { weight: Number, description: String },
    }
  }) rubric: RubricSchema;
  @Prop({ type: [String], default: [] }) hints: string[];   // [hint1, hint2, hint3]
  @Prop({ default: 2400 }) timeLimitSeconds: number;         // default 40min
  @Prop() sampleAnswerOutline: string;                       // admin reference only
  @Prop({ default: true }) isPublished: boolean;
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop({ default: 0 }) attemptCount: number;
  @Prop({ default: 0 }) avgScore: number;
}
// Indexes: track, difficulty, isPublished, tags
```

### Topic schema
```typescript
// topics.schema.ts
@Schema({ timestamps: true })
export class Topic {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) category: string;              // e.g. 'Caching', 'Consensus'
  @Prop({ required: true, enum: QuestionTrack }) track: QuestionTrack;
  @Prop({ type: Object, required: true }) content: Record<string, any>; // TipTap JSON doc
  @Prop({ type: [String], default: [] }) images: string[];  // Supabase Storage URLs
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Topic' }], default: [] }) prerequisites: Types.ObjectId[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Topic' }], default: [] }) nextTopics: Types.ObjectId[];
  @Prop({ default: 0 }) order: number;
  @Prop() estimatedReadMinutes: number;
  @Prop({ default: true }) isPublished: boolean;
}
// Indexes: track, category, isPublished
```

### Session schema
```typescript
// sessions.schema.ts
@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Question', required: true }) questionId: Types.ObjectId;
  @Prop({ type: Object, default: {} }) diagramJSON: Record<string, any>;  // Excalidraw elements JSON
  @Prop({ default: '' }) voiceTranscript: string;
  @Prop({
    type: {
      scalability:  Number,
      correctness:  Number,
      completeness: Number,
      clarity:      Number,
      overall:      Number,
      strengths:    [String],
      improvements: [String],
      nextSteps:    String,
      voiceScore:   Number,
    },
    default: null,
  }) aiRating: RatingSchema | null;
  @Prop({ default: 0, min: 0, max: 3 }) hintsUsed: number;
  @Prop({ default: 0 }) timeTakenSeconds: number;
  @Prop({ default: false }) isCompleted: boolean;
  @Prop({ type: [Object], default: [] }) chatHistory: ChatMessage[];  // [{role, content, timestamp}]
}
// Indexes: userId, questionId, userId+questionId compound, createdAt
```

---

## 🔌 API — complete endpoint reference

### Auth endpoints
```
POST   /api/auth/login              Body: { email, password }  → { accessToken, user }
POST   /api/auth/oauth/callback     Body: { supabaseToken }    → { accessToken, user }
POST   /api/auth/refresh            Cookie: refreshToken       → { accessToken }
POST   /api/auth/logout             Auth: Bearer               → { success: true }
GET    /api/auth/me                 Auth: Bearer               → { user }
```

### Questions endpoints
```
GET    /api/questions               Query: track?, difficulty?, search?, page?, limit?  → { data: Question[], meta: Pagination }
GET    /api/questions/:id           Auth: Bearer               → { data: Question }
GET    /api/questions/:id/topics    Auth: Bearer               → { data: Topic[] }       ← topics linked to this question
GET    /api/questions/grouped       Auth: Bearer               → { data: GroupedByTrack } ← for sidebar
POST   /api/questions               Auth: content-admin+       Body: CreateQuestionDto   → { data: Question }
PUT    /api/questions/:id           Auth: content-admin+       Body: UpdateQuestionDto   → { data: Question }
DELETE /api/questions/:id           Auth: super-admin           → { data: { deleted: true } }
```

### Topics endpoints
```
GET    /api/topics                  Query: track?, category?, page?  → { data: Topic[], meta }
GET    /api/topics/:id              Auth: Bearer               → { data: Topic }
GET    /api/topics/:id/next         Auth: Bearer               → { data: Topic[] }       ← suggested next topics
POST   /api/topics                  Auth: content-admin+       Body: CreateTopicDto      → { data: Topic }
PUT    /api/topics/:id              Auth: content-admin+       Body: UpdateTopicDto      → { data: Topic }
DELETE /api/topics/:id              Auth: super-admin           → { data: { deleted: true } }
```

### Sessions endpoints
```
POST   /api/sessions                Auth: Bearer               Body: { questionId }      → { data: Session }  ← start session
GET    /api/sessions/:id            Auth: Bearer               → { data: Session }
PUT    /api/sessions/:id/diagram    Auth: Bearer               Body: { diagramJSON }     → { data: Session }  ← autosave diagram
PUT    /api/sessions/:id/transcript Auth: Bearer               Body: { voiceTranscript } → { data: Session }
POST   /api/sessions/:id/rate       Auth: Bearer               → { data: RatingResult }  ← triggers AI rating
GET    /api/sessions/history        Auth: Bearer               Query: page?, limit?      → { data: Session[], meta }
GET    /api/sessions/:id/hint/:level Auth: Bearer              → { data: { hint: string } }  level = 1|2|3
```

### AI endpoints
```
POST   /api/ai/chat                 Auth: Bearer               Body: { sessionId, message }  → SSE stream
POST   /api/ai/rate                 Auth: Bearer (internal)    Body: { sessionId }           → { data: RatingResult }
POST   /api/ai/voice-score          Auth: Bearer               Body: { sessionId, transcript } → { data: { voiceScore, feedback } }
```

### Upload endpoints
```
POST   /api/upload/image            Auth: content-admin+       Body: FormData(file)      → { data: { url: string } }
DELETE /api/upload/image            Auth: content-admin+       Body: { url }             → { data: { deleted: true } }
```

### Admin endpoints
```
GET    /api/admin/users             Auth: super-admin          Query: page?, role?       → { data: User[], meta }
PUT    /api/admin/users/:id/role    Auth: super-admin          Body: { role }            → { data: User }
PUT    /api/admin/users/:id/plan    Auth: super-admin          Body: { plan }            → { data: User }
GET    /api/admin/analytics         Auth: super-admin          → { data: AnalyticsSummary }
GET    /api/admin/questions/stats   Auth: content-admin+       → { data: QuestionStats[] }
```

### WebSocket events (Socket.IO)
```
# Client → Server
event: 'chat:message'    payload: { sessionId: string, message: string, diagramJSON?: object }
event: 'chat:stop'       payload: { sessionId: string }

# Server → Client  
event: 'chat:chunk'      payload: { chunk: string }          ← streaming token
event: 'chat:done'       payload: { fullResponse: string }
event: 'chat:error'      payload: { error: string }
```

---

## 🔐 Auth & RBAC rules

### JWT setup
- Access token: 15 minutes, signed with `JWT_SECRET`, payload `{ sub: userId, email, role, plan }`
- Refresh token: 7 days, stored as `httpOnly; Secure; SameSite=Strict` cookie, hashed in DB
- Supabase OAuth: exchange Supabase token → create/find user in MongoDB → issue our own JWT

### Role hierarchy (highest to lowest)
```
super-admin > content-admin > pro > free
```

### Guard usage in NestJS
```typescript
// Apply both guards globally, then use @Public() to opt out
@UseGuards(JwtAuthGuard, RolesGuard)

// On controller methods:
@Roles(UserRole.CONTENT_ADMIN)   // content-admin AND super-admin can access
@Roles(UserRole.SUPER_ADMIN)     // only super-admin

// Public routes use:
@Public()  // custom decorator that skips JwtAuthGuard
```

### Plan gating (frontend + backend)
```
FREE plan:  max 5 sessions/month, HLD track only, no voice scoring, no AI chat
PRO plan:   unlimited sessions, all tracks, voice scoring, AI chat, analytics
```

---

## 🤖 AI integration — Claude API

### Model to use
```
claude-sonnet-4-20250514   (always use this — do not use opus or haiku)
```

### AI Tutor system prompt template
```
You are a senior staff engineer interviewer at a top tech company.
The candidate is solving: "{questionTitle}"
Track: {track} | Difficulty: {difficulty}/5

Current diagram (Excalidraw JSON summary): {diagramSummary}
Voice transcript so far: {transcript}

Your role:
- Ask ONE focused follow-up question at a time
- Never give away the answer directly
- Probe for depth: scalability, failure modes, tradeoffs
- If the candidate is stuck, ask a leading question not a hint
- Keep responses under 3 sentences
- Match the tone of a real technical interview
```

### AI Rating system prompt template
```
You are a principal engineer evaluating a system design interview response.

Question: "{questionTitle}"
Rubric weights: scalability={w1}, correctness={w2}, completeness={w3}, clarity={w4}
Hints used by candidate: {hintsUsed} (deduct 0.5 points per hint from overall)

Diagram analysis (Excalidraw elements): {diagramJSON}
Verbal explanation transcript: {voiceTranscript}

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
}
```

### Hint system prompt template
```
Question: "{questionTitle}"
Hint level requested: {level} (1=gentle nudge, 2=concrete direction, 3=partial solution)
Candidate's current diagram: {diagramSummary}

Give a level-{level} hint. 
Level 1: Ask a question that points them in the right direction (1 sentence).
Level 2: Name the concept or component they are missing (2 sentences max).
Level 3: Describe how that component fits into the solution (3 sentences max).
Never give the full answer. Never mention that you are giving a hint.
```

---

## 🎨 Frontend conventions

### API client setup
```typescript
// api/client.ts
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,   // needed for httpOnly refresh token cookie
});

// Request interceptor: attach access token
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh on 401
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      await authApi.refresh();    // hits /api/auth/refresh with cookie
      return client(err.config);
    }
    return Promise.reject(err);
  }
);
```

### API response envelope
Every backend response follows this shape. Unwrap in React Query's `select`:
```typescript
// packages/shared/src/types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

### Zustand store pattern
```typescript
// Always use this pattern — no classes, no context
interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ accessToken: token }),
  logout: () => set({ user: null, accessToken: null }),
}));
```

### React Query pattern
```typescript
// Always use queryKey arrays with entity names + ids
const { data } = useQuery({
  queryKey: ['questions', { track, difficulty }],
  queryFn: () => questionsApi.getAll({ track, difficulty }),
  select: (res) => res.data,     // unwrap envelope
  staleTime: 5 * 60 * 1000,
});

const mutation = useMutation({
  mutationFn: (dto) => sessionsApi.create(dto),
  onSuccess: (res) => {
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
  },
});
```

### Tailwind class conventions
```
Layout:     flex, grid, container
Spacing:    p-4, px-6, py-3, gap-4, space-y-2
Text:       text-sm (13px), text-base (16px), text-lg (18px), font-medium
Colors:     Use CSS variables via Tailwind config — no arbitrary hex values
Radius:     rounded-md (8px), rounded-lg (12px), rounded-full (pills)
Border:     border border-gray-200 (light), border-gray-800 (dark)
```

### Component template
```typescript
// Every component follows this structure
import { FC } from 'react';

interface Props {
  // explicit types — no 'any'
}

export const ComponentName: FC<Props> = ({ prop1, prop2 }) => {
  // hooks at top
  // derived state next
  // handlers after
  // early returns for loading/error
  return (/* JSX */);
};
```

---

## ⚙️ Backend conventions

### NestJS module pattern
Every feature module must have these files:
```
feature/
├── feature.module.ts       ← imports, providers, exports
├── feature.controller.ts   ← routes, guards, swagger decorators
├── feature.service.ts      ← business logic, DB calls
├── feature.schema.ts       ← Mongoose schema + document interface
└── dto/
    ├── create-feature.dto.ts
    └── update-feature.dto.ts
```

### DTO pattern
```typescript
import { IsString, IsEnum, IsNumber, Min, Max, IsOptional, IsArray } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  title: string;

  @IsEnum(QuestionTrack)
  track: QuestionTrack;

  @IsNumber()
  @Min(1) @Max(5)
  difficulty: number;

  @IsArray()
  @IsOptional()
  topicIds?: string[];
}
```

### Service pattern
```typescript
@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async findAll(filters: FilterDto): Promise<PaginatedResult<Question>> {
    const query = this.buildQuery(filters);
    const [data, total] = await Promise.all([
      this.questionModel.find(query).skip(skip).limit(limit).lean(),
      this.questionModel.countDocuments(query),
    ]);
    return { data, meta: { page, limit, total, totalPages } };
  }
}
```

### Response interceptor (wraps everything)
```typescript
// All responses automatically become: { data: T, error: null, meta?: {} }
// Errors automatically become: { data: null, error: "message" }
// Do NOT manually wrap responses in controllers — the interceptor handles it
```

### Environment variables needed
```bash
# Backend .env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173

# Frontend .env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 🗺 Key UI screens

### 1. Practice screen (`/practice/:questionId`)
```
┌─────────────────────────────────────────────────────────────────┐
│ TechPrep Pro              ⏱ 38:22          [HLD Track]  [Pro]  │
├───────────────┬─────────────────────────┬───────────────────────┤
│ SIDEBAR       │ QUESTION PANEL          │ WHITEBOARD PANEL      │
│               │                         │                       │
│ ▼ HLD         │ Design a URL Shortener  │ [▭ Box][→ Arrow]      │
│  ● URL Short  │ ──────────────────────  │ [✎ Text][⬛ DB]       │
│  ○ Twitter    │ Difficulty: ●●●○○       │ [Rate my design ↗]   │
│  ○ Uber       │ Tags: Hashing, Cache    │                       │
│  ○ Netflix    │                         │                       │
│               │ [📖 Topics][💡 Hint]    │   Excalidraw canvas   │
│ ▼ LLD         │ [▶ Start solving]       │                       │
│  ○ Parking    │                         │                       │
│  ○ Chess      │ ── AI Tutor ──          │                       │
│               │ "Walk me through the    │                       │
│ [Search...]   │  301 vs 302 tradeoff"   │                       │
│               │ [🎤 Explain verbally]   │                       │
└───────────────┴─────────────────────────┴───────────────────────┘
```

### 2. Topic viewer (`/topics/:id`) — before solving
```
┌──────────────────────────────────────────────────────────┐
│ ← Back to question        Consistent Hashing — 8 min read │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ## What is consistent hashing?                         │
│  [rich content: text + images + code blocks]            │
│                                                          │
│  ## Why it matters in system design                     │
│  [content...]                                            │
│                                                          │
│  ## Key terms                                           │
│  [glossary pills]                                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Prerequisites: ← Hash Functions    Next: Ring Buffer →  │
│                                [▶ Start solving question] │
└──────────────────────────────────────────────────────────┘
```

### 3. Rating modal (after "Rate my design")
```
┌──────────────────────────────────────────┐
│ Your design rating                   ✕  │
├──────────────────────────────────────────┤
│  Overall score        7.4 / 10          │
│  ████████░░                             │
│                                          │
│  Scalability    8/10  ████████░░        │
│  Correctness    7/10  ███████░░░        │
│  Completeness   6/10  ██████░░░░        │
│  Clarity        9/10  █████████░        │
│  Voice quality  7/10  ███████░░░        │
│                                          │
│  ✓ Strengths                           │
│  • Good use of consistent hashing       │
│  • Correct cache invalidation strategy  │
│                                          │
│  △ Improvements                        │
│  • Missing rate limiting layer          │
│  • DB sharding strategy not explained   │
│                                          │
│  Next: Study "Rate limiting patterns"   │
│  [Study topic →]    [Try another Q →]   │
└──────────────────────────────────────────┘
```

### 4. Admin — Topic editor
```
┌──────────────────────────────────────────────────────────┐
│ Admin CMS > Topics > Edit: Consistent Hashing            │
├─────────────────┬────────────────────────────────────────┤
│ FORM            │ EDITOR (TipTap)                        │
│                 │                                        │
│ Name: [______]  │ [H1][H2][B][I][Code][Image][List]     │
│ Track: [HLD ▾]  │ ──────────────────────────────────    │
│ Category:[___]  │                                        │
│ Est. read: [__] │  ## What is consistent hashing?       │
│                 │  [editable rich content...]            │
│ Prerequisites:  │                                        │
│ [+ Add topic]   │  [drag to reorder sections]           │
│                 │                                        │
│ Next topics:    │                                        │
│ [+ Add topic]   │                                        │
│                 │                                        │
│ [Save] [Cancel] │                                        │
└─────────────────┴────────────────────────────────────────┘
```

---

## 📦 Build status — update this section as you go

```
[ ] Monorepo scaffolded
[ ] MongoDB schemas created
[ ] NestJS app boots (GET /health returns 200)
[ ] Auth module: login + refresh + logout
[ ] Auth module: Supabase OAuth callback
[ ] Auth module: JwtAuthGuard + RolesGuard working
[ ] Users module: CRUD + weaknessMap update
[ ] Questions module: CRUD + pagination + filters
[ ] Topics module: CRUD
[ ] Sessions module: create + autosave diagram + save transcript
[ ] AI: Claude chat endpoint (streaming via Socket.IO)
[ ] AI: Design rater (POST /api/sessions/:id/rate)
[ ] AI: Hint endpoint (3 levels)
[ ] Upload: image upload to Supabase Storage
[ ] Admin: user management endpoints
[ ] Frontend: React app boots with React Router
[ ] Frontend: Login page + OAuth flow
[ ] Frontend: Question sidebar (grouped by track)
[ ] Frontend: Practice screen layout (3-panel)
[ ] Frontend: Excalidraw whiteboard component
[ ] Frontend: AI chat panel (streaming)
[ ] Frontend: Voice panel (react-speech-recognition)
[ ] Frontend: Rating modal
[ ] Frontend: Topic viewer (TipTap JSON renderer)
[ ] Frontend: Admin layout + routing
[ ] Frontend: Admin topic editor (TipTap + image upload)
[ ] Frontend: Admin question builder
[ ] Frontend: Admin user manager
[ ] Deployment: backend on Railway
[ ] Deployment: frontend on Vercel
```

---

## 🚀 How to build — Claude Code session prompts

Use these prompts in order. Each one is a complete session. Run `/clear` between them and update the Build Status above.

### Session 1 — Scaffold
```
"Scaffold the TechPrep Pro monorepo. Create /apps/frontend with React 18 + TypeScript + Vite + TailwindCSS + Zustand + React Query v5 + React Router v6 + axios. Create /apps/backend with NestJS + TypeScript. Create /packages/shared with TypeScript. Use npm workspaces. Add tsconfig path aliases (@techprep/shared). Add a root package.json with scripts: dev (runs both apps), build:all. Initialize git with a .gitignore."
```

### Session 2 — MongoDB + NestJS bootstrap
```
"In /apps/backend, add @nestjs/mongoose + mongoose. Create /src/database/database.module.ts that connects to MongoDB using MONGODB_URI env var. Create all 4 schemas exactly as defined in CLAUDE.md (User, Question, Topic, Session) in /src/database/schemas/. Add the response interceptor at /src/common/interceptors/response.interceptor.ts that wraps all responses in { data, error, meta }. Add the global exception filter. Register everything in app.module.ts. Make the app boot with GET /health returning 200."
```

### Session 3 — Auth module
```
"Build the complete Auth module for /apps/backend/src/auth/. Requirements from CLAUDE.md: JWT access token 15min + refresh token 7d in httpOnly cookie, Supabase OAuth callback (POST /api/auth/oauth/callback takes supabaseToken, verifies with Supabase, creates/finds User in MongoDB, returns our own JWT), local login (POST /api/auth/login), POST /api/auth/refresh, POST /api/auth/logout, GET /api/auth/me. Create JwtStrategy using passport-jwt. Create JwtAuthGuard + RolesGuard + @Roles() decorator + @Public() decorator. Apply guards globally in app.module.ts. Use class-validator DTOs."
```

### Session 4 — Questions + Topics modules
```
"Build the Questions module and Topics module for /apps/backend following the patterns in CLAUDE.md. Questions: full CRUD, GET /api/questions with query params (track, difficulty, search, page, limit), GET /api/questions/grouped (returns questions grouped by track for sidebar), GET /api/questions/:id/topics. Topics: full CRUD, GET /api/topics/:id/next. All endpoints follow the ApiResponse<T> envelope. Apply @Roles guards on write endpoints (CONTENT_ADMIN+). Add Swagger decorators. Write the DTOs with class-validator."
```

### Session 5 — Sessions + AI modules
```
"Build the Sessions module and AI module for /apps/backend. Sessions: POST /api/sessions (creates session), PUT /api/sessions/:id/diagram (autosave), PUT /api/sessions/:id/transcript, POST /api/sessions/:id/rate (calls ai-rating.service), GET /api/sessions/history, GET /api/sessions/:id/hint/:level. AI module: create ai-rating.service.ts and ai-tutor.service.ts using @anthropic-ai/sdk with the system prompts defined in CLAUDE.md. Create ai-chat.gateway.ts (Socket.IO) that handles 'chat:message' events and streams Claude API responses back as 'chat:chunk' events. Use the model claude-sonnet-4-20250514."
```

### Session 6 — Frontend core
```
"Build the frontend core in /apps/frontend/src. Create the axios client at api/client.ts with the interceptors defined in CLAUDE.md (Bearer token attach + 401 auto-refresh). Create all API modules: auth.api.ts, questions.api.ts, topics.api.ts, sessions.api.ts. Create Zustand stores: authStore.ts (user, accessToken), sessionStore.ts (activeQuestion, diagramJSON, transcript, isSessionActive, hintsUsed). Create React Router setup in App.tsx with routes: /login, /practice/:questionId, /topics/:id, /dashboard, /admin/* (protected). Create the LoginPage.tsx with Google + GitHub OAuth buttons."
```

### Session 7 — Practice screen
```
"Build the Practice screen at /apps/frontend/src/pages/practice/PracticePage.tsx. It is a 3-panel layout: left sidebar (QuestionSidebar), center panel (question detail + AI chat), right panel (whiteboard). QuestionSidebar: fetches GET /api/questions/grouped, renders collapsible track sections, shows difficulty dots, completed badge, search input. QuestionDetail: shows title, description, difficulty, tags, Topics button (navigates to /topics/:id), Hints button (fetches hint level 1/2/3), Start Solving button (starts timer). Whiteboard: embed @excalidraw/excalidraw (dynamic import), show toolbar above with 'Rate my design' button, on change save diagram JSON to sessionStore. Timer: counts down from question.timeLimitSeconds. Use TypeScript + Tailwind."
```

### Session 8 — AI chat + voice + rating
```
"Build the AI features in /apps/frontend/src. AiChatPanel.tsx: connects to Socket.IO server, sends 'chat:message' with { sessionId, message, diagramJSON from sessionStore }, displays streaming 'chat:chunk' events in real-time in a chat bubble UI (user messages right, AI messages left). VoicePanel.tsx: uses react-speech-recognition, shows animated waveform bars while listening, shows live transcript, Stop button calls onTranscriptReady(transcript) prop which saves to sessionStore and calls PUT /api/sessions/:id/transcript. RatingModal.tsx: shown after 'Rate my design', calls POST /api/sessions/:id/rate, shows overall score + 4 dimension scores as progress bars, strengths list, improvements list, nextSteps, buttons to study topic or try another question."
```

### Session 9 — Admin CMS
```
"Build the Admin section at /apps/frontend/src/pages/admin/. AdminLayout.tsx: sidebar nav with links to Questions, Topics, Categories, Users (only visible to CONTENT_ADMIN and SUPER_ADMIN roles, redirect to /dashboard if not authorized). TopicEditor.tsx: TipTap editor (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-image) with toolbar, image upload (POST /api/upload/image then insert into editor), form fields for name/category/track/estimatedReadMinutes, multi-select for prerequisites and nextTopics from fetched topic list, Save button with React Query mutation. QuestionEditor.tsx: form for all question fields, difficulty slider 1-5, multi-select topics, hint fields (3 inputs), rubric weight inputs, save with mutation."
```

---

## ⚡ Quick reference — things Claude Code often gets wrong

1. **Never use `any` type** — always define proper TypeScript interfaces
2. **Mongoose schemas need `.lean()`** on read queries for performance
3. **Excalidraw must be dynamically imported** — it breaks SSR and has large bundle
4. **Socket.IO gateway needs `@WebSocketGateway({ cors: { origin: FRONTEND_URL } })`**
5. **All NestJS modules must be imported in app.module.ts** — easy to forget
6. **React Query keys must include all filter params** — `['questions', { track }]` not `['questions']`
7. **Supabase Storage bucket must be set to public** for image URLs to work without auth
8. **httpOnly cookies need `withCredentials: true` on both axios and NestJS CORS config**
9. **TipTap requires explicit extensions array** — StarterKit + Image + CodeBlock individually
10. **Bull queues need Redis running** — add a health check guard in development

---

*Last updated: initial setup — update Build Status section after each session*