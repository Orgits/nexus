"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import { Edit, Eye, Key, Lock, Plus, Shield, Trash2, UserRound, Users } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { PageHeader, SectionCard } from "@/components/ca-nexus/page-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsersByRole, mockPermissions } from "@/mock-data/users";
import type { Permission, User, UserRole } from "@/types";

const roleTabs = [
  { id: "roles", label: "Roles", icon: Shield },
  { id: "permissions", label: "Permissions", icon: Key },
  { id: "matrix", label: "Permission Matrix", icon: Lock },
  { id: "users", label: "User Assignments", icon: Users },
];

type RoleConfig = {
  value: UserRole;
  label: string;
  description: string;
  color: string;
  isSystem: boolean;
};

const roleColorToBadgeVariant = (color: string): "default" | "destructive" | "secondary" => {
  switch (color) {
    case "destructive":
      return "destructive";
    case "default":
      return "default";
    default:
      return "secondary";
  }
};

const rolesConfig: RoleConfig[] = [
  {
    value: "admin",
    label: "Administrator",
    description: "Full system access including user management and firm settings",
    color: "destructive",
    isSystem: true,
  },
  {
    value: "partner",
    label: "Partner",
    description: "Firm-wide access with financial permissions and approval authority",
    color: "default",
    isSystem: true,
  },
  {
    value: "manager",
    label: "Manager",
    description: "Team and department management with client/matter oversight",
    color: "secondary",
    isSystem: true,
  },
  {
    value: "senior_associate",
    label: "Senior Associate",
    description: "Senior-level work with review and mentoring responsibilities",
    color: "blue",
    isSystem: true,
  },
  {
    value: "associate",
    label: "Associate",
    description: "Standard professional work with task execution focus",
    color: "green",
    isSystem: true,
  },
  {
    value: "intern",
    label: "Intern",
    description: "Limited access for learning and supervised work",
    color: "yellow",
    isSystem: true,
  },
  {
    value: "support_staff",
    label: "Support Staff",
    description: "Administrative and operational support access",
    color: "gray",
    isSystem: true,
  },
  {
    value: "client_portal",
    label: "Client Portal",
    description: "External client access for document sharing and communication",
    color: "purple",
    isSystem: true,
  },
];

const modules = [
  "clients",
  "matters",
  "tasks",
  "compliance",
  "documents",
  "communications",
  "billing",
  "reports",
  "administration",
];

const actions = ["view", "create", "edit", "delete", "approve", "financial", "admin"];
const scopes = ["own", "team", "department", "firm", "all"];

export function RolesPermissionsPage() {
  const _router = useRouter();
  const [activeTab, setActiveTab] = useState("roles");
  const [_search, _setSearch] = useState("");
  const [_selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage roles, permissions, and access control across the firm"
        actions={
          <Button variant="outline" size="sm" onClick={() => setSelectedRole("custom" as UserRole)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Custom Role
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {roleTabs.map((tab) => (
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

        <TabsContent value="roles" className="space-y-6">
          <RolesTab rolesConfig={rolesConfig} onSelectRole={setSelectedRole} />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <PermissionsTab permissions={mockPermissions} />
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <PermissionMatrixTab rolesConfig={rolesConfig} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserAssignmentsTab rolesConfig={rolesConfig} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RolesTab({
  rolesConfig,
  onSelectRole,
}: {
  rolesConfig: RoleConfig[];
  onSelectRole: (role: UserRole) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {rolesConfig.map((role) => (
          <Card key={role.value} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      `bg-${role.color}-100 text-${role.color}-600 dark:bg-${role.color}-900/30 dark:text-${role.color}-400`,
                    )}
                  >
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{role.label}</CardTitle>
                    <CardDescription className="text-xs">{role.description}</CardDescription>
                  </div>
                </div>
                {role.isSystem && (
                  <Badge variant="outline" className="text-xs">
                    System
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Badge variant={roleColorToBadgeVariant(role.color)} className="text-xs">
                  {getUsersByRole(role.value).length} users
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onSelectRole(role.value)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!role.isSystem && (
                    <Button variant="ghost" size="icon" onClick={() => alert(`Edit ${role.label}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionCard title="Role Details">
        {rolesConfig.map((role) => (
          <div key={role.value} className="border-b py-4 last:border-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-lg p-2",
                    `bg-${role.color}-100 text-${role.color}-600 dark:bg-${role.color}-900/30 dark:text-${role.color}-400`,
                  )}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{role.label}</p>
                  <p className="text-muted-foreground text-sm">{role.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {role.isSystem ? "System Role" : "Custom Role"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getUsersByRole(role.value).length} assigned users
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onSelectRole(role.value)}>
                  <Eye className="h-4 w-4" /> View
                </Button>
                {!role.isSystem && (
                  <Button variant="ghost" size="icon" onClick={() => alert(`Edit ${role.label}`)}>
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                )}
                {!role.isSystem && (
                  <Button variant="ghost" size="icon" onClick={() => alert(`Delete ${role.label}`)}>
                    <Trash2 className="h-4 w-4 text-destructive" /> Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

function PermissionsTab({ permissions }: { permissions: Permission[] }) {
  const [moduleFilter, setModuleFilter] = useState("");

  const filteredPermissions = permissions.filter((p) => !moduleFilter || p.module === moduleFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Modules</SelectItem>
            {modules.map((m) => (
              <SelectItem key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable<Permission>
        data={filteredPermissions}
        columns={
          [
            {
              accessorKey: "module",
              header: "Module",
              cell: ({ row }: { row: { original: Permission } }) => (
                <Badge variant="secondary">
                  {row.original.module.charAt(0).toUpperCase() + row.original.module.slice(1)}
                </Badge>
              ),
            },
            {
              accessorKey: "action",
              header: "Action",
              cell: ({ row }: { row: { original: Permission } }) => (
                <span className="text-sm capitalize">{row.original.action}</span>
              ),
            },
            {
              accessorKey: "scope",
              header: "Scope",
              cell: ({ row }: { row: { original: Permission } }) => (
                <Badge variant="outline">{row.original.scope}</Badge>
              ),
            },
          ] as const
        }
        getRowId={(row) => `${row.module}-${row.action}-${row.scope}`}
        pageSize={15}
        emptyMessage="No permissions found"
      />

      <SectionCard title="Permission Definitions">
        <div className="space-y-4">
          {[
            { action: "view", description: "Read-only access to list and detail views" },
            { action: "create", description: "Ability to create new records" },
            { action: "edit", description: "Ability to modify existing records" },
            { action: "delete", description: "Ability to delete records" },
            { action: "approve", description: "Ability to approve/reject workflows" },
            { action: "financial", description: "Access to financial data and billing" },
            { action: "admin", description: "Full administrative control" },
          ].map((perm) => (
            <div key={perm.action} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Key className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium capitalize">{perm.action}</p>
                  <p className="text-muted-foreground text-sm">{perm.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {scopes.map((scope) => (
                  <Badge key={scope} variant="outline" className="text-xs">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

const actionAbbreviations: Record<string, string> = {
  view: "V",
  create: "C",
  edit: "E",
  delete: "D",
  approve: "A",
  financial: "$",
  admin: "Adm",
};

function PermissionMatrixTab({ rolesConfig }: { rolesConfig: RoleConfig[] }) {
  // Simplified permission matrix - in reality this would be computed from actual role permissions
  const rolePermissions: Record<UserRole, Record<string, string[]>> = {
    admin: {
      clients: ["view", "create", "edit", "delete", "admin"],
      matters: ["view", "create", "edit", "delete", "admin"],
      tasks: ["view", "create", "edit", "delete", "admin"],
      compliance: ["view", "create", "edit", "delete", "admin"],
      documents: ["view", "create", "edit", "delete", "admin"],
      communications: ["view", "create", "edit", "delete", "admin"],
      billing: ["view", "create", "edit", "delete", "financial", "admin"],
      reports: ["view", "create", "edit", "delete", "admin"],
      administration: ["view", "create", "edit", "delete", "admin"],
    },
    partner: {
      clients: ["view", "create", "edit", "delete"],
      matters: ["view", "create", "edit", "delete"],
      tasks: ["view", "create", "edit", "delete"],
      compliance: ["view", "create", "edit", "delete"],
      documents: ["view", "create", "edit", "delete"],
      communications: ["view", "create", "edit", "delete"],
      billing: ["view", "create", "edit", "delete", "financial"],
      reports: ["view", "create", "edit"],
      administration: ["view"],
    },
    manager: {
      clients: ["view", "create", "edit"],
      matters: ["view", "create", "edit"],
      tasks: ["view", "create", "edit"],
      compliance: ["view", "create", "edit"],
      documents: ["view", "create", "edit"],
      communications: ["view", "create", "edit"],
      billing: ["view", "create", "edit"],
      reports: ["view"],
      administration: [],
    },
    senior_associate: {
      clients: ["view", "create", "edit"],
      matters: ["view", "create", "edit"],
      tasks: ["view", "create", "edit"],
      compliance: ["view", "create", "edit"],
      documents: ["view", "create", "edit"],
      communications: ["view", "create", "edit"],
      billing: ["view"],
      reports: [],
      administration: [],
    },
    associate: {
      clients: ["view", "create"],
      matters: ["view", "create"],
      tasks: ["view", "create"],
      compliance: ["view", "create"],
      documents: ["view", "create"],
      communications: ["view", "create"],
      billing: ["view"],
      reports: [],
      administration: [],
    },
    intern: {
      clients: ["view"],
      matters: ["view"],
      tasks: ["view"],
      compliance: ["view"],
      documents: ["view"],
      communications: ["view"],
      billing: [],
      reports: [],
      administration: [],
    },
    support_staff: {
      clients: ["view"],
      matters: ["view"],
      tasks: ["view"],
      compliance: ["view"],
      documents: ["view", "create"],
      communications: ["view", "create"],
      billing: ["view"],
      reports: [],
      administration: [],
    },
    client_portal: {
      clients: ["view"],
      matters: ["view"],
      tasks: [],
      compliance: ["view"],
      documents: ["view"],
      communications: ["view"],
      billing: ["view"],
      reports: [],
      administration: [],
    },
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 z-10 bg-background p-3 text-left font-medium">Module / Role</th>
              {rolesConfig.map((role) => (
                <th key={role.value} className="p-3 text-center font-medium">
                  <Badge variant={roleColorToBadgeVariant(role.color)}>{role.label}</Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module} className="border-b">
                <td className="sticky left-0 z-10 bg-background p-3 font-medium">
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </td>
                {rolesConfig.map((role) => {
                  const perms = rolePermissions[role.value]?.[module] || [];
                  return (
                    <td key={role.value} className="p-3 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {actions.map((action) => (
                          <span
                            key={action}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-xs",
                              perms.includes(action) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-400",
                            )}
                          >
                            {actionAbbreviations[action] || action}
                          </span>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/50 p-4">
        <span className="text-muted-foreground text-sm">Legend:</span>
        <span className="rounded bg-green-100 px-2 py-0.5 text-green-800 text-xs">Granted</span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-400 text-xs">Denied</span>
        <span className="ml-4 text-muted-foreground text-sm">
          V=View, C=Create, E=Edit, D=Delete, A=Approve, $=Financial, Adm=Admin
        </span>
      </div>
    </div>
  );
}

function UserAssignmentsTab({ rolesConfig }: { rolesConfig: RoleConfig[] }) {
  const [roleFilter, setRoleFilter] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            {rolesConfig.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {rolesConfig.map((role) => {
          const usersInRole = getUsersByRole(role.value);
          if (roleFilter && roleFilter !== role.value) return null;

          return (
            <SectionCard key={role.value} title={`${role.label} (${usersInRole.length} users)`}>
              {usersInRole.length > 0 ? (
                <DataTable<User>
                  data={usersInRole}
                  columns={
                    [
                      {
                        accessorKey: "fullName",
                        header: "Name",
                        cell: ({ row }: { row: { original: User } }) => (
                          <p className="font-medium text-sm">{row.original.fullName}</p>
                        ),
                      },
                      {
                        accessorKey: "email",
                        header: "Email",
                        cell: ({ row }: { row: { original: User } }) => (
                          <span className="text-sm">{row.original.email}</span>
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
                        accessorKey: "isActive",
                        header: "Status",
                        cell: ({ row }: { row: { original: User } }) => (
                          <Badge variant={row.original.isActive ? "default" : "secondary"}>
                            {row.original.isActive ? "Active" : "Inactive"}
                          </Badge>
                        ),
                      },
                    ] as const
                  }
                  getRowId={(row) => row.id}
                  pageSize={10}
                  emptyMessage="No users in this role"
                />
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <UserRound className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>No users assigned to this role</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => alert(`Assign user to ${role.label}`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Assign User
                  </Button>
                </div>
              )}
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}

// Need to import Select components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
