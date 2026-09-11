"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import { AlertTriangle, Building2, CheckCircle, Download, FileText, Filter, Gavel, Search } from "lucide-react";

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

const mcaServiceTypes: ServiceType[] = ["mca_aoc4", "mca_mgt7", "mca_adt1", "mca_dpt3", "mca_other"];

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
      { value: "mca_aoc4", label: "AOC-4 (Financial Statements)" },
      { value: "mca_mgt7", label: "MGT-7 (Annual Return)" },
      { value: "mca_adt1", label: "ADT-1 (Auditor Appointment)" },
      { value: "mca_dpt3", label: "DPT-3 (Deposits Return)" },
      { value: "mca_other", label: "Other MCA Forms" },
    ],
  },
  {
    key: "clientType",
    label: "Entity Type",
    type: "select",
    options: [
      { value: "private_limited", label: "Private Limited" },
      { value: "public_limited", label: "Public Limited" },
      { value: "one_person_company", label: "OPC" },
      { value: "section_8_company", label: "Section 8 Company" },
      { value: "llp", label: "LLP" },
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
  { id: "all", label: "All MCA/ROC", icon: Search },
  { id: "aoc4", label: "AOC-4", icon: FileText },
  { id: "mgt7", label: "MGT-7", icon: FileText },
  { id: "adt1", label: "ADT-1", icon: Gavel },
  { id: "dpt3", label: "DPT-3", icon: FileText },
  { id: "company", label: "Companies", icon: Building2 },
  { id: "llp", label: "LLPs", icon: Building2 },
  { id: "overdue", label: "Overdue", icon: AlertTriangle },
  { id: "due_soon", label: "Due Soon", icon: Filter },
  { id: "pending_docs", label: "Pending Docs", icon: Filter },
  { id: "ready_review", label: "Ready for Review", icon: CheckCircle },
  { id: "filed", label: "Filed/Completed", icon: CheckCircle },
] as const;

const formLabels: Record<string, string> = {
  mca_aoc4: "AOC-4",
  mca_mgt7: "MGT-7",
  mca_adt1: "ADT-1",
  mca_dpt3: "DPT-3",
  mca_other: "Other",
};

const entityLabels: Record<ClientType, string> = {
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

export function MCAWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "dueDate",
    direction: "asc",
  });

  const mcaCycles = useMemo(() => mockComplianceCycles.filter((c) => mcaServiceTypes.includes(c.serviceType)), []);

  const filtered = useMemo(() => {
    let result = [...mcaCycles];

    if (view !== "all") {
      switch (view) {
        case "aoc4":
          result = result.filter((c) => c.serviceType === "mca_aoc4");
          break;
        case "mgt7":
          result = result.filter((c) => c.serviceType === "mca_mgt7");
          break;
        case "adt1":
          result = result.filter((c) => c.serviceType === "mca_adt1");
          break;
        case "dpt3":
          result = result.filter((c) => c.serviceType === "mca_dpt3");
          break;
        case "company":
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
            return client?.type === "llp";
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
  }, [mcaCycles, search, filters, view, sortConfig]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const overdue = filtered.filter((c) => c.isOverdue).length;
    const pendingDocs = filtered.filter((c) => c.missingDocuments.some((d) => d.isMandatory && !d.receivedAt)).length;
    const readyForReview = filtered.filter((c) => c.status === "ready_for_review" || c.status === "in_review").length;
    const filed = filtered.filter((c) => c.status === "filed" || c.status === "completed").length;
    const aoc4 = filtered.filter((c) => c.serviceType === "mca_aoc4").length;
    const mgt7 = filtered.filter((c) => c.serviceType === "mca_mgt7").length;
    const adt1 = filtered.filter((c) => c.serviceType === "mca_adt1").length;
    const dpt3 = filtered.filter((c) => c.serviceType === "mca_dpt3").length;
    const company = filtered.filter((c) => {
      const client = getClientById(c.clientId);
      return ["private_limited", "public_limited", "one_person_company", "section_8_company"].includes(
        client?.type ?? "",
      );
    }).length;
    const llp = filtered.filter((c) => {
      const client = getClientById(c.clientId);
      return client?.type === "llp";
    }).length;

    return { total, overdue, pendingDocs, readyForReview, filed, aoc4, mgt7, adt1, dpt3, company, llp };
  }, [filtered]);

  const mcaColumns = [
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
      accessorKey: "clientType",
      header: "Entity",
      cell: ({ row }: { row: { original: ComplianceCycle } }) => {
        const client = getClientById(row.original.clientId);
        if (!client) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <Badge variant="outline" className="text-xs">
            {entityLabels[client.type] || client.type}
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
        title="MCA / ROC Workspace"
        description="Manage MCA/ROC annual and periodic compliance filings - AOC-4, MGT-7, ADT-1, DPT-3"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) =>
                router.push(`/dashboard/compliance/mca-roc${value !== "all" ? `?view=${value}` : ""}`)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All MCA/ROC" />
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
            <Button size="sm" onClick={() => alert("Bulk MCA filing actions")}>
              Bulk Actions
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
        <StatCard title="Total MCA" value={summary.total} icon={<Search className="h-5 w-5" />} />
        <StatCard title="Companies" value={summary.company} icon={<Building2 className="h-5 w-5 text-blue-600" />} />
        <StatCard title="LLPs" value={summary.llp} icon={<Building2 className="h-5 w-5 text-purple-600" />} />
        <StatCard title="AOC-4" value={summary.aoc4} icon={<FileText className="h-5 w-5 text-green-600" />} />
        <StatCard title="MGT-7" value={summary.mgt7} icon={<FileText className="h-5 w-5 text-indigo-600" />} />
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
        searchPlaceholder="Search MCA/ROC cycles..."
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
          columns={mcaColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={15}
          emptyMessage="No MCA/ROC cycles match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/compliance/mca-roc/${row.id}`),
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
