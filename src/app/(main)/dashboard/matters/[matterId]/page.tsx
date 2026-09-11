import { MatterDetail } from "./_components/matter-detail";

export default async function MatterDetailPage({ params }: { params: Promise<{ matterId: string }> }) {
  const { matterId } = await params;
  return <MatterDetail matterId={matterId} />;
}
