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
  Clock,
  FileText,
  Mail,
  Phone,
  Plus,
  Settings,
  UserRound,
  Users2,
} from "lucide-react";

import { type ActivityItem, ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { ClientLink, MatterLink, UserLink } from "@/components/ca-nexus/object-link";
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
import { getTeamById, getUsersByTeam, mockUsers } from "@/mock-data/users";
import type { Department, Task, Team, User } from "@/types";

const teamTabs = [
  { id: "overview", label: "Overview", icon: Users2 },
  { id: "members", label: "Members", icon: UserRound },
  { id: "matters", label: "Matters", icon: Briefcase },
  { id: "tasks", label: "Tasks", icon: CheckCircle },
  { id: "compliance", label: "Compliance", icon: FileText },
  { id: "workload", label: "Workload", icon: BarChart3 },
  { id: "activity", label: "Activity", icon: Activity },
];

function getRoleBadgeVariant(role: string): "destructive" | "default" | "secondary" | "outline" {
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
}

function getUtilizationHint(utilization: number): string {
  if (utilization > 100) return "Overloaded";
  if (utilization < 70) return "Underutilized";
  return "Optimal";
}

interface TeamActivityItem {
  id: string;
  type: "task" | "matter" | "compliance" | "review" | "member" | "system";
  title: string;
  description?: string;
  user?: User;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export function TeamDetail({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const team = getTeamById(teamId);
  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Users2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Team not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The team you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/administration/teams")}
          className="text-primary hover:underline"
        >
          Back to Teams
        </button>
      </div>
    );
  }

  const members = getUsersByTeam(teamId);
  const department = mockUsers.find((u) => u.id === team.departmentId)?.department;
  const lead = mockUsers.find((u) => u.id === team.leadId);

  // Calculate team workload
  const teamTasks = members.flatMap((m) => mockTasks.filter((t) => t.assignedUserId === m.id));
  const teamMatters = members.flatMap((_m) => mockMatters.filter((m) => m.assignedUserId === m.id));
  const openTasks = teamTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled");
  const overdueTasks = openTasks.filter((t) => new Date(t.dueDate) < new Date());
  const completedTasks = teamTasks.filter((t) => t.status === "completed");
  const avgUtilization = Math.round(
    members.reduce((sum, m) => sum + (mockTeamWorkload.find((w) => w.userId === m.id)?.utilization || 0), 0) /
      Math.max(1, members.length),
  );
  const totalEstimatedHours = teamTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActualHours = teamTasks.reduce((sum, t) => sum + t.actualHours, 0);

  // Team activities
  const allActivities: TeamActivityItem[] = [
    ...teamTasks.slice(0, 10).map((t) => ({
      id: `task-${t.id}`,
      type: "task" as const,
      title: `Task ${t.taskNumber}: ${t.title}`,
      description: `Assigned to ${mockUsers.find((u) => u.id === t.assignedUserId)?.fullName} • ${t.status}`,
      user: mockUsers.find((u) => u.id === t.assignedUserId),
      timestamp: t.updatedAt,
      entityType: "task",
      entityId: t.id,
    })),
    ...teamMatters.slice(0, 5).map((m) => ({
      id: `matter-${m.id}`,
      type: "matter" as const,
      title: `Matter: ${m.name}`,
      description: `Client: ${mockClients.find((c) => c.id === m.clientId)?.displayName} • ${m.stage}`,
      user: mockUsers.find((u) => u.id === m.assignedUserId),
      timestamp: m.updatedAt,
      entityType: "matter",
      entityId: m.id,
    })),
    ...members.slice(0, 3).map((m) => ({
      id: `member-${m.id}`,
      type: "member" as const,
      title: `Member: ${m.fullName}`,
      description: `Role: ${m.role.replace(/_/g, " ")}`,
      user: m,
      timestamp: m.createdAt,
      entityType: "user",
      entityId: m.id,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title={team.name}
        description={team.description}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/administration/teams")}>
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Back to Teams
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/dashboard/administration/teams/${teamId}/edit`)}
            >
              <Settings className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 bg-primary/10">
            <AvatarFallback className="text-2xl">
              {team.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {department && <Badge variant="secondary">{department.name}</Badge>}
              <Badge variant="outline">{team.specialization?.length || 0} specializations</Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>{members.length} members</span>
              <span>•</span>
              <span>{teamMatters.length} matters</span>
              <span>•</span>
              <span>{teamTasks.length} tasks</span>
            </div>
          </div>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {teamTabs.map((tab) => (
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
          <TeamOverviewTab
            team={team}
            members={members}
            lead={lead}
            department={department}
            stats={{
              openTasks: openTasks.length,
              overdueTasks: overdueTasks.length,
              completedTasks: completedTasks.length,
              openMatters: teamMatters.length,
              avgUtilization,
              totalEstimatedHours,
              totalActualHours,
            }}
          />
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <TeamMembersTab members={members} team={team} />
        </TabsContent>

        <TabsContent value="matters" className="space-y-6">
          <TeamMattersTab matters={teamMatters} team={team} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TeamTasksTab tasks={teamTasks} team={team} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <TeamComplianceTab team={team} members={members} />
        </TabsContent>

        <TabsContent value="workload" className="space-y-6">
          <TeamWorkloadTab
            team={team}
            members={members}
            stats={{
              openTasks: openTasks.length,
              overdueTasks: overdueTasks.length,
              completedTasks: completedTasks.length,
              openMatters: teamMatters.length,
              avgUtilization,
              totalEstimatedHours,
              totalActualHours,
            }}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <TeamActivityTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeamOverviewTab({
  team,
  members,
  lead,
  department,
  stats,
}: {
  team: Team;
  members: User[];
  lead: User | undefined;
  department: Department | undefined;
  stats: {
    openTasks: number;
    overdueTasks: number;
    completedTasks: number;
    openMatters: number;
    avgUtilization: number;
    totalEstimatedHours: number;
    totalActualHours: number;
  };
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile label="Members" value={members.length} icon={<Users2 className="h-5 w-5" />} />
        <StatTile
          label="Open Tasks"
          value={stats.openTasks}
          icon={<CheckCircle className="h-5 w-5" />}
          hint={`${stats.overdueTasks} overdue`}
        />
        <StatTile label="Matters" value={stats.openMatters} icon={<Briefcase className="h-5 w-5" />} />
        <StatTile
          label="Avg Utilization"
          value={`${stats.avgUtilization}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          hint={getUtilizationHint(stats.avgUtilization)}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Team Information">
          <KeyValueList
            items={[
              { label: "Team Name", value: team.name },
              { label: "Description", value: team.description || "—" },
              { label: "Department", value: department?.name || "—" },
              { label: "Team Lead", value: lead ? <UserLink user={lead} showRole={true} /> : "—" },
              { label: "Members", value: String(members.length) },
              {
                label: "Specializations",
                value: team.specialization?.map((s) => s.replace(/_/g, " ").toUpperCase()).join(", ") || "—",
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Workload Summary">
          <KeyValueList
            items={[
              { label: "Open Tasks", value: String(stats.openTasks) },
              {
                label: "Overdue Tasks",
                value:
                  stats.overdueTasks > 0 ? (
                    <span className="font-medium text-destructive">{stats.overdueTasks}</span>
                  ) : (
                    "0"
                  ),
              },
              { label: "Completed Tasks", value: String(stats.completedTasks) },
              { label: "Active Matters", value: String(stats.openMatters) },
              { label: "Total Est. Hours", value: `${stats.totalEstimatedHours}h` },
              { label: "Total Actual Hours", value: `${stats.totalActualHours}h` },
              { label: "Avg Utilization", value: `${stats.avgUtilization}%` },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Member Roles">
        <div className="grid gap-2 md:grid-cols-3">
          {members.map((m) => (
            <div key={m.id} className="rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={m.avatarUrl} alt={m.fullName} />
                  <AvatarFallback>
                    {m.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{m.fullName}</p>
                  <p className="text-muted-foreground text-xs">{m.role.replace(/_/g, " ")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function TeamMembersTab({ members, team }: { members: User[]; team: Team }) {
  const [statusFilter, setStatusFilter] = useState("");

  const filteredMembers = members.filter((m) => !statusFilter || m.isActive === (statusFilter === "active"));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Members</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => alert("Add member to team")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <DataTable<User>
        data={filteredMembers}
        columns={
          [
            {
              accessorKey: "avatar",
              header: "",
              cell: ({ row }: { row: { original: User } }) => (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={row.original.avatarUrl} alt={row.original.fullName} />
                  <AvatarFallback>
                    {row.original.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ),
            },
            {
              accessorKey: "fullName",
              header: "Member",
              cell: ({ row }: { row: { original: User } }) => (
                <div>
                  <p className="font-medium text-sm">{row.original.fullName}</p>
                  <p className="text-muted-foreground text-xs">{row.original.email}</p>
                </div>
              ),
            },
            {
              accessorKey: "role",
              header: "Role",
              cell: ({ row }: { row: { original: User } }) => (
                <Badge variant={getRoleBadgeVariant(row.original.role)}>{row.original.role.replace(/_/g, " ")}</Badge>
              ),
            },
            {
              accessorKey: "phone",
              header: "Contact",
              cell: ({ row }: { row: { original: User } }) => (
                <div className="text-sm">
                  {row.original.phone && (
                    <p>
                      <Phone className="mr-1 inline h-3 w-3" /> {row.original.phone}
                    </p>
                  )}
                  {row.original.email && (
                    <p>
                      <Mail className="mr-1 inline h-3 w-3" /> {row.original.email}
                    </p>
                  )}
                </div>
              ),
            },
            {
              accessorKey: "isActive",
              header: "Status",
              cell: ({ row }: { row: { original: User } }) => (
                <Badge variant={row.original.isActive ? "default" : "secondary"}>
                  {row.original.isActive ? "Active" : "Inactive"}
                </Badge>
              ),
            },
            {
              accessorKey: "workload",
              header: "Workload",
              cell: ({ row }: { row: { original: User } }) => {
                const userTasks = mockTasks.filter(
                  (t) => t.assignedUserId === row.original.id && t.status !== "completed" && t.status !== "cancelled",
                );
                const overdue = userTasks.filter((t) => new Date(t.dueDate) < new Date()).length;
                return (
                  <div className="text-sm">
                    <span className={cn("font-medium", overdue > 0 && "text-destructive")}>
                      {userTasks.length} tasks
                    </span>
                    {overdue > 0 && <span className="ml-1 text-destructive">({overdue} overdue)</span>}
                  </div>
                );
              },
            },
          ] as any
        }
        getRowId={(row) => row.id}
        pageSize={10}
        emptyMessage="No members in this team"
        rowActions={[{ label: "View Profile", action: (u: User) => alert(`View user ${u.fullName}`) }]}
      />
    </div>
  );
}

interface TeamMatter {
  id: string;
  matterNumber: string;
  name: string;
  clientId: string;
  assignedUserId: string;
  serviceName: string;
  stage: string;
  progress: number;
  dueDate: string;
}

function TeamMattersTab({ matters, team }: { matters: TeamMatter[]; team: Team }) {
  return (
    <DataTable<TeamMatter>
      data={matters}
      columns={
        [
          {
            accessorKey: "matterNumber",
            header: "Matter #",
            cell: ({ row }: { row: { original: TeamMatter } }) => (
              <span className="font-medium text-sm">{row.original.matterNumber}</span>
            ),
          },
          {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }: { row: { original: TeamMatter } }) => (
              <p className="font-medium text-sm">{row.original.name}</p>
            ),
          },
          {
            accessorKey: "clientId",
            header: "Client",
            cell: ({ row }: { row: { original: TeamMatter } }) => {
              const client = mockClients.find((c) => c.id === row.original.clientId);
              return client ? (
                <ClientLink client={client} showStatus={true} />
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              );
            },
          },
          {
            accessorKey: "assignedUserId",
            header: "Assigned To",
            cell: ({ row }: { row: { original: TeamMatter } }) => {
              const user = mockUsers.find((u) => u.id === row.original.assignedUserId);
              return user ? (
                <UserLink user={user} showRole={true} />
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              );
            },
          },
          {
            accessorKey: "serviceName",
            header: "Service",
            cell: ({ row }: { row: { original: TeamMatter } }) => (
              <Badge variant="secondary">{row.original.serviceName}</Badge>
            ),
          },
          {
            accessorKey: "stage",
            header: "Stage",
            cell: ({ row }: { row: { original: TeamMatter } }) => (
              <span className="text-sm capitalize">{row.original.stage.replace(/_/g, " ")}</span>
            ),
          },
          {
            accessorKey: "progress",
            header: "Progress",
            cell: ({ row }: { row: { original: TeamMatter } }) => (
              <span className="text-sm">{row.original.progress}%</span>
            ),
          },
          {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }: { row: { original: TeamMatter } }) => (
              <span className="text-sm">{formatDate(row.original.dueDate)}</span>
            ),
          },
        ] satisfies Parameters<typeof DataTable<TeamMatter>>[0]["columns"]
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No matters assigned to this team"
      rowActions={[{ label: "View", action: (m: TeamMatter) => alert(`View matter ${m.matterNumber}`) }]}
    />
  );
}

function TeamTasksTab({ tasks, team }: { tasks: Task[]; team: Team }) {
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
              accessorKey: "assignedUserId",
              header: "Assignee",
              cell: ({ row }: { row: { original: Task } }) => {
                const assignee = mockUsers.find((u) => u.id === row.original.assignedUserId);
                return assignee ? (
                  <UserLink user={assignee} showRole={true} />
                ) : (
                  <span className="text-muted-foreground text-sm">Unknown</span>
                );
              },
            },
            {
              accessorKey: "matterId",
              header: "Matter",
              cell: ({ row }: { row: { original: Task } }) => {
                const matter = mockMatters.find((m) => m.id === row.original.matterId);
                return matter ? (
                  <MatterLink matter={matter} showStatus={false} />
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
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
        emptyMessage="No tasks for this team"
        rowActions={[{ label: "View", action: (t: Task) => alert(`View task ${t.taskNumber}`) }]}
      />
    </div>
  );
}

interface TeamComplianceCycle {
  id: string;
  cycleNumber: string;
  serviceName: string;
  assignedUserId: string;
  period: { label: string };
  status: string;
  dueDate: string;
  isOverdue: boolean;
}

function TeamComplianceTab({ team, members }: { team: Team; members: User[] }) {
  const teamCompliance = members.flatMap((m) => getComplianceCyclesByUser(m.id));
  const overdueCompliance = teamCompliance.filter((c) => c.isOverdue);

  return (
    <div className="space-y-6">
      <SectionCard title="Compliance Summary" className="grid gap-4 md:grid-cols-4">
        <StatTile label="Total Cycles" value={teamCompliance.length} icon={<FileText className="h-5 w-5" />} />
        <StatTile
          label="Completed"
          value={teamCompliance.filter((c) => c.status === "completed" || c.status === "filed").length}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatTile
          label="In Progress"
          value={teamCompliance.filter((c) => c.status === "processing" || c.status === "ready_for_review").length}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
        />
        <StatTile
          label="Overdue"
          value={overdueCompliance.length}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        />
      </SectionCard>

      <DataTable<TeamComplianceCycle>
        data={teamCompliance}
        columns={
          [
            {
              accessorKey: "cycleNumber",
              header: "Cycle #",
              cell: ({ row }: { row: { original: TeamComplianceCycle } }) => (
                <span className="font-medium text-sm">{row.original.cycleNumber}</span>
              ),
            },
            {
              accessorKey: "serviceName",
              header: "Service",
              cell: ({ row }: { row: { original: TeamComplianceCycle } }) => (
                <p className="font-medium text-sm">{row.original.serviceName}</p>
              ),
            },
            {
              accessorKey: "assignedUserId",
              header: "Assignee",
              cell: ({ row }: { row: { original: TeamComplianceCycle } }) => {
                const user = mockUsers.find((u) => u.id === row.original.assignedUserId);
                return user ? (
                  <UserLink user={user} showRole={true} />
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                );
              },
            },
            {
              accessorKey: "period",
              header: "Period",
              cell: ({ row }: { row: { original: TeamComplianceCycle } }) => (
                <span className="text-sm">{row.original.period.label}</span>
              ),
            },
            {
              accessorKey: "status",
              header: "Status",
              cell: ({ row }: { row: { original: TeamComplianceCycle } }) => {
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
              cell: ({ row }: { row: { original: TeamComplianceCycle } }) => (
                <span className={cn("text-sm", row.original.isOverdue && "font-medium text-destructive")}>
                  {formatDate(row.original.dueDate)}
                </span>
              ),
            },
          ] satisfies Parameters<typeof DataTable<TeamComplianceCycle>>[0]["columns"]
        }
        getRowId={(row) => row.id}
        pageSize={10}
        emptyMessage="No compliance cycles for this team"
      />
    </div>
  );
}

interface WorkloadStats {
  openTasks: number;
  overdueTasks: number;
  completedTasks: number;
  openMatters: number;
  avgUtilization: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}

function TeamWorkloadTab({ team, members, stats }: { team: Team; members: User[]; stats: WorkloadStats }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Team Utilization" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Avg Utilization"
          value={`${stats.avgUtilization}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          hint={getUtilizationHint(stats.avgUtilization)}
        />
        <StatTile
          label="Total Open Tasks"
          value={stats.openTasks}
          icon={<CheckCircle className="h-5 w-5" />}
          hint={`${stats.overdueTasks} overdue`}
        />
        <StatTile label="Active Matters" value={stats.openMatters} icon={<Briefcase className="h-5 w-5" />} />
        <StatTile
          label="Hours (Act/Est)"
          value={`${stats.totalActualHours}h / ${stats.totalEstimatedHours}h`}
          icon={<Clock className="h-5 w-5" />}
        />
      </SectionCard>

      <SectionCard title="Member Workload">
        <DataTable<User>
          data={members}
          columns={
            [
              {
                accessorKey: "fullName",
                header: "Member",
                cell: ({ row }: { row: { original: User } }) => (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={row.original.avatarUrl} alt={row.original.fullName} />
                      <AvatarFallback className="text-xs">
                        {row.original.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{row.original.fullName}</span>
                  </div>
                ),
              },
              {
                accessorKey: "role",
                header: "Role",
                cell: ({ row }: { row: { original: User } }) => (
                  <Badge variant={getRoleBadgeVariant(row.original.role)}>{row.original.role.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "openTasks",
                header: "Open Tasks",
                cell: ({ row }: { row: { original: User } }) => {
                  const userTasks = mockTasks.filter(
                    (t) => t.assignedUserId === row.original.id && t.status !== "completed" && t.status !== "cancelled",
                  );
                  return <span className="font-medium">{userTasks.length}</span>;
                },
              },
              {
                accessorKey: "overdueTasks",
                header: "Overdue",
                cell: ({ row }: { row: { original: User } }) => {
                  const overdue = mockTasks.filter(
                    (t) =>
                      t.assignedUserId === row.original.id &&
                      new Date(t.dueDate) < new Date() &&
                      t.status !== "completed" &&
                      t.status !== "cancelled",
                  ).length;
                  return <span className={cn("font-medium", overdue > 0 && "text-destructive")}>{overdue}</span>;
                },
              },
              {
                accessorKey: "utilization",
                header: "Utilization",
                cell: ({ row }: { row: { original: User } }) => {
                  const wl = mockTeamWorkload.find((w) => w.userId === row.original.id);
                  return wl ? (
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${wl.utilization}%` }} />
                      </div>
                      <span className="w-16 text-right font-medium text-sm">{wl.utilization}%</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "estimatedHours",
                header: "Est. Hours",
                cell: ({ row }: { row: { original: User } }) => {
                  const est = mockTasks
                    .filter((t) => t.assignedUserId === row.original.id)
                    .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
                  const act = mockTasks
                    .filter((t) => t.assignedUserId === row.original.id)
                    .reduce((sum, t) => sum + t.actualHours, 0);
                  return (
                    <span className="text-sm">
                      {act}h / {est}h
                    </span>
                  );
                },
              },
            ] satisfies Parameters<typeof DataTable<User>>[0]["columns"]
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No members in this team"
        />
      </SectionCard>
    </div>
  );
}

function TeamActivityTab({ activities }: { activities: TeamActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline
        activities={activities.map(
          (a): ActivityItem => ({
            ...a,
            type: a.type === "compliance" ? "document" : a.type === "member" ? "system" : a.type,
            entityId: a.entityId,
            status: a.metadata?.status as string | undefined,
          }),
        )}
        grouped
        maxItems={50}
      />
    </SectionCard>
  );
}
