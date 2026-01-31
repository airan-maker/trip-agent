'use client';

import { ItineraryDay } from '@/types/trip';
import SortablePlaceCard from './SortablePlaceCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const timeSlotOrder = ['morning', 'lunch', 'afternoon', 'evening'];

const timeSlotHeaders: Record<string, { label: string; icon: string }> = {
  morning: { label: '오전', icon: '🌅' },
  lunch: { label: '점심', icon: '🍽️' },
  afternoon: { label: '오후', icon: '☀️' },
  evening: { label: '저녁', icon: '🌙' },
};

interface SortableDaySectionProps {
  day: ItineraryDay;
  onReorder: (placeIds: string[]) => void;
}

export default function SortableDaySection({ day, onReorder }: SortableDaySectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const grouped = timeSlotOrder
    .map((slot) => ({
      slot,
      places: day.places.filter((p) => p.timeSlot === slot),
    }))
    .filter((g) => g.places.length > 0);

  const allPlaceIds = day.places.map((p) => p.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = allPlaceIds.indexOf(active.id as string);
    const newIndex = allPlaceIds.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) return;

    const newIds = [...allPlaceIds];
    newIds.splice(oldIndex, 1);
    newIds.splice(newIndex, 0, active.id as string);
    onReorder(newIds);
  };

  return (
    <div className="mb-10">
      {/* Day header */}
      <div className="sticky top-12 z-10 bg-[#fafafa]/95 backdrop-blur-sm py-3 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {day.dayIndex}
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900 tracking-tight">{day.title}</h2>
            {day.date && (
              <p className="text-sm text-gray-400">
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

      {/* Timeline with drag-and-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allPlaceIds} strategy={verticalListSortingStrategy}>
          <div className="pl-6 ml-6 border-l-2 border-violet-100 space-y-4">
            {grouped.map((group) => (
              <div key={group.slot}>
                <div className="relative mb-3">
                  <div className="absolute -left-[1.85rem] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-violet-200 border-[3px] border-white shadow-sm" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {timeSlotHeaders[group.slot]?.icon} {timeSlotHeaders[group.slot]?.label || group.slot}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.places.map((place) => (
                    <SortablePlaceCard
                      key={place.id}
                      id={place.id}
                      place={place}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
