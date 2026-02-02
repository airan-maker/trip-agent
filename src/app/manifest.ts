import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TripTalk - 대화하면 완성되는 여행 일정',
    short_name: 'TripTalk',
    description: 'AI와 대화하면서 여행을 기획하고, 공유 가능한 웹 일정 페이지를 자동 생성하세요.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
