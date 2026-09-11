"use client";

import { useState } from "react";

import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Users } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { UserLink } from "@/components/ca-nexus/object-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMattersByUser, getTasksByUser } from "@/mock-data/matters";
import { getTimeEntriesByUser } from "@/mock-data/time-billing";
import { mockTeams, mockUsers } from "@/mock-data/users";
import type { User } from "@/types";

interface WorkloadUser {
  user: User;
  taskCount: number;
  overdueTasks: number;
  highPriorityTasks: number;
  totalHours: number;
  billableHours: number;
  capacity: number;
  utilization: number;
  status: "overloaded" | "optimal" | "underutilized";
}

const calculateUserWorkload = (user: User): WorkloadUser => {
  const userTasks = getTasksByUser(user.id);
  const userTimeEntries = getTimeEntriesByUser(user.id);
  const _userMatters = getMattersByUser(user.id);

  const taskCount = userTasks.length;
  const overdueTasks = userTasks.filter((t) => t.status !== "completed" && new Date(t.dueDate) < new Date()).length;
  const highPriorityTasks = userTasks.filter(
    (t) => t.priority === "high" || t.priority === "critical" || t.priority === "urgent",
  ).length;

  const totalHours = userTimeEntries.reduce((sum, t) => sum + t.durationMinutes, 0) / 60;
  const billableHours = userTimeEntries.filter((t) => t.isBillable).reduce((sum, t) => sum + t.durationMinutes, 0) / 60;

  const capacity = 40;
  const utilization = capacity > 0 ? Math.round((totalHours / capacity) * 100) : 0;

  let status: "overloaded" | "optimal" | "underutilized" = "optimal";
  if (utilization > 100 || overdueTasks > 5) status = "overloaded";
  else if (utilization < 50 && taskCount < 3) status = "underutilized";

  return {
    user,
    taskCount,
    overdueTasks,
    highPriorityTasks,
    totalHours: Math.round(totalHours * 10) / 10,
    billableHours: Math.round(billableHours * 10) / 10,
    capacity,
    utilization,
    status,
  };
};

const allUsers = mockUsers.filter((u) => u.isActive);
const workloadData = allUsers.map(calculateUserWorkload);

const teamWorkload = mockTeams.map((team) => {
  const teamMembers = allUsers.filter((u) => u.teams.some((t) => t.id === team.id));
  const membersWorkload = teamMembers.map(calculateUserWorkload);
  const avgUtilization =
    membersWorkload.length > 0
      ? Math.round(membersWorkload.reduce((sum, w) => sum + w.utilization, 0) / membersWorkload.length)
      : 0;
  const totalTasks = membersWorkload.reduce((sum, w) => sum + w.taskCount, 0);
  const overloadedCount = membersWorkload.filter((w) => w.status === "overloaded").length;
  const underutilizedCount = membersWorkload.filter((w) => w.status === "underutilized").length;

  return {
    team,
    members: membersWorkload,
    avgUtilization,
    totalTasks,
    overloadedCount,
    underutilizedCount,
    memberCount: membersWorkload.length,
  };
});

export function WorkloadPage() {
  const [view, setView] = useState<"users" | "teams">("users");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "partner", label: "Partner" },
        { value: "manager", label: "Manager" },
        { value: "senior_associate", label: "Senior Associate" },
        { value: "associate", label: "Associate" },
        { value: "intern", label: "Intern" },
      ],
    },
    {
      key: "status",
      label: "Workload Status",
      type: "select",
      options: [
        { value: "overloaded", label: "Overloaded" },
        { value: "optimal", label: "Optimal" },
        { value: "underutilized", label: "Underutilized" },
      ],
    },
    { key: "teamId", label: "Team", type: "select", options: mockTeams.map((t) => ({ value: t.id, label: t.name })) },
  ];

  const filteredWorkload = workloadData.filter((w) => {
    if (search && !w.user.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        if (key === "role" && w.user.role !== value) return false;
        if (key === "status" && w.status !== value) return false;
        if (key === "teamId" && !w.user.teams.some((t) => t.id === value)) return false;
      }
    }
    return true;
  });

  const overloadedUsers = workloadData.filter((w) => w.status === "overloaded").length;
  const optimalUsers = workloadData.filter((w) => w.status === "optimal").length;
  const underutilizedUsers = workloadData.filter((w) => w.status === "underutilized").length;
  const avgUtilization =
    workloadData.length > 0
      ? Math.round(workloadData.reduce((sum, w) => sum + w.utilization, 0) / workloadData.length)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Workload & Capacity</h1>
          <p className="text-muted-foreground text-sm">
            Monitor team and individual workload, capacity, and utilization
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={view === "users" ? "default" : "outline"} onClick={() => setView("users")}>
            <Users className="mr-1.5 h-4 w-4" />
            By User
          </Button>
          <Button variant={view === "teams" ? "default" : "outline"} onClick={() => setView("teams")}>
            <Users className="mr-1.5 h-4 w-4" />
            By Team
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Overloaded</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-destructive">{overloadedUsers}</div>
            <p className="text-muted-foreground text-xs">Users exceeding capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Optimal</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">{optimalUsers}</div>
            <p className="text-muted-foreground text-xs">Users at optimal capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Underutilized</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-blue-600">{underutilizedUsers}</div>
            <p className="text-muted-foreground text-xs">Users with available capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{avgUtilization}%</div>
            <p className="text-muted-foreground text-xs">Team average utilization</p>
          </CardContent>
        </Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search users by name..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {view === "users" ? (
        <DataTable<WorkloadUser>
          data={filteredWorkload}
          columns={
            [
              {
                accessorKey: "user",
                header: "User",
                cell: ({ row }: { row: { original: WorkloadUser } }) => (
                  <UserLink user={row.original.user} showRole={true} />
                ),
              },
              {
                accessorKey: "taskCount",
                header: "Tasks",
                cell: ({ row }: { row: { original: WorkloadUser } }) => (
                  <span className="font-medium">{row.original.taskCount}</span>
                ),
              },
              {
                accessorKey: "overdueTasks",
                header: "Overdue",
                cell: ({ row }: { row: { original: WorkloadUser } }) => (
                  <span className={cn("font-medium", row.original.overdueTasks > 0 && "text-destructive")}>
                    {row.original.overdueTasks}
                  </span>
                ),
              },
              {
                accessorKey: "highPriorityTasks",
                header: "High Priority",
                cell: ({ row }: { row: { original: WorkloadUser } }) => (
                  <span className={cn("font-medium", row.original.highPriorityTasks > 3 && "text-amber-600")}>
                    {row.original.highPriorityTasks}
                  </span>
                ),
              },
              {
                accessorKey: "totalHours",
                header: "Total Hours",
                cell: ({ row }: { row: { original: WorkloadUser } }) => (
                  <span className="font-medium">{row.original.totalHours}h</span>
                ),
              },
              {
                accessorKey: "billableHours",
                header: "Billable Hours",
                cell: ({ row }: { row: { original: WorkloadUser } }) => (
                  <span className="font-medium text-green-600">{row.original.billableHours}h</span>
                ),
              },
              {
                accessorKey: "utilization",
                header: "Utilization",
                cell: ({ row }: { row: { original: WorkloadUser } }) => (
                  <div className="w-32">
                    <Progress value={Math.min(row.original.utilization, 100)} className="h-2" />
                    <span className="mt-1 text-muted-foreground text-xs">{row.original.utilization}%</span>
                  </div>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: WorkloadUser } }) => (
                  <Badge
                    variant={
                      row.original.status === "overloaded"
                        ? "destructive"
                        : row.original.status === "underutilized"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                  </Badge>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.user.id}
          pageSize={15}
          emptyMessage="No users match your search or filters"
          rowActions={[
            { label: "View Tasks", action: (w: WorkloadUser) => alert(`View tasks for ${w.user.fullName}`) },
            {
              label: "View Time Entries",
              action: (w: WorkloadUser) => alert(`View time entries for ${w.user.fullName}`),
            },
          ]}
        />
      ) : (
        <div className="space-y-4">
          {teamWorkload
            .filter((t) => t.memberCount > 0)
            .map((team) => (
              <Card key={team.team.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{team.team.name}</CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {team.memberCount} members • {team.totalTasks} tasks
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <Progress value={Math.min(team.avgUtilization, 100)} className="h-2" />
                        <span className="mt-1 text-muted-foreground text-xs">
                          {team.avgUtilization}% avg utilization
                        </span>
                      </div>
                      {team.overloadedCount > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {team.overloadedCount} overloaded
                        </Badge>
                      )}
                      {team.underutilizedCount > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <TrendingDown className="h-3 w-3" />
                          {team.underutilizedCount} underutilized
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable<WorkloadUser>
                    data={team.members}
                    columns={
                      [
                        {
                          accessorKey: "user",
                          header: "Member",
                          cell: ({ row }: { row: { original: WorkloadUser } }) => (
                            <UserLink user={row.original.user} showRole={true} />
                          ),
                        },
                        {
                          accessorKey: "taskCount",
                          header: "Tasks",
                          cell: ({ row }: { row: { original: WorkloadUser } }) => (
                            <span className="font-medium">{row.original.taskCount}</span>
                          ),
                        },
                        {
                          accessorKey: "overdueTasks",
                          header: "Overdue",
                          cell: ({ row }: { row: { original: WorkloadUser } }) => (
                            <span className={cn("font-medium", row.original.overdueTasks > 0 && "text-destructive")}>
                              {row.original.overdueTasks}
                            </span>
                          ),
                        },
                        {
                          accessorKey: "totalHours",
                          header: "Hours",
                          cell: ({ row }: { row: { original: WorkloadUser } }) => (
                            <span className="font-medium">{row.original.totalHours}h</span>
                          ),
                        },
                        {
                          accessorKey: "billableHours",
                          header: "Billable",
                          cell: ({ row }: { row: { original: WorkloadUser } }) => (
                            <span className="font-medium text-green-600">{row.original.billableHours}h</span>
                          ),
                        },
                        {
                          accessorKey: "utilization",
                          header: "Utilization",
                          cell: ({ row }: { row: { original: WorkloadUser } }) => (
                            <div className="w-28">
                              <Progress value={Math.min(row.original.utilization, 100)} className="h-2" />
                              <span className="mt-1 text-muted-foreground text-xs">{row.original.utilization}%</span>
                            </div>
                          ),
                        },
                        {
                          accessorKey: "status",
                          header: "Status",
                          cell: ({ row }: { row: { original: WorkloadUser } }) => (
                            <Badge
                              variant={
                                row.original.status === "overloaded"
                                  ? "destructive"
                                  : row.original.status === "underutilized"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                            </Badge>
                          ),
                        },
                      ] as any
                    }
                    getRowId={(row) => row.user.id}
                    pageSize={10}
                    emptyMessage="No team members"
                  />
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}

import { cn } from "cn";
