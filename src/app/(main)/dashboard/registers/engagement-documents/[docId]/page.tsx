import { EngagementDocumentDetail } from "./_components/engagement-document-detail";

export default async function Page({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = await params;
  return <EngagementDocumentDetail docId={docId} />;
}
