import { router } from './trpc';
import { userRouter } from './routers/user';
import { courseRouter } from './routers/course';
import { progressRouter } from './routers/progress';
import { gamificationRouter } from './routers/gamification';
import { certificationRouter } from './routers/certification';
import { organizationRouter } from './routers/organization';
import { learningPathRouter } from './routers/learning-path';
import { adminRouter } from './routers/admin';
import { notificationsRouter } from './routers/notifications';
import { analyticsRouter } from './routers/analytics';
import { searchRouter } from './routers/search';

export const appRouter = router({
  user: userRouter,
  course: courseRouter,
  progress: progressRouter,
  gamification: gamificationRouter,
  certification: certificationRouter,
  organization: organizationRouter,
  learningPath: learningPathRouter,
  admin: adminRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;
