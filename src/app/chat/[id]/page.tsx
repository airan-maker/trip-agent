'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';
import LiveItineraryPanel from '@/components/itinerary/LiveItineraryPanel';
import { MessageCircle, Map } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const tripId = params.id as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<'chat' | 'itinerary'>('chat');
  const hasItinerary = refreshKey > 0;

  const handleItineraryUpdate = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="h-dvh flex flex-col bg-[#f7f7f8]">
      {/* Desktop: side by side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div className={`flex-1 min-w-0 flex flex-col ${mobileTab !== 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <ChatWindow
            tripId={tripId}
            onItineraryUpdate={handleItineraryUpdate}
          />
        </div>

        {/* Itinerary panel (desktop: always visible, mobile: tab) */}
        <div
          className={`md:w-[380px] lg:w-[420px] md:border-l border-gray-200/60 bg-white flex-shrink-0 flex flex-col ${
            mobileTab !== 'itinerary' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <LiveItineraryPanel tripId={tripId} refreshKey={refreshKey} />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      {hasItinerary && (
        <div className="md:hidden flex-shrink-0 border-t border-gray-200 bg-white/90 backdrop-blur-xl">
          <div className="flex">
            <button
              onClick={() => setMobileTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                mobileTab === 'chat'
                  ? 'text-violet-600'
                  : 'text-gray-400'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              대화
            </button>
            <button
              onClick={() => setMobileTab('itinerary')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                mobileTab === 'itinerary'
                  ? 'text-violet-600'
                  : 'text-gray-400'
              }`}
            >
              <Map className="w-4 h-4" />
              일정
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
