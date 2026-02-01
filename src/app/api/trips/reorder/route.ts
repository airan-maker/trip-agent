import { NextRequest, NextResponse } from 'next/server';
import { reorderPlaces } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tripId, dayIndex, placeIds } = body;

    if (!tripId || !dayIndex || !Array.isArray(placeIds)) {
      return NextResponse.json(
        { error: 'tripId, dayIndex, placeIds 필드가 필요합니다.' },
        { status: 400 }
      );
    }

    await reorderPlaces(tripId, dayIndex, placeIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json(
      { error: '순서 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}
