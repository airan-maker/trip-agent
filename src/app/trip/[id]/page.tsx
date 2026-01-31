'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Itinerary } from '@/types/trip';
import ItineraryView from '@/components/itinerary/ItineraryView';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TripPage() {
  const params = useParams();
  const id = params.id as string;
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/trips?id=${id}`);
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
  }, [id]);

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
        <div className="text-center px-4">
          <p className="text-lg font-medium text-gray-700 mb-2">
            {error || '일정을 찾을 수 없어요'}
          </p>
          <Link
            href="/"
            className="text-violet-500 hover:underline text-sm"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return <ItineraryView itinerary={itinerary} />;
}
