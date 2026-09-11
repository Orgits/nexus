import { ComplianceDetail } from "./_components/compliance-detail";

export default async function ComplianceDetailPage({
  params,
}: {
  params: Promise<{ serviceType: string; cycleId: string }>;
}) {
  const { serviceType, cycleId } = await params;
  return <ComplianceDetail serviceType={serviceType} cycleId={cycleId} />;
}
