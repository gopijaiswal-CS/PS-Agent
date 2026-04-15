import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { QuestionDocument } from './schemas/question.schema';
import { TopicDocument } from './schemas/topic.schema';
import { SessionDocument } from './schemas/session.schema';
import * as crypto from 'crypto';

async function bootstrap() {
  console.log('🌱 Starting database seed...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>(getModelToken('User'));
  const questionModel = app.get<Model<QuestionDocument>>(getModelToken('Question'));
  const topicModel = app.get<Model<TopicDocument>>(getModelToken('Topic'));
  const sessionModel = app.get<Model<SessionDocument>>(getModelToken('Session'));

  console.log('🧹 Clearing existing data...');
  await userModel.deleteMany({});
  await questionModel.deleteMany({});
  await topicModel.deleteMany({});
  await sessionModel.deleteMany({});

  console.log('👤 Creating users...');
  const hashedPassword = crypto.createHash('sha256').update('password123').digest('hex');
  
  await userModel.create([
    {
      email: 'admin@techprep.io',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super-admin',
      plan: 'pro',
    },
    {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'free',
      plan: 'free',
    }
  ]);

  console.log('📚 Creating questions and topics...');
  
  const createdQuestions = await questionModel.create([
    {
      title: 'Design a URL Shortener',
      description: 'Design a system that takes long URLs and converts them into short, unique URLs. The system should handle millions of URL shortenings per day, redirect users to the original URL when they visit the short link, and provide analytics on link usage. Consider scalability, availability, and data consistency.',
      track: 'hld',
      difficulty: 3,
      tags: ['Hashing', 'Cache', 'NoSQL'],
      isPublished: true,
      timeLimitSeconds: 2400,
      rubric: {
        scalability: { weight: 0.3, description: 'Handles high write and read throughput correctly using load balancers and horizontal scaling.' },
        correctness: { weight: 0.3, description: 'Generates unique IDs, handles collisions, properly redirects users.' },
        completeness: { weight: 0.2, description: 'Addresses both URL shortening and analytics requirements.' },
        clarity: { weight: 0.2, description: 'Clear component diagram, understandable verbal explanation.' }
      },
      hints: [
        'What happens when two users submit the same long URL at the same time?',
        'Consider using a key-value store like Redis for fast lookups. You might need base62 encoding with a distributed counter.',
        'A complete solution would include: Load Balancer → App Servers → Cache (Redis) → Database (DynamoDB/Cassandra). Use a Zookeeper-based counter for unique ID generation, then base62-encode it.'
      ]
    },
    {
      title: 'Design Twitter/X Feed',
      description: 'Design the home feed system for Twitter/X. Users should see tweets from accounts they follow, ordered by relevance and recency. Consider the fan-out problem, real-time delivery, and how to handle celebrity accounts with millions of followers.',
      track: 'hld',
      difficulty: 4,
      tags: ['Fan-out', 'Pub/Sub', 'Timeline'],
      isPublished: true,
      timeLimitSeconds: 2400,
      rubric: {
        scalability: { weight: 0.4, description: 'Handles celebrity fan-out efficiently without overwhelming the system.' },
        correctness: { weight: 0.2, description: 'Feed accurately reflects chronological order of followed users.' },
        completeness: { weight: 0.2, description: 'Covers push vs pull models.' },
        clarity: { weight: 0.2, description: 'Clear diagram.' }
      },
      hints: ['Consider a Push model for regular users and a Pull model for celebrities.']
    },
    {
      title: 'Design a Parking Lot',
      description: 'Design an object-oriented parking lot system. Support multiple levels, different vehicle sizes (motorcycle, car, bus), and multiple entry/exit points. Track availability and calculate parking fees.',
      track: 'lld',
      difficulty: 2,
      tags: ['OOP', 'Strategy'],
      isPublished: true,
      timeLimitSeconds: 1800,
      rubric: {
        scalability: { weight: 0.1, description: 'Not strictly applicable for LLD, but code should be modular.' },
        correctness: { weight: 0.5, description: 'Correct OOP principles, single responsibility, classes appropriately separated.' },
        completeness: { weight: 0.2, description: 'Covers vehicles, levels, slots, and fees.' },
        clarity: { weight: 0.2, description: 'Clear class structure.' }
      },
      hints: ['Start by defining the core classes: ParkingLot, Level, ParkingSpot, Vehicle. Use enum for VehicleType.']
    },
    {
      title: 'LRU Cache',
      description: 'Implement a Least Recently Used (LRU) cache with O(1) get and put operations. The cache should evict the least recently used item when capacity is reached.',
      track: 'dsa',
      difficulty: 2,
      tags: ['Hash Map', 'Linked List'],
      isPublished: true,
      timeLimitSeconds: 1800,
      rubric: {
        scalability: { weight: 0.1, description: 'N/A' },
        correctness: { weight: 0.6, description: 'O(1) time complexity achieved correctly using doubly linked list and hash map.' },
        completeness: { weight: 0.1, description: 'Handles capacity edge cases.' },
        clarity: { weight: 0.2, description: 'Clean code.' }
      },
      hints: ['A Hash Map alone is not enough to maintain order. A doubly linked list allows O(1) node removal.']
    },
    {
      title: 'Tell me about a time you handled a conflict',
      description: 'Describe a situation where you had a fundamental disagreement with a colleague or manager about a technical direction. How did you resolve it, and what was the outcome?',
      track: 'behavioral',
      difficulty: 2,
      tags: ['Leadership', 'Conflict'],
      isPublished: true,
      timeLimitSeconds: 600,
      rubric: {
        scalability: { weight: 0, description: 'N/A' },
        correctness: { weight: 0.4, description: 'Uses the STAR method.' },
        completeness: { weight: 0.4, description: 'Shows empathy, compromise, and a focus on data-driven decisions.' },
        clarity: { weight: 0.2, description: 'Clear and concise.' }
      },
      hints: ['Use the STAR method. Focus on how you used data or compromises rather than just winning an argument.']
    }
  ]);

  await topicModel.create([
    {
      name: 'Consistent Hashing',
      category: 'System Design',
      track: 'hld',
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Consistent hashing is a distributed hashing scheme that operates independently of the number of servers...' }]}] },
      order: 1,
      estimatedReadMinutes: 5,
      isPublished: true,
    },
    {
      name: 'Singleton Pattern',
      category: 'Design Patterns',
      track: 'lld',
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The singleton pattern ensures a class has only one instance and provides a global point of access to it...' }]}] },
      order: 1,
      estimatedReadMinutes: 3,
      isPublished: true,
    }
  ]);

  console.log('✅ Seeding complete!');
  await app.close();
  process.exit(0);
}

bootstrap();
