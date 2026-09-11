"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import { AlertTriangle, Edit, Eye, Trash2, UserRound } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { mockMatters, mockTasks } from "@/mock-data/matters";
import { getUsersByRole, mockDepartments, mockTeams, mockUsers } from "@/mock-data/users";
import type { User, UserRole } from "@/types";

const userTabs = [
  { id: "all", label: "All", count: mockUsers.length },
  { id: "active", label: "Active", count: mockUsers.filter((u) => u.isActive).length },
  { id: "inactive", label: "Inactive", count: mockUsers.filter((u) => !u.isActive).length },
  { id: "admin", label: "Admins", count: mockUsers.filter((u) => u.role === "admin").length },
  { id: "partner", label: "Partners", count: mockUsers.filter((u) => u.role === "partner").length },
  { id: "manager", label: "Managers", count: mockUsers.filter((u) => u.role === "manager").length },
  { id: "senior", label: "Senior Associates", count: mockUsers.filter((u) => u.role === "senior_associate").length },
  { id: "associate", label: "Associates", count: mockUsers.filter((u) => u.role === "associate").length },
  { id: "support", label: "Support Staff", count: mockUsers.filter((u) => u.role === "support_staff").length },
];

const roles: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "partner", label: "Partner" },
  { value: "manager", label: "Manager" },
  { value: "senior_associate", label: "Senior Associate" },
  { value: "associate", label: "Associate" },
  { value: "intern", label: "Intern" },
  { value: "support_staff", label: "Support Staff" },
  { value: "client_portal", label: "Client Portal" },
];

const getUserWorkload = (userId: string) => {
  const userTasks = mockTasks.filter((t) => t.assignedUserId === userId);
  const userMatters = mockMatters.filter((m) => m.assignedUserId === userId);
  const openTasks = userTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;
  const overdueTasks = userTasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "completed" && t.status !== "cancelled",
  ).length;
  const estimatedHours = userTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const actualHours = userTasks.reduce((sum, t) => sum + t.actualHours, 0);
  return { openTasks, overdueTasks, estimatedHours, actualHours, openMatters: userMatters.length };
};

const getUserInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("");

export function UsersList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    { key: "role", label: "Role", type: "select", options: roles.map((r) => ({ value: r.value, label: r.label })) },
    { key: "teamId", label: "Team", type: "select", options: mockTeams.map((t) => ({ value: t.id, label: t.name })) },
    {
      key: "departmentId",
      label: "Department",
      type: "select",
      options: mockDepartments.map((d) => ({ value: d.id, label: d.name })),
    },
    {
      key: "isActive",
      label: "Status",
      type: "select",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  let filteredUsers = mockUsers;

  if (activeTab !== "all") {
    if (activeTab === "active") {
      filteredUsers = mockUsers.filter((u) => u.isActive);
    } else if (activeTab === "inactive") {
      filteredUsers = mockUsers.filter((u) => !u.isActive);
    } else {
      filteredUsers = getUsersByRole(activeTab as UserRole);
    }
  }

  filteredUsers = filteredUsers.filter((user: User) => {
    if (
      search &&
      !user.fullName.toLowerCase().includes(search.toLowerCase()) &&
      !user.email.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (user as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleUserClick = (user: User) => router.push(`/dashboard/administration/users/${user.id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Users</h1>
          <p className="text-muted-foreground text-sm">Manage firm users, roles, and access</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/administration/users/new")}>
            <UserRound className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1" role="tablist">
        {userTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="whitespace-nowrap"
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label} <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs">{tab.count}</span>
          </Button>
        ))}
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search users by name, email..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredUsers.length > 0 ? (
        <DataTable<User>
          data={filteredUsers}
          columns={
            [
              {
                accessorKey: "avatar",
                header: "",
                cell: ({ row }: { row: { original: User } }) => (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={row.original.avatarUrl} alt={row.original.fullName} />
                    <AvatarFallback>{getUserInitials(row.original.fullName)}</AvatarFallback>
                  </Avatar>
                ),
              },
              {
                accessorKey: "fullName",
                header: "Name",
                cell: ({ row }: { row: { original: User } }) => (
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-sm">{row.original.fullName}</p>
                      <p className="text-muted-foreground text-xs">{row.original.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                accessorKey: "role",
                header: "Role",
                cell: ({ row }: { row: { original: User } }) => (
                  <Badge
                    variant={
                      row.original.role === "admin"
                        ? "destructive"
                        : row.original.role === "partner"
                          ? "default"
                          : row.original.role === "manager"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {row.original.role.replace(/_/g, " ")}
                  </Badge>
                ),
              },
              {
                accessorKey: "department",
                header: "Department",
                cell: ({ row }: { row: { original: User } }) => (
                  <span className="text-sm">{row.original.department?.name || "—"}</span>
                ),
              },
              {
                accessorKey: "teams",
                header: "Teams",
                cell: ({ row }: { row: { original: User } }) => (
                  <div className="flex flex-wrap gap-1">
                    {row.original.teams.map((t) => (
                      <Badge key={t.id} variant="outline" className="text-xs">
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                ),
              },
              {
                accessorKey: "workload",
                header: "Workload",
                cell: ({ row }: { row: { original: User } }) => {
                  const workload = getUserWorkload(row.original.id);
                  return (
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium", workload.overdueTasks > 0 && "text-destructive")}>
                          {workload.openTasks} tasks
                        </span>
                        {workload.overdueTasks > 0 && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {workload.openMatters} matters • {workload.actualHours}h / {workload.estimatedHours || 0}h est.
                      </div>
                    </div>
                  );
                },
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
                accessorKey: "lastLoginAt",
                header: "Last Login",
                cell: ({ row }: { row: { original: User } }) => (
                  <span className="text-sm">
                    {row.original.lastLoginAt ? formatDate(row.original.lastLoginAt.split("T")[0]) : "Never"}
                  </span>
                ),
              },
              {
                accessorKey: "actions",
                header: "Actions",
                cell: ({ row }: { row: { original: User } }) => (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleUserClick(row.original)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/dashboard/administration/users/${row.original.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => alert(`Deactivate ${row.original.fullName}`)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No users match your search or filters"
        />
      ) : (
        <EmptyState
          icon={<UserRound className="h-12 w-12 text-muted-foreground/50" />}
          title="No users found"
          description={
            search || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "No users in the system yet"
          }
        />
      )}
    </div>
  );
}
