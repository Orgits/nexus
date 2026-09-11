import { PaymentDetail } from "./_components/payment-detail";

export default async function Page({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  return <PaymentDetail paymentId={paymentId} />;
}
