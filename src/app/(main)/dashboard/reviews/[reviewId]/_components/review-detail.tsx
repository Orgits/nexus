"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CheckSquare,
  ChevronLeft,
  Clock,
  FileText,
  MessageSquare,
  Search,
} from "lucide-react";

import { ActivityTimeline, CommentThread } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyCommunications, EmptyDocuments, EmptyState, EmptyTasks } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, ComplianceCycleLink, MatterLink, TaskLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { ReviewRecordHeader } from "@/components/ca-nexus/record-header";
import { PriorityBadge, ReviewStatusBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { daysOverdue, formatDate } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getCommunicationsByComplianceCycle } from "@/mock-data/communications";
import { getComplianceCycleById } from "@/mock-data/compliance";
import { getDocumentsByComplianceCycle } from "@/mock-data/documents";
import { getMatterById, getTasksByMatter, mockTasks } from "@/mock-data/matters";
import { getReviewById } from "@/mock-data/reviews";
import { getUserById, mockUsers } from "@/mock-data/users";
import type { Communication, Document, Review, ReviewAction, ReviewStage, Task } from "@/types";

const reviewTabs = [
  { id: "overview", label: "Overview", icon: CheckSquare },
  { id: "stages", label: "Stages", icon: ArrowRight },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "communications", label: "Communications", icon: MessageSquare },
  { id: "comments", label: "Comments", icon: AlertCircle },
  { id: "history", label: "History", icon: Clock },
];

const reviewActions: { value: ReviewAction; label: string; variant: "default" | "destructive" | "outline" }[] = [
  { value: "approve", label: "Approve", variant: "default" },
  { value: "reject", label: "Reject", variant: "destructive" },
  { value: "rework", label: "Request Rework", variant: "outline" },
  { value: "comment", label: "Add Comment", variant: "outline" },
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

export function ReviewDetail({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [_search, _setSearch] = useState("");
  const [_filters, _setFilters] = useState<Record<string, unknown>>({});

  const review = getReviewById(reviewId);
  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Review not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The review you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/reviews")}
          className="text-primary hover:underline"
        >
          Back to Reviews
        </button>
      </div>
    );
  }

  const client = getClientById(review.clientId);
  const matter = review.matterId ? getMatterById(review.matterId) : undefined;
  const task = review.taskId ? mockTasks.find((t) => t.id === review.taskId) : undefined;
  const complianceCycle = review.complianceCycleId ? getComplianceCycleById(review.complianceCycleId) : undefined;
  const assignedReviewer = getUserById(review.assignedReviewerId);
  const assignedBy = getUserById(review.assignedById);
  const currentStage = review.stages.find((s) => s.stageNumber === review.currentStage);

  const documents = review.complianceCycleId ? getDocumentsByComplianceCycle(review.complianceCycleId) : [];
  const communications = review.complianceCycleId ? getCommunicationsByComplianceCycle(review.complianceCycleId) : [];
  const tasks = review.matterId ? getTasksByMatter(review.matterId) : [];

  const pendingTasks = tasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && daysOverdue(t.dueDate) > 0);
  const _completedStages = review.stages.filter((s) => s.status === "completed").length;
  const _totalStages = review.stages.length;

  const handleTaskClick = (t: Task) => router.push(`/dashboard/tasks/${t.id}`);
  const handleDocumentClick = (d: Document) => router.push(`/dashboard/documents/${d.id}`);
  const handleCommunicationClick = (c: Communication) => router.push(`/dashboard/communications/${c.id}`);

  const allActivities: ActivityItem[] = [
    ...review.stages
      .filter((s) => s.startedAt || s.completedAt)
      .map((s, index) => ({
        id: `review-stage-${index}`,
        type: "review" as const,
        title: `Stage ${s.stageNumber}: ${s.name}`,
        description: s.comments ? `Action: ${s.action || "comment"}` : `Status: ${s.status.replace(/_/g, " ")}`,
        user: getUserById(s.reviewerId),
        timestamp: s.completedAt || s.startedAt || review.createdAt,
        entityUrl: "#",
        status: s.status,
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
    ...communications.map((c) => ({
      id: `comm-${c.id}`,
      type: "communication" as const,
      title: c.subject || c.content.slice(0, 60),
      description: `${c.channel.toUpperCase()} • ${c.direction}`,
      timestamp: c.sentAt || c.createdAt,
      entityUrl: `/dashboard/communications/${c.id}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const reviewComments = review.stages
    .filter((s) => s.comments)
    .map((s, index) => ({
      id: `comment-${index}`,
      content: s.comments || "",
      user: getUserById(s.reviewerId)!,
      createdAt: s.completedAt || s.startedAt || review.createdAt,
      updatedAt: s.completedAt,
      isInternal: true,
    }));

  return (
    <div className="space-y-6">
      <ReviewRecordHeader
        review={review}
        client={client}
        matter={matter}
        actions={
          <>
            {currentStage && currentStage.status !== "completed" && review.status !== "completed" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <CheckCircle className="mr-1.5 h-4 w-4" />
                    Take Action
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {reviewActions.map((action) => (
                    <DropdownMenuItem
                      key={action.value}
                      className={cn(action.variant === "destructive" && "text-destructive focus:text-destructive")}
                      onSelect={() => alert(`${action.label} action for stage ${currentStage.stageNumber}`)}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/reviews")}>
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Back to Inbox
            </Button>
          </>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
          {reviewTabs.map((tab) => (
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
          <ReviewOverviewTab
            review={review}
            client={client}
            matter={matter}
            task={task}
            complianceCycle={complianceCycle}
            assignedReviewer={assignedReviewer}
            assignedBy={assignedBy}
            currentStage={currentStage}
            pendingTasks={pendingTasks}
            overdueTasks={overdueTasks}
            documents={documents}
            communications={communications}
            tasks={tasks}
          />
        </TabsContent>

        <TabsContent value="stages" className="space-y-6">
          <ReviewStagesTab review={review} currentStage={currentStage} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ReviewDocumentsTab documents={documents} review={review} onDocumentClick={handleDocumentClick} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <ReviewTasksTab tasks={tasks} onTaskClick={handleTaskClick} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <ReviewCommunicationsTab communications={communications} onCommunicationClick={handleCommunicationClick} />
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <ReviewCommentsTab comments={reviewComments} review={review} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ReviewHistoryTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReviewOverviewTab({
  review,
  client,
  matter,
  task,
  complianceCycle,
  assignedReviewer,
  assignedBy,
  currentStage,
  pendingTasks,
  overdueTasks,
  documents,
  communications,
  tasks,
}: {
  review: Review;
  client: any;
  matter: any;
  task: any;
  complianceCycle: any;
  assignedReviewer: any;
  assignedBy: any;
  currentStage: any;
  pendingTasks: Task[];
  overdueTasks: Task[];
  documents: Document[];
  communications: Communication[];
  tasks: Task[];
}) {
  const completedStages = review.stages.filter((s) => s.status === "completed").length;
  const totalStages = review.stages.length;
  const _isOverdue = daysOverdue(review.dueDate) > 0 && review.status !== "completed";

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Status"
          value={<ReviewStatusBadge status={review.status} />}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatTile
          label="Stages"
          value={`${completedStages}/${totalStages}`}
          icon={<ArrowRight className="h-5 w-5" />}
        />
        <StatTile
          label="Pending Tasks"
          value={pendingTasks.length}
          hint={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : undefined}
          icon={<CheckSquare className="h-5 w-5" />}
        />
        <StatTile label="Documents" value={documents.length} icon={<FileText className="h-5 w-5" />} />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Review Details">
          <KeyValueList
            items={[
              { label: "Review Number", value: review.reviewNumber },
              { label: "Type", value: review.reviewType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
              { label: "Priority", value: <PriorityBadge priority={review.priority} /> },
              { label: "Due Date", value: formatDate(review.dueDate) },
              { label: "Started", value: review.startedAt ? formatDate(review.startedAt) : "—" },
              { label: "Completed", value: review.completedAt ? formatDate(review.completedAt) : "—" },
              { label: "Overall Comments", value: review.overallComments || "—" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Assignment">
          <KeyValueList
            items={[
              { label: "Assigned Reviewer", value: assignedReviewer?.fullName || "—" },
              { label: "Reviewer Role", value: currentStage?.reviewerRole?.replace(/_/g, " ") || "—" },
              { label: "Assigned By", value: assignedBy?.fullName || "—" },
              { label: "Current Stage", value: currentStage?.name || "—" },
              { label: "Stage Status", value: currentStage ? <ReviewStatusBadge status={currentStage.status} /> : "—" },
              {
                label: "Stage Reviewer",
                value: currentStage ? getUserById(currentStage.reviewerId)?.fullName || "—" : "—",
              },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Linked Entities">
        <div className="grid gap-4 md:grid-cols-4">
          {client && <ClientLink client={client} showStatus={true} />}
          {matter && <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />}
          {task && <TaskLink task={task} showStatus={true} showMatter={true} matter={matter} />}
          {complianceCycle && (
            <ComplianceCycleLink cycle={complianceCycle} showStatus={true} showClient={true} client={client} />
          )}
        </div>
      </SectionCard>

      {review.tags.length > 0 && (
        <SectionCard title="Tags">
          <div className="flex flex-wrap gap-2">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function ReviewStagesTab({ review, currentStage }: { review: Review; currentStage: ReviewStage | undefined }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Multi-Stage Review Visualization">
        <div className="space-y-4">
          {review.stages.map((stage, _index) => {
            const isCompleted = stage.status === "completed";
            const isCurrent = stage.stageNumber === review.currentStage && stage.status !== "completed";
            const isPending = stage.status === "pending";

            return (
              <div
                key={stage.stageNumber}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-colors",
                  isCompleted
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                    : isCurrent
                      ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10"
                      : isPending
                        ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10"
                        : "bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-medium text-sm",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <CheckCircle className="h-6 w-6" /> : stage.stageNumber}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium capitalize",
                        isCompleted
                          ? "text-green-700 dark:text-green-300"
                          : isCurrent
                            ? "text-blue-700 dark:text-blue-300"
                            : "",
                      )}
                    >
                      {stage.name}
                    </span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="outline" className="text-green-600 text-xs dark:text-green-400">
                        Completed
                      </Badge>
                    )}
                    {isPending && (
                      <Badge variant="outline" className="text-xs text-yellow-600 dark:text-yellow-400">
                        Pending
                      </Badge>
                    )}
                    <ReviewStatusBadge status={stage.status} />
                  </div>
                  <div className="mt-2 grid gap-2 text-sm md:grid-cols-4">
                    <div>
                      <span className="text-muted-foreground">Reviewer:</span>{" "}
                      <span className="ml-2 font-medium">{getUserById(stage.reviewerId)?.fullName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Role:</span>{" "}
                      <span className="ml-2">{stage.reviewerRole.replace(/_/g, " ")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Started:</span>{" "}
                      <span className="ml-2">{stage.startedAt ? formatDate(stage.startedAt) : "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed:</span>{" "}
                      <span className="ml-2">{stage.completedAt ? formatDate(stage.completedAt) : "—"}</span>
                    </div>
                  </div>
                  {stage.comments && (
                    <p className="mt-2 text-muted-foreground text-sm">
                      <strong>Comment/Action:</strong> {stage.comments}
                    </p>
                  )}
                  {stage.action && (
                    <p className="mt-2 text-sm">
                      <strong>Action Taken:</strong>{" "}
                      <Badge
                        variant={
                          stage.action === "approve" ? "default" : stage.action === "reject" ? "destructive" : "outline"
                        }
                      >
                        {stage.action}
                      </Badge>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Stage Actions">
        {currentStage && currentStage.status !== "completed" && review.status !== "completed" && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => alert("Approve current stage")}>
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Approve
            </Button>
            <Button variant="destructive" onClick={() => alert("Reject current stage")}>
              <AlertCircle className="mr-1.5 h-4 w-4" />
              Reject
            </Button>
            <Button variant="outline" onClick={() => alert("Request rework for current stage")}>
              <AlertTriangle className="mr-1.5 h-4 w-4" />
              Request Rework
            </Button>
            <Button variant="outline" onClick={() => alert("Add comment to current stage")}>
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Add Comment
            </Button>
          </div>
        )}
        {review.status === "completed" && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">All stages completed. Review approved.</span>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Stage Configuration">
        <DataTable<ReviewStage>
          data={review.stages}
          columns={
            [
              {
                accessorKey: "stageNumber",
                header: "Stage",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="font-medium">Stage {row.original.stageNumber}</span>
                ),
              },
              {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="text-sm">{row.original.name}</span>
                ),
              },
              {
                accessorKey: "reviewerRole",
                header: "Reviewer Role",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <Badge variant="outline">{row.original.reviewerRole.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "reviewerId",
                header: "Reviewer",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="text-sm">
                    {getUserById(row.original.reviewerId)?.fullName || row.original.reviewerId}
                  </span>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <ReviewStatusBadge status={row.original.status} />
                ),
              },
              {
                accessorKey: "startedAt",
                header: "Started",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="text-sm">{row.original.startedAt ? formatDate(row.original.startedAt) : "—"}</span>
                ),
              },
              {
                accessorKey: "completedAt",
                header: "Completed",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="text-sm">
                    {row.original.completedAt ? formatDate(row.original.completedAt) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "comments",
                header: "Comments",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="text-muted-foreground text-sm">{row.original.comments || "—"}</span>
                ),
              },
              {
                accessorKey: "action",
                header: "Action",
                cell: ({ row }: { row: { original: ReviewStage } }) =>
                  row.original.action ? (
                    <Badge
                      variant={
                        row.original.action === "approve"
                          ? "default"
                          : row.original.action === "reject"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {row.original.action}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  ),
              },
            ] as any
          }
          getRowId={(row) => String(row.stageNumber)}
          pageSize={10}
          emptyMessage="No review stages"
        />
      </SectionCard>
    </div>
  );
}

function ReviewDocumentsTab({
  documents,
  review,
  onDocumentClick,
}: {
  documents: Document[];
  review: Review;
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

function ReviewTasksTab({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
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

function ReviewCommunicationsTab({
  communications,
  onCommunicationClick,
}: {
  communications: Communication[];
  onCommunicationClick: (comm: Communication) => void;
}) {
  if (communications.length === 0) return <EmptyCommunications />;

  return (
    <DataTable<Communication>
      data={communications}
      columns={
        [
          {
            accessorKey: "subject",
            header: "Subject",
            cell: ({ row }: { row: { original: Communication } }) => (
              <p className="font-medium">{row.original.subject || row.original.content.slice(0, 60)}</p>
            ),
          },
          {
            accessorKey: "channel",
            header: "Channel",
            cell: ({ row }: { row: { original: Communication } }) => (
              <Badge variant="secondary">{row.original.channel.toUpperCase()}</Badge>
            ),
          },
          {
            accessorKey: "direction",
            header: "Direction",
            cell: ({ row }: { row: { original: Communication } }) => (
              <Badge variant="outline">{row.original.direction}</Badge>
            ),
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: { original: Communication } }) => (
              <Badge variant="outline">{row.original.status}</Badge>
            ),
          },
          {
            accessorKey: "sentAt",
            header: "Sent",
            cell: ({ row }: { row: { original: Communication } }) => (
              <span className="text-sm">{row.original.sentAt ? formatDate(row.original.sentAt) : "—"}</span>
            ),
          },
        ] as any
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No communications"
      rowActions={[{ label: "View", action: onCommunicationClick }]}
    />
  );
}

function ReviewCommentsTab({ comments, review }: { comments: any[]; review: Review }) {
  if (comments.length === 0 && !review.overallComments) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-12 w-12 text-muted-foreground/50" />}
        title="No comments yet"
        description="Comments will appear here as reviewers add them to stages."
      />
    );
  }

  return (
    <div className="space-y-6">
      {review.overallComments && (
        <SectionCard title="Overall Review Comments">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm">{review.overallComments}</p>
          </div>
        </SectionCard>
      )}
      <SectionCard title="Stage Comments">
        <CommentThread comments={comments} currentUserId={mockUsers[0].id} />
      </SectionCard>
    </div>
  );
}

function ReviewHistoryTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}

// Import DropdownMenu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
