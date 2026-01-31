'use client';

import { ItineraryDay } from '@/types/trip';
import PlaceCard from './PlaceCard';

interface DaySectionProps {
  day: ItineraryDay;
}

const timeSlotOrder = ['morning', 'lunch', 'afternoon', 'evening'];

export default function DaySection({ day }: DaySectionProps) {
  // Group places by time slot
  const grouped = timeSlotOrder
    .map((slot) => ({
      slot,
      places: day.places.filter((p) => p.timeSlot === slot),
    }))
    .filter((g) => g.places.length > 0);

  return (
    <div className="mb-8">
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {day.dayIndex}
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">{day.title}</h2>
            {day.date && (
              <p className="text-sm text-gray-500">
                {new Date(day.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 pl-5 border-l-2 border-violet-200 ml-5">
        {grouped.map((group) =>
          group.places.map((place) => (
            <div key={place.id} className="relative">
              <div className="absolute -left-[1.65rem] top-4 w-3 h-3 rounded-full bg-violet-400 border-2 border-white" />
              <PlaceCard place={place} showTimeSlot />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
