"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Briefcase, CheckCircle, TrendingUp, Users } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink } from "@/components/ca-nexus/object-link";
import { AuditStatusBadge, PriorityBadge } from "@/components/ca-nexus/status-badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { getAuditEngagementsByStatus, mockAuditEngagements } from "@/mock-data/audit";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getUserById, mockUsers } from "@/mock-data/users";
import type { AuditEngagement, AuditStatus, AuditType } from "@/types";

const auditTabs = [
  { id: "all", label: "All", count: mockAuditEngagements.length },
  { id: "planning", label: "Planning", count: mockAuditEngagements.filter((a) => a.status === "planning").length },
  { id: "fieldwork", label: "Fieldwork", count: mockAuditEngagements.filter((a) => a.status === "fieldwork").length },
  { id: "review", label: "Review", count: mockAuditEngagements.filter((a) => a.status === "review").length },
  { id: "reporting", label: "Reporting", count: mockAuditEngagements.filter((a) => a.status === "reporting").length },
  { id: "completed", label: "Completed", count: mockAuditEngagements.filter((a) => a.status === "completed").length },
  { id: "archived", label: "Archived", count: mockAuditEngagements.filter((a) => a.status === "archived").length },
];

const auditTypes: { value: AuditType; label: string }[] = [
  { value: "statutory", label: "Statutory" },
  { value: "tax", label: "Tax" },
  { value: "internal", label: "Internal" },
  { value: "special", label: "Special" },
  { value: "concurrent", label: "Concurrent" },
  { value: "stock", label: "Stock" },
  { value: "cost", label: "Cost" },
  { value: "secretarial", label: "Secretarial" },
];

export function AuditList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "planning", label: "Planning" },
        { value: "fieldwork", label: "Fieldwork" },
        { value: "review", label: "Review" },
        { value: "reporting", label: "Reporting" },
        { value: "completed", label: "Completed" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: auditTypes.map((t) => ({ value: t.value, label: t.label })),
    },
    {
      key: "partnerId",
      label: "Partner",
      type: "select",
      options: mockUsers.filter((u) => u.role === "partner").map((u) => ({ value: u.id, label: u.fullName })),
    },
    {
      key: "managerIds",
      label: "Manager",
      type: "select",
      options: mockUsers.filter((u) => u.role === "manager").map((u) => ({ value: u.id, label: u.fullName })),
    },
    {
      key: "clientId",
      label: "Client",
      type: "select",
      options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
    },
  ];

  let filteredAudits = mockAuditEngagements;

  if (activeTab !== "all") {
    filteredAudits = getAuditEngagementsByStatus(activeTab as AuditStatus);
  }

  filteredAudits = filteredAudits.filter((a: AuditEngagement) => {
    if (
      search &&
      !a.name.toLowerCase().includes(search.toLowerCase()) &&
      !a.engagementNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (a as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleAuditClick = (audit: AuditEngagement) => router.push(`/dashboard/audit/${audit.id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Audit Workspace</h1>
          <p className="text-muted-foreground text-sm">Manage audit engagements and track progress</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {auditTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap"
            >
              {tab.label} <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs">{tab.count}</span>
            </Button>
          ))}
        </div>
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search audits by name, number..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredAudits.length > 0 ? (
        <DataTable<AuditEngagement>
          data={filteredAudits}
          columns={
            [
              {
                accessorKey: "engagementNumber",
                header: "Engagement #",
                cell: ({ row }: { row: { original: AuditEngagement } }) => (
                  <span className="font-medium text-sm">{row.original.engagementNumber}</span>
                ),
              },
              {
                accessorKey: "name",
                header: "Engagement Name",
                cell: ({ row }: { row: { original: AuditEngagement } }) => (
                  <p className="line-clamp-1 font-medium">{row.original.name}</p>
                ),
              },
              {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }: { row: { original: AuditEngagement } }) => (
                  <span className="text-sm capitalize">{row.original.type}</span>
                ),
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }: { row: { original: AuditEngagement } }) => {
                  const client = getClientById(row.original.clientId);
                  return <ClientLink client={client!} showStatus={true} />;
                },
              },
              {
                accessorKey: "period",
                header: "Period",
                cell: ({ row }: { row: { original: AuditEngagement } }) => (
                  <span className="text-sm">{row.original.period.label}</span>
                ),
              },
              {
                accessorKey: "assignedTeam",
                header: "Team",
                cell: ({ row }: { row: { original: AuditEngagement } }) => {
                  const partner = getUserById(row.original.assignedTeam.partnerId);
                  const managers = row.original.assignedTeam.managerIds
                    .map((id) => getUserById(id)?.fullName)
                    .filter(Boolean);
                  return (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {partner?.fullName || "—"} <span className="text-muted-foreground text-xs">(Partner)</span>
                        </span>
                      </div>
                      {managers.length > 0 && (
                        <div className="ml-5 flex items-center gap-2 text-muted-foreground text-xs">
                          <span>Mgrs: {managers.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  );
                },
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: AuditEngagement } }) => (
                  <AuditStatusBadge status={row.original.status} />
                ),
              },
              {
                accessorKey: "planning",
                header: "Planning",
                cell: ({ row }: { row: { original: AuditEngagement } }) => (
                  <div className="flex items-center gap-2">
                    {row.original.planning.completedAt ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 text-sm">Completed</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                        <span className="text-amber-600 text-sm">Pending</span>
                      </>
                    )}
                  </div>
                ),
              },
              {
                accessorKey: "riskAssessment",
                header: "Overall Risk",
                cell: ({ row }: { row: { original: AuditEngagement } }) => (
                  <PriorityBadge
                    priority={
                      row.original.riskAssessment.overallRisk === "critical"
                        ? "urgent"
                        : row.original.riskAssessment.overallRisk === "high"
                          ? "high"
                          : row.original.riskAssessment.overallRisk === "medium"
                            ? "medium"
                            : "low"
                    }
                  />
                ),
              },
              {
                accessorKey: "materiality",
                header: "Materiality",
                cell: ({ row }: { row: { original: AuditEngagement } }) => (
                  <span className="font-mono text-sm">{formatINR(row.original.materiality.overallMateriality)}</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No audits match your search or filters"
          rowActions={[{ label: "View Details", action: handleAuditClick }]}
        />
      ) : (
        <EmptyState
          icon={<Briefcase className="h-12 w-12 text-muted-foreground/50" />}
          title="No audit engagements found"
          description={
            search || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "No audit engagements created yet"
          }
        />
      )}
    </div>
  );
}
