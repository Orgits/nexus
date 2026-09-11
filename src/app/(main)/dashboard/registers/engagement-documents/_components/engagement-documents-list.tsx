"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle, Clock, FileText } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink } from "@/components/ca-nexus/object-link";
import { EngagementDocumentStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import { getEngagementDocsByStatus, mockEngagementDocuments } from "@/mock-data/registers";
import type { EngagementDocument, EngagementDocumentStatus } from "@/types";

const engagementTabs = [
  { id: "all", label: "All", count: mockEngagementDocuments.length },
  { id: "draft", label: "Draft", count: mockEngagementDocuments.filter((e) => e.status === "draft").length },
  {
    id: "pending_signature",
    label: "Pending Signature",
    count: mockEngagementDocuments.filter((e) => e.status === "pending_signature").length,
  },
  {
    id: "partially_signed",
    label: "Partially Signed",
    count: mockEngagementDocuments.filter((e) => e.status === "partially_signed").length,
  },
  { id: "signed", label: "Signed", count: mockEngagementDocuments.filter((e) => e.status === "signed").length },
  { id: "expired", label: "Expired", count: mockEngagementDocuments.filter((e) => e.status === "expired").length },
];

const statuses: { value: EngagementDocumentStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending_signature", label: "Pending Signature" },
  { value: "partially_signed", label: "Partially Signed" },
  { value: "signed", label: "Signed" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
  { value: "declined", label: "Declined" },
];

export function EngagementDocumentsList() {
  const _router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: statuses.map((s) => ({ value: s.value, label: s.label })),
    },
    {
      key: "clientId",
      label: "Client",
      type: "select",
      options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
    },
  ];

  let filteredEngagements = mockEngagementDocuments;

  if (activeTab !== "all") {
    filteredEngagements = getEngagementDocsByStatus(activeTab as any);
  }

  filteredEngagements = filteredEngagements.filter((eng: EngagementDocument) => {
    if (search && !eng.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (eng as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleEngagementClick = (eng: EngagementDocument) => alert(`View Engagement Document ${eng.name}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Engagement Documents</h1>
          <p className="text-muted-foreground text-sm">Manage engagement letters and digital signatures</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {engagementTabs.map((tab) => (
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
        searchPlaceholder="Search engagement documents by name..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredEngagements.length > 0 ? (
        <DataTable<EngagementDocument>
          data={filteredEngagements}
          columns={
            [
              {
                accessorKey: "name",
                header: "Document Name",
                cell: ({ row }: { row: { original: EngagementDocument } }) => (
                  <p className="font-medium">{row.original.name}</p>
                ),
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }: { row: { original: EngagementDocument } }) => {
                  const client = getClientById(row.original.clientId);
                  return <ClientLink client={client!} showStatus={true} />;
                },
              },
              {
                accessorKey: "matterId",
                header: "Matter",
                cell: ({ row }: { row: { original: EngagementDocument } }) => {
                  if (!row.original.matterId) return <span className="text-muted-foreground text-sm">—</span>;
                  const matter = getMatterById(row.original.matterId);
                  return <span className="text-sm">{matter?.name || "—"}</span>;
                },
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: EngagementDocument } }) => (
                  <EngagementDocumentStatusBadge status={row.original.status} />
                ),
              },
              {
                accessorKey: "signers",
                header: "Signers",
                cell: ({ row }: { row: { original: EngagementDocument } }) => (
                  <div className="space-y-1">
                    {row.original.signers.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full",
                            s.status === "signed"
                              ? "bg-green-100 text-green-600"
                              : s.status === "pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : s.status === "declined"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-gray-100 text-gray-600",
                          )}
                        >
                          {s.status === "signed" ? (
                            <CheckCircle className="h-3.5 w-3.5" />
                          ) : s.status === "declined" ? (
                            <XCircle className="h-3.5 w-3.5" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span>
                          {s.name} ({s.role})
                        </span>
                        <Badge
                          variant={
                            s.status === "signed"
                              ? "default"
                              : s.status === "pending"
                                ? "secondary"
                                : s.status === "declined"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="text-xs"
                        >
                          {s.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                accessorKey: "sentAt",
                header: "Sent",
                cell: ({ row }: { row: { original: EngagementDocument } }) => (
                  <span className="text-sm">{row.original.sentAt ? formatDate(row.original.sentAt) : "—"}</span>
                ),
              },
              {
                accessorKey: "completedAt",
                header: "Completed",
                cell: ({ row }: { row: { original: EngagementDocument } }) => (
                  <span className="text-sm">
                    {row.original.completedAt ? formatDate(row.original.completedAt) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "reminderCount",
                header: "Reminders",
                cell: ({ row }: { row: { original: EngagementDocument } }) => (
                  <span className="text-sm">{row.original.reminderCount}</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No engagement documents match your search or filters"
          rowActions={[{ label: "View", action: handleEngagementClick }]}
        />
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No engagement documents found"
          description={
            search || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "No engagement documents yet"
          }
        />
      )}
    </div>
  );
}

import { cn } from "cn";
import { XCircle } from "lucide-react";
