import { CommunicationDetail } from "./_components/communication-detail";

interface CommunicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CommunicationDetailPage({ params }: CommunicationDetailPageProps) {
  const { id } = await params;
  return <CommunicationDetail id={id} />;
}
