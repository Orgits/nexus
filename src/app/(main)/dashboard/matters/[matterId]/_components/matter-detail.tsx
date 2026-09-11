"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckSquare,
  Clock,
  CreditCard,
  FileText,
  FolderOpen,
  ListTodo,
  Mail,
  RefreshCw,
  Search,
  Timer,
  Users,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyCommunications, EmptyDocuments, EmptyState, EmptyTasks } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { MatterRecordHeader } from "@/components/ca-nexus/record-header";
import { MatterStatusBadge, PriorityBadge, StatusBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { formatCurrency, serviceTypeLabel } from "@/lib/labels";
import { getClientById } from "@/mock-data/clients";
import { getCommunicationsByMatter } from "@/mock-data/communications";
import { getDocumentsByMatter } from "@/mock-data/documents";
import { getMatterById, getTasksByMatter } from "@/mock-data/matters";
import { getTimeEntriesByMatter } from "@/mock-data/time-billing";
import { getTeamById, getUserById } from "@/mock-data/users";
import type { ChecklistItem, Communication, Document, Matter, MatterStage, Subtask, Task, TimeEntry } from "@/types";

const matterTabs = [
  { id: "overview", label: "Overview", icon: Briefcase },
  { id: "lifecycle", label: "Lifecycle", icon: RefreshCw },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "checklist", label: "Checklist", icon: ListTodo },
  { id: "subtasks", label: "Subtasks", icon: Clock },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "communications", label: "Communications", icon: Mail },
  { id: "time", label: "Time", icon: Timer },
  { id: "review", label: "Review", icon: Search },
  { id: "collaboration", label: "Collaboration", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "activity", label: "Activity", icon: Activity },
];

const lifecycleStages: { id: string; label: string; order: number; description: string }[] = [
  { id: "created", label: "Created", order: 1, description: "Matter created, awaiting information" },
  {
    id: "information_pending",
    label: "Information Pending",
    order: 2,
    description: "Waiting for client information or documents",
  },
  {
    id: "documents_pending",
    label: "Documents Pending",
    order: 3,
    description: "All information received, documents being collected",
  },
  { id: "in_progress", label: "In Progress", order: 4, description: "Active work in progress" },
  {
    id: "ready_for_review",
    label: "Ready for Review",
    order: 5,
    description: "Work completed, ready for partner/senior review",
  },
  { id: "rework", label: "Rework", order: 6, description: "Review identified issues requiring rework" },
  { id: "approved", label: "Approved", order: 7, description: "Work approved, ready for filing" },
  { id: "filed", label: "Filed", order: 8, description: "Filed with authority, awaiting acknowledgment" },
  { id: "completed", label: "Completed", order: 9, description: "Filing acknowledged, matter completed" },
  { id: "billing_followup", label: "Billing Follow-up", order: 10, description: "Invoice sent, awaiting payment" },
  { id: "closed", label: "Closed", order: 11, description: "Matter fully closed, all actions complete" },
];

export function MatterDetail({ matterId }: { matterId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [_search, _setSearch] = useState("");
  const [_filters, _setFilters] = useState<Record<string, unknown>>({});

  const matter = getMatterById(matterId);
  if (!matter) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Matter not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The matter you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/matters")}
          className="text-primary hover:underline"
        >
          Back to Matters
        </button>
      </div>
    );
  }

  const client = getClientById(matter.clientId);
  const tasks = getTasksByMatter(matterId);
  const documents = getDocumentsByMatter(matterId);
  const communications = getCommunicationsByMatter(matterId);
  const timeEntries = getTimeEntriesByMatter(matterId);
  const assignedUser = getUserById(matter.assignedUserId);
  const assignedTeam = matter.assignedTeamId ? getTeamById(matter.assignedTeamId) : undefined;
  const supervisingPartner = matter.supervisingPartnerId ? getUserById(matter.supervisingPartnerId) : undefined;

  const _pendingTasks = tasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const _completedTasks = tasks.filter((t) => t.status === "completed");
  const _overdueTasks = tasks.filter((t) => t.status !== "completed" && new Date(t.dueDate) < new Date());
  const _totalTime = timeEntries.reduce((sum, t) => sum + t.durationMinutes, 0);
  const _billableTime = timeEntries.filter((t) => t.isBillable).reduce((sum, t) => sum + t.durationMinutes, 0);

  const handleTaskClick = (task: Task) => router.push(`/dashboard/tasks/${task.id}`);

  return (
    <div className="space-y-6">
      <MatterRecordHeader
        matter={matter}
        client={client}
        actions={
          <Button size="sm" onClick={() => setActiveTab("lifecycle")}>
            Advance Stage
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 md:grid-cols-12">
          {matterTabs.map((tab) => (
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
          <MatterOverviewTab
            matter={matter}
            client={client}
            tasks={tasks}
            timeEntries={timeEntries}
            assignedUser={assignedUser}
            assignedTeam={assignedTeam}
            supervisingPartner={supervisingPartner}
            router={router}
          />
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-6">
          <MatterLifecycleTab matter={matter} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <MatterTasksTab tasks={tasks} onTaskClick={handleTaskClick} />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <MatterChecklistTab tasks={tasks} matter={matter} />
        </TabsContent>

        <TabsContent value="subtasks" className="space-y-4">
          <MatterSubtasksTab tasks={tasks} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <MatterDocumentsTab documents={documents} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <MatterCommunicationsTab communications={communications} router={router} />
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <MatterTimeTab timeEntries={timeEntries} matter={matter} />
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <MatterReviewTab matter={matter} tasks={tasks} />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <MatterCollaborationTab
            matter={matter}
            tasks={tasks}
            assignedUser={assignedUser}
            assignedTeam={assignedTeam}
            supervisingPartner={supervisingPartner}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <MatterBillingTab matter={matter} timeEntries={timeEntries} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <MatterActivityTab
            matter={matter}
            tasks={tasks}
            documents={documents}
            communications={communications}
            timeEntries={timeEntries}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MatterOverviewTab({
  matter,
  client,
  tasks,
  timeEntries,
  assignedUser,
  assignedTeam,
  supervisingPartner,
  router,
}: {
  matter: Matter;
  client: any;
  tasks: Task[];
  timeEntries: TimeEntry[];
  assignedUser: any;
  assignedTeam: any;
  supervisingPartner: any;
  router: ReturnType<typeof useRouter>;
}) {
  const pendingTasks = tasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && new Date(t.dueDate) < new Date());
  const totalTime = timeEntries.reduce((sum, t) => sum + t.durationMinutes, 0);
  const billableTime = timeEntries.filter((t) => t.isBillable).reduce((sum, t) => sum + t.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile label="Progress" value={`${matter.progress}%`} icon={<Briefcase className="h-5 w-5" />} />
        <StatTile
          label="Pending Tasks"
          value={pendingTasks.length}
          hint={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : undefined}
          icon={<CheckSquare className="h-5 w-5" />}
        />
        <StatTile
          label="Time Spent"
          value={`${Math.round(totalTime / 60)}h ${totalTime % 60}m`}
          hint={`${Math.round(billableTime / 60)}h billable`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatTile
          label="Budget Used"
          value={
            matter.budgetAmount ? `${Math.round((matter.actualHours / (matter.estimatedHours || 1)) * 100)}%` : "—"
          }
          icon={<CreditCard className="h-5 w-5" />}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Matter Details">
          <KeyValueList
            items={[
              { label: "Matter Number", value: matter.matterNumber },
              { label: "Service", value: matter.serviceName },
              { label: "Service Type", value: serviceTypeLabel(matter.serviceType) },
              { label: "Period", value: matter.period.label },
              { label: "Status", value: <MatterStatusBadge status={matter.status} /> },
              { label: "Priority", value: <PriorityBadge priority={matter.priority} /> },
              { label: "Stage", value: matter.stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
              { label: "Billing Method", value: matter.billingMethod.replace(/_/g, " ") },
              { label: "Budget", value: matter.budgetAmount ? formatCurrency(matter.budgetAmount) : "—" },
              { label: "Billed", value: formatCurrency(matter.billedAmount) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Assignment & Dates">
          <KeyValueList
            items={[
              { label: "Assigned To", value: assignedUser?.fullName || "—" },
              { label: "Team", value: assignedTeam?.name || "—" },
              { label: "Supervising Partner", value: supervisingPartner?.fullName || "—" },
              { label: "Due Date", value: formatDate(matter.dueDate) },
              { label: "Created", value: formatDate(matter.createdAt) },
              { label: "Estimated Hours", value: matter.estimatedHours ? `${matter.estimatedHours}h` : "—" },
              { label: "Actual Hours", value: `${matter.actualHours}h` },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Client">
        {client ? (
          <ClientLink client={client} showStatus={true} />
        ) : (
          <span className="text-muted-foreground">Client not found</span>
        )}
      </SectionCard>

      <SectionCard title="Recent Tasks">
        {tasks.length > 0 ? (
          <DataTable<Task>
            data={tasks.slice(0, 5)}
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
                        new Date(row.original.dueDate) < new Date() &&
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
            pageSize={5}
            emptyMessage="No tasks"
            rowActions={[{ label: "View", action: (row) => router.push(`/dashboard/tasks/${row.id}`) }]}
          />
        ) : (
          <EmptyState
            icon={<CheckSquare className="h-12 w-12 text-muted-foreground/50" />}
            title="No tasks"
            description="Create tasks to track work for this matter."
          />
        )}
      </SectionCard>
    </div>
  );
}

function MatterLifecycleTab({ matter }: { matter: Matter }) {
  const [currentStageId, setCurrentStageId] = useState<MatterStage>(matter.stage);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const currentStageIndex = lifecycleStages.findIndex((s) => s.id === currentStageId);
  const stageHistory = matter.stageHistory || [];

  const advanceStage = () => {
    if (currentStageIndex < lifecycleStages.length - 1) {
      setCurrentStageId(lifecycleStages[currentStageIndex + 1].id as MatterStage);
    }
  };

  const reworkStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageId(lifecycleStages[currentStageIndex - 1].id as MatterStage);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Lifecycle Visualization">
        <div className="space-y-4">
          {lifecycleStages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const _isFuture = index > currentStageIndex;
            const historyEntry = stageHistory.find((h) => h.stage === stage.id);

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-colors",
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
                  {isCompleted ? <AlertTriangle className="h-5 w-5" /> : stage.order}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium",
                        isCompleted
                          ? "text-green-700 dark:text-green-300"
                          : isCurrent
                            ? "text-blue-700 dark:text-blue-300"
                            : "",
                      )}
                    >
                      {stage.label}
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
                  </div>
                  <p className="mt-0.5 text-muted-foreground text-sm">{stage.description}</p>
                  {historyEntry && (
                    <p className="mt-1 text-muted-foreground text-xs">
                      Changed: {formatDate(historyEntry.changedAt)} by{" "}
                      {getUserById(historyEntry.changedBy)?.fullName || historyEntry.changedBy}
                      {historyEntry.notes && ` • ${historyEntry.notes}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Stage Actions">
        <div className="flex flex-wrap gap-2">
          {currentStageIndex < lifecycleStages.length - 1 && (
            <Button onClick={advanceStage}>Advance to {lifecycleStages[currentStageIndex + 1].label}</Button>
          )}
          {currentStageIndex > 0 && (
            <Button variant="outline" onClick={reworkStage}>
              Rework to {lifecycleStages[currentStageIndex - 1].label}
            </Button>
          )}
          <Button variant="ghost" onClick={() => setShowFullHistory((v) => !v)}>
            {showFullHistory ? "Hide History" : "View Full History"}
          </Button>
        </div>
      </SectionCard>

      {showFullHistory && (
        <SectionCard title="Stage History">
          {stageHistory.length > 0 ? (
            <div className="space-y-3">
              {[...stageHistory].reverse().map((entry, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {entry.stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">
                      {formatDate(entry.changedAt)} by {getUserById(entry.changedBy)?.fullName || entry.changedBy}
                    </p>
                    {entry.notes && <p className="mt-1 text-sm">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No stage history recorded.</p>
          )}
        </SectionCard>
      )}
    </div>
  );
}

function MatterTasksTab({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
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
                      new Date(row.original.dueDate) < new Date() &&
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
              {
                accessorKey: "estimatedHours",
                header: "Est. Hours",
                cell: ({ row }: { row: { original: Task } }) => (
                  <span className="text-sm">
                    {row.original.estimatedHours ? `${row.original.estimatedHours}h` : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "actualHours",
                header: "Actual",
                cell: ({ row }: { row: { original: Task } }) => (
                  <span className="text-sm">{row.original.actualHours}h</span>
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

function MatterChecklistTab({ tasks, matter }: { tasks: Task[]; matter: Matter }) {
  const allChecklistItems = tasks.flatMap((task) =>
    task.checklistItems.map((item) => ({ ...item, taskTitle: task.title, taskId: task.id })),
  );

  const mandatoryItems = allChecklistItems.filter((item) => item.isMandatory);
  const completedMandatory = mandatoryItems.filter((item) => item.isCompleted).length;
  const optionalItems = allChecklistItems.filter((item) => !item.isMandatory);
  const completedOptional = optionalItems.filter((item) => item.isCompleted).length;

  return (
    <div className="space-y-6">
      <SectionCard title="Checklist Summary" className="grid gap-4 md:grid-cols-4">
        <StatTile label="Total Items" value={allChecklistItems.length} icon={<ListTodo className="h-5 w-5" />} />
        <StatTile
          label="Mandatory"
          value={`${completedMandatory}/${mandatoryItems.length}`}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatTile
          label="Optional"
          value={`${completedOptional}/${optionalItems.length}`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatTile
          label="Completion"
          value={
            allChecklistItems.length > 0
              ? `${Math.round(((completedMandatory + completedOptional) / allChecklistItems.length) * 100)}%`
              : "0%"
          }
          icon={<CheckSquare className="h-5 w-5" />}
        />
      </SectionCard>

      <SectionCard title="Checklist Items">
        {allChecklistItems.length > 0 ? (
          <DataTable<ChecklistItem & { taskTitle: string; taskId: string }>
            data={allChecklistItems}
            columns={
              [
                {
                  accessorKey: "title",
                  header: "Item",
                  cell: ({ row }: { row: { original: ChecklistItem & { taskTitle: string } } }) => (
                    <p className="font-medium">{row.original.title}</p>
                  ),
                },
                {
                  accessorKey: "taskTitle",
                  header: "Task",
                  cell: ({ row }: { row: { original: ChecklistItem & { taskTitle: string } } }) => (
                    <span className="text-muted-foreground text-sm">{row.original.taskTitle}</span>
                  ),
                },
                {
                  accessorKey: "isMandatory",
                  header: "Mandatory",
                  cell: ({ row }: { row: { original: ChecklistItem & { taskTitle: string } } }) =>
                    row.original.isMandatory ? (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Optional
                      </Badge>
                    ),
                },
                {
                  accessorKey: "isCompleted",
                  header: "Status",
                  cell: ({ row }: { row: { original: ChecklistItem & { taskTitle: string } } }) =>
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
                  cell: ({ row }: { row: { original: ChecklistItem & { taskTitle: string } } }) => (
                    <span className="text-sm">
                      {row.original.completedAt ? formatDate(row.original.completedAt) : "—"}
                    </span>
                  ),
                },
                {
                  accessorKey: "completedBy",
                  header: "Completed By",
                  cell: ({ row }: { row: { original: ChecklistItem & { taskTitle: string } } }) => (
                    <span className="text-sm">
                      {row.original.completedBy ? getUserById(row.original.completedBy)?.fullName || "—" : "—"}
                    </span>
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
            icon={<ListTodo className="h-12 w-12 text-muted-foreground/50" />}
            title="No checklist items"
            description="Add checklist items to tasks to track detailed requirements."
          />
        )}
      </SectionCard>
    </div>
  );
}

function MatterSubtasksTab({ tasks }: { tasks: Task[] }) {
  const allSubtasks = tasks.flatMap((task) =>
    task.subtasks.map((subtask) => ({ ...subtask, taskTitle: task.title, taskId: task.id })),
  );

  return (
    <div className="space-y-4">
      <FilterBar
        filters={[
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "todo", label: "Todo" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
            ],
          },
        ]}
        values={{}}
        onSearch={() => {
          // no-op
        }}
        onChange={() => {
          // no-op
        }}
        compact
      />
      {allSubtasks.length > 0 ? (
        <DataTable<Subtask & { taskTitle: string }>
          data={allSubtasks}
          columns={
            [
              {
                accessorKey: "title",
                header: "Subtask",
                cell: ({ row }: { row: { original: Subtask & { taskTitle: string } } }) => (
                  <p className="font-medium">{row.original.title}</p>
                ),
              },
              {
                accessorKey: "taskTitle",
                header: "Parent Task",
                cell: ({ row }: { row: { original: Subtask & { taskTitle: string } } }) => (
                  <span className="text-muted-foreground text-sm">{row.original.taskTitle}</span>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Subtask & { taskTitle: string } } }) => (
                  <TaskStatusBadge status={row.original.status} />
                ),
              },
              {
                accessorKey: "dueDate",
                header: "Due",
                cell: ({ row }: { row: { original: Subtask & { taskTitle: string } } }) => (
                  <span className="text-sm">{row.original.dueDate ? formatDate(row.original.dueDate) : "—"}</span>
                ),
              },
              {
                accessorKey: "completedAt",
                header: "Completed",
                cell: ({ row }: { row: { original: Subtask & { taskTitle: string } } }) => (
                  <span className="text-sm">
                    {row.original.completedAt ? formatDate(row.original.completedAt) : "—"}
                  </span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={15}
          emptyMessage="No subtasks"
        />
      ) : (
        <EmptyState
          icon={<Clock className="h-12 w-12 text-muted-foreground/50" />}
          title="No subtasks"
          description="Subtasks break down tasks into smaller work items."
        />
      )}
    </div>
  );
}

function MatterDocumentsTab({ documents }: { documents: Document[] }) {
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
    />
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MatterCommunicationsTab({
  communications,
  router,
}: {
  communications: Communication[];
  router: ReturnType<typeof useRouter>;
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
            cell: ({ row }: { row: { original: Communication } }) => <StatusBadge status={row.original.status} />,
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
      rowActions={[{ label: "View", action: (row) => router.push(`/dashboard/communications/${row.id}`) }]}
    />
  );
}

function MatterTimeTab({ timeEntries, matter }: { timeEntries: TimeEntry[]; matter: Matter }) {
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
          label="Billable Time"
          value={`${Math.round(billableMinutes / 60)}h ${billableMinutes % 60}m`}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatTile
          label="Non-Billable"
          value={`${Math.round((totalMinutes - billableMinutes) / 60)}h {(totalMinutes - billableMinutes) % 60}m`}
          icon={<Clock className="h-5 w-5" />}
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
                    <span className="text-sm">{getUserById(row.original.userId)?.fullName || row.original.userId}</span>
                  ),
                },
                {
                  accessorKey: "startTime",
                  header: "Start",
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
            description="Time entries will appear here when team members log time against this matter."
          />
        )}
      </SectionCard>
    </div>
  );
}

function MatterReviewTab({ matter, tasks }: { matter: Matter; tasks: Task[] }) {
  const reviewTasks = tasks.filter((t) => ["in_review", "rework", "approved"].includes(t.status));

  return (
    <div className="space-y-6">
      <SectionCard title="Review Status">
        <KeyValueList
          items={[
            { label: "Current Stage", value: matter.stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
            { label: "Review Tasks", value: reviewTasks.length },
            { label: "Ready for Review", value: tasks.filter((t) => t.status === "in_review").length },
            { label: "In Rework", value: tasks.filter((t) => t.status === "rework").length },
            { label: "Completed", value: tasks.filter((t) => t.status === "completed").length },
          ]}
        />
      </SectionCard>

      <SectionCard title="Tasks Requiring Review">
        {reviewTasks.length > 0 ? (
          <DataTable<Task>
            data={reviewTasks}
            columns={
              [
                {
                  accessorKey: "title",
                  header: "Task",
                  cell: ({ row }: { row: { original: Task } }) => <p className="font-medium">{row.original.title}</p>,
                },
                {
                  accessorKey: "status",
                  header: "Review Status",
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
            emptyMessage="No review tasks"
          />
        ) : (
          <EmptyState
            icon={<Search className="h-12 w-12 text-muted-foreground/50" />}
            title="No tasks in review"
            description="Tasks will appear here when they reach the review stage."
          />
        )}
      </SectionCard>
    </div>
  );
}

function MatterCollaborationTab({
  matter,
  tasks,
  assignedUser,
  assignedTeam,
  supervisingPartner,
}: {
  matter: Matter;
  tasks: Task[];
  assignedUser: any;
  assignedTeam: any;
  supervisingPartner: any;
}) {
  const teamMembers = [
    { name: assignedUser?.fullName, role: "Assignee", avatar: assignedUser?.avatarUrl },
    { name: assignedTeam?.name, role: "Team", avatar: null },
    { name: supervisingPartner?.fullName, role: "Supervising Partner", avatar: supervisingPartner?.avatarUrl },
  ].filter((m) => m.name);

  return (
    <div className="space-y-6">
      <SectionCard title="Team">
        <div className="flex flex-wrap gap-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full" />
                ) : (
                  <span className="font-medium text-primary">
                    {member.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Task Assignment">
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
                accessorKey: "assignedUserId",
                header: "Assignee",
                cell: ({ row }: { row: { original: Task } }) => (
                  <span className="text-sm">{getUserById(row.original.assignedUserId)?.fullName || "—"}</span>
                ),
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
          emptyMessage="No tasks"
        />
      </SectionCard>
    </div>
  );
}

function MatterBillingTab({ matter, timeEntries }: { matter: Matter; timeEntries: TimeEntry[] }) {
  const billableMinutes = timeEntries.filter((t) => t.isBillable).reduce((sum, t) => sum + t.durationMinutes, 0);
  const billableHours = billableMinutes / 60;

  return (
    <div className="space-y-6">
      <SectionCard title="Billing Information">
        <KeyValueList
          items={[
            { label: "Billing Method", value: matter.billingMethod.replace(/_/g, " ") },
            { label: "Budget Amount", value: matter.budgetAmount ? formatCurrency(matter.budgetAmount) : "—" },
            { label: "Billed Amount", value: formatCurrency(matter.billedAmount) },
            { label: "Billable Time", value: `${billableHours.toFixed(1)}h` },
            { label: "Is Billable", value: matter.isBillable ? "Yes" : "No" },
          ]}
        />
      </SectionCard>

      <SectionCard title="Time to Bill">
        {timeEntries.filter((t) => t.isBillable && !t.invoiceId).length > 0 ? (
          <DataTable<TimeEntry>
            data={timeEntries.filter((t) => t.isBillable && !t.invoiceId)}
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
                  header: "Hours",
                  cell: ({ row }: { row: { original: TimeEntry } }) => (
                    <span className="text-sm">{row.original.durationMinutes / 60}h</span>
                  ),
                },
                {
                  accessorKey: "billingRate",
                  header: "Rate",
                  cell: ({ row }: { row: { original: TimeEntry } }) => (
                    <span className="text-sm">
                      {row.original.billingRate ? formatCurrency(row.original.billingRate) : "—"}
                    </span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No unbilled time entries"
          />
        ) : (
          <EmptyState
            icon={<CreditCard className="h-12 w-12 text-muted-foreground/50" />}
            title="No unbilled time"
            description="All billable time has been invoiced or no billable time recorded."
          />
        )}
      </SectionCard>
    </div>
  );
}

function MatterActivityTab({
  matter,
  tasks,
  documents,
  communications,
  timeEntries,
}: {
  matter: Matter;
  tasks: Task[];
  documents: Document[];
  communications: Communication[];
  timeEntries: TimeEntry[];
}) {
  const allActivities = [
    ...stageHistoryToActivities(matter.stageHistory || []),
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
    ...timeEntries.map((t) => ({
      id: `time-${t.id}`,
      type: "task" as const,
      title: `Time Entry: ${t.description}`,
      description: `${t.durationMinutes}m • ${t.isBillable ? "Billable" : "Non-billable"}`,
      timestamp: t.createdAt,
      entityUrl: `/dashboard/time-tracking/${t.id}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={allActivities} grouped maxItems={50} />
    </SectionCard>
  );
}

function stageHistoryToActivities(history: any[]): any[] {
  return history.map((h, index) => ({
    id: `stage-${index}`,
    type: "matter" as const,
    title: `Stage changed to ${h.stage.replace(/_/g, " ")}`,
    description: h.notes || "Stage transition",
    timestamp: h.changedAt,
    entityUrl: "#",
  }));
}
