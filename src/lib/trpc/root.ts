import { router } from './trpc';
import { userRouter } from './routers/user';
import { courseRouter } from './routers/course';
import { progressRouter } from './routers/progress';
import { gamificationRouter } from './routers/gamification';

export const appRouter = router({
  user: userRouter,
  course: courseRouter,
  progress: progressRouter,
  gamification: gamificationRouter,
});

export type AppRouter = typeof appRouter;
