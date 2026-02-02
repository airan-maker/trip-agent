export function getBookingSearchUrl(destination: string): string | null {
  const aid = process.env.NEXT_PUBLIC_TP_BOOKING_AID;
  if (!aid) return null;
  return `https://www.booking.com/searchresults.html?aid=${aid}&ss=${encodeURIComponent(destination)}`;
}

export function getGetYourGuideUrl(destination: string): string | null {
  const pid = process.env.NEXT_PUBLIC_TP_GYG_PARTNER_ID;
  if (!pid) return null;
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}&partner_id=${pid}`;
}

export function getKlookSearchUrl(destination: string): string | null {
  const aid = process.env.NEXT_PUBLIC_TP_KLOOK_AID;
  if (!aid) return null;
  return `https://www.klook.com/search/result/?query=${encodeURIComponent(destination)}&aid=${aid}`;
}

export function getAiraloUrl(): string | null {
  const ref = process.env.NEXT_PUBLIC_TP_AIRALO_REF;
  if (!ref) return null;
  return `https://ref.airalo.com/${ref}`;
}
