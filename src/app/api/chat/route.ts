import { NextRequest, NextResponse } from 'next/server';
import { processChat } from '@/lib/agent';
import * as db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { tripId, message } = await request.json();

    if (!tripId || !message) {
      return NextResponse.json(
        { error: 'tripId and message are required' },
        { status: 400 }
      );
    }

    // Verify trip exists
    const trip = db.getTrip(tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get API key from environment
    const apiKey =
      process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || '';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const result = await processChat(tripId, message, apiKey);

    return NextResponse.json({
      message: result.message,
      tripUpdated: !!result.itineraryData,
      itineraryReady: !!result.itineraryData,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/chat?tripId=xxx - Get chat history
export async function GET(request: NextRequest) {
  const tripId = request.nextUrl.searchParams.get('tripId');
  if (!tripId) {
    return NextResponse.json({ error: 'tripId required' }, { status: 400 });
  }

  const messages = db.getMessages(tripId);
  return NextResponse.json(messages);
}
