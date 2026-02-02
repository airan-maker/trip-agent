'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ItineraryDay, Place } from '@/types/trip';
import 'leaflet/dist/leaflet.css';

const DAY_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777', '#7c3aed', '#2563eb',
];

function createDayIcon(dayIndex: number, orderIndex: number) {
  const color = DAY_COLORS[(dayIndex - 1) % DAY_COLORS.length];
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker" style="background-color: ${color};">${orderIndex + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function getGoogleMapsUrl(place: Place): string {
  if (place.latitude != null && place.longitude != null) {
    const query = encodeURIComponent(place.nameLocal || place.name);
    return `https://www.google.com/maps/search/?api=1&query=${query}&center=${place.latitude},${place.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.nameLocal || place.name)}`;
}

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    const validPlaces = places.filter((p) => p.latitude != null && p.longitude != null);
    if (validPlaces.length === 0) return;
    const bounds = L.latLngBounds(validPlaces.map((p) => [p.latitude!, p.longitude!] as L.LatLngTuple));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, places]);

  return null;
}

interface ItineraryMapProps {
  days: ItineraryDay[];
}

export default function ItineraryMap({ days }: ItineraryMapProps) {
  const t = useTranslations('itinerary');
  const allPlaces = useMemo(() => days.flatMap((d) => d.places), [days]);
  const validPlaces = useMemo(() => allPlaces.filter((p) => p.latitude != null && p.longitude != null), [allPlaces]);

  const center: L.LatLngTuple = useMemo(() => {
    if (validPlaces.length === 0) return [36.5, 136.5];
    const lat = validPlaces.reduce((s, p) => s + p.latitude!, 0) / validPlaces.length;
    const lng = validPlaces.reduce((s, p) => s + p.longitude!, 0) / validPlaces.length;
    return [lat, lng];
  }, [validPlaces]);

  const dayRoutes = useMemo(() => {
    return days.map((day) => {
      const coords = day.places
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => [p.latitude!, p.longitude!] as L.LatLngTuple);
      return { dayIndex: day.dayIndex, coords, color: DAY_COLORS[(day.dayIndex - 1) % DAY_COLORS.length] };
    }).filter((r) => r.coords.length >= 2);
  }, [days]);

  if (validPlaces.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        {t('noLocationData')}
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer center={center} zoom={12} className="h-full w-full z-0" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds places={validPlaces} />
        {dayRoutes.map((route) => (
          <Polyline
            key={`route-${route.dayIndex}`}
            positions={route.coords}
            pathOptions={{ color: route.color, weight: 3, opacity: 0.6, dashArray: '8, 6' }}
          />
        ))}
        {days.map((day) =>
          day.places
            .filter((p) => p.latitude != null && p.longitude != null)
            .map((place, idx) => (
              <Marker key={place.id} position={[place.latitude!, place.longitude!]} icon={createDayIcon(day.dayIndex, idx)}>
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-bold text-sm">{place.name}</p>
                    {place.nameLocal && <p className="text-xs text-gray-400">{place.nameLocal}</p>}
                    {place.description && <p className="text-xs text-gray-500 mt-1">{place.description}</p>}
                    <p className="text-[0.65rem] text-violet-600 mt-1 font-medium">
                      Day {day.dayIndex}
                      {place.duration && ` · ${place.duration}`}
                      {place.cost && ` · ${place.cost}`}
                    </p>
                    <a href={getGoogleMapsUrl(place)} target="_blank" rel="noopener noreferrer" className="inline-block mt-1.5 text-[0.65rem] text-blue-500 hover:text-blue-700 font-medium">
                      📍 {t('viewOnGoogleMaps')} →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))
        )}
      </MapContainer>
      {days.length > 1 && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <div key={day.dayIndex} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DAY_COLORS[(day.dayIndex - 1) % DAY_COLORS.length] }} />
                <span className="text-[0.6rem] font-medium text-gray-600">Day {day.dayIndex}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
