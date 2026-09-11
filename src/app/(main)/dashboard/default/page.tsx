import { KPICards } from "./_components/metric-cards";
import {
  CommunicationFollowups,
  MissingDocuments,
  PendingReviews,
  RecentClients,
  RecentMatters,
  TeamWorkloadSummary,
  UpcomingDeadlines,
  UrgentWork,
} from "./_components/urgent-work";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Daily command centre -{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <KPICards />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <UrgentWork limit={5} />
        <UpcomingDeadlines limit={8} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <MissingDocuments limit={5} />
        <PendingReviews limit={5} />
        <CommunicationFollowups limit={5} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <RecentClients limit={5} />
        <RecentMatters limit={5} />
      </div>

      <TeamWorkloadSummary limit={6} />
    </div>
  );
}
