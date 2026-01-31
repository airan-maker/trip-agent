import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import * as db from '@/lib/db';
import { tripIdSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = checkRateLimit(`create:${ip}`, 10, 60_000);

    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const id = nanoid(12);
    const trip = db.createTrip(id);
    return NextResponse.json(trip, { headers: getRateLimitHeaders(rl) });
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}

// GET /api/trips?id=xxx - Get trip details with itinerary
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const parsed = tripIdSchema.safeParse(id);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Valid Trip ID required' }, { status: 400 });
    }

    const itinerary = db.getItinerary(parsed.data);
    if (!itinerary) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Get trip error:', error);
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 });
  }
}
