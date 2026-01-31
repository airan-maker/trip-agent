'use client';

import { Message } from '@/types/trip';
import { Plane } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Plane className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <Card
        className={`max-w-[80%] px-4 py-3 shadow-sm border-0 ${
          isUser
            ? 'bubble-user bg-gray-900 text-white rounded-[20px_20px_6px_20px]'
            : 'bubble-assistant bg-white text-gray-800 border border-gray-100 rounded-[20px_20px_20px_6px]'
        }`}
      >
        <p className="text-[0.9rem] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </Card>
    </motion.div>
  );
}
