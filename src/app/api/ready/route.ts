import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Readiness probe - checks if the app is ready to serve traffic
export async function GET() {
  const checks: Record<string, string> = {
    app: 'ok',
  };

  // Check database connectivity
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'mock') {
    try {
      await db.execute(sql`SELECT 1`);
      checks.database = 'ok';
    } catch {
      checks.database = 'failed';
    }
  }

  const allHealthy = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      ready: allHealthy,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
