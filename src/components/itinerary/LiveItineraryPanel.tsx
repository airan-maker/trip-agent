'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Itinerary } from '@/types/trip';
import {
  MapPin,
  Calendar,
  Users,
  Loader2,
  Sparkles,
  Palette,
  Wallet,
  Bus,
} from 'lucide-react';
import ShareButton from '../shared/ShareButton';
import DaySection from './DaySection';
import DynamicMap from '@/components/map/DynamicMap';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LiveItineraryPanelProps {
  tripId: string;
  refreshKey: number;
}

export default function LiveItineraryPanel({ tripId, refreshKey }: LiveItineraryPanelProps) {
  const t = useTranslations('itinerary');
  const tc = useTranslations('common');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<string>('list');

  const fetchItinerary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips?id=${encodeURIComponent(tripId)}`);
      if (!res.ok) return;
      const data: Itinerary = await res.json();
      setItinerary(data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (refreshKey > 0) {
      fetchItinerary();
    }
  }, [refreshKey, fetchItinerary]);

  if (!itinerary || itinerary.days.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            {loading ? (
              <>
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">{t('loadingItinerary')}</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-violet-300" />
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('preview')}</p>
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                  {t('previewDesc')}
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

  const infoItems = [
    { icon: <Calendar className="w-3 h-3" />, label: trip.startDate && trip.endDate ? `${trip.startDate} ~ ${trip.endDate}` : null, variant: 'blue' as const },
    { icon: <Users className="w-3 h-3" />, label: trip.travelers, variant: 'orange' as const },
    { icon: <Palette className="w-3 h-3" />, label: trip.theme, variant: 'violet' as const },
    { icon: <Wallet className="w-3 h-3" />, label: trip.budget, variant: 'emerald' as const },
    { icon: <Bus className="w-3 h-3" />, label: trip.transportation, variant: 'secondary' as const },
  ].filter((item) => item.label);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-100 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-base text-white truncate">
            {trip.title || `${trip.destination || ''} ${tc('trip')}`}
          </h2>
          {loading && <Loader2 className="w-3.5 h-3.5 text-violet-300 animate-spin flex-shrink-0" />}
        </div>

        {trip.destination && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-violet-300 text-xs font-medium">{trip.destination}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {days.length > 0 && (
            <Badge variant="outline" className="bg-white/10 text-white/80 border-white/10 text-[0.65rem]">
              <Calendar className="w-2.5 h-2.5" />
              {tc('days', { count: days.length })}
            </Badge>
          )}
          {totalPlaces > 0 && (
            <Badge variant="outline" className="bg-white/10 text-white/80 border-white/10 text-[0.65rem]">
              <MapPin className="w-2.5 h-2.5" />
              {tc('places', { count: totalPlaces })}
            </Badge>
          )}
          {infoItems.map((item, i) => (
            <Badge key={i} variant="outline" className="bg-white/10 text-white/80 border-white/10 text-[0.65rem]">
              {item.icon}
              {item.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100 bg-white">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="w-full">
            <TabsTrigger value="list" className="flex-1">{tc('list')}</TabsTrigger>
            <TabsTrigger value="map" className="flex-1">{tc('map')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'list' ? (
          <div className="absolute inset-0 overflow-y-auto no-scrollbar bg-[#fafafa]">
            <div className="px-4 py-6">
              {days.map((day) => (
                <DaySection key={day.dayIndex} day={day} />
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0">
            <DynamicMap days={days} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-gray-50/50">
        <ShareButton tripId={tripId} variant="full" />
      </div>
    </div>
  );
}
