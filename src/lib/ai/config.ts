import { env } from '@/lib/config/env';

export const aiConfig = {
  primaryModel: env.AI_MODEL_PRIMARY,
  fallbackModel: env.AI_MODEL_FALLBACK,
  maxTokens: 4096,
  temperature: {
    tutor: 0.7,
    assessor: 0.3,
    codeReview: 0.2,
    mentor: 0.8,
    projectGuide: 0.5,
    quizGenerator: 0.4,
  },
  rateLimit: {
    maxRequestsPerMinute: env.MAX_AI_REQUESTS_PER_MINUTE,
    maxTokensPerMinute: 100000,
  },
};

export const ragConfig = {
  qdrantUrl: env.QDRANT_URL,
  qdrantApiKey: env.QDRANT_API_KEY,
  collectionName: 'course_content',
  embeddingModel: 'text-embedding-3-large',
  chunkSize: 1000,
  chunkOverlap: 200,
  topK: 5,
};
