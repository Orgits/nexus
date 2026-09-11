"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Edit, Eye, Plus, Trash2, Users2 } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockMatters, mockTasks } from "@/mock-data/matters";
import { getUsersByTeam, mockDepartments, mockTeams, mockUsers } from "@/mock-data/users";
import type { Team, User } from "@/types";

const _teamTabs = [{ id: "all", label: "All", count: mockTeams.length }];

const getTeamWorkload = (teamId: string) => {
  const members = getUsersByTeam(teamId);
  const totalOpenTasks = members.reduce(
    (sum, u) =>
      sum +
      mockTasks.filter((t) => t.assignedUserId === u.id && t.status !== "completed" && t.status !== "cancelled").length,
    0,
  );
  const totalOverdueTasks = members.reduce(
    (sum, u) =>
      sum +
      mockTasks.filter(
        (t) =>
          t.assignedUserId === u.id &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "completed" &&
          t.status !== "cancelled",
      ).length,
    0,
  );
  const totalOpenMatters = members.reduce(
    (sum, u) => sum + mockMatters.filter((m) => m.assignedUserId === u.id).length,
    0,
  );
  const avgUtilization =
    members.length > 0
      ? Math.round(
          members.reduce((sum, u) => {
            const userTasks = mockTasks.filter((t) => t.assignedUserId === u.id);
            const estimatedHours = userTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
            const actualHours = userTasks.reduce((s, t) => s + t.actualHours, 0);
            const utilization = estimatedHours > 0 ? Math.round((actualHours / estimatedHours) * 100) : 0;
            return sum + utilization;
          }, 0) / members.length,
        )
      : 0;
  return { memberCount: members.length, totalOpenTasks, totalOverdueTasks, totalOpenMatters, avgUtilization };
};

export function TeamsList() {
  const router = useRouter();
  const [activeTab, _setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "departmentId",
      label: "Department",
      type: "select",
      options: mockDepartments.map((d) => ({ value: d.id, label: d.name })),
    },
  ];

  let filteredTeams = mockTeams;

  if (activeTab !== "all") {
    // No specific filtering for now
  }

  filteredTeams = filteredTeams.filter((team: Team) => {
    if (
      search &&
      !team.name.toLowerCase().includes(search.toLowerCase()) &&
      !team.description?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (team as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleTeamClick = (team: Team) => router.push(`/dashboard/administration/teams/${team.id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Teams</h1>
          <p className="text-muted-foreground text-sm">Manage teams, members, and capacity</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/administration/teams/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search teams by name, description..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredTeams.length > 0 ? (
        <DataTable<Team>
          data={filteredTeams}
          columns={
            [
              {
                accessorKey: "name",
                header: "Team",
                cell: ({ row }: { row: { original: Team } }) => (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {row.original.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{row.original.name}</p>
                      <p className="line-clamp-1 text-muted-foreground text-xs">{row.original.description}</p>
                    </div>
                  </div>
                ),
              },
              {
                accessorKey: "departmentId",
                header: "Department",
                cell: ({ row }: { row: { original: Team } }) => {
                  const dept = mockDepartments.find((d) => d.id === row.original.departmentId);
                  return dept ? (
                    <Badge variant="secondary">{dept.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "leadId",
                header: "Lead",
                cell: ({ row }: { row: { original: Team } }) => {
                  const lead = mockUsers.find((u) => u.id === row.original.leadId);
                  return lead ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={lead.avatarUrl} alt={lead.fullName} />
                        <AvatarFallback>
                          {lead.fullName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{lead.fullName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "memberIds",
                header: "Members",
                cell: ({ row }: { row: { original: Team } }) => {
                  const members = getUsersByTeam(row.original.id);
                  return (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{members.length}</span>
                      <div className="flex -space-x-1">
                        {members.slice(0, 3).map((m: User) => (
                          <Avatar key={m.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={m.avatarUrl} alt={m.fullName} />
                            <AvatarFallback className="text-xs">
                              {m.fullName
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {members.length > 3 && (
                          <Avatar className="h-6 w-6 border-2 border-background bg-muted">
                            <span className="text-xs">+{members.length - 3}</span>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  );
                },
              },
              {
                accessorKey: "specialization",
                header: "Specialization",
                cell: ({ row }: { row: { original: Team } }) => (
                  <div className="flex flex-wrap gap-1">
                    {row.original.specialization?.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {s.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                ),
              },
              {
                accessorKey: "workload",
                header: "Workload",
                cell: ({ row }: { row: { original: Team } }) => {
                  const workload = getTeamWorkload(row.original.id);
                  return (
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{workload.totalOpenTasks} tasks</span>
                        {workload.totalOverdueTasks > 0 && (
                          <span className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            {workload.totalOverdueTasks} overdue
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {workload.totalOpenMatters} matters • {workload.avgUtilization}% avg utilization
                      </div>
                    </div>
                  );
                },
              },
              {
                accessorKey: "actions",
                header: "Actions",
                cell: ({ row }: { row: { original: Team } }) => (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleTeamClick(row.original)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/dashboard/administration/teams/${row.original.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => alert(`Delete ${row.original.name}`)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ),
              },
            ] as const
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No teams match your search or filters"
        />
      ) : (
        <EmptyState
          icon={<Users2 className="h-12 w-12 text-muted-foreground/50" />}
          title="No teams found"
          description={
            search || Object.keys(filters).length > 0 ? "Try adjusting your search or filters" : "No teams created yet"
          }
        />
      )}
    </div>
  );
}

// Need to import AlertTriangle
import { AlertTriangle } from "lucide-react";
