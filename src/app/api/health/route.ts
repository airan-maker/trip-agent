import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db';

export async function GET() {
  const dbOk = await healthCheck();

  const status = dbOk ? 'healthy' : 'degraded';
  const httpStatus = dbOk ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbOk ? 'ok' : 'error',
      },
    },
    { status: httpStatus }
  );
}
