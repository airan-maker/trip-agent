import { Metadata } from 'next';
import ChatPageClient from './ChatPageClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatPageClient tripId={id} />;
}
