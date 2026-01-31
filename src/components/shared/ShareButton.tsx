'use client';

import { useState } from 'react';
import { Share2, Link2, Check, QrCode } from 'lucide-react';

interface ShareButtonProps {
  tripId: string;
  variant?: 'icon' | 'full';
}

export default function ShareButton({ tripId, variant = 'icon' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/trip/${tripId}`
    : `/trip/${tripId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TripTalk 여행 일정',
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  if (variant === 'full') {
    return (
      <div className="space-y-3">
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 bg-violet-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-violet-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            공유하기
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
            {copied ? '복사됨!' : '링크 복사'}
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            QR
          </button>
        </div>
        {showQR && (
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-xl shadow-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr?url=${encodeURIComponent(shareUrl)}`}
                alt="QR Code"
                className="w-48 h-48"
              />
              <p className="text-xs text-gray-400 text-center mt-2">
                QR 코드를 스캔하세요
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
    >
      <Share2 className="w-4 h-4" />
    </button>
  );
}
