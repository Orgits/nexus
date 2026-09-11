import { TeamDetail } from "./_components/team-detail";

export default async function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return <TeamDetail teamId={teamId} />;
}
