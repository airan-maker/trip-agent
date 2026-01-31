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
  TreePine,
  Landmark,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const categoryConfig: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  '관광지': { icon: <Camera className="w-4 h-4" />, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  '맛집': { icon: <Utensils className="w-4 h-4" />, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  '카페': { icon: <Coffee className="w-4 h-4" />, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  '쇼핑': { icon: <ShoppingBag className="w-4 h-4" />, bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
  '체험': { icon: <Compass className="w-4 h-4" />, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  '숙소': { icon: <Home className="w-4 h-4" />, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  '이동': { icon: <Bus className="w-4 h-4" />, bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' },
  '자연': { icon: <TreePine className="w-4 h-4" />, bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  '신사/사찰': { icon: <Landmark className="w-4 h-4" />, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
};

const timeSlotLabels: Record<string, { label: string; color: string }> = {
  morning: { label: '오전', color: 'text-amber-600 bg-amber-50' },
  lunch: { label: '점심', color: 'text-orange-600 bg-orange-50' },
  afternoon: { label: '오후', color: 'text-blue-600 bg-blue-50' },
  evening: { label: '저녁', color: 'text-violet-600 bg-violet-50' },
};

interface PlaceCardProps {
  place: Place;
  showTimeSlot?: boolean;
}

export default function PlaceCard({ place, showTimeSlot = false }: PlaceCardProps) {
  const config = categoryConfig[place.category] || { icon: <MapPin className="w-4 h-4" />, bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' };
  const slot = timeSlotLabels[place.timeSlot];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.08)' }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4">
        <CardContent className="p-0">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bg} ${config.text} flex items-center justify-center border ${config.border}`}>
              {config.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {showTimeSlot && slot && (
                  <Badge variant="secondary" className={`text-[0.65rem] ${slot.color}`}>
                    {slot.label}
                  </Badge>
                )}
                <h3 className="font-bold text-sm text-gray-900">{place.name}</h3>
                {place.nameLocal && (
                  <span className="text-xs text-gray-400 font-light">{place.nameLocal}</span>
                )}
              </div>

              <p className="text-xs text-gray-500 leading-relaxed mb-2">
                {place.description}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {place.rating != null && place.rating > 0 && (
                  <Badge variant="amber">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {place.rating}
                  </Badge>
                )}
                {place.duration && (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3" />
                    {place.duration}
                  </Badge>
                )}
                {place.cost && (
                  <Badge variant="secondary">
                    {place.cost}
                  </Badge>
                )}
              </div>

              {(place.address || place.openingHours) && (
                <div className="mt-2 space-y-0.5">
                  {place.address && (
                    <div className="flex items-center gap-1.5 text-[0.7rem] text-gray-400">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{place.address}</span>
                    </div>
                  )}
                  {place.openingHours && (
                    <div className="flex items-center gap-1.5 text-[0.7rem] text-gray-400">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{place.openingHours}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
