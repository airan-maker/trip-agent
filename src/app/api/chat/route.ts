import { NextRequest, NextResponse } from 'next/server';
import { createStreamingResponse } from '@/lib/agent';
import * as db from '@/lib/db';
import { chatMessageSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { getEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const env = getEnv();
    const rl = checkRateLimit(`chat:${ip}`, env.RATE_LIMIT_MAX, env.RATE_LIMIT_WINDOW_MS);

    if (!rl.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    // Parse and validate input
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = chatMessageSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: 'Invalid request', details: errors },
        { status: 400 }
      );
    }

    const { tripId, message } = parsed.data;

    // Verify trip exists
    const trip = db.getTrip(tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check message count limit
    const msgCount = db.getMessageCount(tripId);
    if (msgCount >= env.MAX_MESSAGES_PER_TRIP) {
      return NextResponse.json(
        { error: '대화 제한에 도달했어요. 새로운 여행 계획을 시작해주세요.' },
        { status: 400 }
      );
    }

    // Stream the response
    const stream = createStreamingResponse(tripId, message);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...getRateLimitHeaders(rl),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했어요.' },
      { status: 500 }
    );
  }
}

// GET /api/chat?tripId=xxx - Get chat history
export async function GET(request: NextRequest) {
  const tripId = request.nextUrl.searchParams.get('tripId');
  if (!tripId || !/^[a-zA-Z0-9_-]+$/.test(tripId)) {
    return NextResponse.json({ error: 'Valid tripId required' }, { status: 400 });
  }

  const messages = db.getMessages(tripId);
  return NextResponse.json(messages);
}
