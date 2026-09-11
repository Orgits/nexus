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
import type { ClientType, ComplianceCycle, ServiceType } from "@/types";

const itrServiceTypes: ServiceType[] = ["itr"];

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
    key: "financialYear",
    label: "Financial Year",
    type: "select",
    options: [
      { value: "2024-25", label: "2024-25" },
      { value: "2023-24", label: "2023-24" },
      { value: "2022-23", label: "2022-23" },
      { value: "2021-22", label: "2021-22" },
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
      { value: "2022-23", label: "2022-23" },
    ],
  },
  {
    key: "clientType",
    label: "Entity Type",
    type: "select",
    options: [
      { value: "individual", label: "Individual" },
      { value: "proprietorship", label: "Proprietorship" },
      { value: "partnership", label: "Partnership" },
      { value: "llp", label: "LLP" },
      { value: "private_limited", label: "Private Limited" },
      { value: "public_limited", label: "Public Limited" },
      { value: "one_person_company", label: "OPC" },
      { value: "huf", label: "HUF" },
      { value: "trust", label: "Trust" },
      { value: "section_8_company", label: "Section 8 Company" },
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
  { id: "all", label: "All ITR", icon: Search },
  { id: "individual", label: "Individual", icon: Users },
  { id: "corporate", label: "Corporate", icon: Building2 },
  { id: "llp", label: "LLP", icon: FileText },
  { id: "overdue", label: "Overdue", icon: AlertTriangle },
  { id: "due_soon", label: "Due Soon", icon: Filter },
  { id: "pending_docs", label: "Pending Docs", icon: FileText },
  { id: "ready_review", label: "Ready for Review", icon: CheckCircle },
  { id: "filed", label: "Filed/Completed", icon: CheckCircle },
] as const;

export function ITRWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "dueDate",
    direction: "asc",
  });

  const itrCycles = useMemo(() => mockComplianceCycles.filter((c) => itrServiceTypes.includes(c.serviceType)), []);

  const filtered = useMemo(() => {
    let result = [...itrCycles];

    if (view !== "all") {
      switch (view) {
        case "individual":
          result = result.filter((c) => {
            const client = getClientById(c.clientId);
            return client?.type === "individual";
          });
          break;
        case "corporate":
          result = result.filter((c) => {
            const client = getClientById(c.clientId);
            return ["private_limited", "public_limited", "one_person_company", "section_8_company"].includes(
              client?.type ?? "",
            );
          });
          break;
        case "llp":
          result = result.filter((c) => {
            const client = getClientById(c.clientId);
            return client?.type === "llp" || client?.type === "partnership";
          });
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
      } else if (key === "clientType") {
        result = result.filter((c) => {
          const client = getClientById(c.clientId);
          return client?.type === value;
        });
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
  }, [itrCycles, search, filters, view, sortConfig]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const overdue = filtered.filter((c) => c.isOverdue).length;
    const pendingDocs = filtered.filter((c) => c.missingDocuments.some((d) => d.isMandatory && !d.receivedAt)).length;
    const readyForReview = filtered.filter((c) => c.status === "ready_for_review" || c.status === "in_review").length;
    const filed = filtered.filter((c) => c.status === "filed" || c.status === "completed").length;
    const notStarted = filtered.filter((c) => c.status === "not_started" || c.status === "identification").length;

    const byForm = filtered.reduce(
      (acc, c) => {
        const form = c.serviceType === "itr" ? "ITR" : "Other";
        acc[form] = (acc[form] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, overdue, pendingDocs, readyForReview, filed, notStarted, byForm };
  }, [filtered]);

  const itrColumns = [
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
      accessorKey: "clientType",
      header: "Entity",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => {
        const client = getClientById(row.original.clientId);
        if (!client) return <span className="text-muted-foreground text-sm">—</span>;
        const typeLabels: Record<ClientType, string> = {
          individual: "Individual",
          proprietorship: "Proprietorship",
          partnership: "Partnership",
          llp: "LLP",
          private_limited: "Pvt Ltd",
          public_limited: "Public Ltd",
          one_person_company: "OPC",
          section_8_company: "Sec 8",
          huf: "HUF",
          trust: "Trust",
          society: "Society",
          foreign_company: "Foreign Co.",
          government: "Govt",
          other: "Other",
        };
        return (
          <Badge variant="secondary" className="text-xs">
            {typeLabels[client.type] || client.type}
          </Badge>
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
      accessorKey: "assessmentYear",
      header: "AY",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => (
        <span className="text-sm">{row.original.period.assessmentYear || "—"}</span>
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
        title="ITR Workspace"
        description="Manage Income Tax Return compliance cycles across all clients"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) =>
                router.push(`/dashboard/compliance/itr${value !== "all" ? `?view=${value}` : ""}`)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All ITR" />
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
            <Button size="sm" onClick={() => alert("Bulk ITR workflow actions")}>
              Bulk Actions
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard title="Total ITR" value={summary.total} icon={<Search className="h-5 w-5" />} />
        <StatCard
          title="Not Started"
          value={summary.notStarted}
          icon={<FileText className="h-5 w-5 text-gray-600" />}
        />
        <StatCard
          title="Pending Docs"
          value={summary.pendingDocs}
          icon={<FileText className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          title="Ready for Review"
          value={summary.readyForReview}
          icon={<CheckCircle className="h-5 w-5 text-purple-600" />}
        />
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
        searchPlaceholder="Search ITR cycles..."
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
          columns={itrColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={15}
          emptyMessage="No ITR cycles match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/compliance/itr/${row.id}`),
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
