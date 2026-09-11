import { DSCRegisterDetail } from "./_components/dsc-register-detail";

export default async function Page({ params }: { params: Promise<{ dscId: string }> }) {
  const { dscId } = await params;
  return <DSCRegisterDetail dscId={dscId} />;
}
