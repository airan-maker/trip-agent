import { Metadata } from 'next';
import * as db from '@/lib/db';
import TripClientPage from './TripClientPage';

interface TripPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const trip = db.getTrip(id);
    if (trip && trip.title) {
      return {
        title: `${trip.title} | TripTalk`,
        description: `${trip.destination} 여행 일정 - ${trip.travelers || ''} ${trip.theme || ''}`.trim(),
        openGraph: {
          title: `${trip.title} | TripTalk`,
          description: `${trip.destination} 여행 일정을 확인해보세요!`,
        },
      };
    }
  } catch {
    // Fall through to defaults
  }

  return {
    title: '여행 일정 | TripTalk',
    description: 'TripTalk으로 만든 여행 일정을 확인해보세요!',
  };
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  return <TripClientPage tripId={id} />;
}
