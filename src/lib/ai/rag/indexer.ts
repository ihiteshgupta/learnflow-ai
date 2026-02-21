import { eq } from 'drizzle-orm';
import { db, courses } from '@/lib/db';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ragConfig } from '../config';
import { ragPipeline } from './pipeline';

type PipelineMetadata = {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  type: string;
  title: string;
};

async function indexChunk(contentId: string, content: string, metadata: PipelineMetadata): Promise<number> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: ragConfig.chunkSize,
    chunkOverlap: ragConfig.chunkOverlap,
  });

  const chunks = await splitter.splitText(content);

  await ragPipeline.indexContent(
    chunks.map((chunk, chunkIndex) => ({
      contentId,
      content: chunk,
      chunkIndex,
      courseId: metadata.courseId,
      moduleId: metadata.moduleId,
      lessonId: metadata.lessonId,
      type: metadata.type,
      title: metadata.title,
    }))
  );

  return chunks.length;
}

export async function indexCourse(courseId: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      modules: {
        with: {
          lessons: true,
        },
      },
    },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  let totalIndexed = 0;

  // Index course description
  if (course.description) {
    const indexed = await indexChunk(
      `course-${course.id}`,
      course.description,
      {
        courseId: course.id,
        type: 'course',
        title: course.name,
      }
    );
    totalIndexed += indexed;
  }

  // Index each module and lesson
  for (const courseModule of course.modules || []) {
    if (courseModule.description) {
      const indexed = await indexChunk(
        `module-${courseModule.id}`,
        courseModule.description,
        {
          courseId: course.id,
          moduleId: courseModule.id,
          type: 'module',
          title: courseModule.name,
        }
      );
      totalIndexed += indexed;
    }

    for (const lesson of courseModule.lessons || []) {
      const content = lesson.contentJson as { text?: string } | null;
      if (content?.text) {
        const indexed = await indexChunk(
          `lesson-${lesson.id}`,
          content.text,
          {
            courseId: course.id,
            moduleId: courseModule.id,
            lessonId: lesson.id,
            type: 'lesson',
            title: lesson.name,
          }
        );
        totalIndexed += indexed;
      }
    }
  }

  return { courseId, totalIndexed };
}

export async function reindexAll() {
  const allCourses = await db.query.courses.findMany();

  const results = [];
  for (const course of allCourses || []) {
    const result = await indexCourse(course.id);
    results.push(result);
  }

  return results;
}
