"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  Clipboard,
  Clock,
  FileText,
  Key,
  Mail,
  Settings,
  UserRound,
  XCircle,
} from "lucide-react";

import type { ActivityItem } from "@/components/ca-nexus/activity-timeline";
import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, PageHeader, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { PriorityBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { mockClients } from "@/mock-data/clients";
import { getComplianceCyclesByUser } from "@/mock-data/compliance";
import { mockTeamWorkload } from "@/mock-data/dashboard";
import { mockMatters, mockTasks } from "@/mock-data/matters";
import { getReviewsByAssignedUser } from "@/mock-data/reviews";
import { getUserById, mockUsers } from "@/mock-data/users";
import type { ComplianceCycle, Task, User } from "@/types";

const roleVariant = (role: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (role) {
    case "admin":
      return "destructive";
    case "partner":
      return "default";
    case "manager":
      return "secondary";
    default:
      return "outline";
  }
};

function getUtilizationHint(utilization: number): string {
  if (utilization > 100) return "Overloaded";
  if (utilization < 70) return "Underutilized";
  return "Optimal";
}

const userTabs = [
  { id: "overview", label: "Overview", icon: UserRound },
  { id: "tasks", label: "Tasks", icon: CheckCircle },
  { id: "matters", label: "Matters", icon: Briefcase },
  { id: "compliance", label: "Compliance", icon: FileText },
  { id: "reviews", label: "Reviews", icon: Clipboard },
  { id: "workload", label: "Workload", icon: BarChart3 },
  { id: "activity", label: "Activity", icon: Activity },
];

// Using ActivityItem from activity-timeline which has the required user property

export function UserDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const user = getUserById(userId);
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <UserRound className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">User not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The user you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/administration/users")}
          className="text-primary hover:underline"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const userTasks = mockTasks.filter((t) => t.assignedUserId === userId);
  const userMatters = mockMatters.filter((m) => m.assignedUserId === userId);
  const userCompliance = getComplianceCyclesByUser(userId);
  const userReviews = getReviewsByAssignedUser(userId);
  const baseWorkload = mockTeamWorkload.find((w) => w.userId === userId);
  const workload = baseWorkload
    ? {
        ...baseWorkload,
        overdueTasks: userTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "completed").length,
      }
    : undefined;

  const allActivities: ActivityItem[] = [
    ...userTasks.slice(0, 10).map((t) => ({
      id: `task-${t.id}`,
      type: "task" as const,
      title: `Task: ${t.title}`,
      description: `Matter: ${mockMatters.find((m) => m.id === t.matterId)?.name} • Status: ${t.status}`,
      user: mockUsers.find((u) => u.id === t.assignedUserId),
      timestamp: t.updatedAt,
      entityType: "task",
      entityId: t.id,
    })),
    ...userMatters.slice(0, 5).map((m) => ({
      id: `matter-${m.id}`,
      type: "matter" as const,
      title: `Matter: ${m.name}`,
      description: `Client: ${mockClients.find((c) => c.id === m.clientId)?.displayName} • Stage: ${m.stage}`,
      user: mockUsers.find((u) => u.id === m.assignedUserId),
      timestamp: m.updatedAt,
      entityType: "matter",
      entityId: m.id,
    })),
    ...userCompliance.slice(0, 5).map((c) => ({
      id: `compliance-${c.id}`,
      type: "system" as const,
      title: `Compliance: ${c.serviceName}`,
      description: `Period: ${c.period.label} • Status: ${c.status}`,
      user: mockUsers.find((u) => u.id === c.assignedUserId),
      timestamp: c.updatedAt,
      entityType: "compliance_cycle",
      entityId: c.id,
    })),
    ...userReviews.slice(0, 5).map((r) => ({
      id: `review-${r.id}`,
      type: "review" as const,
      title: `Review: ${r.title}`,
      description: `Type: ${r.reviewType} • Stage: ${r.currentStage}/${r.stages.length}`,
      user: mockUsers.find((u) => u.id === r.assignedReviewerId),
      timestamp: r.updatedAt,
      entityType: "review",
      entityId: r.id,
    })),
    {
      id: `login-${userId}`,
      type: "system" as const,
      title: "Last Login",
      description: user.lastLoginAt ? `Logged in from dashboard` : "Never logged in",
      timestamp: user.lastLoginAt || user.createdAt,
    },
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.fullName}
        description={`${user.role.replace(/_/g, " ")} • ${user.email}`}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/administration/users")}>
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Back to Users
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/dashboard/administration/users/${userId}/edit`)}
            >
              <Settings className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            <AvatarFallback className="text-xl">
              {user.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge variant={roleVariant(user.role)}>{user.role.replace(/_/g, " ")}</Badge>
              <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>{user.department?.name}</span>
              {user.teams.map((t) => (
                <Badge key={t.id} variant="outline" className="text-xs">
                  {t.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {userTabs.map((tab) => (
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
          <UserOverviewTab user={user} workload={workload} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <UserTasksTab tasks={userTasks} user={user} />
        </TabsContent>

        <TabsContent value="matters" className="space-y-6">
          <UserMattersTab matters={userMatters} user={user} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <UserComplianceTab compliance={userCompliance} user={user} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <UserReviewsTab reviews={userReviews} user={user} />
        </TabsContent>

        <TabsContent value="workload" className="space-y-6">
          <UserWorkloadTab user={user} workload={workload} userMatters={userMatters} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <UserActivityTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface WorkloadData {
  userId: string;
  userName: string;
  role: string;
  openTasks: number;
  openMatters: number;
  estimatedHours: number;
  actualHours: number;
  capacity: number;
  utilization: number;
  isOverloaded: boolean;
  isUnderutilized: boolean;
  href: string;
  overdueTasks: number;
}

function UserOverviewTab({ user, workload }: { user: User; workload: WorkloadData | undefined }) {
  const permissionsByModule = user.permissions.reduce(
    (acc, p) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push(`${p.action}:${p.scope}`);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Assigned Tasks"
          value={workload?.openTasks || 0}
          icon={<CheckCircle className="h-5 w-5" />}
          hint={`${workload?.utilization ? Math.round((workload.utilization / 100) * workload.openTasks) : 0} overdue`}
        />
        <StatTile
          label="Assigned Matters"
          value={workload?.openMatters || 0}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatTile
          label="Compliance Cycles"
          value={getComplianceCyclesByUser(user.id).length}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile
          label="Reviews Assigned"
          value={getReviewsByAssignedUser(user.id).length}
          icon={<Clipboard className="h-5 w-5" />}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Profile Information">
          <KeyValueList
            items={[
              { label: "Full Name", value: user.fullName },
              {
                label: "Email",
                value: (
                  <a href={`mailto:${user.email}`} className="text-primary hover:underline">
                    {user.email}
                  </a>
                ),
              },
              { label: "Phone", value: user.phone || "—" },
              { label: "Role", value: user.role.replace(/_/g, " ") },
              { label: "Department", value: user.department?.name || "—" },
              { label: "Teams", value: user.teams.length > 0 ? user.teams.map((t) => t.name).join(", ") : "—" },
              { label: "Timezone", value: user.timezone },
              { label: "Language", value: user.language },
              { label: "MFA Enabled", value: user.mfaEnabled ? "Yes" : "No" },
              {
                label: "Status",
                value: user.isActive ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                ),
              },
              { label: "Created", value: formatDate(user.createdAt.split("T")[0]) },
              { label: "Last Login", value: user.lastLoginAt ? formatDate(user.lastLoginAt.split("T")[0]) : "Never" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Permissions Summary">
          <div className="space-y-4">
            {Object.entries(permissionsByModule).map(([module, perms]) => (
              <div key={module} className="rounded-lg border p-3">
                <p className="font-medium capitalize">{module}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {perms.map((p, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => alert("Send password reset email")}>
            <Key className="mr-2 h-4 w-4" />
            Reset Password
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert("Send activation email")}>
            <Mail className="mr-2 h-4 w-4" />
            Resend Activation
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert("View audit log")}>
            <Activity className="mr-2 h-4 w-4" />
            View Audit Log
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert("Export user data")}>
            <FileText className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function UserTasksTab({ tasks, user }: { tasks: Task[]; user: User }) {
  const [statusFilter, setStatusFilter] = useState("");

  const filteredTasks = tasks.filter((t) => !statusFilter || t.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable<Task>
        data={filteredTasks}
        columns={
          [
            {
              accessorKey: "taskNumber",
              header: "Task #",
              cell: ({ row }: { row: { original: Task } }) => (
                <span className="font-medium text-sm">{row.original.taskNumber}</span>
              ),
            },
            {
              accessorKey: "title",
              header: "Title",
              cell: ({ row }: { row: { original: Task } }) => (
                <p className="line-clamp-1 font-medium text-sm">{row.original.title}</p>
              ),
            },
            {
              accessorKey: "matterId",
              header: "Matter",
              cell: ({ row }: { row: { original: Task } }) => {
                const matter = mockMatters.find((m) => m.id === row.original.matterId);
                return matter ? (
                  <MatterLink matter={matter} showStatus={false} />
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                );
              },
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
              header: "Due Date",
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
              accessorKey: "estimatedHours",
              header: "Est. Hours",
              cell: ({ row }: { row: { original: Task } }) => (
                <span className="text-sm">{row.original.estimatedHours || "—"}</span>
              ),
            },
            {
              accessorKey: "actualHours",
              header: "Actual Hours",
              cell: ({ row }: { row: { original: Task } }) => (
                <span className="text-sm">{row.original.actualHours}h</span>
              ),
            },
          ] satisfies Parameters<typeof DataTable<Task>>[0]["columns"]
        }
        getRowId={(row) => row.id}
        pageSize={10}
        emptyMessage="No tasks assigned"
        rowActions={[{ label: "View", action: (t: Task) => alert(`View task ${t.taskNumber}`) }]}
      />
    </div>
  );
}

interface UserMatter {
  id: string;
  matterNumber: string;
  name: string;
  clientId: string;
  serviceName: string;
  stage: string;
  progress: number;
  dueDate: string;
}

function UserMattersTab({ matters, user }: { matters: UserMatter[]; user: User }) {
  return (
    <DataTable<UserMatter>
      data={matters}
      columns={
        [
          {
            accessorKey: "matterNumber",
            header: "Matter #",
            cell: ({ row }: { row: { original: UserMatter } }) => (
              <span className="font-medium text-sm">{row.original.matterNumber}</span>
            ),
          },
          {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }: { row: { original: UserMatter } }) => (
              <p className="font-medium text-sm">{row.original.name}</p>
            ),
          },
          {
            accessorKey: "clientId",
            header: "Client",
            cell: ({ row }: { row: { original: UserMatter } }) => {
              const client = mockClients.find((c) => c.id === row.original.clientId);
              return client ? (
                <ClientLink client={client} showStatus={true} />
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              );
            },
          },
          {
            accessorKey: "serviceName",
            header: "Service",
            cell: ({ row }: { row: { original: UserMatter } }) => (
              <Badge variant="secondary">{row.original.serviceName}</Badge>
            ),
          },
          {
            accessorKey: "stage",
            header: "Stage",
            cell: ({ row }: { row: { original: UserMatter } }) => (
              <span className="text-sm capitalize">{row.original.stage.replace(/_/g, " ")}</span>
            ),
          },
          {
            accessorKey: "progress",
            header: "Progress",
            cell: ({ row }: { row: { original: UserMatter } }) => (
              <span className="text-sm">{row.original.progress}%</span>
            ),
          },
          {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }: { row: { original: UserMatter } }) => (
              <span className="text-sm">{formatDate(row.original.dueDate)}</span>
            ),
          },
        ] satisfies Parameters<typeof DataTable<UserMatter>>[0]["columns"]
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No matters assigned"
      rowActions={[{ label: "View", action: (m: UserMatter) => alert(`View matter ${m.matterNumber}`) }]}
    />
  );
}

function UserComplianceTab({ compliance, user }: { compliance: ComplianceCycle[]; user: User }) {
  return (
    <DataTable<ComplianceCycle>
      data={compliance}
      columns={
        [
          {
            accessorKey: "cycleNumber",
            header: "Cycle #",
            cell: ({ row }: { row: { original: ComplianceCycle } }) => (
              <span className="font-medium text-sm">{row.original.cycleNumber}</span>
            ),
          },
          {
            accessorKey: "serviceName",
            header: "Service",
            cell: ({ row }: { row: { original: ComplianceCycle } }) => (
              <p className="font-medium text-sm">{row.original.serviceName}</p>
            ),
          },
          {
            accessorKey: "period",
            header: "Period",
            cell: ({ row }: { row: { original: ComplianceCycle } }) => (
              <span className="text-sm">{row.original.period.label}</span>
            ),
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: { original: ComplianceCycle } }) => {
              const status = row.original.status;
              const isCompleted = status === "completed" || status === "filed";
              const isOverdue = status === "overdue";
              const variant = isCompleted ? "default" : isOverdue ? "destructive" : "secondary";
              return <Badge variant={variant}>{status.replace(/_/g, " ")}</Badge>;
            },
          },
          {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }: { row: { original: ComplianceCycle } }) => (
              <span className={cn("text-sm", row.original.isOverdue && "font-medium text-destructive")}>
                {formatDate(row.original.dueDate)}
              </span>
            ),
          },
          {
            accessorKey: "isOverdue",
            header: "Overdue",
            cell: ({ row }: { row: { original: ComplianceCycle } }) =>
              row.original.isOverdue ? (
                <Badge variant="destructive">{row.original.daysOverdue} days</Badge>
              ) : (
                <Badge variant="default">No</Badge>
              ),
          },
        ] satisfies Parameters<typeof DataTable<ComplianceCycle>>[0]["columns"]
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No compliance cycles assigned"
      rowActions={[{ label: "View", action: (c: ComplianceCycle) => alert(`View compliance ${c.cycleNumber}`) }]}
    />
  );
}

interface UserReview {
  id: string;
  reviewNumber: string;
  title: string;
  reviewType: string;
  status: string;
  currentStage: number;
  stages: unknown[];
  dueDate: string;
}

function UserReviewsTab({ reviews, user }: { reviews: UserReview[]; user: User }) {
  return (
    <DataTable<UserReview>
      data={reviews}
      columns={
        [
          {
            accessorKey: "reviewNumber",
            header: "Review #",
            cell: ({ row }: { row: { original: UserReview } }) => (
              <span className="font-medium text-sm">{row.original.reviewNumber}</span>
            ),
          },
          {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }: { row: { original: UserReview } }) => (
              <p className="font-medium text-sm">{row.original.title}</p>
            ),
          },
          {
            accessorKey: "reviewType",
            header: "Type",
            cell: ({ row }: { row: { original: UserReview } }) => (
              <Badge variant="secondary">{row.original.reviewType.replace(/_/g, " ")}</Badge>
            ),
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: { original: UserReview } }) => {
              const status = row.original.status;
              const variant = status === "completed" ? "default" : status === "in_progress" ? "secondary" : "outline";
              return <Badge variant={variant}>{status.replace(/_/g, " ")}</Badge>;
            },
          },
          {
            accessorKey: "currentStage",
            header: "Stage",
            cell: ({ row }: { row: { original: UserReview } }) => (
              <span className="text-sm">
                {row.original.currentStage}/{row.original.stages.length}
              </span>
            ),
          },
          {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }: { row: { original: UserReview } }) => (
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
        ] satisfies Parameters<typeof DataTable<UserReview>>[0]["columns"]
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No reviews assigned"
      rowActions={[{ label: "View", action: (r: any) => alert(`View review ${r.reviewNumber}`) }]}
    />
  );
}

interface WorkloadData {
  userId: string;
  userName: string;
  role: string;
  openTasks: number;
  openMatters: number;
  estimatedHours: number;
  actualHours: number;
  capacity: number;
  utilization: number;
  isOverloaded: boolean;
  isUnderutilized: boolean;
  href: string;
  overdueTasks: number;
}

interface UserMatter {
  id: string;
  name: string;
  clientId: string;
  stage: string;
  progress: number;
}

function UserWorkloadTab({
  user,
  workload,
  userMatters,
}: {
  user: User;
  workload: WorkloadData | undefined;
  userMatters: UserMatter[];
}) {
  if (!workload) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-12 w-12 text-muted-foreground/50" />}
        title="No workload data"
        description="Workload data will appear when tasks and matters are assigned"
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Utilization Overview" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Utilization"
          value={`${workload.utilization}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          hint={getUtilizationHint(workload.utilization)}
        />
        <StatTile
          label="Open Tasks"
          value={workload.openTasks}
          icon={<CheckCircle className="h-5 w-5" />}
          hint={`${workload.overdueTasks} overdue`}
        />
        <StatTile label="Open Matters" value={workload.openMatters} icon={<Briefcase className="h-5 w-5" />} />
        <StatTile
          label="Hours (Actual/Est.)"
          value={`${workload.actualHours}h / ${workload.estimatedHours || 0}h`}
          icon={<Clock className="h-5 w-5" />}
        />
      </SectionCard>

      <SectionCard title="Task Breakdown">
        <div className="grid gap-4 md:grid-cols-3">
          <StatTile
            label="To Do"
            value={mockTasks.filter((t) => t.assignedUserId === user.id && t.status === "todo").length}
            icon={<CheckCircle className="h-5 w-5 text-gray-600" />}
          />
          <StatTile
            label="In Progress"
            value={mockTasks.filter((t) => t.assignedUserId === user.id && t.status === "in_progress").length}
            icon={<CheckCircle className="h-5 w-5 text-blue-600" />}
          />
          <StatTile
            label="In Review"
            value={mockTasks.filter((t) => t.assignedUserId === user.id && t.status === "in_review").length}
            icon={<CheckCircle className="h-5 w-5 text-purple-600" />}
          />
          <StatTile
            label="Completed"
            value={mockTasks.filter((t) => t.assignedUserId === user.id && t.status === "completed").length}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          />
          <StatTile
            label="Overdue"
            value={
              mockTasks.filter(
                (t) => t.assignedUserId === user.id && new Date(t.dueDate) < new Date() && t.status !== "completed",
              ).length
            }
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          />
          <StatTile
            label="Blocked"
            value={mockTasks.filter((t) => t.assignedUserId === user.id && t.status === "blocked").length}
            icon={<XCircle className="h-5 w-5 text-orange-600" />}
          />
        </div>
      </SectionCard>

      <SectionCard title="Matter Distribution">
        <div className="space-y-2">
          {userMatters.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {mockClients.find((c) => c.id === m.clientId)?.displayName} • {m.stage.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{m.progress}%</span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${m.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function UserActivityTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}
