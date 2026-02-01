'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';
import LiveItineraryPanel from '@/components/itinerary/LiveItineraryPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle, Map } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const tripId = params.id as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<'chat' | 'itinerary'>('chat');
  const [sheetOpen, setSheetOpen] = useState(false);
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

        {/* Itinerary panel (desktop: always visible) */}
        <div className="hidden md:flex md:w-[420px] lg:w-[480px] md:border-l border-gray-200/60 bg-white flex-shrink-0 flex-col">
          <LiveItineraryPanel tripId={tripId} refreshKey={refreshKey} />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      {hasItinerary && (
        <div className="md:hidden flex-shrink-0 border-t border-gray-200 bg-white/90 backdrop-blur-xl">
          <div className="flex">
            <Button
              variant="ghost"
              onClick={() => { setMobileTab('chat'); setSheetOpen(false); }}
              className={`flex-1 rounded-none py-3 text-xs font-medium ${
                mobileTab === 'chat' ? 'text-violet-600' : 'text-gray-400'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              대화
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSheetOpen(true)}
              className={`flex-1 rounded-none py-3 text-xs font-medium ${
                mobileTab === 'itinerary' ? 'text-violet-600' : 'text-gray-400'
              }`}
            >
              <Map className="w-4 h-4" />
              일정
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Sheet drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" onClose={() => setSheetOpen(false)} className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>여행 일정</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto mt-4">
            <LiveItineraryPanel tripId={tripId} refreshKey={refreshKey} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
