import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { qrUrlSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');
  const parsed = qrUrlSchema.safeParse(rawUrl);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Valid HTTP/HTTPS URL required' },
      { status: 400 }
    );
  }

  // Only allow QR codes for our own domain or localhost
  try {
    const urlObj = new URL(parsed.data);
    const host = request.headers.get('host') || '';
    const isOwnDomain =
      urlObj.host === host ||
      urlObj.hostname === 'localhost' ||
      urlObj.hostname === '127.0.0.1';

    if (!isOwnDomain) {
      return NextResponse.json(
        { error: 'QR codes can only be generated for this domain' },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const svg = await QRCode.toString(parsed.data, {
      type: 'svg',
      margin: 2,
      width: 256,
      color: {
        dark: '#7c3aed',
        light: '#ffffff',
      },
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
