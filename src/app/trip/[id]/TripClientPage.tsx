'use client';

import { useEffect, useState } from 'react';
import { Itinerary } from '@/types/trip';
import ItineraryView from '@/components/itinerary/ItineraryView';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/shared/PageTransition';

interface TripClientPageProps {
  tripId: string;
}

export default function TripClientPage({ tripId }: TripClientPageProps) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/trips?id=${encodeURIComponent(tripId)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('여행 일정을 찾을 수 없어요.');
          } else {
            setError('일정을 불러오는 중 오류가 발생했어요.');
          }
          return;
        }
        const data = await res.json();
        setItinerary(data);
      } catch {
        setError('네트워크 오류가 발생했어요.');
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-sm mx-4">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-medium text-gray-700 mb-4">
              {error || '일정을 찾을 수 없어요'}
            </p>
            <Button variant="violet" asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition>
      <ItineraryView itinerary={itinerary} />
    </PageTransition>
  );
}
