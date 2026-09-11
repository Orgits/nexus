"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  Clock,
  FileText,
  Forward,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  Reply,
  Smartphone,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { CommunicationRecordHeader } from "@/components/ca-nexus/record-header";
import { CommunicationStatusBadge, PriorityBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { daysOverdue, formatDate, formatDateTime, formatFileSize } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getCommunicationById } from "@/mock-data/communications";
import { getDocumentsByConversation } from "@/mock-data/documents";
import { getMatterById, getTasksByConversation } from "@/mock-data/matters";
import { getUserById } from "@/mock-data/users";
import type { Communication, CommunicationAttachment, Document, Task } from "@/types";

import { CreateTaskFromCommunicationDialog } from "./create-task-dialog";

const communicationTabs = [
  { id: "overview", label: "Overview", icon: Mail },
  { id: "thread", label: "Thread", icon: MessageSquare },
  { id: "attachments", label: "Attachments", icon: Paperclip },
  { id: "linked", label: "Linked", icon: FileText },
  { id: "activity", label: "Activity", icon: Clock },
];

export function CommunicationDetail({ id }: { id: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [_showFullContent, _setShowFullContent] = useState(false);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);

  const communication = getCommunicationById(id);
  if (!communication) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Mail className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Communication not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The communication you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/communications")}
          className="text-primary hover:underline"
        >
          Back to Communications
        </button>
      </div>
    );
  }

  const client = communication.clientId ? getClientById(communication.clientId) : undefined;
  const matter = communication.matterId ? getMatterById(communication.matterId) : undefined;
  const documents = getDocumentsByConversation(id);
  const tasks = getTasksByConversation(id);
  const fromUser = getUserById(communication.from.id);
  const toUsers = communication.to.map((p) => getUserById(p.id)).filter(Boolean);
  const ccUsers = communication.cc?.map((p) => getUserById(p.id)).filter(Boolean) ?? [];
  const bccUsers = communication.bcc?.map((p) => getUserById(p.id)).filter(Boolean) ?? [];

  const handleTaskClick = (task: Task) => router.push(`/dashboard/tasks/${task.id}`);
  const handleDocumentClick = (doc: Document) => router.push(`/dashboard/documents/${doc.id}`);
  const handleMatterClick = () => matter && router.push(`/dashboard/matters/${matter.id}`);
  const handleClientClick = () => client && router.push(`/dashboard/clients/${client.id}`);

  return (
    <div className="space-y-6">
      <CommunicationRecordHeader
        communication={communication}
        client={client}
        matter={matter}
        actions={
          <>
            {!communication.isInternal && (
              <Button size="sm" variant="outline" onClick={() => alert("Reply to communication")}>
                <Reply className="mr-1.5 h-4 w-4" />
                Reply
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => alert("Forward communication")}>
              <Forward className="mr-1.5 h-4 w-4" />
              Forward
            </Button>
            <Button size="sm" onClick={() => setShowCreateTaskDialog(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create Task
            </Button>
            <Button size="sm" variant="ghost" onClick={() => alert("More actions")}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </>
        }
      />
      {showCreateTaskDialog && (
        <CreateTaskFromCommunicationDialog
          communication={communication}
          onClose={() => setShowCreateTaskDialog(false)}
          onTaskCreated={(task) => {
            alert(`Task ${task.taskNumber} created successfully!`);
            router.push(`/dashboard/tasks/${task.id}`);
          }}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {communicationTabs.map((tab) => (
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
          <CommunicationOverviewTab
            communication={communication}
            client={client}
            matter={matter}
            documents={documents}
            tasks={tasks}
            fromUser={fromUser}
            toUsers={toUsers}
            ccUsers={ccUsers}
            bccUsers={bccUsers}
            onMatterClick={handleMatterClick}
            onClientClick={handleClientClick}
          />
        </TabsContent>

        <TabsContent value="thread" className="space-y-4">
          <CommunicationThreadTab communication={communication} />
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <CommunicationAttachmentsTab
            communication={communication}
            documents={documents}
            onDocumentClick={handleDocumentClick}
          />
        </TabsContent>

        <TabsContent value="linked" className="space-y-4">
          <CommunicationLinkedTab
            communication={communication}
            client={client}
            matter={matter}
            documents={documents}
            tasks={tasks}
            onDocumentClick={handleDocumentClick}
            onTaskClick={handleTaskClick}
            onMatterClick={handleMatterClick}
            onClientClick={handleClientClick}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <CommunicationActivityTab communication={communication} tasks={tasks} documents={documents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommunicationOverviewTab({
  communication,
  client,
  matter,
  documents,
  tasks,
  fromUser,
  toUsers,
  ccUsers,
  bccUsers,
}: {
  communication: Communication;
  client: any;
  matter: any;
  documents: Document[];
  tasks: Task[];
  fromUser: any;
  toUsers: any[];
  ccUsers: any[];
  bccUsers: any[];
  onMatterClick?: () => void;
  onClientClick?: () => void;
}) {
  const pendingTasks = tasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && daysOverdue(t.dueDate) > 0);

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Status"
          value={<CommunicationStatusBadge status={communication.status} />}
          icon={<Mail className="h-5 w-5" />}
        />
        <StatTile
          label="Attachments"
          value={communication.attachments.length}
          icon={<Paperclip className="h-5 w-5" />}
        />
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
        <StatTile label="Documents" value={documents.length} icon={<FileText className="h-5 w-5" />} />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Communication Details">
          <KeyValueList
            items={[
              { label: "Communication ID", value: communication.communicationNumber },
              {
                label: "Channel",
                value: (
                  <Badge variant="secondary" className="gap-1">
                    {communication.channel === "email" && <Mail className="h-3.5 w-3.5" />}
                    {communication.channel === "whatsapp" && <MessageSquare className="h-3.5 w-3.5" />}
                    {communication.channel === "sms" && <Smartphone className="h-3.5 w-3.5" />}
                    {communication.channel === "call" && <Phone className="h-3.5 w-3.5" />}
                    {communication.channel.toUpperCase()}
                  </Badge>
                ),
              },
              {
                label: "Direction",
                value: (
                  <Badge variant="outline" className="capitalize">
                    {communication.direction}
                  </Badge>
                ),
              },
              {
                label: "Type",
                value: (
                  <Badge variant={communication.isInternal ? "secondary" : "outline"}>
                    {communication.isInternal ? "Internal" : "External"}
                  </Badge>
                ),
              },
              { label: "Priority", value: <PriorityBadge priority={communication.priority ?? "medium"} /> },
              { label: "Status", value: <CommunicationStatusBadge status={communication.status} /> },
              { label: "Sent At", value: communication.sentAt ? formatDateTime(communication.sentAt) : "—" },
              {
                label: "Delivered At",
                value: communication.deliveredAt ? formatDateTime(communication.deliveredAt) : "—",
              },
              { label: "Read At", value: communication.readAt ? formatDateTime(communication.readAt) : "—" },
              { label: "Replied At", value: communication.repliedAt ? formatDateTime(communication.repliedAt) : "—" },
              { label: "Campaign", value: communication.campaignId ? communication.campaignId : "—" },
              { label: "Template", value: communication.templateId ? communication.templateId : "—" },
              { label: "Provider Message ID", value: communication.providerMessageId || "—" },
              { label: "Provider Status", value: communication.providerStatus || "—" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Participants">
          <KeyValueList
            items={[
              {
                label: "From",
                value: (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
                      {fromUser?.fullName?.[0] || communication.from.name[0]}
                    </div>
                    <span>
                      {communication.from.name}{" "}
                      {communication.from.email && (
                        <span className="text-muted-foreground text-sm">({communication.from.email})</span>
                      )}
                    </span>
                  </div>
                ),
              },
              {
                label: "To",
                value: (
                  <div className="space-y-1">
                    {communication.to.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600 text-xs">
                          {p.name[0]}
                        </div>
                        <span className="text-sm">
                          {p.name} {p.email && <span className="text-muted-foreground">({p.email})</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                label: "CC",
                value: (
                  <div className="space-y-1">
                    {ccUsers.length > 0 ? (
                      ccUsers.map((u, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 font-medium text-green-600 text-xs">
                            {u?.fullName?.[0] || u?.name?.[0]}
                          </div>
                          <span className="text-sm">{u?.fullName || u?.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </div>
                ),
              },
              {
                label: "BCC",
                value: (
                  <div className="space-y-1">
                    {bccUsers.length > 0 ? (
                      bccUsers.map((u, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 font-medium text-purple-600 text-xs">
                            {u?.fullName?.[0] || u?.name?.[0]}
                          </div>
                          <span className="text-sm">{u?.fullName || u?.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </div>
                ),
              },
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

      {communication.attachments.length > 0 && (
        <SectionCard title="Attachments">
          <DataTable<CommunicationAttachment>
            data={communication.attachments}
            columns={
              [
                {
                  accessorKey: "fileName",
                  header: "File",
                  cell: ({ row }: { row: { original: CommunicationAttachment } }) => (
                    <p className="font-medium">{row.original.fileName}</p>
                  ),
                },
                {
                  accessorKey: "mimeType",
                  header: "Type",
                  cell: ({ row }: { row: { original: CommunicationAttachment } }) => (
                    <span className="text-muted-foreground text-sm">{row.original.mimeType}</span>
                  ),
                },
                {
                  accessorKey: "fileSize",
                  header: "Size",
                  cell: ({ row }: { row: { original: CommunicationAttachment } }) => (
                    <span className="text-sm">{formatFileSize(row.original.fileSize)}</span>
                  ),
                },
                {
                  accessorKey: "documentId",
                  header: "Linked Document",
                  cell: ({ row }: { row: { original: CommunicationAttachment } }) =>
                    row.original.documentId ? (
                      <Badge variant="secondary">Linked</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No attachments"
          />
        </SectionCard>
      )}

      {communication.internalNotes && (
        <SectionCard title="Internal Notes">
          <div className="rounded-lg border-amber-500 border-l-4 bg-muted/50 p-4">
            <p className="text-sm">{communication.internalNotes}</p>
          </div>
        </SectionCard>
      )}

      {communication.errorMessage && (
        <SectionCard title="Error Details">
          <div className="rounded-lg border-destructive border-l-4 bg-destructive/10 p-4">
            <p className="text-destructive text-sm">{communication.errorMessage}</p>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function CommunicationThreadTab({ communication }: { communication: Communication }) {
  return (
    <SectionCard title="Message Thread">
      <div className="space-y-6">
        <div
          className={cn(
            "rounded-lg border p-4",
            communication.direction === "inbound"
              ? "bg-blue-50 dark:bg-blue-900/10"
              : "bg-green-50 dark:bg-green-900/10",
          )}
        >
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
              {communication.from.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{communication.from.name}</span>
                {communication.from.email && (
                  <span className="text-muted-foreground text-sm">{communication.from.email}</span>
                )}
                <Badge variant="secondary" className="ml-2">
                  {communication.channel.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {communication.direction}
                </Badge>
                {communication.isInternal && (
                  <Badge variant="secondary" className="ml-1">
                    Internal
                  </Badge>
                )}
              </div>
              <div className="mt-1 text-muted-foreground text-sm">
                {communication.sentAt && `Sent: ${formatDateTime(communication.sentAt)}`}
                {communication.deliveredAt && ` • Delivered: ${formatDateTime(communication.deliveredAt)}`}
                {communication.readAt && ` • Read: ${formatDateTime(communication.readAt)}`}
              </div>
            </div>
          </div>
          <div className="ml-13 whitespace-pre-wrap text-sm">{communication.content}</div>
        </div>

        {communication.subject && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="mb-2 font-medium">Subject</h4>
            <p className="text-sm">{communication.subject}</p>
          </div>
        )}

        {communication.variables && Object.keys(communication.variables).length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="mb-2 font-medium">Template Variables</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(communication.variables).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="ml-2 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function CommunicationAttachmentsTab({
  communication,
  documents,
  onDocumentClick,
}: {
  communication: Communication;
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
}) {
  if (communication.attachments.length === 0 && documents.length === 0) {
    return (
      <EmptyState
        icon={<Paperclip className="h-12 w-12 text-muted-foreground/50" />}
        title="No attachments"
        description="This communication has no attachments or linked documents."
      />
    );
  }

  return (
    <div className="space-y-6">
      {communication.attachments.length > 0 && (
        <SectionCard title="Communication Attachments">
          <DataTable<CommunicationAttachment>
            data={communication.attachments}
            columns={
              [
                {
                  accessorKey: "fileName",
                  header: "File",
                  cell: ({ row }: { row: { original: CommunicationAttachment } }) => (
                    <p className="font-medium">{row.original.fileName}</p>
                  ),
                },
                {
                  accessorKey: "mimeType",
                  header: "Type",
                  cell: ({ row }: { row: { original: CommunicationAttachment } }) => (
                    <span className="text-muted-foreground text-sm">{row.original.mimeType}</span>
                  ),
                },
                {
                  accessorKey: "fileSize",
                  header: "Size",
                  cell: ({ row }: { row: { original: CommunicationAttachment } }) => (
                    <span className="text-sm">{formatFileSize(row.original.fileSize)}</span>
                  ),
                },
                {
                  accessorKey: "documentId",
                  header: "Linked Document",
                  cell: ({ row }: { row: { original: CommunicationAttachment } }) =>
                    row.original.documentId ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const doc = documents.find((d) => d.id === row.original.documentId);
                          if (doc) onDocumentClick(doc);
                        }}
                      >
                        View Document
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No attachments"
          />
        </SectionCard>
      )}

      {documents.length > 0 && (
        <SectionCard title="Linked Documents">
          <DataTable<Document>
            data={documents}
            columns={
              [
                {
                  accessorKey: "originalFileName",
                  header: "Document",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <p className="font-medium">{row.original.originalFileName}</p>
                  ),
                },
                {
                  accessorKey: "category",
                  header: "Category",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <Badge variant="secondary">{row.original.category.replace(/_/g, " ")}</Badge>
                  ),
                },
                {
                  accessorKey: "documentType",
                  header: "Type",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <span className="text-sm">{row.original.documentType.replace(/_/g, " ")}</span>
                  ),
                },
                {
                  accessorKey: "fileSize",
                  header: "Size",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <span className="text-sm">{formatFileSize(row.original.fileSize)}</span>
                  ),
                },
                {
                  accessorKey: "createdAt",
                  header: "Uploaded",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <span className="text-sm">{formatDate(row.original.createdAt)}</span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No documents"
            rowActions={[{ label: "View", action: onDocumentClick }]}
          />
        </SectionCard>
      )}
    </div>
  );
}

function CommunicationLinkedTab({
  communication,
  client,
  matter,
  documents,
  tasks,
  onDocumentClick,
  onTaskClick,
  onMatterClick,
  onClientClick,
}: {
  communication: Communication;
  client: any;
  matter: any;
  documents: Document[];
  tasks: Task[];
  onDocumentClick: (doc: Document) => void;
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
                    <span
                      className={cn(
                        "text-sm",
                        daysOverdue(row.original.dueDate) > 0 &&
                          row.original.status !== "completed" &&
                          "text-destructive",
                      )}
                    >
                      {formatDate(row.original.dueDate)}
                    </span>
                  ),
                },
                {
                  accessorKey: "progress",
                  header: "Progress",
                  cell: ({ row }: { row: { original: Task } }) => (
                    <div className="w-24">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${row.original.progress}%` }} />
                      </div>
                    </div>
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

      {documents.length > 0 && (
        <SectionCard title={`Linked Documents (${documents.length})`}>
          <DataTable<Document>
            data={documents}
            columns={
              [
                {
                  accessorKey: "originalFileName",
                  header: "Document",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <p className="font-medium">{row.original.originalFileName}</p>
                  ),
                },
                {
                  accessorKey: "category",
                  header: "Category",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <Badge variant="secondary">{row.original.category.replace(/_/g, " ")}</Badge>
                  ),
                },
                {
                  accessorKey: "documentType",
                  header: "Type",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <span className="text-sm">{row.original.documentType.replace(/_/g, " ")}</span>
                  ),
                },
                {
                  accessorKey: "fileSize",
                  header: "Size",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <span className="text-sm">{formatFileSize(row.original.fileSize)}</span>
                  ),
                },
                {
                  accessorKey: "createdAt",
                  header: "Uploaded",
                  cell: ({ row }: { row: { original: Document } }) => (
                    <span className="text-sm">{formatDate(row.original.createdAt)}</span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No linked documents"
            rowActions={[{ label: "View", action: onDocumentClick }]}
          />
        </SectionCard>
      )}

      {tasks.length === 0 && documents.length === 0 && !client && !matter && (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No linked entities"
          description="This communication is not linked to any client, matter, tasks, or documents."
        />
      )}
    </div>
  );
}

function CommunicationActivityTab({
  communication,
  tasks,
  documents,
}: {
  communication: Communication;
  tasks: Task[];
  documents: Document[];
}) {
  const allActivities = [
    {
      id: `comm-created`,
      type: "communication" as const,
      title: `Communication ${communication.communicationNumber} created`,
      description: `${communication.channel.toUpperCase()} • ${communication.direction} • ${communication.status}`,
      timestamp: communication.createdAt,
      entityUrl: "#",
    },
    ...(communication.sentAt
      ? [
          {
            id: `comm-sent`,
            type: "communication" as const,
            title: `Communication sent`,
            description: `Via ${communication.channel.toUpperCase()}`,
            timestamp: communication.sentAt,
            entityUrl: "#",
          },
        ]
      : []),
    ...(communication.deliveredAt
      ? [
          {
            id: `comm-delivered`,
            type: "communication" as const,
            title: `Communication delivered`,
            timestamp: communication.deliveredAt,
            entityUrl: "#",
          },
        ]
      : []),
    ...(communication.readAt
      ? [
          {
            id: `comm-read`,
            type: "communication" as const,
            title: `Communication read`,
            timestamp: communication.readAt,
            entityUrl: "#",
          },
        ]
      : []),
    ...(communication.repliedAt
      ? [
          {
            id: `comm-replied`,
            type: "communication" as const,
            title: `Communication replied to`,
            timestamp: communication.repliedAt,
            entityUrl: "#",
          },
        ]
      : []),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task" as const,
      title: `Task ${t.taskNumber}: ${t.title}`,
      description: `Status: ${t.status.replace(/_/g, " ")}`,
      timestamp: t.updatedAt,
      entityUrl: `/dashboard/tasks/${t.id}`,
    })),
    ...documents.map((d) => ({
      id: `doc-${d.id}`,
      type: "document" as const,
      title: `Document: ${d.originalFileName}`,
      description: `${d.category} • ${d.documentType}`,
      timestamp: d.createdAt,
      entityUrl: `/dashboard/documents/${d.id}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={allActivities} grouped maxItems={50} />
    </SectionCard>
  );
}
