'use client';

import { Message } from '@/types/trip';
import { Plane } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Plane className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 shadow-sm ${
          isUser
            ? 'bubble-user bg-gray-900 text-white'
            : 'bubble-assistant bg-white text-gray-800 border border-gray-100'
        }`}
      >
        <p className="text-[0.9rem] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
