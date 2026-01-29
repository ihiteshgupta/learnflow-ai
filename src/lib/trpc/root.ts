import { router } from './trpc';
import { userRouter } from './routers/user';
import { courseRouter } from './routers/course';
import { progressRouter } from './routers/progress';
import { gamificationRouter } from './routers/gamification';
import { certificationRouter } from './routers/certification';
import { organizationRouter } from './routers/organization';
import { learningPathRouter } from './routers/learning-path';
import { adminRouter } from './routers/admin';

export const appRouter = router({
  user: userRouter,
  course: courseRouter,
  progress: progressRouter,
  gamification: gamificationRouter,
  certification: certificationRouter,
  organization: organizationRouter,
  learningPath: learningPathRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
