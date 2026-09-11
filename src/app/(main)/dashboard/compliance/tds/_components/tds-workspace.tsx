"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import { AlertTriangle, Building2, CheckCircle, Download, FileText, Filter, Search, Users } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyCompliance } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink } from "@/components/ca-nexus/object-link";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { ComplianceStatusBadge, PriorityBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { daysOverdue, formatDate } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { mockComplianceCycles } from "@/mock-data/compliance";
import { getUserById, mockTeams, mockUsers } from "@/mock-data/users";
import type { ComplianceCycle, ServiceType } from "@/types";

const tdsServiceTypes: ServiceType[] = ["tds_24q", "tds_26q", "tds_27q", "tds_27eq"];

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
    label: "Form Type",
    type: "select",
    options: [
      { value: "tds_24q", label: "24Q - Salary TDS" },
      { value: "tds_26q", label: "26Q - Non-Salary TDS" },
      { value: "tds_27q", label: "27Q - NRI TDS" },
      { value: "tds_27eq", label: "27EQ - TCS" },
    ],
  },
  {
    key: "quarter",
    label: "Quarter",
    type: "select",
    options: [
      { value: "Q1", label: "Q1 (Apr-Jun)" },
      { value: "Q2", label: "Q2 (Jul-Sep)" },
      { value: "Q3", label: "Q3 (Oct-Dec)" },
      { value: "Q4", label: "Q4 (Jan-Mar)" },
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
  { id: "all", label: "All TDS", icon: Search },
  { id: "24q", label: "24Q Salary", icon: Users },
  { id: "26q", label: "26Q Non-Salary", icon: Building2 },
  { id: "27q", label: "27Q NRI", icon: FileText },
  { id: "27eq", label: "27EQ TCS", icon: FileText },
  { id: "overdue", label: "Overdue", icon: AlertTriangle },
  { id: "due_soon", label: "Due Soon", icon: Filter },
  { id: "pending_docs", label: "Pending Docs", icon: Filter },
  { id: "ready_review", label: "Ready for Review", icon: CheckCircle },
  { id: "filed", label: "Filed/Completed", icon: CheckCircle },
] as const;

const formLabels: Record<string, string> = {
  tds_24q: "24Q",
  tds_26q: "26Q",
  tds_27q: "27Q",
  tds_27eq: "27EQ",
};

export function TDSWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "dueDate",
    direction: "asc",
  });

  const tdsCycles = useMemo(() => mockComplianceCycles.filter((c) => tdsServiceTypes.includes(c.serviceType)), []);

  const filtered = useMemo(() => {
    let result = [...tdsCycles];

    if (view !== "all") {
      switch (view) {
        case "24q":
          result = result.filter((c) => c.serviceType === "tds_24q");
          break;
        case "26q":
          result = result.filter((c) => c.serviceType === "tds_26q");
          break;
        case "27q":
          result = result.filter((c) => c.serviceType === "tds_27q");
          break;
        case "27eq":
          result = result.filter((c) => c.serviceType === "tds_27eq");
          break;
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
        case "filed":
          result = result.filter((c) => c.status === "filed" || c.status === "completed" || c.status === "closed");
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
      } else if (key === "quarter") {
        result = result.filter((c) => c.period.label.includes(value as string));
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
  }, [tdsCycles, search, filters, view, sortConfig]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const overdue = filtered.filter((c) => c.isOverdue).length;
    const pendingDocs = filtered.filter((c) => c.missingDocuments.some((d) => d.isMandatory && !d.receivedAt)).length;
    const readyForReview = filtered.filter((c) => c.status === "ready_for_review" || c.status === "in_review").length;
    const filed = filtered.filter((c) => c.status === "filed" || c.status === "completed").length;
    const form24q = filtered.filter((c) => c.serviceType === "tds_24q").length;
    const form26q = filtered.filter((c) => c.serviceType === "tds_26q").length;
    const form27q = filtered.filter((c) => c.serviceType === "tds_27q").length;
    const form27eq = filtered.filter((c) => c.serviceType === "tds_27eq").length;

    return { total, overdue, pendingDocs, readyForReview, filed, form24q, form26q, form27q, form27eq };
  }, [filtered]);

  const tdsColumns = [
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
      header: "Form",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => (
        <Badge variant="secondary" className="font-medium text-xs">
          {formLabels[row.original.serviceType] || row.original.serviceType}
        </Badge>
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
      accessorKey: "financialYear",
      header: "FY",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => (
        <span className="text-sm">{row.original.period.financialYear}</span>
      ),
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
    {
      accessorKey: "assignedUserId",
      header: "Assignee",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => {
        const user = getUserById(row.original.assignedUserId);
        return <span className="text-sm">{user?.fullName || row.original.assignedUserId}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="TDS Workspace"
        description="Manage TDS/TCS return compliance - Form 24Q, 26Q, 27Q, 27EQ"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) =>
                router.push(`/dashboard/compliance/tds${value !== "all" ? `?view=${value}` : ""}`)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All TDS" />
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
            <Button size="sm" onClick={() => alert("Bulk TDS filing actions")}>
              Bulk Actions
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
        <StatCard title="Total TDS" value={summary.total} icon={<Search className="h-5 w-5" />} />
        <StatCard title="24Q Salary" value={summary.form24q} icon={<Users className="h-5 w-5 text-blue-600" />} />
        <StatCard
          title="26Q Non-Salary"
          value={summary.form26q}
          icon={<Building2 className="h-5 w-5 text-purple-600" />}
        />
        <StatCard title="27Q NRI" value={summary.form27q} icon={<FileText className="h-5 w-5 text-indigo-600" />} />
        <StatCard title="27EQ TCS" value={summary.form27eq} icon={<FileText className="h-5 w-5 text-teal-600" />} />
        <StatCard
          title="Overdue"
          value={summary.overdue}
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          variant="destructive"
        />
        <StatCard title="Filed" value={summary.filed} icon={<CheckCircle className="h-5 w-5 text-green-600" />} />
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search TDS cycles..."
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
          columns={tdsColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={15}
          emptyMessage="No TDS cycles match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/compliance/tds/${row.id}`),
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
  icon,
  variant,
}: {
  title: string;
  value: number;
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
        </div>
        <div className="rounded-lg bg-muted p-2">{icon}</div>
      </div>
    </div>
  );
}
