import { ReviewDetail } from "./_components/review-detail";

export default async function Page({ params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  return <ReviewDetail reviewId={reviewId} />;
}
