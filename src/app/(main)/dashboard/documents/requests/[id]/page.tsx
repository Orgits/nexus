import { DocumentRequestDetail } from "./_components/document-request-detail";

export default async function DocumentRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocumentRequestDetail id={id} />;
}
