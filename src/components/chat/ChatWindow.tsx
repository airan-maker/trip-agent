'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Message } from '@/types/trip';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import PlanningProgress from './PlanningProgress';
import { Plane, ExternalLink } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface ChatWindowProps {
  tripId: string;
  initialMessages?: Message[];
  onItineraryUpdate?: () => void;
}

export default function ChatWindow({ tripId, initialMessages = [], onItineraryUpdate }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [planningData, setPlanningData] = useState<{ destination?: string; dates?: string; places: string[] } | null>(null);
  const [itineraryReady, setItineraryReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Message = {
        id: 'greeting',
        tripId,
        role: 'assistant',
        content:
          '안녕하세요! ✈️ TripTalk이에요.\n\n여행 계획을 도와드릴게요. 어디로 여행을 떠나고 싶으세요?',
        createdAt: new Date().toISOString(),
      };
      setMessages([greeting]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (content: string) => {
    const userMsg: Message = {
      id: nanoid(),
      tripId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setStreamingContent('');

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, message: content }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        let errorMsg = '서버 오류가 발생했어요.';
        try {
          const error = await res.json();
          errorMsg = error.error || errorMsg;
        } catch {
          // Use default error message
        }
        throw new Error(errorMsg);
      }

      if (res.headers.get('content-type')?.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const event = JSON.parse(data);
              if (event.type === 'text') {
                accumulated += event.content;
                // Strip complete ```json...``` blocks and incomplete ones (open ```json without closing ```)
                let display = accumulated.replace(/```json[\s\S]*?```/g, '');
                display = display.replace(/```json[\s\S]*$/g, '');
                display = display.trim();

                // Extract planning info from incomplete JSON for live preview
                if (accumulated.includes('```json')) {
                  const jsonPart = accumulated.split('```json')[1] || '';
                  const dest = jsonPart.match(/"destination"\s*:\s*"([^"]+)"/)?.[1];
                  const startDate = jsonPart.match(/"startDate"\s*:\s*"([^"]+)"/)?.[1];
                  const endDate = jsonPart.match(/"endDate"\s*:\s*"([^"]+)"/)?.[1];
                  const places = [...jsonPart.matchAll(/"name"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
                  setPlanningData({
                    destination: dest,
                    dates: startDate && endDate ? `${startDate} ~ ${endDate}` : startDate || undefined,
                    places,
                  });
                }

                setStreamingContent(display);
              } else if (event.type === 'itinerary_ready') {
                setItineraryReady(true);
                onItineraryUpdate?.();
              } else if (event.type === 'error') {
                throw new Error(event.message);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }

        setPlanningData(null);
        let finalContent = accumulated.replace(/```json[\s\S]*?```/g, '');
        finalContent = finalContent.replace(/```json[\s\S]*$/g, '').trim();
        if (!finalContent && accumulated.includes('```json')) {
          finalContent = '일정을 만들었어요! 오른쪽 패널에서 확인해보세요 ✈️';
        }
        if (finalContent) {
          const assistantMsg: Message = {
            id: nanoid(),
            tripId,
            role: 'assistant',
            content: finalContent,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
        setStreamingContent('');
      } else {
        const data = await res.json();
        const assistantMsg: Message = {
          id: nanoid(),
          tripId,
          role: 'assistant',
          content: data.message,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (data.itineraryReady) {
          setItineraryReady(true);
          onItineraryUpdate?.();
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      const errMessage = error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.';
      toast.error(errMessage);
      const errorMsg: Message = {
        id: nanoid(),
        tripId,
        role: 'assistant',
        content: `죄송해요, 오류가 발생했어요. ${errMessage}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f7f7f8]">
      {/* Header */}
      <div className="flex-shrink-0 glass border-b border-gray-100/50 px-4 py-3 z-10">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-gray-900">TripTalk</h1>
              <p className="text-[0.65rem] text-gray-400">여행 플래너 AI</p>
            </div>
          </div>
          {itineraryReady && (
            <Button
              size="sm"
              onClick={() => router.push(`/trip/${tripId}`)}
              className="gap-1.5"
            >
              일정 보기
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {streamingContent && (
            <ChatMessage
              message={{
                id: 'streaming',
                tripId,
                role: 'assistant',
                content: streamingContent,
                createdAt: new Date().toISOString(),
              }}
            />
          )}

          {planningData && planningData.places.length > 0 && (
            <PlanningProgress
              destination={planningData.destination}
              dates={planningData.dates}
              places={planningData.places}
            />
          )}

          {isLoading && !streamingContent && !planningData && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Plane className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bubble-assistant bg-white border border-gray-100 px-5 py-4 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-300 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="여행지, 일정, 원하는 것을 알려주세요..."
      />
    </div>
  );
}
