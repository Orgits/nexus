import { LicenseRegisterDetail } from "./_components/license-register-detail";

export default async function Page({ params }: { params: Promise<{ licenseId: string }> }) {
  const { licenseId } = await params;
  return <LicenseRegisterDetail licenseId={licenseId} />;
}
