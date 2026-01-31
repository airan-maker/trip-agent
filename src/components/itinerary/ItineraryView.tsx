'use client';

import { Itinerary } from '@/types/trip';
import DaySection from './DaySection';
import ShareButton from '../shared/ShareButton';
import {
  MapPin,
  Calendar,
  Users,
  Palette,
  Wallet,
  Bus,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface ItineraryViewProps {
  itinerary: Itinerary;
}

export default function ItineraryView({ itinerary }: ItineraryViewProps) {
  const { trip, days } = itinerary;

  const infoItems = [
    { icon: <Calendar className="w-4 h-4" />, label: trip.startDate && trip.endDate ? `${trip.startDate} ~ ${trip.endDate}` : null },
    { icon: <Users className="w-4 h-4" />, label: trip.travelers },
    { icon: <Palette className="w-4 h-4" />, label: trip.theme },
    { icon: <Wallet className="w-4 h-4" />, label: trip.budget },
    { icon: <Bus className="w-4 h-4" />, label: trip.transportation },
  ].filter((item) => item.label);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href={`/chat/${trip.id}`}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              대화로 돌아가기
            </Link>
            <ShareButton tripId={trip.id} />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-white/80" />
            <span className="text-white/80 text-sm">{trip.destination}</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {trip.title || `${trip.destination} 여행`}
          </h1>

          {infoItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {infoItems.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs"
                >
                  {item.icon}
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Day tabs */}
      {days.length > 1 && (
        <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex overflow-x-auto gap-1 py-2 no-scrollbar">
              {days.map((day) => (
                <a
                  key={day.dayIndex}
                  href={`#day-${day.dayIndex}`}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  Day {day.dayIndex}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Days */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {days.map((day) => (
          <div key={day.dayIndex} id={`day-${day.dayIndex}`}>
            <DaySection day={day} />
          </div>
        ))}

        {days.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>아직 일정이 생성되지 않았어요.</p>
            <Link
              href={`/chat/${trip.id}`}
              className="text-violet-500 hover:underline mt-2 inline-block"
            >
              대화를 계속해서 일정을 만들어보세요
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-white py-6">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">
            TripTalk으로 만든 여행 일정
          </p>
          <div className="mt-3">
            <ShareButton tripId={trip.id} variant="full" />
          </div>
        </div>
      </div>
    </div>
  );
}
