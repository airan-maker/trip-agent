'use client';

import { Place } from '@/types/trip';
import {
  MapPin,
  Clock,
  Star,
  Utensils,
  Coffee,
  Camera,
  ShoppingBag,
  Compass,
  Home,
  Bus,
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  '관광지': <Camera className="w-4 h-4" />,
  '맛집': <Utensils className="w-4 h-4" />,
  '카페': <Coffee className="w-4 h-4" />,
  '쇼핑': <ShoppingBag className="w-4 h-4" />,
  '체험': <Compass className="w-4 h-4" />,
  '숙소': <Home className="w-4 h-4" />,
  '이동': <Bus className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  '관광지': 'bg-blue-100 text-blue-700',
  '맛집': 'bg-orange-100 text-orange-700',
  '카페': 'bg-amber-100 text-amber-700',
  '쇼핑': 'bg-pink-100 text-pink-700',
  '체험': 'bg-green-100 text-green-700',
  '숙소': 'bg-indigo-100 text-indigo-700',
  '이동': 'bg-gray-100 text-gray-700',
};

const timeSlotLabels: Record<string, string> = {
  morning: '🌅 오전',
  lunch: '🍽️ 점심',
  afternoon: '☀️ 오후',
  evening: '🌙 저녁',
};

interface PlaceCardProps {
  place: Place;
  showTimeSlot?: boolean;
}

export default function PlaceCard({ place, showTimeSlot = false }: PlaceCardProps) {
  const icon = categoryIcons[place.category] || <MapPin className="w-4 h-4" />;
  const colorClass = categoryColors[place.category] || 'bg-gray-100 text-gray-700';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      {showTimeSlot && (
        <div className="text-xs text-gray-500 mb-2 font-medium">
          {timeSlotLabels[place.timeSlot] || place.timeSlot}
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-gray-900">{place.name}</h3>
            {place.nameLocal && (
              <span className="text-xs text-gray-400">{place.nameLocal}</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            {place.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
            {place.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {place.rating}
              </span>
            )}
            {place.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {place.duration}
              </span>
            )}
            {place.cost && (
              <span className="text-gray-400">{place.cost}</span>
            )}
          </div>

          {place.address && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{place.address}</span>
            </div>
          )}

          {place.openingHours && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{place.openingHours}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
