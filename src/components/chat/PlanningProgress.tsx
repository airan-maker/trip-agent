'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane } from 'lucide-react';

interface PlanningProgressProps {
  destination?: string;
  dates?: string;
  places: string[];
}

export default function PlanningProgress({ destination, dates, places }: PlanningProgressProps) {
  const t = useTranslations('chat');

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
        <Plane className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="max-w-[80%] bg-white border border-gray-100 rounded-[20px_20px_20px_6px] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />
          <span className="text-xs font-semibold text-violet-600">{t('planningProgress')}</span>
        </div>

        {(destination || dates) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {destination && (
              <span className="inline-flex items-center gap-1 text-[0.7rem] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">
                <MapPin className="w-2.5 h-2.5" />
                {destination}
              </span>
            )}
            {dates && (
              <span className="inline-flex items-center gap-1 text-[0.7rem] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                <Calendar className="w-2.5 h-2.5" />
                {dates}
              </span>
            )}
          </div>
        )}

        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {places.map((place, i) => (
              <motion.div
                key={`${i}-${place}`}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5"
              >
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[0.55rem] font-bold">
                  {i + 1}
                </span>
                <span className="text-xs text-gray-600 truncate">{place}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
