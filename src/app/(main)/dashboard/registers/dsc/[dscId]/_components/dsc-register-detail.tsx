"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  Clock,
  Download,
  Eye,
  Key,
  Lock,
  RotateCcw,
  Shield,
  UserCheck,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { ClientLink, ObjectLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { DSCStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getDSCById } from "@/mock-data/registers";
import { getUserById } from "@/mock-data/users";
import type { DSCRegister } from "@/types";

const dscTabs = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "renewal", label: "Renewal History", icon: RotateCcw },
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

export function DSCRegisterDetail({ dscId }: { dscId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const dsc = getDSCById(dscId);
  if (!dsc) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Shield className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">DSC not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The DSC record you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/registers/dsc")}
          className="text-primary hover:underline"
        >
          Back to DSC Register
        </button>
      </div>
    );
  }

  const client =
    dsc.holderType === "company" || dsc.holderType === "llp"
      ? dsc.holderId
        ? getClientById(dsc.holderId)
        : undefined
      : undefined;
  const custodian = getUserById(dsc.custodianId);
  const holderUser =
    dsc.holderType === "partner" || dsc.holderType === "director" || dsc.holderType === "authorized_signatory"
      ? dsc.holderId
        ? getUserById(dsc.holderId)
        : undefined
      : undefined;

  const daysToExpiry = Math.ceil((new Date(dsc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry > 0;
  const isExpired = daysToExpiry < 0;

  const allActivities: ActivityItem[] = [
    {
      id: `dsc-created`,
      type: "system" as const,
      title: `DSC Registered: ${dsc.holderName}`,
      description: `${dsc.certificateType.toUpperCase()} • ${dsc.certifyingAuthority} • Serial: ${dsc.serialNumber}`,
      user: custodian,
      timestamp: dsc.createdAt,
      entityUrl: "#",
      status: dsc.status,
    },
    ...(dsc.renewalReminderSent
      ? [
          {
            id: `dsc-reminder`,
            type: "system" as const,
            title: `Renewal Reminder Sent`,
            description: `Reminder sent for DSC expiry on ${formatDate(dsc.expiryDate)}`,
            user: custodian,
            timestamp: dsc.updatedAt,
            entityUrl: "#",
            status: "sent",
          },
        ]
      : []),
    ...(dsc.renewedFromId
      ? [
          {
            id: `dsc-renewed`,
            type: "system" as const,
            title: `DSC Renewed`,
            description: `Renewed from previous certificate`,
            timestamp: dsc.issuedDate,
            entityUrl: "#",
            status: "renewed",
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <SectionCard
        title={dsc.holderName}
        description={`${dsc.certificateType.toUpperCase()} • ${dsc.certifyingAuthority} • Serial: ${dsc.serialNumber}`}
        actions={
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/registers/dsc")}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to DSC Register
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <StatTile
            label="Status"
            value={<DSCStatusBadge status={dsc.status} />}
            icon={<Shield className="h-5 w-5" />}
          />
          <StatTile
            label="Type"
            value={<Badge variant="secondary">{dsc.certificateType.toUpperCase()}</Badge>}
            icon={<Lock className="h-5 w-5" />}
          />
          <StatTile
            label="Token"
            value={<Badge variant="outline">{dsc.tokenType.replace(/_/g, " ")}</Badge>}
            icon={<Key className="h-5 w-5" />}
          />
          <StatTile
            label="Expiry"
            value={formatDate(dsc.expiryDate)}
            hint={isExpiringSoon ? `${daysToExpiry} days left` : isExpired ? "EXPIRED" : undefined}
            icon={<Calendar className="h-5 w-5" />}
          />
        </div>
      </SectionCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {dscTabs.map((tab) => (
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
          <DSCOverviewTab
            dsc={dsc}
            client={client}
            custodian={custodian}
            holderUser={holderUser}
            daysToExpiry={daysToExpiry}
            isExpiringSoon={isExpiringSoon}
            isExpired={isExpired}
          />
        </TabsContent>

        <TabsContent value="renewal" className="space-y-6">
          <DSCRenewalTab dsc={dsc} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <DSCActivityTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DSCOverviewTab({
  dsc,
  client,
  custodian,
  holderUser,
  daysToExpiry,
  isExpiringSoon,
  isExpired,
}: {
  dsc: DSCRegister;
  client: any;
  custodian: any;
  holderUser: any;
  daysToExpiry: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Certificate Details">
          <KeyValueList
            items={[
              { label: "Holder Name", value: dsc.holderName },
              {
                label: "Holder Type",
                value: dsc.holderType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              },
              { label: "Certifying Authority", value: dsc.certifyingAuthority },
              { label: "Certificate Type", value: dsc.certificateType.toUpperCase() },
              { label: "Serial Number", value: dsc.serialNumber },
              { label: "Token Type", value: dsc.tokenType.replace(/_/g, " ") },
              { label: "Issued Date", value: formatDate(dsc.issuedDate) },
              { label: "Expiry Date", value: formatDate(dsc.expiryDate) },
              {
                label: "Days to Expiry",
                value: isExpired
                  ? "Expired"
                  : isExpiringSoon
                    ? `${daysToExpiry} days (Expiring Soon)`
                    : `${daysToExpiry} days`,
              },
              { label: "Physical Location", value: dsc.physicalLocation || "—" },
              { label: "PIN Set", value: dsc.pin ? "Yes (Set)" : "No" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Custodian & Holder">
          <KeyValueList
            items={[
              { label: "Custodian", value: custodian?.fullName || "—" },
              { label: "Holder User", value: holderUser?.fullName || "—" },
              { label: "Renewal Reminder", value: dsc.renewalReminderSent ? "Sent" : "Not Sent" },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Linked Entities">
        <div className="grid gap-4 md:grid-cols-3">
          {client && <ClientLink client={client} showStatus={true} />}
          {custodian && (
            <ObjectLink
              href={`/dashboard/users/${custodian.id}`}
              label={custodian.fullName}
              icon={<UserCheck className="h-4 w-4" />}
            />
          )}
          {holderUser && (
            <ObjectLink
              href={`/dashboard/users/${holderUser.id}`}
              label={holderUser.fullName}
              icon={<UserCheck className="h-4 w-4" />}
            />
          )}
        </div>
      </SectionCard>

      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => alert("Download certificate")}>
            <Download className="mr-2 h-4 w-4" />
            Download Certificate
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert("View certificate details")}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert("Initiate renewal process")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Initiate Renewal
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function DSCRenewalTab({ dsc }: { dsc: DSCRegister }) {
  const daysToExpiry = Math.ceil((new Date(dsc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry > 0;
  const isExpired = daysToExpiry < 0;

  return (
    <div className="space-y-6">
      <SectionCard title="Renewal Status">
        <div className="grid gap-4 md:grid-cols-2">
          <KeyValueList
            items={[
              { label: "Current Status", value: <DSCStatusBadge status={dsc.status} /> },
              { label: "Expiry Date", value: formatDate(dsc.expiryDate) },
              { label: "Days Remaining", value: isExpired ? "Expired" : `${daysToExpiry} days` },
              { label: "Renewal Reminder", value: dsc.renewalReminderSent ? "Sent" : "Pending" },
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="Renewal History">
        <div className="space-y-4">
          {dsc.renewedFromId ? (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="font-medium">Renewed from previous certificate</p>
              <p className="text-muted-foreground text-sm">Previous DSC ID: {dsc.renewedFromId}</p>
              <p className="text-muted-foreground text-sm">Renewal Date: {formatDate(dsc.issuedDate)}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No previous renewal history</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Renewal Actions">
        <div className="flex flex-wrap gap-2">
          {isExpiringSoon && (
            <Button variant="default" size="sm" onClick={() => alert("Initiate renewal process")}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Initiate Renewal Now
            </Button>
          )}
          {!dsc.renewalReminderSent && (
            <Button variant="outline" size="sm" onClick={() => alert("Send renewal reminder")}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Send Reminder
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => alert("View renewal checklist")}>
            <Shield className="mr-2 h-4 w-4" />
            View Checklist
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function DSCActivityTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}
