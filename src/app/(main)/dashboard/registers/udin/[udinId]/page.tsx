import { UDINRegisterDetail } from "./_components/udin-register-detail";

export default async function Page({ params }: { params: Promise<{ udinId: string }> }) {
  const { udinId } = await params;
  return <UDINRegisterDetail udinId={udinId} />;
}
