import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { eq, and } from 'drizzle-orm';
import { chat } from '@/lib/ai/orchestrator';
import { db, users, userProfiles, lessons, aiSessions, aiMessages } from '@/lib/db';
import type { TeachingMode } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Get user from header (replace with proper auth)
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, lessonId } = await req.json();

    // Get user profile
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Get lesson context if provided
    let lessonContext = {
      lessonId: '',
      topic: 'General',
      courseId: '',
      objectives: [] as string[],
      teachingMode: 'adaptive' as TeachingMode,
    };

    if (lessonId) {
      const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
          module: {
            with: {
              course: true,
            },
          },
        },
      });

      if (lesson) {
        const content = lesson.contentJson as { objectives?: string[] } | null;
        const aiConfig = lesson.aiConfig as { mode?: string } | null;

        lessonContext = {
          lessonId: lesson.id,
          topic: lesson.name,
          courseId: lesson.module?.courseId || '',
          objectives: content?.objectives || [],
          teachingMode: (aiConfig?.mode as TeachingMode) || 'adaptive',
        };
      }
    }

    // Convert messages to LangChain format
    const previousMessages = messages.slice(0, -1).map((m: { role: string; content: string }) =>
      m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
    );

    const userMessage = messages[messages.length - 1].content;

    // Get or create AI session
    const session = await db.query.aiSessions.findFirst({
      where: and(
        eq(aiSessions.userId, userId),
        eq(aiSessions.lessonId, lessonId || ''),
        eq(aiSessions.status, 'active')
      ),
    });

    const sessionId = session?.id || crypto.randomUUID();

    if (!session) {
      await db.insert(aiSessions).values({
        id: sessionId,
        userId,
        lessonId: lessonId || null,
        agentType: 'orchestrator',
        status: 'active',
      });
    }

    // Save user message
    await db.insert(aiMessages).values({
      sessionId,
      role: 'user',
      content: userMessage,
    });

    // Get AI response
    const result = await chat(userMessage, {
      lessonId,
      userProfile: {
        id: userId,
        level: profile?.level || 1,
        learningStyle: profile?.learningStyle || 'adaptive',
        struggleAreas: (profile?.skillMap as { weakAreas?: string[] })?.weakAreas || [],
        interests: (profile?.studyPreferences as { interests?: string[] })?.interests || [],
        avgScore: 75,
      },
      lessonContext,
      previousMessages,
    });

    // Save AI response
    await db.insert(aiMessages).values({
      sessionId,
      role: 'assistant',
      content: result.response,
      metadata: result.metadata,
    });

    // Return response
    return new Response(JSON.stringify({
      content: result.response,
      agentType: result.agentType,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
