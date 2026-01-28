import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export interface Context {
  db: typeof db;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    orgId: string | null;
    teamId: string | null;
  } | null;
}

export async function createContext(): Promise<Context> {
  // Get session from NextAuth
  const session = await auth();

  let user = null;
  if (session?.user?.id) {
    try {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          orgId: dbUser.orgId,
          teamId: dbUser.teamId,
        };
      }
    } catch (error) {
      console.error('Database error during user lookup:', error);
      return { db, user: null };
    }
  }

  return { db, user };
}

export type CreateContext = typeof createContext;
