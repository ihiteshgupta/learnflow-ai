import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const startTime = Date.now();

export async function GET() {
  const uptimeMs = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: uptimeSeconds,
    checks: {
      app: 'ok',
    },
  };

  return NextResponse.json(health);
}
