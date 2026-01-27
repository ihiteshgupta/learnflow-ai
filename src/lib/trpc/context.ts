import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

export async function createContext(opts: { headers: Headers }): Promise<Context> {
  // For now, we'll use a simple header-based auth
  // Later replace with NextAuth session
  const userId = opts.headers.get('x-user-id');

  let user = null;
  if (userId) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
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
  }

  return { db, user };
}

export type CreateContext = typeof createContext;
