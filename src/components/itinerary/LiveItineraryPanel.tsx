'use client';

import { useEffect, useState, useCallback } from 'react';
import { Itinerary, Place } from '@/types/trip';
import {
  Plane,
  MapPin,
  Clock,
  Calendar,
  Users,
  Loader2,
  Utensils,
  Coffee,
  Camera,
  ShoppingBag,
  Compass,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import ShareButton from '../shared/ShareButton';

interface LiveItineraryPanelProps {
  tripId: string;
  refreshKey: number; // increment to trigger re-fetch
}

const categoryIcons: Record<string, React.ReactNode> = {
  '관광지': <Camera className="w-3.5 h-3.5" />,
  '맛집': <Utensils className="w-3.5 h-3.5" />,
  '카페': <Coffee className="w-3.5 h-3.5" />,
  '쇼핑': <ShoppingBag className="w-3.5 h-3.5" />,
  '체험': <Compass className="w-3.5 h-3.5" />,
};

const categoryColors: Record<string, string> = {
  '관광지': 'bg-blue-50 text-blue-600 border-blue-100',
  '맛집': 'bg-orange-50 text-orange-600 border-orange-100',
  '카페': 'bg-amber-50 text-amber-600 border-amber-100',
  '쇼핑': 'bg-pink-50 text-pink-600 border-pink-100',
  '체험': 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const timeSlotLabels: Record<string, string> = {
  morning: '오전',
  lunch: '점심',
  afternoon: '오후',
  evening: '저녁',
};

function CompactPlaceCard({ place }: { place: Place }) {
  const icon = categoryIcons[place.category] || <MapPin className="w-3.5 h-3.5" />;
  const color = categoryColors[place.category] || 'bg-gray-50 text-gray-500 border-gray-100';

  return (
    <div className="flex items-center gap-2.5 py-2 animate-fade-in">
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{place.name}</p>
        {place.duration && (
          <p className="text-[0.6rem] text-gray-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-2.5 h-2.5" />
            {place.duration}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LiveItineraryPanel({ tripId, refreshKey }: LiveItineraryPanelProps) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const fetchItinerary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips?id=${encodeURIComponent(tripId)}`);
      if (!res.ok) return;
      const data: Itinerary = await res.json();
      setItinerary(data);
      // Auto-expand all days on first load
      if (data.days.length > 0) {
        setExpandedDays(new Set(data.days.map((d) => d.dayIndex)));
      }
    } catch {
      // Silently fail - panel is supplementary
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (refreshKey > 0) {
      fetchItinerary();
    }
  }, [refreshKey, fetchItinerary]);

  const toggleDay = (dayIndex: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayIndex)) next.delete(dayIndex);
      else next.add(dayIndex);
      return next;
    });
  };

  // Empty state
  if (!itinerary || itinerary.days.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            {loading ? (
              <>
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">일정 불러오는 중...</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-violet-300" />
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">일정 미리보기</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  AI와 대화하면 여기에<br />일정이 실시간으로 나타나요
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { trip, days } = itinerary;
  const totalPlaces = days.reduce((sum, d) => sum + d.places.length, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Panel header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-sm text-gray-900 truncate">
            {trip.title || `${trip.destination || ''} 여행`}
          </h2>
          {loading && <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin flex-shrink-0" />}
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-1.5">
          {trip.destination && (
            <span className="inline-flex items-center gap-1 text-[0.6rem] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md">
              <MapPin className="w-2.5 h-2.5" />
              {trip.destination}
            </span>
          )}
          {days.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[0.6rem] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
              <Calendar className="w-2.5 h-2.5" />
              {days.length}일
            </span>
          )}
          {totalPlaces > 0 && (
            <span className="inline-flex items-center gap-1 text-[0.6rem] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
              <MapPin className="w-2.5 h-2.5" />
              {totalPlaces}곳
            </span>
          )}
          {trip.travelers && (
            <span className="inline-flex items-center gap-1 text-[0.6rem] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md">
              <Users className="w-2.5 h-2.5" />
              {trip.travelers}
            </span>
          )}
        </div>
      </div>

      {/* Day list */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {days.map((day) => {
          const isExpanded = expandedDays.has(day.dayIndex);
          const timeSlots = ['morning', 'lunch', 'afternoon', 'evening'];
          const grouped = timeSlots
            .map((slot) => ({
              slot,
              places: day.places.filter((p) => p.timeSlot === slot),
            }))
            .filter((g) => g.places.length > 0);

          return (
            <div key={day.dayIndex} className="border-b border-gray-50 last:border-b-0">
              {/* Day header (collapsible) */}
              <button
                onClick={() => toggleDay(day.dayIndex)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {day.dayIndex}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{day.title}</p>
                  <p className="text-[0.6rem] text-gray-400">{day.places.length}곳</p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-300 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
              </button>

              {/* Expanded places */}
              {isExpanded && (
                <div className="px-4 pb-3 space-y-1">
                  {grouped.map((group) => (
                    <div key={group.slot}>
                      <p className="text-[0.6rem] font-semibold text-gray-300 uppercase tracking-wider mt-2 mb-1">
                        {timeSlotLabels[group.slot] || group.slot}
                      </p>
                      {group.places.map((place) => (
                        <CompactPlaceCard key={place.id} place={place} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <ShareButton tripId={tripId} variant="full" />
        </div>
      </div>
    </div>
  );
}
