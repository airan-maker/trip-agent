'use client';

import { useState } from 'react';
import { Share2, Link2, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

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
      toast.success('링크가 복사되었어요!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      toast.success('링크가 복사되었어요!');
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
          <Button variant="violet" onClick={handleShare} className="rounded-full">
            <Share2 className="w-4 h-4" />
            공유하기
          </Button>
          <Button variant="secondary" onClick={handleCopy} className="rounded-full">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
            {copied ? '복사됨!' : '링크 복사'}
          </Button>
          <Button variant="secondary" onClick={() => setShowQR(true)} className="rounded-full">
            <QrCode className="w-4 h-4" />
            QR
          </Button>
        </div>

        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent onClose={() => setShowQR(false)}>
            <DialogHeader>
              <DialogTitle>QR 코드</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr?url=${encodeURIComponent(shareUrl)}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              QR 코드를 스캔하세요
            </p>
          </DialogContent>
        </Dialog>
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
