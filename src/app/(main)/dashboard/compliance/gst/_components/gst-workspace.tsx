"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import { AlertTriangle, Building2, Calendar, CheckCircle, Download, Filter, Search } from "lucide-react";

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
import { serviceTypeLabel } from "@/lib/labels";
import { getClientById, mockClients } from "@/mock-data/clients";
import { mockComplianceCycles } from "@/mock-data/compliance";
import { getUserById, mockTeams, mockUsers } from "@/mock-data/users";
import type { ComplianceCycle, ServiceType } from "@/types";

const gstServiceTypes: ServiceType[] = ["gst_monthly", "gst_quarterly", "gst_annual"];

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
    label: "Return Type",
    type: "select",
    options: [
      { value: "gst_monthly", label: "GSTR-1/3B Monthly" },
      { value: "gst_quarterly", label: "GSTR-1 Quarterly (QRMP)" },
      { value: "gst_annual", label: "GSTR-9 Annual" },
    ],
  },
  {
    key: "periodType",
    label: "Period View",
    type: "select",
    options: [
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "annual", label: "Annual" },
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
  { id: "all", label: "All GST", icon: Search },
  { id: "monthly", label: "Monthly", icon: Calendar },
  { id: "quarterly", label: "Quarterly", icon: Calendar },
  { id: "annual", label: "Annual", icon: Calendar },
  { id: "qrmp", label: "QRMP", icon: Building2 },
  { id: "overdue", label: "Overdue", icon: AlertTriangle },
  { id: "due_soon", label: "Due Soon", icon: Filter },
  { id: "pending_docs", label: "Pending Docs", icon: Filter },
  { id: "ready_review", label: "Ready for Review", icon: CheckCircle },
  { id: "filed", label: "Filed/Completed", icon: CheckCircle },
] as const;

export function GSTWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "dueDate",
    direction: "asc",
  });

  const gstCycles = useMemo(() => mockComplianceCycles.filter((c) => gstServiceTypes.includes(c.serviceType)), []);

  const filtered = useMemo(() => {
    let result = [...gstCycles];

    if (view !== "all") {
      switch (view) {
        case "monthly":
          result = result.filter((c) => c.serviceType === "gst_monthly");
          break;
        case "quarterly":
          result = result.filter((c) => c.serviceType === "gst_quarterly");
          break;
        case "annual":
          result = result.filter((c) => c.serviceType === "gst_annual");
          break;
        case "qrmp":
          result = result.filter((c) => c.serviceType === "gst_quarterly");
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
      } else if (key === "periodType") {
        const periodMap: Record<string, ServiceType[]> = {
          monthly: ["gst_monthly"],
          quarterly: ["gst_quarterly"],
          annual: ["gst_annual"],
        };
        if (periodMap[value as string]) {
          result = result.filter((c) => periodMap[value as string].includes(c.serviceType));
        }
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
  }, [gstCycles, search, filters, view, sortConfig]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const overdue = filtered.filter((c) => c.isOverdue).length;
    const pendingDocs = filtered.filter((c) => c.missingDocuments.some((d) => d.isMandatory && !d.receivedAt)).length;
    const readyForReview = filtered.filter((c) => c.status === "ready_for_review" || c.status === "in_review").length;
    const filed = filtered.filter((c) => c.status === "filed" || c.status === "completed").length;
    const monthly = filtered.filter((c) => c.serviceType === "gst_monthly").length;
    const quarterly = filtered.filter((c) => c.serviceType === "gst_quarterly").length;
    const annual = filtered.filter((c) => c.serviceType === "gst_annual").length;

    return { total, overdue, pendingDocs, readyForReview, filed, monthly, quarterly, annual };
  }, [filtered]);

  const gstColumns = [
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
      header: "Return Type",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => (
        <Badge variant="secondary" className="text-xs">
          {serviceTypeLabel(row.original.serviceType)}
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
        title="GST Workspace"
        description="Manage GST return compliance cycles - Monthly, Quarterly (QRMP), and Annual"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) =>
                router.push(`/dashboard/compliance/gst${value !== "all" ? `?view=${value}` : ""}`)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All GST" />
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
            <Button size="sm" onClick={() => alert("Bulk GST filing actions")}>
              Bulk Actions
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Total GST" value={summary.total} icon={<Search className="h-5 w-5" />} />
        <StatCard title="Monthly" value={summary.monthly} icon={<Calendar className="h-5 w-5 text-blue-600" />} />
        <StatCard title="Quarterly" value={summary.quarterly} icon={<Calendar className="h-5 w-5 text-purple-600" />} />
        <StatCard title="Annual" value={summary.annual} icon={<Calendar className="h-5 w-5 text-indigo-600" />} />
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
        searchPlaceholder="Search GST cycles..."
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
          columns={gstColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={15}
          emptyMessage="No GST cycles match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/compliance/gst/${row.id}`),
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
