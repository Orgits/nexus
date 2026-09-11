"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronLeft,
  FileQuestion,
  FileText,
  Gavel,
  History,
  Search,
  Send,
  Shield,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyDocuments, EmptyState, EmptyTasks } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { NoticeRecordHeader } from "@/components/ca-nexus/record-header";
import { NoticeStatusBadge, PriorityBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { daysOverdue, formatDate } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { mockDocuments } from "@/mock-data/documents";
import { getMatterById, mockTasks } from "@/mock-data/matters";
import { getNoticeById } from "@/mock-data/notices";
import { getReviewsByClient, getReviewsByMatter } from "@/mock-data/reviews";
import { getTeamById, getUserById } from "@/mock-data/users";
import type { Communication, Document, Notice, Review, Task } from "@/types";

const noticeTabs = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "response", label: "Response", icon: Send },
  { id: "reviews", label: "Reviews", icon: Search },
  { id: "submissions", label: "Submissions", icon: FileQuestion },
  { id: "activity", label: "Activity", icon: History },
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
    | "document_request";
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

export function NoticeDetail({ noticeId }: { noticeId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [_search, _setSearch] = useState("");
  const [_filters, _setFilters] = useState<Record<string, unknown>>({});

  const notice = getNoticeById(noticeId);
  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Gavel className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Notice not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The notice you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/notices")}
          className="text-primary hover:underline"
        >
          Back to Notices
        </button>
      </div>
    );
  }

  const client = getClientById(notice.clientId);
  const matter = notice.matterId ? getMatterById(notice.matterId) : undefined;
  const assignedUser = getUserById(notice.assignedUserId);
  const assignedTeam = notice.matterId
    ? getMatterById(notice.matterId)?.assignedTeamId
      ? getTeamById(getMatterById(notice.matterId)?.assignedTeamId ?? "")
      : undefined
    : undefined;

  const linkedDocuments = notice.documents
    .map((nd) => mockDocuments.find((d) => d.id === nd.documentId))
    .filter(Boolean) as Document[];
  const linkedTasks = notice.tasks.map((taskId) => mockTasks.find((t) => t.id === taskId)).filter(Boolean) as Task[];
  const linkedReviews = notice.matterId ? getReviewsByMatter(notice.matterId) : getReviewsByClient(notice.clientId);

  const pendingTasks = linkedTasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const overdueTasks = linkedTasks.filter((t) => t.status !== "completed" && daysOverdue(t.dueDate) > 0);
  const daysUntilDue = Math.ceil((new Date(notice.responseDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0 && notice.status !== "closed" && notice.status !== "submitted";

  const handleTaskClick = (t: Task) => router.push(`/dashboard/tasks/${t.id}`);
  const handleDocumentClick = (d: Document) => router.push(`/dashboard/documents/${d.id}`);
  const _handleCommunicationClick = (c: Communication) => router.push(`/dashboard/communications/${c.id}`);

  const allActivities: ActivityItem[] = [
    ...(notice.tasks
      .map((taskId) => {
        const task = mockTasks.find((t) => t.id === taskId);
        return task
          ? {
              id: `task-${task.id}`,
              type: "task" as const,
              title: `Task ${task.taskNumber}: ${task.title}`,
              description: `Status: ${task.status.replace(/_/g, " ")}`,
              timestamp: task.updatedAt,
              entityUrl: `/dashboard/tasks/${task.id}`,
            }
          : null;
      })
      .filter(Boolean) as ActivityItem[]),
    ...(notice.documents
      .map((nd, index) => {
        const doc = mockDocuments.find((d) => d.id === nd.documentId);
        return doc
          ? {
              id: `doc-${index}`,
              type: "document" as const,
              title: `Document: ${doc.originalFileName}`,
              description: `${doc.category} • ${doc.documentType} (${nd.type.replace(/_/g, " ")})`,
              timestamp: doc.createdAt,
              entityUrl: `/dashboard/documents/${doc.id}`,
            }
          : null;
      })
      .filter(Boolean) as ActivityItem[]),
    ...linkedReviews.map((r) => ({
      id: `review-${r.id}`,
      type: "review" as const,
      title: `Review: ${r.title}`,
      description: `Status: ${r.status.replace(/_/g, " ")} • ${r.stages.filter((s) => s.status === "completed").length}/${r.stages.length} stages`,
      timestamp: r.updatedAt,
      entityUrl: `/dashboard/reviews/${r.id}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <NoticeRecordHeader
        notice={notice}
        client={client}
        matter={matter}
        actions={
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/notices")}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Register
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
          {noticeTabs.map((tab) => (
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
          <NoticeOverviewTab
            notice={notice}
            client={client}
            matter={matter}
            assignedUser={assignedUser}
            assignedTeam={assignedTeam}
            linkedDocuments={linkedDocuments}
            linkedTasks={linkedTasks}
            linkedReviews={linkedReviews}
            pendingTasks={pendingTasks}
            overdueTasks={overdueTasks}
            isOverdue={isOverdue}
            daysUntilDue={daysUntilDue}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <NoticeDocumentsTab documents={linkedDocuments} notice={notice} onDocumentClick={handleDocumentClick} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <NoticeTasksTab tasks={linkedTasks} onTaskClick={handleTaskClick} />
        </TabsContent>

        <TabsContent value="response" className="space-y-6">
          <NoticeResponseTab notice={notice} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <NoticeReviewsTab reviews={linkedReviews} />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <NoticeSubmissionsTab notice={notice} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <NoticeActivityTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NoticeOverviewTab({
  notice,
  client,
  matter,
  assignedUser,
  assignedTeam,
  linkedDocuments,
  linkedTasks,
  linkedReviews,
  pendingTasks,
  overdueTasks,
  isOverdue,
  daysUntilDue,
}: {
  notice: Notice;
  client: any;
  matter: any;
  assignedUser: any;
  assignedTeam: any;
  linkedDocuments: Document[];
  linkedTasks: Task[];
  linkedReviews: Review[];
  pendingTasks: Task[];
  overdueTasks: Task[];
  isOverdue: boolean;
  daysUntilDue: number;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Status"
          value={<NoticeStatusBadge status={notice.status} />}
          icon={<Shield className="h-5 w-5" />}
        />
        <StatTile
          label="Due In"
          value={isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days`}
          hint={isOverdue ? "Overdue" : undefined}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatTile label="Documents" value={linkedDocuments.length} icon={<FileText className="h-5 w-5" />} />
        <StatTile
          label="Pending Tasks"
          value={pendingTasks.length}
          hint={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : undefined}
          icon={<CheckSquare className="h-5 w-5" />}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Notice Details">
          <KeyValueList
            items={[
              { label: "Notice Number", value: notice.noticeNumber },
              { label: "Reference Number", value: notice.referenceNumber },
              { label: "Authority", value: notice.authority },
              { label: "Authority Type", value: notice.authorityType.replace(/_/g, " ").toUpperCase() },
              { label: "Category", value: notice.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
              { label: "Priority", value: <PriorityBadge priority={notice.priority} /> },
              { label: "Received Date", value: formatDate(notice.receivedDate) },
              { label: "Response Due Date", value: formatDate(notice.responseDueDate) },
              { label: "Escalation Level", value: `Level ${notice.escalationLevel}` },
              { label: "Urgent", value: notice.isUrgent ? "Yes" : "No" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Assignment">
          <KeyValueList
            items={[
              { label: "Assigned To", value: assignedUser?.fullName || "—" },
              { label: "Team", value: assignedTeam?.name || "—" },
              { label: "Hearing Date", value: notice.hearingDate ? formatDate(notice.hearingDate) : "—" },
              { label: "Hearing Location", value: notice.hearingLocation || "—" },
              { label: "Submission Ref", value: notice.submissionReference || "—" },
              {
                label: "Response Submitted",
                value: notice.responseSubmittedAt ? formatDate(notice.responseSubmittedAt) : "—",
              },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Linked Entities">
        <div className="grid gap-4 md:grid-cols-4">
          {client && <ClientLink client={client} showStatus={true} />}
          {matter && <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />}
        </div>
      </SectionCard>

      {notice.description && (
        <SectionCard title="Description">
          <p className="text-sm">{notice.description}</p>
        </SectionCard>
      )}
    </div>
  );
}

function NoticeDocumentsTab({
  documents,
  notice,
  onDocumentClick,
}: {
  documents: Document[];
  notice: Notice;
  onDocumentClick: (doc: Document) => void;
}) {
  if (documents.length === 0) return <EmptyDocuments />;

  return (
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
            accessorKey: "ocrStatus",
            header: "OCR",
            cell: ({ row }: { row: { original: Document } }) => (
              <Badge variant="outline">{row.original.ocrStatus.replace(/_/g, " ")}</Badge>
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
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NoticeTasksTab({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "todo", label: "Todo" },
        { value: "in_progress", label: "In Progress" },
        { value: "in_review", label: "In Review" },
        { value: "rework", label: "Rework" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "on_hold", label: "On Hold" },
        { value: "blocked", label: "Blocked" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
        { value: "urgent", label: "Urgent" },
      ],
    },
  ];

  const filteredTasks = tasks.filter((t: Task) => {
    if (
      search &&
      !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !t.taskNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (t as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search tasks..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />
      {filteredTasks.length > 0 ? (
        <DataTable<Task>
          data={filteredTasks}
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
          emptyMessage="No tasks match your search or filters"
          rowActions={[{ label: "View Details", action: onTaskClick }]}
        />
      ) : (
        <EmptyTasks />
      )}
    </div>
  );
}

function NoticeResponseTab({ notice }: { notice: Notice }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Response Information">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h4 className="mb-1 font-medium text-muted-foreground text-sm">Response Draft</h4>
              <div className="min-h-[100px] rounded-lg border bg-muted/50 p-4">
                {notice.responseDraft ? (
                  <p className="text-sm">{notice.responseDraft}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">No response draft prepared yet.</p>
                )}
              </div>
            </div>

            {notice.responseSubmittedAt && (
              <div>
                <h4 className="mb-1 font-medium text-muted-foreground text-sm">Submission Details</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Submitted:</strong> {formatDate(notice.responseSubmittedAt)}
                  </p>
                  <p>
                    <strong>Reference:</strong> {notice.submissionReference || "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="mb-1 font-medium text-muted-foreground text-sm">Timeline</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/10">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Notice Received</p>
                    <p className="text-muted-foreground">{formatDate(notice.receivedDate)}</p>
                  </div>
                </div>
                {notice.responseDraft && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Response Draft Prepared</p>
                      <p className="text-muted-foreground">Draft content available</p>
                    </div>
                  </div>
                )}
                {notice.responseSubmittedAt && (
                  <div className="flex items-center gap-2 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/10">
                    <Send className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Response Submitted</p>
                      <p className="text-muted-foreground">
                        {formatDate(notice.responseSubmittedAt)} • Ref: {notice.submissionReference || "—"}
                      </p>
                    </div>
                  </div>
                )}
                {notice.hearingDate && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/10">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Hearing Scheduled</p>
                      <p className="text-muted-foreground">
                        {formatDate(notice.hearingDate)} • {notice.hearingLocation || "TBD"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => alert("Edit response draft")}>
                <FileText className="mr-1.5 h-4 w-4" />
                Edit Draft
              </Button>
              {notice.responseDraft && !notice.responseSubmittedAt && (
                <Button variant="default" onClick={() => alert("Submit response")}>
                  <Send className="mr-1.5 h-4 w-4" />
                  Submit Response
                </Button>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {notice.hearingDate && (
        <SectionCard title="Hearing Details">
          <div className="grid gap-4 md:grid-cols-2">
            <KeyValueList
              items={[
                { label: "Hearing Date", value: formatDate(notice.hearingDate) },
                { label: "Hearing Location", value: notice.hearingLocation || "—" },
              ]}
            />
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function NoticeReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12 text-muted-foreground/50" />}
        title="No linked reviews"
        description="Reviews related to this notice will appear here."
      />
    );
  }

  return (
    <DataTable<Review>
      data={reviews}
      columns={
        [
          {
            accessorKey: "reviewNumber",
            header: "Review #",
            cell: ({ row }: { row: { original: Review } }) => (
              <span className="font-medium text-sm">{row.original.reviewNumber}</span>
            ),
          },
          {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }: { row: { original: Review } }) => (
              <p className="line-clamp-1 font-medium">{row.original.title}</p>
            ),
          },
          {
            accessorKey: "reviewType",
            header: "Type",
            cell: ({ row }: { row: { original: Review } }) => (
              <span className="text-sm capitalize">{row.original.reviewType.replace(/_/g, " ")}</span>
            ),
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: { original: Review } }) => (
              <span className="capitalize">{row.original.status.replace(/_/g, " ")}</span>
            ),
          },
          {
            accessorKey: "stages",
            header: "Progress",
            cell: ({ row }: { row: { original: Review } }) => {
              const completed = row.original.stages.filter((s) => s.status === "completed").length;
              const total = row.original.stages.length;
              return (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {completed}/{total}
                  </span>
                </div>
              );
            },
          },
          {
            accessorKey: "dueDate",
            header: "Due",
            cell: ({ row }: { row: { original: Review } }) => (
              <span
                className={cn(
                  "text-sm",
                  daysOverdue(row.original.dueDate) > 0 && row.original.status !== "completed" && "text-destructive",
                )}
              >
                {formatDate(row.original.dueDate)}
              </span>
            ),
          },
        ] as any
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No reviews"
      rowActions={[{ label: "View", action: (r: Review) => alert(`View review ${r.id}`) }]}
    />
  );
}

function NoticeSubmissionsTab({ notice }: { notice: Notice }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Submission Record">
        {notice.responseSubmittedAt ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/10">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Response Submitted</p>
                  <p className="text-green-700 text-sm dark:text-green-300">
                    The response has been successfully submitted to the authority.
                  </p>
                </div>
              </div>
            </div>

            <KeyValueList
              items={[
                { label: "Submission Date", value: formatDate(notice.responseSubmittedAt) },
                { label: "Submission Reference", value: notice.submissionReference || "—" },
                { label: "Status", value: <Badge variant="default">Submitted</Badge> },
              ]}
            />
          </div>
        ) : (
          <div className="py-8 text-center">
            <FileQuestion className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h4 className="mb-2 font-medium">No submission yet</h4>
            <p className="mb-4 text-muted-foreground text-sm">The response has not been submitted to the authority.</p>
            <Button onClick={() => alert("Submit response")}>
              <Send className="mr-1.5 h-4 w-4" />
              Submit Response
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Submission History">
        <p className="text-muted-foreground text-sm">Submission history will be displayed here once available.</p>
      </SectionCard>
    </div>
  );
}

function NoticeActivityTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}
