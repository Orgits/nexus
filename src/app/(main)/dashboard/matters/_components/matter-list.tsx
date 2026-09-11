"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import { Filter, Search } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyMatters } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ObjectLink } from "@/components/ca-nexus/object-link";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { MatterStatusBadge, PriorityBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { serviceTypeLabel } from "@/lib/labels";
import { getClientById, mockClients } from "@/mock-data/clients";
import { mockMatters } from "@/mock-data/matters";
import { getUserById, mockTeams, mockUsers } from "@/mock-data/users";
import type { Matter } from "@/types";

const filterConfigs: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "created", label: "Created" },
      { value: "information_pending", label: "Information Pending" },
      { value: "documents_pending", label: "Documents Pending" },
      { value: "in_progress", label: "In Progress" },
      { value: "ready_for_review", label: "Ready for Review" },
      { value: "rework", label: "Rework" },
      { value: "approved", label: "Approved" },
      { value: "filed", label: "Filed" },
      { value: "completed", label: "Completed" },
      { value: "billing_followup", label: "Billing Follow-up" },
      { value: "closed", label: "Closed" },
      { value: "on_hold", label: "On Hold" },
      { value: "overdue", label: "Overdue" },
      { value: "planning", label: "Planning" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    key: "serviceType",
    label: "Service Type",
    type: "select",
    options: [
      { value: "itr", label: "ITR" },
      { value: "gst_monthly", label: "GST Monthly" },
      { value: "gst_quarterly", label: "GST Quarterly" },
      { value: "gst_annual", label: "GST Annual" },
      { value: "tds_24q", label: "TDS 24Q" },
      { value: "tds_26q", label: "TDS 26Q" },
      { value: "tds_27q", label: "TDS 27Q" },
      { value: "tds_27eq", label: "TDS 27EQ" },
      { value: "mca_aoc4", label: "MCA AOC-4" },
      { value: "mca_mgt7", label: "MCA MGT-7" },
      { value: "mca_adt1", label: "MCA ADT-1" },
      { value: "mca_dpt3", label: "MCA DPT-3" },
      { value: "mca_other", label: "MCA Other" },
      { value: "audit_statutory", label: "Statutory Audit" },
      { value: "audit_tax", label: "Tax Audit" },
      { value: "audit_internal", label: "Internal Audit" },
      { value: "audit_special", label: "Special Audit" },
      { value: "advisory_tax", label: "Tax Advisory" },
      { value: "advisory_gst", label: "GST Advisory" },
      { value: "advisory_corporate", label: "Corporate Advisory" },
      { value: "advisory_fe", label: "FEMA Advisory" },
      { value: "payroll", label: "Payroll" },
      { value: "bookkeeping", label: "Bookkeeping" },
      { value: "virtual_cfo", label: "Virtual CFO" },
      { value: "secretarial", label: "Secretarial" },
      { value: "registration", label: "Registration" },
      { value: "licensing", label: "Licensing" },
      { value: "other", label: "Other" },
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
  {
    key: "clientId",
    label: "Client",
    type: "select",
    options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
  },
  {
    key: "assignedUserId",
    label: "Assignee",
    type: "select",
    options: mockUsers.map((u) => ({ value: u.id, label: u.fullName })),
  },
  {
    key: "assignedTeamId",
    label: "Team",
    type: "select",
    options: mockTeams.map((t) => ({ value: t.id, label: t.name })),
  },
];

const VIEW_OPTIONS = [
  { id: "all", label: "All Matters", icon: Search },
  { id: "my", label: "My Matters", icon: Filter },
  { id: "pending", label: "Pending Information", icon: Filter },
  { id: "progress", label: "In Progress", icon: Filter },
  { id: "review", label: "Ready for Review", icon: Filter },
  { id: "overdue", label: "Overdue", icon: Filter },
  { id: "completed", label: "Completed", icon: Filter },
] as const;

export function MatterList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [matters, _setMatters] = useState<Matter[]>(mockMatters);

  const filtered = useMemo(() => {
    let result = [...matters];

    if (view !== "all") {
      switch (view) {
        case "my":
          result = result.filter((m) => m.assignedUserId === "user-admin-001");
          break;
        case "pending":
          result = result.filter((m) => ["created", "information_pending", "documents_pending"].includes(m.status));
          break;
        case "progress":
          result = result.filter((m) => m.status === "in_progress");
          break;
        case "review":
          result = result.filter((m) => m.status === "ready_for_review");
          break;
        case "overdue":
          result = result.filter(
            (m) =>
              m.status === "overdue" ||
              (new Date(m.dueDate) < new Date() && !["completed", "closed", "cancelled"].includes(m.status)),
          );
          break;
        case "completed":
          result = result.filter((m) => ["completed", "closed", "filed"].includes(m.status));
          break;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.matterNumber.toLowerCase().includes(q) ||
          m.clientId.toLowerCase().includes(q),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      result = result.filter((m) => (m as unknown as Record<string, unknown>)[key] === value);
    }

    return result;
  }, [matters, search, filters, view]);

  const matterColumns = [
    {
      accessorKey: "name",
      header: "Matter",
      enableHiding: false,
      cell: ({ row }: { row: { original: Matter } }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-muted-foreground text-xs">{row.original.matterNumber}</p>
        </div>
      ),
    },
    {
      accessorKey: "serviceType",
      header: "Service",
      cell: ({ row }: { row: { original: Matter } }) => (
        <Badge variant="secondary" className="text-xs">
          {serviceTypeLabel(row.original.serviceType)}
        </Badge>
      ),
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }: { row: { original: Matter } }) => <span className="text-sm">{row.original.period.label}</span>,
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }: { row: { original: Matter } }) => {
        const client = getClientById(row.original.clientId);
        return client ? (
          <ObjectLink href={`/dashboard/clients/${client.id}`} label={client.displayName || client.name} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Matter } }) => <MatterStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: { row: { original: Matter } }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "progress",
      header: "Progress",
      enableSorting: true,
      cell: ({ row }: { row: { original: Matter } }) => (
        <div className="w-32">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${row.original.progress}%` }} />
          </div>
          <span className="text-muted-foreground text-xs">{row.original.progress}%</span>
        </div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      enableSorting: true,
      cell: ({ row }: { row: { original: Matter } }) => (
        <span
          className={cn(
            "text-sm",
            new Date(row.original.dueDate) < new Date() &&
              !["completed", "closed", "cancelled"].includes(row.original.status) &&
              "text-destructive",
          )}
        >
          {formatDate(row.original.dueDate)}
        </span>
      ),
    },
    {
      accessorKey: "assignedUserId",
      header: "Assignee",
      cell: ({ row }: { row: { original: Matter } }) => {
        const user = getUserById(row.original.assignedUserId);
        return <span className="text-sm">{user?.fullName || row.original.assignedUserId}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Matters" description="Manage service matters, track progress, and monitor deadlines" />

      <div className="mb-4 flex flex-wrap gap-2">
        {VIEW_OPTIONS.map((v) => (
          <Button
            key={v.id}
            variant={view === v.id ? "default" : "outline"}
            size="sm"
            onClick={() => router.push(`/dashboard/matters${v.id !== "all" ? `?view=${v.id}` : ""}`)}
            className="gap-1.5"
          >
            <v.icon className="h-3.5 w-3.5" />
            {v.label}
          </Button>
        ))}
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search matters..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filtered.length > 0 ? (
        <DataTable<Matter>
          data={filtered}
          columns={matterColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={10}
          emptyMessage="No matters match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/matters/${row.id}`),
            },
          ]}
        />
      ) : (
        <EmptyMatters />
      )}
    </div>
  );
}
