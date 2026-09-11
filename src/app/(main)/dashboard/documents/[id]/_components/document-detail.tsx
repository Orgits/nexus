"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  FileText,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Shield as ShieldIcon,
  Smartphone,
  Tag,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { DocumentRecordHeader } from "@/components/ca-nexus/record-header";
import { CommunicationStatusBadge, PriorityBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime, formatFileSize } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getCommunicationsByDocument } from "@/mock-data/communications";
import { getDocumentById } from "@/mock-data/documents";
import { getMatterById, getTasksByDocument } from "@/mock-data/matters";
import { getUserById } from "@/mock-data/users";
import type { Communication, Document, Task } from "@/types";

const documentTabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "metadata", label: "Metadata", icon: Tag },
  { id: "classification", label: "Classification", icon: ShieldIcon },
  { id: "linked", label: "Linked", icon: FileText },
  { id: "activity", label: "Activity", icon: Clock },
];

export function DocumentDetail({ id }: { id: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const document = getDocumentById(id);
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Document not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The document you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/documents")}
          className="text-primary hover:underline"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  const client = document.clientId ? getClientById(document.clientId) : undefined;
  const matter = document.matterId ? getMatterById(document.matterId) : undefined;
  const uploadedBy = getUserById(document.uploadedById);
  const communications = getCommunicationsByDocument(id);
  const tasks = getTasksByDocument(id);

  const handleTaskClick = (task: Task) => router.push(`/dashboard/tasks/${task.id}`);
  const handleCommunicationClick = (comm: Communication) => router.push(`/dashboard/communications/${comm.id}`);
  const handleMatterClick = () => matter && router.push(`/dashboard/matters/${matter.id}`);
  const handleClientClick = () => client && router.push(`/dashboard/clients/${client.id}`);

  return (
    <div className="space-y-6">
      <DocumentRecordHeader
        document={document}
        client={client}
        matter={matter}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => alert(`Download ${document.originalFileName}`)}>
              <Download className="mr-1.5 h-4 w-4" />
              Download
            </Button>
            <Button size="sm" onClick={() => alert("Share document")}>
              <Share className="mr-1.5 h-4 w-4" />
              Share
            </Button>
            <Button size="sm" variant="ghost" onClick={() => alert("More actions")}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {documentTabs.map((tab) => (
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
          <DocumentOverviewTab
            document={document}
            client={client}
            matter={matter}
            uploadedBy={uploadedBy}
            communications={communications}
            tasks={tasks}
            onMatterClick={handleMatterClick}
            onClientClick={handleClientClick}
          />
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <DocumentMetadataTab document={document} />
        </TabsContent>

        <TabsContent value="classification" className="space-y-6">
          <DocumentClassificationTab document={document} />
        </TabsContent>

        <TabsContent value="linked" className="space-y-6">
          <DocumentLinkedTab
            document={document}
            client={client}
            matter={matter}
            communications={communications}
            tasks={tasks}
            onCommunicationClick={handleCommunicationClick}
            onTaskClick={handleTaskClick}
            onMatterClick={handleMatterClick}
            onClientClick={handleClientClick}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <DocumentActivityTab document={document} communications={communications} tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Share } from "lucide-react";

function DocumentOverviewTab({
  document,
  client,
  matter,
  uploadedBy,
  communications,
  tasks,
}: {
  document: Document;
  client: any;
  matter: any;
  uploadedBy: any;
  communications: Communication[];
  tasks: Task[];
  onMatterClick?: () => void;
  onClientClick?: () => void;
}) {
  const pendingTasks = tasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && new Date(t.dueDate) < new Date());

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Status"
          value={<Badge variant={document.isConfidential ? "destructive" : "outline"}>Uploaded</Badge>}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile label="Size" value={formatFileSize(document.fileSize)} icon={<FileText className="h-5 w-5" />} />
        <StatTile
          label="Linked Tasks"
          value={tasks.length}
          hint={
            overdueTasks.length > 0
              ? `${overdueTasks.length} overdue`
              : pendingTasks.length > 0
                ? `${pendingTasks.length} pending`
                : undefined
          }
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile label="Communications" value={communications.length} icon={<FileText className="h-5 w-5" />} />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Document Details">
          <KeyValueList
            items={[
              { label: "Document Number", value: document.documentNumber },
              { label: "File Name", value: document.fileName },
              { label: "Original Name", value: document.originalFileName },
              {
                label: "Category",
                value: (
                  <Badge variant="secondary" className="capitalize">
                    {document.category.replace(/_/g, " ")}
                  </Badge>
                ),
              },
              { label: "Type", value: <span className="capitalize">{document.documentType.replace(/_/g, " ")}</span> },
              { label: "MIME Type", value: document.mimeType },
              { label: "File Size", value: formatFileSize(document.fileSize) },
              { label: "Version", value: `v${document.version}` },
              { label: "Latest Version", value: document.isLatestVersion ? "Yes" : "No" },
              {
                label: "Confidential",
                value: (
                  <Badge variant={document.isConfidential ? "destructive" : "outline"}>
                    {document.isConfidential ? "Yes" : "No"}
                  </Badge>
                ),
              },
              {
                label: "Tags",
                value:
                  document.tags.length > 0
                    ? document.tags.map((t) => (
                        <Badge key={t} variant="outline" className="mr-1">
                          {t}
                        </Badge>
                      ))
                    : "—",
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Upload & Security">
          <KeyValueList
            items={[
              { label: "Uploaded By", value: uploadedBy ? uploadedBy.fullName : "—" },
              { label: "Uploaded At", value: formatDateTime(document.createdAt) },
              { label: "Updated At", value: formatDateTime(document.updatedAt) },
              {
                label: "OCR Status",
                value: (
                  <Badge
                    variant={
                      document.ocrStatus === "completed"
                        ? "default"
                        : document.ocrStatus === "processing"
                          ? "secondary"
                          : document.ocrStatus === "failed"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {document.ocrStatus === "completed" && <Eye className="mr-1 h-3 w-3" />}
                    {document.ocrStatus === "pending" && <AlertTriangle className="mr-1 h-3 w-3" />}
                    {document.ocrStatus === "processing" && <Clock className="mr-1 h-3 w-3 animate-spin" />}
                    {document.ocrStatus.replace(/_/g, " ")}
                  </Badge>
                ),
              },
              {
                label: "Virus Scan",
                value: (
                  <Badge
                    variant={
                      document.virusScanStatus === "clean"
                        ? "default"
                        : document.virusScanStatus === "infected"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    <ShieldIcon
                      className={`mr-1 h-3 w-3 ${document.virusScanStatus === "clean" ? "text-green-600" : document.virusScanStatus === "infected" ? "text-red-600" : ""}`}
                    />
                    {document.virusScanStatus}
                  </Badge>
                ),
              },
              {
                label: "Virus Scanned At",
                value: document.virusScannedAt ? formatDateTime(document.virusScannedAt) : "—",
              },
              {
                label: "Retention",
                value: document.retentionPolicy
                  ? `${document.retentionPolicy.retentionYears} years (${document.retentionPolicy.disposalAction})`
                  : "—",
              },
              { label: "Legal Basis", value: document.retentionPolicy?.legalBasis || "—" },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Client & Matter">
        <div className="grid gap-4 md:grid-cols-2">
          {client && <ClientLink client={client} showStatus={true} />}
          {matter && <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />}
        </div>
      </SectionCard>

      {document.ocrText && (
        <SectionCard title="OCR Extracted Text">
          <div className="max-h-64 overflow-y-auto rounded-lg border bg-muted/30 p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{document.ocrText}</pre>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function DocumentMetadataTab({ document }: { document: Document }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Core Metadata">
        <KeyValueList
          items={[
            { label: "Document Number", value: document.documentNumber },
            { label: "File Name", value: document.fileName },
            { label: "Original File Name", value: document.originalFileName },
            { label: "File Size", value: formatFileSize(document.fileSize) },
            { label: "MIME Type", value: document.mimeType },
            { label: "Category", value: document.category },
            { label: "Document Type", value: document.documentType },
            { label: "Version", value: document.version },
            { label: "Previous Version", value: document.previousVersionId || "—" },
            { label: "Is Latest", value: document.isLatestVersion ? "Yes" : "No" },
            { label: "Tags", value: document.tags.join(", ") || "—" },
            { label: "Confidential", value: document.isConfidential ? "Yes" : "No" },
            { label: "Client ID", value: document.clientId },
            { label: "Matter ID", value: document.matterId || "—" },
            { label: "Task ID", value: document.taskId || "—" },
            { label: "Compliance Cycle ID", value: document.complianceCycleId || "—" },
            { label: "Source Communication ID", value: document.sourceCommunicationId || "—" },
            { label: "Uploaded By", value: document.uploadedById },
            { label: "Created At", value: document.createdAt },
            { label: "Updated At", value: document.updatedAt },
          ]}
        />
      </SectionCard>

      {document.metadata && Object.keys(document.metadata).length > 0 && (
        <SectionCard title="Custom Metadata">
          <KeyValueList
            items={Object.entries(document.metadata).map(([key, value]) => ({
              label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              value: String(value),
            }))}
          />
        </SectionCard>
      )}

      <SectionCard title="Retention Policy">
        {document.retentionPolicy ? (
          <KeyValueList
            items={[
              { label: "Retention Years", value: document.retentionPolicy.retentionYears },
              { label: "Disposal Action", value: document.retentionPolicy.disposalAction },
              { label: "Legal Basis", value: document.retentionPolicy.legalBasis || "—" },
            ]}
          />
        ) : (
          <p className="text-muted-foreground">No retention policy configured</p>
        )}
      </SectionCard>
    </div>
  );
}

function DocumentClassificationTab({ document }: { document: Document }) {
  if (!document.classification) {
    return (
      <EmptyState
        icon={<ShieldIcon className="h-12 w-12 text-muted-foreground/50" />}
        title="No classification data"
        description="This document has not been classified yet. Run AI classification to extract document type and fields."
        action={
          <Button size="sm" onClick={() => alert("Run classification")}>
            <ShieldIcon className="mr-2 h-4 w-4" />
            Classify Document
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard title="AI Classification Results" className="grid gap-4 md:grid-cols-3">
        <StatTile
          label="Document Type"
          value={<span className="capitalize">{document.classification.documentType.replace(/_/g, " ")}</span>}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile
          label="Confidence"
          value={`${(document.classification.confidence * 100).toFixed(1)}%`}
          icon={<Target className="h-5 w-5" />}
        />
        <StatTile
          label="Classified By"
          value={document.classification.classifiedBy === "ai" ? "AI" : "Manual"}
          icon={<Bot className="h-5 w-5" />}
        />
      </SectionCard>

      <SectionCard title="Extracted Fields">
        {document.classification.extractedFields && Object.keys(document.classification.extractedFields).length > 0 ? (
          <KeyValueList
            items={Object.entries(document.classification.extractedFields).map(([key, value]) => ({
              label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              value: String(value),
            }))}
          />
        ) : (
          <p className="text-muted-foreground">No fields extracted</p>
        )}
      </SectionCard>

      <SectionCard title="Classification Metadata">
        <KeyValueList
          items={[
            { label: "Classified At", value: formatDateTime(document.classification.classifiedAt) },
            {
              label: "Classified By",
              value: document.classification.classifiedBy === "ai" ? "AI Model" : "Manual Review",
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function DocumentLinkedTab({
  document,
  client,
  matter,
  communications,
  tasks,
  onCommunicationClick,
  onTaskClick,
}: {
  document: Document;
  client: any;
  matter: any;
  communications: Communication[];
  tasks: Task[];
  onCommunicationClick: (comm: Communication) => void;
  onTaskClick: (task: Task) => void;
  onMatterClick?: () => void;
  onClientClick?: () => void;
}) {
  return (
    <div className="space-y-6">
      {client && (
        <SectionCard title="Linked Client">
          <ClientLink client={client} showStatus={true} />
        </SectionCard>
      )}

      {matter && (
        <SectionCard title="Linked Matter">
          <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />
        </SectionCard>
      )}

      {communications.length > 0 && (
        <SectionCard title={`Communications (${communications.length})`}>
          <DataTable<Communication>
            data={communications}
            columns={
              [
                {
                  accessorKey: "communicationNumber",
                  header: "ID",
                  cell: ({ row }: { row: { original: Communication } }) => (
                    <span className="font-medium text-sm">{row.original.communicationNumber}</span>
                  ),
                },
                {
                  accessorKey: "subject",
                  header: "Subject",
                  cell: ({ row }: { row: { original: Communication } }) => (
                    <p className="font-medium text-sm">{row.original.subject || row.original.content.slice(0, 60)}</p>
                  ),
                },
                {
                  accessorKey: "channel",
                  header: "Channel",
                  cell: ({ row }: { row: { original: Communication } }) => (
                    <Badge variant="secondary" className="gap-1">
                      {row.original.channel === "email" && <Mail className="h-3 w-3" />}
                      {row.original.channel === "whatsapp" && <MessageSquare className="h-3 w-3" />}
                      {row.original.channel === "sms" && <Smartphone className="h-3 w-3" />}
                      {row.original.channel.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "direction",
                  header: "Direction",
                  cell: ({ row }: { row: { original: Communication } }) => (
                    <Badge variant="outline" className="capitalize">
                      {row.original.direction}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: Communication } }) => (
                    <CommunicationStatusBadge status={row.original.status} />
                  ),
                },
                {
                  accessorKey: "sentAt",
                  header: "Sent",
                  cell: ({ row }: { row: { original: Communication } }) => (
                    <span className="text-sm">{row.original.sentAt ? formatDateTime(row.original.sentAt) : "—"}</span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No communications"
            rowActions={[{ label: "View", action: onCommunicationClick }]}
          />
        </SectionCard>
      )}

      {tasks.length > 0 && (
        <SectionCard title={`Linked Tasks (${tasks.length})`}>
          <DataTable<Task>
            data={tasks}
            columns={
              [
                {
                  accessorKey: "title",
                  header: "Task",
                  cell: ({ row }: { row: { original: Task } }) => <p className="font-medium">{row.original.title}</p>,
                },
                {
                  accessorKey: "taskNumber",
                  header: "ID",
                  cell: ({ row }: { row: { original: Task } }) => (
                    <span className="text-muted-foreground text-sm">{row.original.taskNumber}</span>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: Task } }) => <TaskStatusBadge status={row.original.status} />,
                },
                {
                  accessorKey: "priority",
                  header: "Priority",
                  cell: ({ row }: { row: { original: Task } }) => <PriorityBadge priority={row.original.priority} />,
                },
                {
                  accessorKey: "dueDate",
                  header: "Due",
                  cell: ({ row }: { row: { original: Task } }) => (
                    <span className="text-sm">{formatDate(row.original.dueDate)}</span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No linked tasks"
            rowActions={[{ label: "View", action: onTaskClick }]}
          />
        </SectionCard>
      )}

      {document.complianceCycleId && (
        <SectionCard title="Compliance Cycle">
          <Badge variant="secondary">Linked to Compliance Cycle: {document.complianceCycleId}</Badge>
        </SectionCard>
      )}

      {communications.length === 0 && tasks.length === 0 && !client && !matter && !document.complianceCycleId && (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No linked entities"
          description="This document is not linked to any client, matter, tasks, communications, or compliance cycles."
        />
      )}
    </div>
  );
}

function DocumentActivityTab({
  document,
  communications,
  tasks,
}: {
  document: Document;
  communications: Communication[];
  tasks: Task[];
}) {
  const allActivities = [
    {
      id: `doc-upload`,
      type: "document" as const,
      title: `Document uploaded: ${document.originalFileName}`,
      description: `Uploaded by ${getUserById(document.uploadedById)?.fullName || document.uploadedById}`,
      timestamp: document.createdAt,
      entityUrl: "#",
    },
    ...communications.map((c) => ({
      id: `comm-${c.id}`,
      type: "communication" as const,
      title: c.subject || c.content.slice(0, 60),
      description: `${c.channel.toUpperCase()} • ${c.direction} • ${c.status}`,
      timestamp: c.sentAt || c.createdAt,
      entityUrl: `/dashboard/communications/${c.id}`,
    })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task" as const,
      title: `Task ${t.taskNumber}: ${t.title}`,
      description: `Status: ${t.status.replace(/_/g, " ")}`,
      timestamp: t.updatedAt,
      entityUrl: `/dashboard/tasks/${t.id}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={allActivities} grouped maxItems={50} />
    </SectionCard>
  );
}

import { Bot, Target } from "lucide-react";
