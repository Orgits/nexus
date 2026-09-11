"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Download,
  Eye,
  FileText,
  Mail,
  PenTool,
  Send,
  X,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { EngagementDocumentStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import { getEngagementDocById } from "@/mock-data/registers";
import type { EngagementDocument } from "@/types";

const engagementTabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "signers", label: "Signers", icon: PenTool },
  { id: "reminders", label: "Reminders", icon: Mail },
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

export function EngagementDocumentDetail({ docId }: { docId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const engagement = getEngagementDocById(docId);
  if (!engagement) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Engagement Document not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The engagement document you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/registers/engagement-documents")}
          className="text-primary hover:underline"
        >
          Back to Engagement Documents
        </button>
      </div>
    );
  }

  const client = getClientById(engagement.clientId);
  const matter = engagement.matterId ? getMatterById(engagement.matterId) : undefined;

  const signedCount = engagement.signers.filter((s) => s.status === "signed").length;
  const pendingCount = engagement.signers.filter((s) => s.status === "pending").length;
  const declinedCount = engagement.signers.filter((s) => s.status === "declined").length;

  const allActivities: ActivityItem[] = [
    {
      id: `engagement-created`,
      type: "system" as const,
      title: `Engagement Document Created: ${engagement.name}`,
      description: `Template: ${engagement.templateId}`,
      timestamp: engagement.createdAt,
      entityUrl: "#",
      status: engagement.status,
    },
    ...(engagement.sentAt
      ? [
          {
            id: `engagement-sent`,
            type: "communication" as const,
            title: `Engagement Document Sent for Signature`,
            description: `Sent to ${engagement.signers.length} signer(s)`,
            timestamp: engagement.sentAt,
            entityUrl: "#",
            status: "sent",
          },
        ]
      : []),
    ...engagement.signers
      .filter((s) => s.signedAt)
      .map((s, i) => ({
        id: `engagement-signed-${i}`,
        type: "system" as const,
        title: `Signed by ${s.name}`,
        description: `Role: ${s.role} • Order: ${s.order}`,
        user: { fullName: s.name, email: s.email },
        timestamp: s.signedAt!,
        entityUrl: "#",
        status: "signed",
      })),
    ...(engagement.completedAt
      ? [
          {
            id: `engagement-completed`,
            type: "system" as const,
            title: `Engagement Document Fully Signed`,
            description: `All signers completed`,
            timestamp: engagement.completedAt,
            entityUrl: "#",
            status: "completed",
          },
        ]
      : []),
    ...engagement.signers
      .filter((s) => s.status === "declined")
      .map((s, i) => ({
        id: `engagement-declined-${i}`,
        type: "system" as const,
        title: `Declined by ${s.name}`,
        description: `Role: ${s.role}`,
        timestamp: engagement.updatedAt,
        entityUrl: "#",
        status: "declined",
      })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <SectionCard
        title={engagement.name}
        description={`Template: ${engagement.templateId}`}
        actions={
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/registers/engagement-documents")}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Engagement Documents
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-5">
          <StatTile
            label="Status"
            value={<EngagementDocumentStatusBadge status={engagement.status} />}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatTile
            label="Signed"
            value={`${signedCount}/${engagement.signers.length}`}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          />
          <StatTile label="Pending" value={String(pendingCount)} icon={<Clock className="h-5 w-5 text-amber-600" />} />
          <StatTile
            label="Declined"
            value={String(declinedCount)}
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          />
          <StatTile label="Reminders" value={String(engagement.reminderCount)} icon={<Mail className="h-5 w-5" />} />
        </div>
      </SectionCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {engagementTabs.map((tab) => (
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
          <EngagementOverviewTab
            engagement={engagement}
            client={client}
            matter={matter}
            signedCount={signedCount}
            pendingCount={pendingCount}
          />
        </TabsContent>

        <TabsContent value="signers" className="space-y-6">
          <EngagementSignersTab engagement={engagement} />
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <EngagementRemindersTab engagement={engagement} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <EngagementActivityTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EngagementOverviewTab({
  engagement,
  client,
  matter,
  signedCount,
  pendingCount,
}: {
  engagement: EngagementDocument;
  client: any;
  matter: any;
  signedCount: number;
  pendingCount: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Document Details">
          <KeyValueList
            items={[
              { label: "Document Name", value: engagement.name },
              { label: "Template ID", value: engagement.templateId },
              { label: "Status", value: <EngagementDocumentStatusBadge status={engagement.status} /> },
              { label: "Sent Date", value: engagement.sentAt ? formatDate(engagement.sentAt) : "—" },
              { label: "Completed Date", value: engagement.completedAt ? formatDate(engagement.completedAt) : "—" },
              { label: "Expired Date", value: engagement.expiredAt ? formatDate(engagement.expiredAt) : "—" },
              { label: "Reminders Sent", value: String(engagement.reminderCount) },
              {
                label: "Last Reminder",
                value: engagement.lastReminderAt ? formatDate(engagement.lastReminderAt) : "—",
              },
              {
                label: "Signed Document",
                value: engagement.signedDocumentId ? (
                  <span className="text-primary hover:underline">View Signed Document</span>
                ) : (
                  "—"
                ),
              },
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
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Signing Progress">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${engagement.signers.length > 0 ? (signedCount / engagement.signers.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="w-24 text-right font-medium text-sm">
              {engagement.signers.length > 0 ? Math.round((signedCount / engagement.signers.length) * 100) : 0}%
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" /> Signed: {signedCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-amber-600" /> Pending: {pendingCount}
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-600" /> Declined:{" "}
              {engagement.signers.filter((s) => s.status === "declined").length}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-2">
          {engagement.status === "pending_signature" || engagement.status === "partially_signed" ? (
            <>
              <Button variant="default" size="sm" onClick={() => alert("Send reminder to pending signers")}>
                <Mail className="mr-2 h-4 w-4" />
                Send Reminder
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Resend to all signers")}>
                <Send className="mr-2 h-4 w-4" />
                Resend Document
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => alert("Create new engagement document")}>
              <FileText className="mr-2 h-4 w-4" />
              Create New
            </Button>
          )}
          {engagement.signedDocumentId && (
            <Button variant="outline" size="sm" onClick={() => alert("Download signed document")}>
              <Download className="mr-2 h-4 w-4" />
              Download Signed
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => alert("View audit trail")}>
            <Eye className="mr-2 h-4 w-4" />
            Audit Trail
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function EngagementSignersTab({ engagement }: { engagement: EngagementDocument }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Signers">
        <div className="space-y-4">
          {engagement.signers.map((signer, _index) => (
            <div key={signer.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                      signer.status === "signed"
                        ? "bg-green-100 text-green-600"
                        : signer.status === "pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : signer.status === "declined"
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600",
                    )}
                  >
                    {signer.status === "signed" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : signer.status === "declined" ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <PenTool className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{signer.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {signer.email} • {signer.role} • Order: {signer.order}
                    </p>
                    {signer.phone && <p className="text-muted-foreground text-sm">{signer.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      signer.status === "signed"
                        ? "default"
                        : signer.status === "pending"
                          ? "secondary"
                          : signer.status === "declined"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {signer.status}
                  </Badge>
                  {signer.signedAt && (
                    <span className="text-muted-foreground text-sm">Signed: {formatDate(signer.signedAt)}</span>
                  )}
                  {signer.ipAddress && (
                    <span className="font-mono text-muted-foreground text-xs">{signer.ipAddress}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Signing Order Visualization">
        <div className="space-y-4">
          {engagement.signers.map((signer, _index) => (
            <div key={signer.id} className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2",
                  signer.status === "signed"
                    ? "border-green-500 bg-green-500 text-white"
                    : signer.status === "pending"
                      ? "border-yellow-500 bg-yellow-500 text-white"
                      : signer.status === "declined"
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-300 bg-gray-100 text-gray-400",
                )}
              >
                {signer.status === "signed" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : signer.status === "declined" ? (
                  <X className="h-5 w-5" />
                ) : (
                  <span className="font-medium text-sm">{signer.order}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {signer.name} <span className="text-muted-foreground text-sm">({signer.role})</span>
                </p>
                <p className="text-muted-foreground text-sm">{signer.email}</p>
              </div>
              <Badge
                variant={
                  signer.status === "signed"
                    ? "default"
                    : signer.status === "pending"
                      ? "secondary"
                      : signer.status === "declined"
                        ? "destructive"
                        : "outline"
                }
              >
                {signer.status}
              </Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function EngagementRemindersTab({ engagement }: { engagement: EngagementDocument }) {
  const pendingSigners = engagement.signers.filter((s) => s.status === "pending");
  const pendingCount = pendingSigners.length;

  return (
    <div className="space-y-6">
      <SectionCard title="Reminder Summary" className="grid gap-4 md:grid-cols-3">
        <StatTile
          label="Total Reminders Sent"
          value={String(engagement.reminderCount)}
          icon={<Mail className="h-5 w-5" />}
        />
        <StatTile
          label="Pending Signers"
          value={String(pendingCount)}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
        />
        <StatTile
          label="Last Reminder"
          value={engagement.lastReminderAt ? formatDate(engagement.lastReminderAt) : "Never"}
          icon={<Calendar className="h-5 w-5" />}
        />
      </SectionCard>

      <SectionCard title="Reminder History">
        <div className="space-y-2">
          {engagement.reminderCount > 0 ? (
            Array.from({ length: engagement.reminderCount }, (_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Reminder #{i + 1}</p>
                  <p className="text-muted-foreground text-sm">
                    {engagement.lastReminderAt
                      ? `Last sent: ${formatDate(engagement.lastReminderAt)}`
                      : "Date not recorded"}
                  </p>
                </div>
                <Badge variant="secondary">Sent</Badge>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-muted-foreground text-sm">No reminders sent yet</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Reminder Actions">
        <div className="flex flex-wrap gap-2">
          {pendingCount > 0 && (
            <>
              <Button variant="default" size="sm" onClick={() => alert("Send reminder to pending signers")}>
                <Mail className="mr-2 h-4 w-4" />
                Send Reminder to {pendingCount} Pending Signer{pendingCount > 1 ? "s" : ""}
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Resend to all pending signers")}>
                <Send className="mr-2 h-4 w-4" />
                Resend to All Pending
              </Button>
            </>
          )}
          {pendingCount === 0 && engagement.status !== "signed" && (
            <Button variant="outline" size="sm" onClick={() => alert("No pending signers")}>
              <Mail className="mr-2 h-4 w-4" />
              No Pending Signers
            </Button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function EngagementActivityTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}
