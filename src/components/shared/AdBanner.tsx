'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

type AdFormat = 'auto' | 'rectangle' | 'horizontal' | 'vertical';

interface AdBannerProps {
  slot: string;
  format?: AdFormat;
  responsive?: boolean;
  className?: string;
}

/**
 * Google AdSense banner component.
 * Set NEXT_PUBLIC_ADSENSE_CLIENT in env (e.g. "ca-pub-XXXXXXXXXXXXXXXX").
 * Set the ad slot ID via the `slot` prop.
 */
export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet or blocked
    }
  }, [client]);

  // Don't render anything if no client ID configured
  if (!client) return null;

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
