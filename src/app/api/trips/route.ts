import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import * as db from '@/lib/db';

// POST /api/trips - Create a new trip
export async function POST() {
  const id = nanoid(12);
  const trip = db.createTrip(id);
  return NextResponse.json(trip);
}

// GET /api/trips?id=xxx - Get trip details with itinerary
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Trip ID required' }, { status: 400 });
  }

  const itinerary = db.getItinerary(id);
  if (!itinerary) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  return NextResponse.json(itinerary);
}
