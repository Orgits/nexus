"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import { Clock, FileText, Mail, MessageSquare, Paperclip, Phone, Send, Smartphone, Users } from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { SectionCard } from "@/components/ca-nexus/page-blocks";
import { CommunicationStatusBadge, PriorityBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { daysOverdue, formatDate, formatDateTime, formatFileSize } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getCommunicationsByConversation, getConversationById } from "@/mock-data/communications";
import { getDocumentsByConversation } from "@/mock-data/documents";
import { getMatterById, getTasksByConversation } from "@/mock-data/matters";
import { getUserById } from "@/mock-data/users";
import type { Communication, CommunicationChannel, Conversation, Document, Task } from "@/types";

const conversationTabs = [
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "participants", label: "Participants", icon: Users },
  { id: "attachments", label: "Attachments", icon: Paperclip },
  { id: "linked", label: "Linked", icon: FileText },
  { id: "activity", label: "Activity", icon: Clock },
];

interface ExtendedParticipant {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  type: "user" | "contact" | "unknown";
  role?: string;
  joinedAt?: string;
  userId?: string;
  contactId?: string;
}

export function ConversationDetail({ id }: { id: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("messages");
  const [newMessage, setNewMessage] = useState("");
  const [replyChannel, setReplyChannel] = useState<CommunicationChannel>("email");

  const conversation = getConversationById(id);
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Conversation not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The conversation you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/conversations")}
          className="text-primary hover:underline"
        >
          Back to Conversations
        </button>
      </div>
    );
  }

  const client = getClientById(conversation.clientId);
  const matter = conversation.matterId ? getMatterById(conversation.matterId) : undefined;
  const communications = getCommunicationsByConversation(id);
  const documents = getDocumentsByConversation(id);
  const tasks = getTasksByConversation(id);

  const participants = conversation.participants.map((p): ExtendedParticipant => {
    if (p.userId) {
      const user = getUserById(p.userId);
      return {
        id: p.userId || "",
        name: user?.fullName || "Unknown User",
        email: user?.email,
        avatar: user?.avatarUrl,
        type: "user" as const,
        role: p.role,
        joinedAt: p.joinedAt,
        userId: p.userId,
      };
    }
    if (p.contactId) {
      return {
        id: p.contactId || "",
        name: p.contactId,
        type: "contact" as const,
        role: p.role,
        joinedAt: p.joinedAt,
        contactId: p.contactId,
      };
    }
    return {
      id: "",
      name: "Unknown",
      type: "unknown" as const,
      role: p.role,
      joinedAt: p.joinedAt,
    };
  });

  const handleTaskClick = (task: Task) => router.push(`/dashboard/tasks/${task.id}`);
  const handleDocumentClick = (doc: Document) => router.push(`/dashboard/documents/${doc.id}`);
  const handleMatterClick = () => matter && router.push(`/dashboard/matters/${matter.id}`);
  const handleClientClick = () => client && router.push(`/dashboard/clients/${client.id}`);
  const handleCommunicationClick = (comm: Communication) => router.push(`/dashboard/communications/${comm.id}`);

  const sendReply = () => {
    if (newMessage.trim()) {
      alert(`Send reply via ${replyChannel}: ${newMessage}`);
      setNewMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate font-semibold text-xl">{conversation.subject}</h1>
          <p className="truncate text-muted-foreground text-sm">Conversation ID: {conversation.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={conversation.isArchived ? "secondary" : "outline"}>
            {conversation.isArchived ? "Archived" : "Active"}
          </Badge>
          {conversation.unreadCount > 0 && <Badge variant="destructive">{conversation.unreadCount} unread</Badge>}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {conversationTabs.map((tab) => (
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

        <TabsContent value="messages" className="space-y-4">
          <ConversationMessagesTab
            conversation={conversation}
            communications={communications}
            client={client}
            matter={matter}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            replyChannel={replyChannel}
            setReplyChannel={setReplyChannel}
            sendReply={sendReply}
            onCommunicationClick={handleCommunicationClick}
          />
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <ConversationParticipantsTab conversation={conversation} participants={participants} />
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <ConversationAttachmentsTab
            communications={communications}
            documents={documents}
            onDocumentClick={handleDocumentClick}
          />
        </TabsContent>

        <TabsContent value="linked" className="space-y-4">
          <ConversationLinkedTab
            conversation={conversation}
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
          <ConversationActivityTab
            conversation={conversation}
            communications={communications}
            tasks={tasks}
            documents={documents}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConversationMessagesTab({
  conversation,
  communications,
  client,
  matter,
  newMessage,
  setNewMessage,
  replyChannel,
  setReplyChannel,
  sendReply,
  onCommunicationClick,
}: {
  conversation: Conversation;
  communications: Communication[];
  client: any;
  matter: any;
  newMessage: string;
  setNewMessage: (value: string) => void;
  replyChannel: CommunicationChannel;
  setReplyChannel: (value: CommunicationChannel) => void;
  sendReply: () => void;
  onCommunicationClick: (comm: Communication) => void;
}) {
  const sortedCommunications = [...communications].sort(
    (a, b) => new Date(a.sentAt || a.createdAt).getTime() - new Date(b.sentAt || b.createdAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <SectionCard title="Messages">
        <div className="max-h-[600px] space-y-6 overflow-y-auto pr-2">
          {sortedCommunications.length > 0 ? (
            sortedCommunications.map((comm, _index) => (
              <div key={comm.id} className={cn("flex gap-3", comm.isInternal && "bg-muted/30")}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                  {comm.from.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-medium">{comm.from.name}</span>
                    {comm.from.email && <span className="text-muted-foreground text-sm">{comm.from.email}</span>}
                    <Badge variant="secondary" className="text-xs">
                      {comm.channel === "email" && <Mail className="h-3 w-3" />}
                      {comm.channel === "whatsapp" && <MessageSquare className="h-3 w-3" />}
                      {comm.channel === "sms" && <Smartphone className="h-3 w-3" />}
                      {comm.channel === "call" && <Phone className="h-3 w-3" />}
                      {comm.channel.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {comm.direction}
                    </Badge>
                    {comm.isInternal && (
                      <Badge variant="secondary" className="text-xs">
                        Internal
                      </Badge>
                    )}
                    <CommunicationStatusBadge status={comm.status} className="text-xs" />
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{comm.content}</div>
                  <div className="mt-2 flex items-center gap-3 text-muted-foreground text-xs">
                    <span>{comm.sentAt ? formatDateTime(comm.sentAt) : "Not sent"}</span>
                    {comm.attachments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {comm.attachments.length} attachment(s)
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 py-0 text-xs"
                      onClick={() => onCommunicationClick(comm)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No messages in this conversation yet.</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="mb-2 flex items-center gap-2">
            <Select value={replyChannel} onValueChange={setReplyChannel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                {conversation.channels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-sm">Reply as</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply..."
                className="min-h-[80px] pr-20"
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={sendReply} disabled={!newMessage.trim()}>
                <Send className="mr-1.5 h-4 w-4" />
                Send
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert("Add attachment")}>
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function ConversationParticipantsTab({
  conversation,
  participants,
}: {
  conversation: Conversation;
  participants: ExtendedParticipant[];
}) {
  return (
    <div className="space-y-4">
      <SectionCard title="Participants">
        <DataTable<(typeof participants)[0]>
          data={participants}
          columns={
            [
              {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }: { row: { original: (typeof participants)[0] } }) => (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                      {row.original.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{row.original.name}</p>
                      {row.original.email && <p className="text-muted-foreground text-xs">{row.original.email}</p>}
                    </div>
                  </div>
                ),
              },
              {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }: { row: { original: (typeof participants)[0] } }) => (
                  <Badge variant={row.original.type === "user" ? "secondary" : "outline"}>
                    {row.original.type === "user" ? "Team Member" : "Client Contact"}
                  </Badge>
                ),
              },
              {
                accessorKey: "role",
                header: "Role",
                cell: ({ row }: { row: { original: (typeof participants)[0] } }) => (
                  <Badge variant="outline" className="capitalize">
                    {(row.original.role || "participant").replace(/_/g, " ")}
                  </Badge>
                ),
              },
              {
                accessorKey: "joinedAt",
                header: "Joined",
                cell: ({ row }: { row: { original: (typeof participants)[0] } }) => (
                  <span className="text-sm">{formatDate(row.original.joinedAt)}</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.userId || row.contactId || row.id}
          pageSize={10}
          emptyMessage="No participants"
        />
      </SectionCard>

      <SectionCard title="Channels">
        <div className="flex flex-wrap gap-2">
          {conversation.channels.map((channel) => (
            <Badge key={channel} variant="secondary" className="gap-1">
              {channel === "email" && <Mail className="h-3 w-3" />}
              {channel === "whatsapp" && <MessageSquare className="h-3 w-3" />}
              {channel === "sms" && <Smartphone className="h-3 w-3" />}
              {channel.toUpperCase()}
            </Badge>
          ))}
        </div>
      </SectionCard>

      {conversation.tags.length > 0 && (
        <SectionCard title="Tags">
          <div className="flex flex-wrap gap-2">
            {conversation.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function ConversationAttachmentsTab({
  communications,
  documents,
  onDocumentClick,
}: {
  communications: Communication[];
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
}) {
  const allAttachments = communications.flatMap((comm) =>
    comm.attachments.map((att) => ({
      ...att,
      communicationId: comm.id,
      communicationNumber: comm.communicationNumber,
    })),
  );

  if (allAttachments.length === 0 && documents.length === 0) {
    return (
      <EmptyState
        icon={<Paperclip className="h-12 w-12 text-muted-foreground/50" />}
        title="No attachments"
        description="No attachments or linked documents in this conversation."
      />
    );
  }

  return (
    <div className="space-y-6">
      {allAttachments.length > 0 && (
        <SectionCard title={`Communication Attachments (${allAttachments.length})`}>
          <DataTable<(typeof allAttachments)[0]>
            data={allAttachments}
            columns={
              [
                {
                  accessorKey: "fileName",
                  header: "File",
                  cell: ({ row }: { row: { original: (typeof allAttachments)[0] } }) => (
                    <p className="font-medium">{row.original.fileName}</p>
                  ),
                },
                {
                  accessorKey: "communicationNumber",
                  header: "From Message",
                  cell: ({ row }: { row: { original: (typeof allAttachments)[0] } }) => (
                    <span className="text-muted-foreground text-sm">{row.original.communicationNumber}</span>
                  ),
                },
                {
                  accessorKey: "mimeType",
                  header: "Type",
                  cell: ({ row }: { row: { original: (typeof allAttachments)[0] } }) => (
                    <span className="text-muted-foreground text-sm">{row.original.mimeType}</span>
                  ),
                },
                {
                  accessorKey: "fileSize",
                  header: "Size",
                  cell: ({ row }: { row: { original: (typeof allAttachments)[0] } }) => (
                    <span className="text-sm">{formatFileSize(row.original.fileSize)}</span>
                  ),
                },
                {
                  accessorKey: "documentId",
                  header: "Linked Document",
                  cell: ({ row }: { row: { original: (typeof allAttachments)[0] } }) =>
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
            emptyMessage="No documents"
            rowActions={[{ label: "View", action: onDocumentClick }]}
          />
        </SectionCard>
      )}
    </div>
  );
}

function ConversationLinkedTab({
  conversation,
  client,
  matter,
  documents,
  tasks,
  onDocumentClick,
  onTaskClick,
  onMatterClick,
  onClientClick,
}: {
  conversation: Conversation;
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
          description="This conversation is not linked to any client, matter, tasks, or documents."
        />
      )}
    </div>
  );
}

function ConversationActivityTab({
  conversation,
  communications,
  tasks,
  documents,
}: {
  conversation: Conversation;
  communications: Communication[];
  tasks: Task[];
  documents: Document[];
}) {
  const allActivities = [
    {
      id: `conv-created`,
      type: "communication" as const,
      title: `Conversation created: ${conversation.subject}`,
      description: `Channels: ${conversation.channels.join(", ")}`,
      timestamp: conversation.createdAt,
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

import { Textarea } from "@/components/ui/textarea";
