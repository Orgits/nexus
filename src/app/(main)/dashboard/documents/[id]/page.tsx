import { DocumentDetail } from "./_components/document-detail";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = await params;
  return <DocumentDetail id={id} />;
}
