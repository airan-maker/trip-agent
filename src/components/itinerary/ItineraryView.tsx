'use client';

import { Itinerary } from '@/types/trip';
import DaySection from './DaySection';
import ShareButton from '../shared/ShareButton';
import AdBanner from '../shared/AdBanner';
import {
  MapPin,
  Calendar,
  Users,
  Palette,
  Wallet,
  Bus,
  ArrowLeft,
  Plane,
} from 'lucide-react';
import Link from 'next/link';

interface ItineraryViewProps {
  itinerary: Itinerary;
}

export default function ItineraryView({ itinerary }: ItineraryViewProps) {
  const { trip, days } = itinerary;

  const infoItems = [
    { icon: <Calendar className="w-3.5 h-3.5" />, label: trip.startDate && trip.endDate ? `${trip.startDate} ~ ${trip.endDate}` : null },
    { icon: <Users className="w-3.5 h-3.5" />, label: trip.travelers },
    { icon: <Palette className="w-3.5 h-3.5" />, label: trip.theme },
    { icon: <Wallet className="w-3.5 h-3.5" />, label: trip.budget },
    { icon: <Bus className="w-3.5 h-3.5" />, label: trip.transportation },
  ].filter((item) => item.label);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2Mmgt
MnYtMnptLTQgMHYyaC0ydi0yaDJ6bTIgMGgydjJoLTJ2LTJ6bS00IDRoMnYyaC0ydi0yem0wLTRoMnYyaC0ydi0yem0tNCA0aDJ2Mmgt
MnYtMnptMC00aDJ2Mmgt
MnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto px-4 pt-6 pb-10">
          <div className="flex items-center justify-between mb-8">
            <Link
              href={`/chat/${trip.id}`}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              대화로 돌아가기
            </Link>
            <ShareButton tripId={trip.id} />
          </div>

          {trip.destination && (
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300 text-sm font-medium">{trip.destination}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold mb-5 tracking-tight leading-tight">
            {trip.title || `${trip.destination} 여행`}
          </h1>

          {infoItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {infoItems.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs text-white/80 border border-white/5"
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
        <div className="sticky top-0 z-20 glass border-b border-gray-100/50 shadow-sm">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex overflow-x-auto gap-1 py-2 no-scrollbar">
              {days.map((day) => (
                <a
                  key={day.dayIndex}
                  href={`#day-${day.dayIndex}`}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-violet-50 hover:text-violet-700 transition-all"
                >
                  Day {day.dayIndex}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Days */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {days.map((day, i) => (
          <div key={day.dayIndex}>
            <div id={`day-${day.dayIndex}`}>
              <DaySection day={day} />
            </div>
            {/* Show ad after every 2nd day */}
            {i > 0 && i % 2 === 1 && i < days.length - 1 && (
              <div className="my-6">
                <AdBanner slot="ITINERARY_BETWEEN_DAYS" format="rectangle" className="rounded-2xl" />
              </div>
            )}
          </div>
        ))}

        {days.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Plane className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 mb-3">아직 일정이 생성되지 않았어요.</p>
            <Link
              href={`/chat/${trip.id}`}
              className="text-sm text-violet-500 hover:text-violet-600 font-medium transition-colors"
            >
              대화를 계속해서 일정을 만들어보세요
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Plane className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">TripTalk</span>
          </div>
          <div className="mt-3">
            <ShareButton tripId={trip.id} variant="full" />
          </div>
        </div>
      </div>
    </div>
  );
}
