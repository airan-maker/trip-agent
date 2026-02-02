import { ImageResponse } from 'next/og';
import * as db from '@/lib/db';

export const runtime = 'nodejs';
export const alt = 'TripTalk 여행 일정';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let title = 'TripTalk 여행 일정';
  let destination = '';
  let dateRange = '';
  let theme = '';

  try {
    const trip = await db.getTrip(id);
    if (trip?.title) {
      title = trip.title;
      destination = trip.destination || '';
      theme = trip.theme || '';
      if (trip.startDate && trip.endDate) {
        dateRange = `${trip.startDate} ~ ${trip.endDate}`;
      } else if (trip.startDate) {
        dateRange = trip.startDate;
      }
    }
  } catch {
    // Use defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: '44px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.3,
              marginBottom: '20px',
            }}
          >
            {title}
          </div>
          {destination && (
            <div
              style={{
                fontSize: '28px',
                color: 'rgba(255,255,255,0.85)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              📍 {destination}
            </div>
          )}
          {dateRange && (
            <div
              style={{
                fontSize: '22px',
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              📅 {dateRange}
            </div>
          )}
          {theme && (
            <div
              style={{
                fontSize: '22px',
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🎯 {theme}
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            ✈️
          </div>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            TripTalk
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
