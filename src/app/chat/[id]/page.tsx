import ChatWindow from '@/components/chat/ChatWindow';

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;

  return (
    <div className="h-dvh flex flex-col bg-white">
      <ChatWindow tripId={id} />
    </div>
  );
}
