import { NoticeDetail } from "./_components/notice-detail";

export default async function Page({ params }: { params: Promise<{ noticeId: string }> }) {
  const { noticeId } = await params;
  return <NoticeDetail noticeId={noticeId} />;
}
