"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  Clock,
  FileText,
  Link as LinkIcon,
  ListTodo,
  MessageSquare,
  Plus,
  Search,
  Timer,
} from "lucide-react";

import { ActivityTimeline, CommentThread } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyDocuments, EmptyState } from "@/components/ca-nexus/empty-state";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { TaskRecordHeader } from "@/components/ca-nexus/record-header";
import { PriorityBadge, StatusBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getCommunicationsByTask } from "@/mock-data/communications";
import { getDocumentsByTask } from "@/mock-data/documents";
import { getMatterById, getTaskById, getTasksByMatter } from "@/mock-data/matters";
import { getTimeEntriesByTask } from "@/mock-data/time-billing";
import { getTeamById, getUserById } from "@/mock-data/users";
import type { ChecklistItem, Client, Communication, Document, Matter, Subtask, Task, TimeEntry } from "@/types";

const taskTabs = [
  { id: "overview", label: "Overview", icon: CheckSquare },
  { id: "status", label: "Status", icon: AlertTriangle },
  { id: "subtasks", label: "Subtasks", icon: ListTodo },
  { id: "checklists", label: "Checklists", icon: Clock },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "dependencies", label: "Dependencies", icon: LinkIcon },
  { id: "time", label: "Time", icon: Timer },
  { id: "review", label: "Review", icon: Search },
  { id: "activity", label: "Activity", icon: Activity },
];

export function TaskDetail({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newChecklistMandatory, setNewChecklistMandatory] = useState(false);

  const task = getTaskById(taskId);
  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Task not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The task you're looking for doesn't exist.</p>
        <button type="button" onClick={() => router.push("/dashboard/tasks")} className="text-primary hover:underline">
          Back to Tasks
        </button>
      </div>
    );
  }

  const matter = task.matterId ? getMatterById(task.matterId) : undefined;
  const client = task.clientId ? getClientById(task.clientId) : undefined;
  const subtasks = task.subtasks;
  const checklistItems = task.checklistItems;
  const documents = getDocumentsByTask(taskId);
  const communications = getCommunicationsByTask(taskId);
  const timeEntries = getTimeEntriesByTask(taskId);
  const assignedUser = getUserById(task.assignedUserId);
  const assignedTeam = task.assignedTeamId ? getTeamById(task.assignedTeamId) : undefined;
  const createdByUser = getUserById(task.createdById);
  const dependencies = task.dependencies;
  const relatedTasks = task.matterId ? getTasksByMatter(task.matterId).filter((t) => t.id !== taskId) : [];

  const _completedSubtasks = subtasks.filter((s) => s.status === "completed").length;
  const _completedChecklist = checklistItems.filter((c) => c.isCompleted).length;
  const _mandatoryChecklist = checklistItems.filter((c) => c.isMandatory).length;
  const _completedMandatory = checklistItems.filter((c) => c.isMandatory && c.isCompleted).length;
  const _totalTime = timeEntries.reduce((sum: number, t: TimeEntry) => sum + t.durationMinutes, 0);

  const _handleSubtaskClick = (_subtask: Subtask) => {
    // Subtasks don't have their own detail page, but could open a dialog
  };

  return (
    <div className="space-y-6">
      <TaskRecordHeader task={task} matter={matter} client={client} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:grid-cols-10">
          {taskTabs.map((tab) => (
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
          <TaskOverviewTab
            task={task}
            matter={matter}
            client={client}
            subtasks={subtasks}
            checklistItems={checklistItems}
            documents={documents}
            communications={communications}
            timeEntries={timeEntries}
            assignedUser={assignedUser}
            assignedTeam={assignedTeam}
            createdByUser={createdByUser}
            dependencies={dependencies}
          />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <TaskStatusTab task={task} />
        </TabsContent>

        <TabsContent value="subtasks" className="space-y-4">
          <TaskSubtasksTab
            subtasks={subtasks}
            onAddSubtask={() => setShowAddSubtask(true)}
            showAddSubtask={showAddSubtask}
            setShowAddSubtask={setShowAddSubtask}
            newSubtaskTitle={newSubtaskTitle}
            setNewSubtaskTitle={setNewSubtaskTitle}
            taskId={taskId}
          />
        </TabsContent>

        <TabsContent value="checklists" className="space-y-4">
          <TaskChecklistsTab
            checklistItems={checklistItems}
            onAddChecklist={() => setShowAddChecklist(true)}
            showAddChecklist={showAddChecklist}
            setShowAddChecklist={setShowAddChecklist}
            newChecklistTitle={newChecklistTitle}
            setNewChecklistTitle={setNewChecklistTitle}
            newChecklistMandatory={newChecklistMandatory}
            setNewChecklistMandatory={setNewChecklistMandatory}
            taskId={taskId}
          />
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <TaskCommentsTab
            task={task}
            newComment={newComment}
            setNewComment={setNewComment}
            isInternalComment={isInternalComment}
            setIsInternalComment={setIsInternalComment}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <TaskDocumentsTab documents={documents} />
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <TaskDependenciesTab dependencies={dependencies} relatedTasks={relatedTasks} router={router} />
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <TaskTimeTab timeEntries={timeEntries} task={task} />
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <TaskReviewTab task={task} subtasks={subtasks} checklistItems={checklistItems} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <TaskActivityTab
            task={task}
            subtasks={subtasks}
            checklistItems={checklistItems}
            documents={documents}
            communications={communications}
            timeEntries={timeEntries}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskOverviewTab({
  task,
  matter,
  client,
  subtasks,
  checklistItems,
  documents,
  communications,
  timeEntries,
  assignedUser,
  assignedTeam,
  createdByUser,
  dependencies,
}: {
  task: Task;
  matter?: Matter;
  client?: Client;
  subtasks: Subtask[];
  checklistItems: ChecklistItem[];
  documents: Document[];
  communications: Communication[];
  timeEntries: TimeEntry[];
  assignedUser: any;
  assignedTeam: any;
  createdByUser: any;
  dependencies: any[];
}) {
  const completedSubtasks = subtasks.filter((s) => s.status === "completed").length;
  const completedChecklist = checklistItems.filter((c) => c.isCompleted).length;
  const totalTime = timeEntries.reduce((sum, t) => sum + t.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile label="Progress" value={`${task.progress}%`} icon={<CheckSquare className="h-5 w-5" />} />
        <StatTile
          label="Subtasks"
          value={`${completedSubtasks}/${subtasks.length}`}
          icon={<ListTodo className="h-5 w-5" />}
        />
        <StatTile
          label="Checklist"
          value={`${completedChecklist}/${checklistItems.length}`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatTile
          label="Time Spent"
          value={`${Math.round(totalTime / 60)}h ${totalTime % 60}m`}
          icon={<Timer className="h-5 w-5" />}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Task Details">
          <KeyValueList
            items={[
              { label: "Task Number", value: task.taskNumber },
              { label: "Status", value: <TaskStatusBadge status={task.status} /> },
              { label: "Priority", value: <PriorityBadge priority={task.priority} /> },
              { label: "Due Date", value: formatDate(task.dueDate) },
              { label: "Start Date", value: task.startDate ? formatDate(task.startDate) : "—" },
              { label: "Completed", value: task.completedAt ? formatDate(task.completedAt) : "—" },
              { label: "Estimated Hours", value: task.estimatedHours ? `${task.estimatedHours}h` : "—" },
              { label: "Actual Hours", value: `${task.actualHours}h` },
              { label: "Billable", value: task.isBillable ? "Yes" : "No" },
              { label: "Tags", value: task.tags.join(", ") || "—" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Assignment">
          <KeyValueList
            items={[
              { label: "Assignee", value: assignedUser?.fullName || "—" },
              { label: "Team", value: assignedTeam?.name || "—" },
              { label: "Created By", value: createdByUser?.fullName || "—" },
              { label: "Created", value: formatDate(task.createdAt) },
              { label: "Updated", value: formatDate(task.updatedAt) },
            ]}
          />
        </SectionCard>
      </div>

      {matter && (
        <SectionCard title="Matter">
          <MatterLink matter={matter} showStatus={true} client={client} />
        </SectionCard>
      )}

      {client && !matter && (
        <SectionCard title="Client">
          <ClientLink client={client} showStatus={true} />
        </SectionCard>
      )}

      {dependencies.length > 0 && (
        <SectionCard title="Dependencies">
          <ul className="space-y-2">
            {dependencies.map((dep, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{dep.type.replace(/_/g, " ")}</span>: Task {dep.taskId}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {task.description && (
        <SectionCard title="Description">
          <p className="text-muted-foreground text-sm">{task.description}</p>
        </SectionCard>
      )}
    </div>
  );
}

function TaskStatusTab({ task }: { task: Task }) {
  const statusFlow = [
    "todo",
    "in_progress",
    "in_review",
    "rework",
    "completed",
    "on_hold",
    "blocked",
    "cancelled",
  ] as const;
  const currentIndex = statusFlow.indexOf(task.status as any);

  return (
    <div className="space-y-6">
      <SectionCard title="Status Workflow">
        <div className="space-y-4">
          {statusFlow.map((status, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const _isFuture = index > currentIndex;

            return (
              <div
                key={status}
                className={cn(
                  "flex items-center gap-4 rounded-lg border p-4 transition-colors",
                  isCompleted
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                    : isCurrent
                      ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10"
                      : "bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-medium text-sm",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <CheckSquare className="h-5 w-5" /> : index + 1}
                </div>
                <div>
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
                    {status.replace(/_/g, " ")}
                  </span>
                  {isCurrent && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Current
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge variant="outline" className="ml-2 text-green-600 text-xs dark:text-green-400">
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Status Actions">
        <div className="flex flex-wrap gap-2">
          {currentIndex < statusFlow.length - 1 && task.status !== "completed" && task.status !== "cancelled" && (
            <Button onClick={() => alert(`Move to ${statusFlow[currentIndex + 1]}`)}>
              Move to {statusFlow[currentIndex + 1].replace(/_/g, " ")}
            </Button>
          )}
          {task.status !== "completed" && (
            <Button variant="outline" onClick={() => alert("Mark as completed")}>
              Mark Complete
            </Button>
          )}
          {task.status === "completed" && (
            <Button variant="ghost" onClick={() => alert("Reopen task")}>
              Reopen
            </Button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function TaskSubtasksTab({
  subtasks,
  onAddSubtask,
  showAddSubtask,
  setShowAddSubtask,
  newSubtaskTitle,
  setNewSubtaskTitle,
  taskId,
}: {
  subtasks: Subtask[];
  onAddSubtask: () => void;
  showAddSubtask: boolean;
  setShowAddSubtask: (v: boolean) => void;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (v: string) => void;
  taskId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Subtasks ({subtasks.length})</h3>
        {showAddSubtask ? (
          <div className="flex gap-2">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Subtask title"
              className="w-64"
            />
            <Button onClick={() => alert("Add subtask functionality")}>Add</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddSubtask(false);
                setNewSubtaskTitle("");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={onAddSubtask}>
            <Plus className="mr-1 h-4 w-4" />
            Add Subtask
          </Button>
        )}
      </div>

      {subtasks.length > 0 ? (
        <DataTable<Subtask>
          data={subtasks}
          columns={
            [
              {
                accessorKey: "title",
                header: "Subtask",
                cell: ({ row }: { row: { original: Subtask } }) => <p className="font-medium">{row.original.title}</p>,
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Subtask } }) => <TaskStatusBadge status={row.original.status} />,
              },
              {
                accessorKey: "dueDate",
                header: "Due",
                cell: ({ row }: { row: { original: Subtask } }) => (
                  <span className="text-sm">{row.original.dueDate ? formatDate(row.original.dueDate) : "—"}</span>
                ),
              },
              {
                accessorKey: "completedAt",
                header: "Completed",
                cell: ({ row }: { row: { original: Subtask } }) => (
                  <span className="text-sm">
                    {row.original.completedAt ? formatDate(row.original.completedAt) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "order",
                header: "Order",
                cell: ({ row }: { row: { original: Subtask } }) => (
                  <span className="text-sm">{row.original.order}</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No subtasks"
        />
      ) : (
        <EmptyState
          icon={<ListTodo className="h-12 w-12 text-muted-foreground/50" />}
          title="No subtasks"
          description="Break down this task into smaller work items."
          action={
            <Button size="sm" onClick={onAddSubtask}>
              <Plus className="mr-1 h-4 w-4" />
              Add Subtask
            </Button>
          }
        />
      )}
    </div>
  );
}

function TaskChecklistsTab({
  checklistItems,
  onAddChecklist,
  showAddChecklist,
  setShowAddChecklist,
  newChecklistTitle,
  setNewChecklistTitle,
  newChecklistMandatory,
  setNewChecklistMandatory,
  taskId,
}: {
  checklistItems: ChecklistItem[];
  onAddChecklist: () => void;
  showAddChecklist: boolean;
  setShowAddChecklist: (v: boolean) => void;
  newChecklistTitle: string;
  setNewChecklistTitle: (v: string) => void;
  newChecklistMandatory: boolean;
  setNewChecklistMandatory: (v: boolean) => void;
  taskId: string;
}) {
  const mandatoryItems = checklistItems.filter((c) => c.isMandatory);
  const completedMandatory = mandatoryItems.filter((c) => c.isCompleted).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Checklist Items ({checklistItems.length})</h3>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span>
            Mandatory: {completedMandatory}/{mandatoryItems.length}
          </span>
        </div>
      </div>

      {checklistItems.length > 0 ? (
        <DataTable<ChecklistItem>
          data={checklistItems}
          columns={
            [
              {
                accessorKey: "title",
                header: "Item",
                cell: ({ row }: { row: { original: ChecklistItem } }) => (
                  <p className="font-medium">{row.original.title}</p>
                ),
              },
              {
                accessorKey: "isMandatory",
                header: "Required",
                cell: ({ row }: { row: { original: ChecklistItem } }) =>
                  row.original.isMandatory ? (
                    <Badge variant="destructive" className="text-xs">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      No
                    </Badge>
                  ),
              },
              {
                accessorKey: "isCompleted",
                header: "Status",
                cell: ({ row }: { row: { original: ChecklistItem } }) =>
                  row.original.isCompleted ? (
                    <Badge variant="default" className="text-xs">
                      Done
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  ),
              },
              {
                accessorKey: "completedAt",
                header: "Completed",
                cell: ({ row }: { row: { original: ChecklistItem } }) => (
                  <span className="text-sm">
                    {row.original.completedAt ? formatDate(row.original.completedAt) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "completedBy",
                header: "By",
                cell: ({ row }: { row: { original: ChecklistItem } }) => (
                  <span className="text-sm">
                    {row.original.completedBy ? getUserById(row.original.completedBy)?.fullName || "—" : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "order",
                header: "Order",
                cell: ({ row }: { row: { original: ChecklistItem } }) => (
                  <span className="text-sm">{row.original.order}</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={15}
          emptyMessage="No checklist items"
        />
      ) : (
        <EmptyState
          icon={<Clock className="h-12 w-12 text-muted-foreground/50" />}
          title="No checklist items"
          description="Add checklist items to track detailed requirements."
          action={
            <Button size="sm" onClick={onAddChecklist}>
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </Button>
          }
        />
      )}
    </div>
  );
}

function TaskCommentsTab({
  task,
  newComment,
  setNewComment,
  isInternalComment,
  setIsInternalComment,
}: {
  task: Task;
  newComment: string;
  setNewComment: (v: string) => void;
  isInternalComment: boolean;
  setIsInternalComment: (v: boolean) => void;
}) {
  const mockComments = [
    {
      id: "1",
      content: "Started working on this task. Will need financial statements from client.",
      user: getUserById("user-senior-001")!,
      createdAt: "2024-05-15T10:00:00Z",
      isInternal: true,
    },
    {
      id: "2",
      content: "Financial statements received. Beginning computation.",
      user: getUserById("user-senior-001")!,
      createdAt: "2024-05-20T14:30:00Z",
      isInternal: false,
    },
    {
      id: "3",
      content: "Please ensure we have the latest Form 26AS before proceeding.",
      user: getUserById("user-partner-001")!,
      createdAt: "2024-05-22T09:15:00Z",
      isInternal: true,
    },
  ];

  return (
    <div className="space-y-4">
      <CommentThread
        comments={mockComments}
        onAddComment={(content) => alert(`Add comment: ${content}`)}
        onReply={(commentId, content) => alert(`Reply to ${commentId}: ${content}`)}
        currentUserId="user-admin-001"
      />
    </div>
  );
}

function TaskDocumentsTab({ documents }: { documents: Document[] }) {
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
    />
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TaskDependenciesTab({
  dependencies,
  relatedTasks,
  router,
}: {
  dependencies: any[];
  relatedTasks: Task[];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Dependencies">
        {dependencies.length > 0 ? (
          <ul className="space-y-2">
            {dependencies.map((dep, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{dep.type.replace(/_/g, " ")}</span>: Task {dep.taskId}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<LinkIcon className="h-12 w-12 text-muted-foreground/50" />}
            title="No dependencies"
            description="This task has no dependencies."
          />
        )}
      </SectionCard>

      <SectionCard title="Related Tasks in Same Matter">
        {relatedTasks.length > 0 ? (
          <DataTable<Task>
            data={relatedTasks}
            columns={
              [
                {
                  accessorKey: "title",
                  header: "Task",
                  cell: ({ row }: { row: { original: Task } }) => <p className="font-medium">{row.original.title}</p>,
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: Task } }) => <TaskStatusBadge status={row.original.status} />,
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
            emptyMessage="No related tasks"
            rowActions={[{ label: "View", action: (row) => router.push(`/dashboard/tasks/${row.id}`) }]}
          />
        ) : (
          <EmptyState
            icon={<LinkIcon className="h-12 w-12 text-muted-foreground/50" />}
            title="No related tasks"
            description="No other tasks in this matter."
          />
        )}
      </SectionCard>
    </div>
  );
}

function TaskTimeTab({ timeEntries, task }: { timeEntries: TimeEntry[]; task: Task }) {
  const totalMinutes = timeEntries.reduce((sum, t) => sum + t.durationMinutes, 0);
  const billableMinutes = timeEntries.filter((t) => t.isBillable).reduce((sum, t) => sum + t.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <SectionCard title="Time Summary" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Total Time"
          value={`${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`}
          icon={<Timer className="h-5 w-5" />}
        />
        <StatTile
          label="Billable"
          value={`${Math.round(billableMinutes / 60)}h ${billableMinutes % 60}m`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatTile
          label="Non-Billable"
          value={`${Math.round((totalMinutes - billableMinutes) / 60)}h {(totalMinutes - billableMinutes) % 60}m`}
          icon={<Timer className="h-5 w-5" />}
        />
        <StatTile label="Entries" value={timeEntries.length} icon={<FileText className="h-5 w-5" />} />
      </SectionCard>

      <SectionCard title="Time Entries">
        {timeEntries.length > 0 ? (
          <DataTable<TimeEntry>
            data={timeEntries}
            columns={
              [
                {
                  accessorKey: "description",
                  header: "Description",
                  cell: ({ row }: { row: { original: TimeEntry } }) => (
                    <p className="font-medium">{row.original.description}</p>
                  ),
                },
                {
                  accessorKey: "userId",
                  header: "User",
                  cell: ({ row }: { row: { original: TimeEntry } }) => (
                    <span className="text-sm">{getUserById(row.original.userId)?.fullName || "—"}</span>
                  ),
                },
                {
                  accessorKey: "startTime",
                  header: "Date",
                  cell: ({ row }: { row: { original: TimeEntry } }) => (
                    <span className="text-sm">{formatDate(row.original.startTime)}</span>
                  ),
                },
                {
                  accessorKey: "durationMinutes",
                  header: "Duration",
                  cell: ({ row }: { row: { original: TimeEntry } }) => (
                    <span className="text-sm">
                      {Math.floor(row.original.durationMinutes / 60)}h {row.original.durationMinutes % 60}m
                    </span>
                  ),
                },
                {
                  accessorKey: "isBillable",
                  header: "Billable",
                  cell: ({ row }: { row: { original: TimeEntry } }) => (
                    <Badge variant={row.original.isBillable ? "default" : "secondary"} className="text-xs">
                      {row.original.isBillable ? "Yes" : "No"}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: TimeEntry } }) => <StatusBadge status={row.original.status} />,
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No time entries"
          />
        ) : (
          <EmptyState
            icon={<Timer className="h-12 w-12 text-muted-foreground/50" />}
            title="No time entries"
            description="Log time against this task to track effort."
          />
        )}
      </SectionCard>
    </div>
  );
}

function TaskReviewTab({
  task,
  subtasks,
  checklistItems,
}: {
  task: Task;
  subtasks: Subtask[];
  checklistItems: ChecklistItem[];
}) {
  const mandatoryItems = checklistItems.filter((c) => c.isMandatory);
  const completedMandatory = mandatoryItems.filter((c) => c.isCompleted).length;

  return (
    <div className="space-y-6">
      <SectionCard title="Review Readiness">
        <KeyValueList
          items={[
            { label: "Task Status", value: <TaskStatusBadge status={task.status} /> },
            { label: "Progress", value: `${task.progress}%` },
            {
              label: "Subtasks Complete",
              value: `${subtasks.filter((s) => s.status === "completed").length}/${subtasks.length}`,
            },
            { label: "Mandatory Checklist", value: `${completedMandatory}/${mandatoryItems.length}` },
            {
              label: "All Checklist",
              value: `${checklistItems.filter((c) => c.isCompleted).length}/${checklistItems.length}`,
            },
            { label: "Ready for Review", value: task.status === "in_review" ? "Yes" : "No" },
          ]}
        />
      </SectionCard>

      <SectionCard title="Review Actions">
        <div className="flex flex-wrap gap-2">
          {task.status !== "in_review" && (
            <Button onClick={() => alert("Submit for review")}>
              <ArrowRight className="mr-1 h-4 w-4" />
              Submit for Review
            </Button>
          )}
          {task.status === "in_review" && (
            <>
              <Button onClick={() => alert("Approve")}>Approve</Button>
              <Button variant="destructive" onClick={() => alert("Request rework")}>
                Request Rework
              </Button>
            </>
          )}
          {task.status === "rework" && (
            <Button onClick={() => alert("Resubmit after rework")}>
              <ArrowRight className="mr-1 h-4 w-4" />
              Resubmit
            </Button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function TaskActivityTab({
  task,
  subtasks,
  checklistItems,
  documents,
  communications,
  timeEntries,
}: {
  task: Task;
  subtasks: Subtask[];
  checklistItems: ChecklistItem[];
  documents: Document[];
  communications: Communication[];
  timeEntries: TimeEntry[];
}) {
  const allActivities = [
    ...subtasks.map((s) => ({
      id: `subtask-${s.id}`,
      type: "task" as const,
      title: `Subtask: ${s.title}`,
      description: `Status: ${s.status}`,
      timestamp: s.updatedAt || s.createdAt,
      entityUrl: "#",
    })),
    ...checklistItems.map((c) => ({
      id: `checklist-${c.id}`,
      type: "task" as const,
      title: `Checklist: ${c.title}`,
      description: c.isCompleted ? "Completed" : "Pending",
      timestamp: c.completedAt || c.createdAt,
      entityUrl: "#",
    })),
    ...documents.map((d) => ({
      id: `doc-${d.id}`,
      type: "document" as const,
      title: `Document: ${d.originalFileName}`,
      description: `${d.category} • ${d.documentType}`,
      timestamp: d.createdAt,
      entityUrl: "#",
    })),
    ...communications.map((c) => ({
      id: `comm-${c.id}`,
      type: "communication" as const,
      title: c.subject || c.content.slice(0, 60),
      description: `${c.channel.toUpperCase()} • ${c.direction}`,
      timestamp: c.sentAt || c.createdAt,
      entityUrl: "#",
    })),
    ...timeEntries.map((t) => ({
      id: `time-${t.id}`,
      type: "task" as const,
      title: `Time Entry: ${t.description}`,
      description: `${t.durationMinutes}m • ${t.isBillable ? "Billable" : "Non-billable"}`,
      timestamp: t.createdAt,
      entityUrl: "#",
    })),
    {
      id: `task-created`,
      type: "task" as const,
      title: `Task created: ${task.title}`,
      description: `Assigned to ${getUserById(task.assignedUserId)?.fullName || task.assignedUserId}`,
      timestamp: task.createdAt,
      entityUrl: "#",
    },
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={allActivities} grouped maxItems={50} />
    </SectionCard>
  );
}
