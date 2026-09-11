"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Calendar, CheckCircle, ChevronLeft, Clock, Eye, FileCheck } from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { ClientLink, MatterLink, ObjectLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { Badge as StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getDocumentById } from "@/mock-data/documents";
import { getMatterById } from "@/mock-data/matters";
import { getUDINByClient, getUDINById } from "@/mock-data/registers";
import { getUserById } from "@/mock-data/users";
import type { UDINRegister } from "@/types";

const udinTabs = [
  { id: "overview", label: "Overview", icon: FileCheck },
  { id: "usage", label: "Usage History", icon: Clock },
  { id: "activity", label: "Activity", icon: Clock },
];

interface ActivityItem {
  id: string;
  type:
    | "task"
    | "document"
    | "communication"
    | "review"
    | "matter"
    | "invoice"
    | "payment"
    | "note"
    | "system"
    | "document_request"
    | "workpaper"
    | "query"
    | "signoff";
  title: string;
  description?: string;
  user?: any;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  entityUrl?: string;
  metadata?: Record<string, unknown>;
  status?: string;
}

export function UDINRegisterDetail({ udinId }: { udinId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const udin = getUDINById(udinId);
  if (!udin) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <FileCheck className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">UDIN not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The UDIN record you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/registers/udin")}
          className="text-primary hover:underline"
        >
          Back to UDIN Register
        </button>
      </div>
    );
  }

  const client = getClientById(udin.clientId);
  const matter = udin.matterId ? getMatterById(udin.matterId) : undefined;
  const document = udin.documentId ? getDocumentById(udin.documentId) : undefined;
  const generatedBy = getUserById(udin.generatedBy);

  const clientUDINs = getUDINByClient(udin.clientId);

  const allActivities: ActivityItem[] = [
    {
      id: `udin-generated`,
      type: "system" as const,
      title: `UDIN Generated: ${udin.udin}`,
      description: `${udin.certificateType} • FY ${udin.financialYear}`,
      user: generatedBy,
      timestamp: udin.generatedDate,
      entityUrl: "#",
      status: udin.status,
    },
    ...(udin.usedAt
      ? [
          {
            id: `udin-used`,
            type: "system" as const,
            title: `UDIN Used`,
            description: `Used for: ${udin.usedFor || "Filing"}`,
            timestamp: udin.usedAt,
            entityUrl: "#",
            status: "used",
          },
        ]
      : []),
    ...(udin.status === "cancelled"
      ? [
          {
            id: `udin-cancelled`,
            type: "system" as const,
            title: `UDIN Cancelled`,
            description: "UDIN was cancelled before use",
            timestamp: udin.updatedAt,
            entityUrl: "#",
            status: "cancelled",
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <SectionCard
        title={`UDIN ${udin.udin}`}
        description={`${udin.certificateType} • FY ${udin.financialYear}`}
        actions={
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/registers/udin")}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to UDIN Register
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <StatTile
            label="Status"
            value={
              <StatusBadge
                variant={
                  udin.status === "used"
                    ? "default"
                    : udin.status === "generated"
                      ? "secondary"
                      : udin.status === "cancelled"
                        ? "destructive"
                        : "outline"
                }
              >
                {udin.status}
              </StatusBadge>
            }
            icon={<FileCheck className="h-5 w-5" />}
          />
          <StatTile label="FY" value={udin.financialYear} icon={<Calendar className="h-5 w-5" />} />
          <StatTile label="Generated" value={formatDate(udin.generatedDate)} icon={<Clock className="h-5 w-5" />} />
          <StatTile
            label="Used"
            value={udin.usedAt ? formatDate(udin.usedAt) : "Not used"}
            icon={<Eye className="h-5 w-5" />}
          />
        </div>
      </SectionCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {udinTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <UDINOverviewTab
            udin={udin}
            client={client}
            matter={matter}
            document={document}
            generatedBy={generatedBy}
            clientUDINs={clientUDINs}
          />
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <UDINUsageTab udin={udin} clientUDINs={clientUDINs} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <UDINActivityTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UDINOverviewTab({
  udin,
  client,
  matter,
  document,
  generatedBy,
  clientUDINs,
}: {
  udin: UDINRegister;
  client: any;
  matter: any;
  document: any;
  generatedBy: any;
  clientUDINs: any[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Certificate Details">
          <KeyValueList
            items={[
              { label: "UDIN", value: <span className="font-medium font-mono">{udin.udin}</span> },
              { label: "Certificate Type", value: udin.certificateType },
              { label: "Financial Year", value: udin.financialYear },
              { label: "Generated Date", value: formatDate(udin.generatedDate) },
              { label: "Generated By", value: generatedBy?.fullName || "—" },
              {
                label: "Status",
                value: (
                  <StatusBadge
                    variant={
                      udin.status === "used"
                        ? "default"
                        : udin.status === "generated"
                          ? "secondary"
                          : udin.status === "cancelled"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {udin.status}
                  </StatusBadge>
                ),
              },
              { label: "Used Date", value: udin.usedAt ? formatDate(udin.usedAt) : "—" },
              { label: "Used For", value: udin.usedFor || "—" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Linked Entities">
          <KeyValueList
            items={[
              { label: "Client", value: client ? <ClientLink client={client} showStatus={true} /> : "—" },
              {
                label: "Matter",
                value: matter ? (
                  <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />
                ) : (
                  "—"
                ),
              },
              {
                label: "Document",
                value: document ? (
                  <ObjectLink href={`/dashboard/documents/${document.id}`} label={document.originalFileName} />
                ) : (
                  "—"
                ),
              },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="All Client UDINs">
        <div className="space-y-2">
          {clientUDINs.map((u, i) => (
            <div key={i} className="flex items-center gap-4 rounded border p-2">
              <span className="font-mono text-sm">{u.udin}</span>
              <StatusBadge
                variant={
                  u.status === "used"
                    ? "default"
                    : u.status === "generated"
                      ? "secondary"
                      : u.status === "cancelled"
                        ? "destructive"
                        : "outline"
                }
                className="text-xs"
              >
                {u.status}
              </StatusBadge>
              <span className="text-muted-foreground text-sm">
                {u.certificateType} • FY {u.financialYear}
              </span>
              <span className="text-muted-foreground text-sm">{formatDate(u.generatedDate)}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function UDINUsageTab({ udin, clientUDINs }: { udin: UDINRegister; clientUDINs: any[] }) {
  const usedUDINs = clientUDINs.filter((u) => u.status === "used");
  const generatedUDINs = clientUDINs.filter((u) => u.status === "generated");
  const _cancelledUDINs = clientUDINs.filter((u) => u.status === "cancelled");

  return (
    <div className="space-y-6">
      <SectionCard title="Usage Summary" className="grid gap-4 md:grid-cols-3">
        <StatTile label="Total UDINs" value={clientUDINs.length} icon={<FileCheck className="h-5 w-5" />} />
        <StatTile label="Used" value={usedUDINs.length} icon={<CheckCircle className="h-5 w-5 text-green-600" />} />
        <StatTile label="Pending" value={generatedUDINs.length} icon={<Clock className="h-5 w-5 text-amber-600" />} />
      </SectionCard>

      <SectionCard title="Usage History">
        <div className="space-y-2">
          {usedUDINs.map((u, i) => (
            <div key={i} className="rounded-lg border bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <span className="font-medium font-mono">{u.udin}</span>
                <StatusBadge variant="default" className="text-xs">
                  Used
                </StatusBadge>
              </div>
              <p className="text-muted-foreground text-sm">
                {u.certificateType} • FY {u.financialYear}
              </p>
              <p className="text-muted-foreground text-sm">
                Used: {u.usedAt ? formatDate(u.usedAt) : "—"} • {u.usedFor || "Filing"}
              </p>
            </div>
          ))}
          {usedUDINs.length === 0 && (
            <p className="py-4 text-center text-muted-foreground text-sm">No UDINs used yet</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function UDINActivityTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}
