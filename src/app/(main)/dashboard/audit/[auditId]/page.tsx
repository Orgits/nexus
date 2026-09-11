import { AuditDetail } from "./_components/audit-detail";

export default async function Page({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = await params;
  return <AuditDetail auditId={auditId} />;
}
