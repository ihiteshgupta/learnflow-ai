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

  const retrieved = await ragPipeline.retrieve(
    query,
    { courseId, moduleId, lessonId, topK: maxChunks }
  );
  const context = retrieved.map((item) => item.content).join('\n\n---\n\n');

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
  const lessonContextItems = await ragPipeline.retrieve(
    userQuestion,
    { lessonId, topK: 3 }
  );
  const lessonContext = lessonContextItems.map((item) => item.content).join('\n\n---\n\n');

  // Then, get broader course context
  const courseContextItems = await ragPipeline.retrieve(
    userQuestion,
    { topK: 2 }
  );
  const courseContext = courseContextItems.map((item) => item.content).join('\n\n---\n\n');

  const combined = [lessonContext, courseContext].filter(Boolean).join('\n\n---\n\n');

  return combined || 'No relevant context found.';
}
