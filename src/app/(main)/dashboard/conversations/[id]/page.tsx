import { ConversationDetail } from "./_components/conversation-detail";

interface ConversationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationDetailPage({ params }: ConversationDetailPageProps) {
  const { id } = await params;
  return <ConversationDetail id={id} />;
}
