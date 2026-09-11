"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import { Download, Filter, Search } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyCompliance } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { ComplianceStatusBadge, PriorityBadge } from "@/components/ca-nexus/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { daysOverdue, formatDate } from "@/lib/format";
import { serviceTypeLabel } from "@/lib/labels";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getComplianceSummary, mockComplianceCycles } from "@/mock-data/compliance";
import { getMatterById } from "@/mock-data/matters";
import { getUserById, mockTeams, mockUsers } from "@/mock-data/users";
import type { ComplianceCycle } from "@/types";

const filterConfigs: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "not_started", label: "Not Started" },
      { value: "identification", label: "Identification" },
      { value: "outreach_sent", label: "Outreach Sent" },
      { value: "documents_pending", label: "Documents Pending" },
      { value: "documents_received", label: "Documents Received" },
      { value: "processing", label: "Processing" },
      { value: "ready_for_review", label: "Ready for Review" },
      { value: "in_review", label: "In Review" },
      { value: "rework_required", label: "Rework Required" },
      { value: "approved", label: "Approved" },
      { value: "filed", label: "Filed" },
      { value: "completed", label: "Completed" },
      { value: "closed", label: "Closed" },
      { value: "not_applicable", label: "Not Applicable" },
      { value: "overdue", label: "Overdue" },
    ],
  },
  {
    key: "serviceType",
    label: "Compliance Type",
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
    key: "financialYear",
    label: "Financial Year",
    type: "select",
    options: [
      { value: "2024-25", label: "2024-25" },
      { value: "2023-24", label: "2023-24" },
      { value: "2022-23", label: "2022-23" },
    ],
  },
  {
    key: "assessmentYear",
    label: "Assessment Year",
    type: "select",
    options: [
      { value: "2025-26", label: "2025-26" },
      { value: "2024-25", label: "2024-25" },
      { value: "2023-24", label: "2023-24" },
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
  { id: "all", label: "All", icon: Search },
  { id: "overdue", label: "Overdue", icon: Filter },
  { id: "due_soon", label: "Due Soon", icon: Filter },
  { id: "pending_docs", label: "Pending Docs", icon: Filter },
  { id: "ready_review", label: "Ready for Review", icon: Filter },
  { id: "completed", label: "Completed", icon: Filter },
] as const;

const _serviceTypeGroups = {
  itr: ["itr"],
  gst: ["gst_monthly", "gst_quarterly", "gst_annual"],
  tds: ["tds_24q", "tds_26q", "tds_27q", "tds_27eq"],
  mca: ["mca_aoc4", "mca_mgt7", "mca_adt1", "mca_dpt3", "mca_other"],
  audit: ["audit_statutory", "audit_tax", "audit_internal", "audit_special"],
  advisory: ["advisory_tax", "advisory_gst", "advisory_corporate", "advisory_fe"],
  other: ["payroll", "bookkeeping", "virtual_cfo", "secretarial", "registration", "licensing", "other"],
} as const;

export function ComplianceList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [cycles] = useState<ComplianceCycle[]>(mockComplianceCycles);
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "dueDate",
    direction: "asc",
  });

  const summary = getComplianceSummary();

  const filtered = useMemo(() => {
    let result = [...cycles];

    if (view !== "all") {
      switch (view) {
        case "overdue":
          result = result.filter((c) => c.isOverdue);
          break;
        case "due_soon":
          result = result.filter(
            (c) =>
              !c.isOverdue &&
              c.status !== "completed" &&
              c.status !== "closed" &&
              c.status !== "filed" &&
              daysOverdue(c.dueDate) <= 30 &&
              daysOverdue(c.dueDate) >= 0,
          );
          break;
        case "pending_docs":
          result = result.filter((c) => c.missingDocuments.some((d) => d.isMandatory && !d.receivedAt));
          break;
        case "ready_review":
          result = result.filter((c) => c.status === "ready_for_review" || c.status === "in_review");
          break;
        case "completed":
          result = result.filter((c) => c.status === "completed" || c.status === "filed" || c.status === "closed");
          break;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.cycleNumber.toLowerCase().includes(q) ||
          c.serviceName.toLowerCase().includes(q) ||
          c.clientId.toLowerCase().includes(q) ||
          c.period.label.toLowerCase().includes(q),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      if (key === "financialYear" || key === "assessmentYear") {
        result = result.filter((c) => c.period.financialYear === value || c.period.assessmentYear === value);
      } else {
        result = result.filter((c) => (c as unknown as Record<string, unknown>)[key] === value);
      }
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof ComplianceCycle] as string | number | undefined;
      const bVal = b[sortConfig.key as keyof ComplianceCycle] as string | number | undefined;
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [cycles, search, filters, view, sortConfig]);

  const complianceColumns = [
    {
      accessorKey: "cycleNumber",
      header: "Cycle",
      enableHiding: false,
      cell: ({ row }: { row: { original: ComplianceCycle } }) => (
        <div>
          <p className="font-medium">{row.original.cycleNumber}</p>
          <p className="text-muted-foreground text-xs">{row.original.period.label}</p>
        </div>
      ),
    },
    {
      accessorKey: "serviceType",
      header: "Type",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => (
        <span className="inline-flex items-center gap-1">
          <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
            {serviceTypeLabel(row.original.serviceType)}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => {
        const client = getClientById(row.original.clientId);
        return client ? (
          <ClientLink client={client} showStatus={true} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => <ComplianceStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      enableSorting: true,
      cell: ({ row }: { row: { original: ComplianceCycle } }) => {
        const isOverdue = row.original.isOverdue;
        const days = daysOverdue(row.original.dueDate);
        return (
          <span
            className={cn(
              "font-medium text-sm",
              isOverdue && "text-destructive",
              days > 0 && !isOverdue && days <= 7 && "text-amber-600",
            )}
          >
            {formatDate(row.original.dueDate)}
            {isOverdue && <span className="ml-1.5 text-destructive text-xs">({days}d overdue)</span>}
            {!isOverdue && days >= 0 && days <= 7 && (
              <span className="ml-1.5 text-amber-600 text-xs">({days}d left)</span>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: "assignedUserId",
      header: "Assignee",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => {
        const user = getUserById(row.original.assignedUserId);
        return <span className="text-sm">{user?.fullName || row.original.assignedUserId}</span>;
      },
    },
    {
      accessorKey: "matterId",
      header: "Matter",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => {
        if (!row.original.matterId) return <span className="text-muted-foreground text-sm">—</span>;
        const matter = getMatterById(row.original.matterId);
        return matter ? (
          <MatterLink matter={matter} showStatus={false} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "missingDocuments",
      header: "Missing Docs",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => {
        const missing = row.original.missingDocuments.filter((d) => d.isMandatory && !d.receivedAt).length;
        const total = row.original.missingDocuments.filter((d) => d.isMandatory).length;
        return (
          <span className={cn("font-medium text-sm", missing > 0 && "text-destructive")}>
            {missing}/{total}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Compliance Overview"
        description="Track and manage all compliance cycles across clients and service types"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) => router.push(`/dashboard/compliance${value !== "all" ? `?view=${value}` : ""}`)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {VIEW_OPTIONS.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Cycles" value={summary.total} icon={<Search className="h-5 w-5" />} />
        <StatCard
          title="Overdue"
          value={summary.overdue}
          hint={`${summary.pendingDocuments} pending docs`}
          icon={<Filter className="h-5 w-5 text-destructive" />}
          variant="destructive"
        />
        <StatCard
          title="Ready for Review"
          value={summary.readyForReview}
          icon={<Filter className="h-5 w-5 text-purple-600" />}
        />
        <StatCard title="Completed" value={summary.completed} icon={<Filter className="h-5 w-5 text-green-600" />} />
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search compliance cycles..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filtered.length > 0 ? (
        <DataTable<ComplianceCycle>
          data={filtered}
          columns={complianceColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={15}
          emptyMessage="No compliance cycles match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/compliance/${row.serviceType}/${row.id}`),
            },
          ]}
        />
      ) : (
        <EmptyCompliance />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon,
  variant,
}: {
  title: string;
  value: number;
  hint?: string;
  icon: React.ReactNode;
  variant?: "destructive";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4",
        variant === "destructive" && "border-destructive/20 bg-destructive/5",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="font-bold text-2xl">{value}</p>
          {hint && <p className="mt-0.5 text-muted-foreground text-xs">{hint}</p>}
        </div>
        <div className="rounded-lg bg-muted p-2">{icon}</div>
      </div>
    </div>
  );
}
