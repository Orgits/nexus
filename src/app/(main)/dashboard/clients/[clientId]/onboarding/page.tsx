import { OnboardingWizard } from "./_components/onboarding-wizard";

export default async function OnboardingPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return <OnboardingWizard clientId={clientId} />;
}
