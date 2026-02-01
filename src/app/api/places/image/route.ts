import { NextRequest, NextResponse } from 'next/server';
import { updatePlaceImageUrl } from '@/lib/db';

const GOOGLE_PLACES_API = 'https://places.googleapis.com/v1/places:searchText';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const placeId = searchParams.get('placeId');
  const name = searchParams.get('name');
  const nameLocal = searchParams.get('nameLocal');

  if (!placeId || !name) {
    return NextResponse.json({ imageUrl: null }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ imageUrl: null });
  }

  try {
    // Step 1: Text Search to find the place and its photos
    const searchQuery = nameLocal || name;
    const searchRes = await fetch(GOOGLE_PLACES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.photos',
      },
      body: JSON.stringify({ textQuery: searchQuery }),
    });

    if (!searchRes.ok) {
      return NextResponse.json({ imageUrl: null });
    }

    const searchData = await searchRes.json();
    const photos = searchData.places?.[0]?.photos;
    if (!photos || photos.length === 0) {
      return NextResponse.json({ imageUrl: null });
    }

    // Step 2: Get photo URI using skipHttpRedirect to get CDN URL without API key
    const photoName = photos[0].name;
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&skipHttpRedirect=true&key=${apiKey}`;
    const photoRes = await fetch(photoUrl);

    if (!photoRes.ok) {
      return NextResponse.json({ imageUrl: null });
    }

    const photoData = await photoRes.json();
    const imageUrl = photoData.photoUri;

    if (!imageUrl) {
      return NextResponse.json({ imageUrl: null });
    }

    // Step 3: Cache in DB (fire-and-forget)
    updatePlaceImageUrl(placeId, imageUrl).catch(() => {});

    return NextResponse.json({ imageUrl });
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
