import { PhysicalFileDetail } from "./_components/physical-file-detail";

export default async function PhysicalFileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PhysicalFileDetail id={id} />;
}
