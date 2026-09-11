import { CampaignDetail } from "./_components/campaign-detail";

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;
  return <CampaignDetail id={id} />;
}
