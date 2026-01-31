'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = input.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-gray-100 bg-white/80 backdrop-blur-xl px-4 py-3">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-[0.9rem] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 focus:bg-white disabled:opacity-50 disabled:bg-gray-50 transition-all placeholder:text-gray-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={`absolute right-2 bottom-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              canSend
                ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-center text-[0.65rem] text-gray-400 mt-2 max-w-3xl mx-auto">
        Shift+Enter로 줄바꿈
      </p>
    </div>
  );
}
