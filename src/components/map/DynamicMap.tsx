'use client';

import dynamic from 'next/dynamic';
import { ItineraryDay } from '@/types/trip';
import { Loader2 } from 'lucide-react';

const ItineraryMap = dynamic(() => import('./ItineraryMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
    </div>
  ),
});

interface DynamicMapProps {
  days: ItineraryDay[];
}

export default function DynamicMap({ days }: DynamicMapProps) {
  return <ItineraryMap days={days} />;
}
