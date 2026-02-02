import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TripTalk - 대화하면 완성되는 여행 일정';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}
          >
            ✈️
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: 'white',
            }}
          >
            TripTalk
          </span>
        </div>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '12px',
          }}
        >
          대화하면 완성되는 나만의 여행 일정
        </div>
        <div
          style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          AI와 대화하며 여행을 기획하고, 공유 가능한 웹 일정을 자동 생성
        </div>
      </div>
    ),
    { ...size }
  );
}
