import { ragPipeline } from './pipeline';

export interface RetrievalOptions {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  maxChunks?: number;
}

export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<string> {
  const { courseId, moduleId, lessonId, maxChunks = 5 } = options;

  const context = await ragPipeline.retrieve(
    query,
    { courseId, moduleId, lessonId },
    maxChunks
  );

  if (!context) {
    return 'No relevant course content found.';
  }

  return `## Relevant Course Content\n\n${context}`;
}

export async function retrieveForLesson(
  lessonId: string,
  userQuestion: string
): Promise<string> {
  // First, get content specific to this lesson
  const lessonContext = await ragPipeline.retrieve(
    userQuestion,
    { lessonId },
    3
  );

  // Then, get broader course context
  const courseContext = await ragPipeline.retrieve(
    userQuestion,
    {},
    2
  );

  const combined = [lessonContext, courseContext].filter(Boolean).join('\n\n---\n\n');

  return combined || 'No relevant context found.';
}
