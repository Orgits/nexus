"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Building,
  Calendar,
  ChevronLeft,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Key,
  RotateCcw,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { LicenseStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatINR } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import { getLicenseById } from "@/mock-data/registers";
import { getUserById } from "@/mock-data/users";
import type { LicenseRegister } from "@/types";

const licenseTabs = [
  { id: "overview", label: "Overview", icon: Building },
  { id: "renewal", label: "Renewal History", icon: RotateCcw },
  { id: "documents", label: "Documents", icon: FileText },
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

export function LicenseRegisterDetail({ licenseId }: { licenseId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const license = getLicenseById(licenseId);
  if (!license) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Building className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">License not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The license record you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/registers/licenses")}
          className="text-primary hover:underline"
        >
          Back to Licenses Register
        </button>
      </div>
    );
  }

  const client = license.clientId ? getClientById(license.clientId) : undefined;
  const matter = license.matterId ? getMatterById(license.matterId) : undefined;
  const responsibleUser = getUserById(license.responsibleUserId);

  const daysToExpiry = Math.ceil((new Date(license.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysToExpiry <= 60 && daysToExpiry > 0;
  const isExpired = daysToExpiry < 0;

  const allActivities: ActivityItem[] = [
    {
      id: `license-created`,
      type: "system" as const,
      title: `License Registered: ${license.name}`,
      description: `${license.type.replace(/_/g, " ")} • ${license.issuingAuthority} • Reg: ${license.registrationNumber}`,
      user: responsibleUser,
      timestamp: license.createdAt,
      entityUrl: "#",
      status: license.status,
    },
    ...(license.renewalReminderSent
      ? [
          {
            id: `license-reminder`,
            type: "system" as const,
            title: `Renewal Reminder Sent`,
            description: `Reminder sent for license expiry on ${formatDate(license.expiryDate)}`,
            user: responsibleUser,
            timestamp: license.updatedAt,
            entityUrl: "#",
            status: "sent",
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <SectionCard
        title={license.name}
        description={`${license.type.replace(/_/g, " ")} • ${license.issuingAuthority} • Reg: ${license.registrationNumber}`}
        actions={
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/registers/licenses")}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Licenses Register
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-5">
          <StatTile
            label="Status"
            value={<LicenseStatusBadge status={license.status} />}
            icon={<Building className="h-5 w-5" />}
          />
          <StatTile
            label="Type"
            value={<Badge variant="secondary">{license.type.replace(/_/g, " ")}</Badge>}
            icon={<Key className="h-5 w-5" />}
          />
          <StatTile
            label="Expiry"
            value={formatDate(license.expiryDate)}
            hint={isExpiringSoon ? `${daysToExpiry} days left` : isExpired ? "EXPIRED" : undefined}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatTile
            label="Renewal By"
            value={license.renewalDate ? formatDate(license.renewalDate) : "—"}
            icon={<RotateCcw className="h-5 w-5" />}
          />
          <StatTile label="Cost" value={formatINR(license.cost || 0)} icon={<DollarSign className="h-5 w-5" />} />
        </div>
      </SectionCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {licenseTabs.map((tab) => (
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
          <LicenseOverviewTab
            license={license}
            client={client}
            matter={matter}
            responsibleUser={responsibleUser}
            daysToExpiry={daysToExpiry}
            isExpiringSoon={isExpiringSoon}
            isExpired={isExpired}
          />
        </TabsContent>

        <TabsContent value="renewal" className="space-y-6">
          <LicenseRenewalTab license={license} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <LicenseDocumentsTab license={license} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <LicenseActivityTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LicenseOverviewTab({
  license,
  client,
  matter,
  responsibleUser,
  daysToExpiry,
  isExpiringSoon,
  isExpired,
}: {
  license: LicenseRegister;
  client: any;
  matter: any;
  responsibleUser: any;
  daysToExpiry: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="License Details">
          <KeyValueList
            items={[
              { label: "License Name", value: license.name },
              { label: "Type", value: license.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
              { label: "Issuing Authority", value: license.issuingAuthority },
              {
                label: "Registration Number",
                value: <span className="font-mono text-sm">{license.registrationNumber}</span>,
              },
              { label: "Issue Date", value: formatDate(license.issueDate) },
              { label: "Expiry Date", value: formatDate(license.expiryDate) },
              {
                label: "Days to Expiry",
                value: isExpired
                  ? "Expired"
                  : isExpiringSoon
                    ? `${daysToExpiry} days (Expiring Soon)`
                    : `${daysToExpiry} days`,
              },
              { label: "Renewal Date", value: license.renewalDate ? formatDate(license.renewalDate) : "—" },
              { label: "Cost", value: formatINR(license.cost || 0) },
              { label: "Currency", value: license.currency },
              { label: "Auto Renewal", value: license.autoRenewal ? "Enabled" : "Disabled" },
              { label: "Renewal Reminder", value: license.renewalReminderSent ? "Sent" : "Pending" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Responsible & Linked Entities">
          <KeyValueList
            items={[
              { label: "Responsible User", value: responsibleUser?.fullName || "—" },
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

      <SectionCard title="Linked Documents">
        {license.documents.length > 0 ? (
          <div className="space-y-2">
            {license.documents.map((docId, i) => {
              const doc = mockDocuments.find((d) => d.id === docId);
              return doc ? (
                <div key={i} className="flex items-center gap-4 rounded border p-2">
                  <span className="font-medium text-sm">{doc.originalFileName || doc.fileName}</span>
                  <span className="text-muted-foreground text-sm">{doc.category.replace(/_/g, " ")}</span>
                  <span className="text-muted-foreground text-sm">
                    {doc.fileSize < 1024
                      ? `${doc.fileSize} B`
                      : doc.fileSize < 1024 * 1024
                        ? `${(doc.fileSize / 1024).toFixed(1)} KB`
                        : `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                  </span>
                </div>
              ) : (
                <div key={i} className="text-muted-foreground text-sm">
                  Document not found: {docId}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No documents linked to this license</p>
        )}
      </SectionCard>

      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-2">
          {isExpiringSoon && (
            <Button variant="default" size="sm" onClick={() => alert("Initiate renewal process")}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Initiate Renewal
            </Button>
          )}
          {!license.renewalReminderSent && (
            <Button variant="outline" size="sm" onClick={() => alert("Send renewal reminder")}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Send Reminder
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => alert("View renewal checklist")}>
            <FileText className="mr-2 h-4 w-4" />
            View Checklist
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert("View compliance requirements")}>
            <Building className="mr-2 h-4 w-4" />
            Compliance Requirements
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function LicenseRenewalTab({ license }: { license: LicenseRegister }) {
  const daysToExpiry = Math.ceil((new Date(license.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysToExpiry <= 60 && daysToExpiry > 0;
  const isExpired = daysToExpiry < 0;

  return (
    <div className="space-y-6">
      <SectionCard title="Renewal Status">
        <div className="grid gap-4 md:grid-cols-2">
          <KeyValueList
            items={[
              { label: "Current Status", value: <LicenseStatusBadge status={license.status} /> },
              { label: "Expiry Date", value: formatDate(license.expiryDate) },
              { label: "Days Remaining", value: isExpired ? "Expired" : `${daysToExpiry} days` },
              { label: "Renewal Deadline", value: license.renewalDate ? formatDate(license.renewalDate) : "Not set" },
              { label: "Auto Renewal", value: license.autoRenewal ? "Enabled" : "Disabled" },
              { label: "Renewal Reminder", value: license.renewalReminderSent ? "Sent" : "Pending" },
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="Renewal History">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">No previous renewal history recorded for this license.</p>
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
          {!license.renewalReminderSent && (
            <Button variant="outline" size="sm" onClick={() => alert("Send renewal reminder")}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Send Reminder
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => alert("View renewal checklist")}>
            <FileText className="mr-2 h-4 w-4" />
            View Checklist
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert("Download compliance requirements")}>
            <Download className="mr-2 h-4 w-4" />
            Compliance Requirements
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function LicenseDocumentsTab({ license }: { license: LicenseRegister }) {
  const linkedDocs = license.documents
    .map((docId) => mockDocuments.find((d) => d.id === docId))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <div className="space-y-6">
      <SectionCard title="Linked Documents">
        {linkedDocs.length > 0 ? (
          <div className="space-y-2">
            {linkedDocs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.originalFileName || doc.fileName}</p>
                    <p className="text-muted-foreground text-sm">
                      {doc.category.replace(/_/g, " ")} •{" "}
                      {doc.fileSize < 1024
                        ? `${doc.fileSize} B`
                        : doc.fileSize < 1024 * 1024
                          ? `${(doc.fileSize / 1024).toFixed(1)} KB`
                          : `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => alert(`View document ${doc.id}`)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No documents linked to this license</p>
        )}
      </SectionCard>

      <SectionCard title="Required Documents for Renewal">
        <div className="space-y-2">
          {license.type === "shop_establishment" && (
            <>
              <div className="flex items-center justify-between rounded border p-3">
                <span>Previous Shop & Establishment Certificate</span>
                <Badge variant="secondary">Required</Badge>
              </div>
              <div className="flex items-center justify-between rounded border p-3">
                <span>Identity Proof of Proprietor/Partners</span>
                <Badge variant="secondary">Required</Badge>
              </div>
              <div className="flex items-center justify-between rounded border p-3">
                <span>Address Proof of Establishment</span>
                <Badge variant="secondary">Required</Badge>
              </div>
            </>
          )}
          {license.type === "professional_tax" && (
            <>
              <div className="flex items-center justify-between rounded border p-3">
                <span>Previous PT Registration Certificate</span>
                <Badge variant="secondary">Required</Badge>
              </div>
              <div className="flex items-center justify-between rounded border p-3">
                <span>PAN Card of Entity</span>
                <Badge variant="secondary">Required</Badge>
              </div>
            </>
          )}
          {license.type === "fssai" && (
            <>
              <div className="flex items-center justify-between rounded border p-3">
                <span>Previous FSSAI License</span>
                <Badge variant="secondary">Required</Badge>
              </div>
              <div className="flex items-center justify-between rounded border p-3">
                <span>Food Safety Management Plan</span>
                <Badge variant="secondary">Required</Badge>
              </div>
              <div className="flex items-center justify-between rounded border p-3">
                <span>Water Testing Report</span>
                <Badge variant="secondary">Required</Badge>
              </div>
            </>
          )}
          {!["shop_establishment", "professional_tax", "fssai"].includes(license.type) && (
            <p className="text-muted-foreground text-sm">Document requirements vary by license type and jurisdiction</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function LicenseActivityTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}

// Need to import mockDocuments for the documents tab
import { mockDocuments } from "@/mock-data/documents";
