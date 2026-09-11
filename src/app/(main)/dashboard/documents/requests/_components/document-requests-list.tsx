"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import { AlertTriangle, CheckCircle, Clock, Download, Edit, FileText, Plus, Upload } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { DocumentRequestStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getDocumentRequestsByComplianceCycle, mockComplianceCycles } from "@/mock-data/compliance";
import { getMatterById, mockMatters } from "@/mock-data/matters";
import { getUserById, mockUsers } from "@/mock-data/users";
import type { DocumentRequest } from "@/types";

const filterConfigs: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "not_sent", label: "Not Sent" },
      { value: "sent", label: "Sent" },
      { value: "reminder_sent", label: "Reminder Sent" },
      { value: "partially_received", label: "Partially Received" },
      { value: "received", label: "Received" },
      { value: "closed", label: "Closed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    key: "clientId",
    label: "Client",
    type: "select",
    options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
  },
  {
    key: "matterId",
    label: "Matter",
    type: "select",
    options: mockMatters.map((m) => ({ value: m.id, label: m.name })),
  },
  {
    key: "requestedById",
    label: "Requested By",
    type: "select",
    options: mockUsers.map((u) => ({ value: u.id, label: u.fullName })),
  },
];

const VIEW_OPTIONS = [
  { id: "all", label: "All Requests", icon: FileText },
  { id: "pending", label: "Pending", icon: Clock },
  { id: "overdue", label: "Overdue", icon: AlertTriangle },
  { id: "received", label: "Received", icon: CheckCircle },
  { id: "draft", label: "Draft", icon: Edit },
] as const;

export function DocumentRequestsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "sentAt",
    direction: "desc",
  });

  const allRequests = useMemo(() => {
    const result: any[] = [];
    mockComplianceCycles.forEach((cycle) => {
      const requests = getDocumentRequestsByComplianceCycle(cycle.id);
      requests.forEach((req) => {
        result.push({ ...req, complianceCycle: cycle });
      });
    });
    return result;
  }, []);

  const filtered = useMemo(() => {
    let result = [...allRequests];

    if (view !== "all") {
      switch (view) {
        case "pending":
          result = result.filter((r) => ["sent", "reminder_sent", "partially_received"].includes(r.status));
          break;
        case "overdue":
          result = result.filter(
            (r) =>
              ["sent", "reminder_sent", "partially_received"].includes(r.status) &&
              r.sentAt &&
              new Date(r.sentAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          );
          break;
        case "received":
          result = result.filter((r) => r.status === "received");
          break;
        case "draft":
          result = result.filter((r) => r.status === "draft" || r.status === "not_sent");
          break;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.items.some((item: any) => item.documentType.toLowerCase().includes(q)) ||
          r.complianceCycle?.serviceName.toLowerCase().includes(q),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      result = result.filter((r) => (r as unknown as Record<string, unknown>)[key] === value);
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof typeof a] as string | number | Date | undefined;
      const bVal = b[sortConfig.key as keyof typeof b] as string | number | Date | undefined;
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      const aComparable = aVal instanceof Date ? aVal.getTime() : aVal;
      const bComparable = bVal instanceof Date ? bVal.getTime() : bVal;
      if (aComparable < bComparable) return sortConfig.direction === "asc" ? -1 : 1;
      if (aComparable > bComparable) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [allRequests, search, filters, view, sortConfig]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const draft = filtered.filter((r) => ["draft", "not_sent"].includes(r.status)).length;
    const sent = filtered.filter((r) => r.status === "sent").length;
    const partially = filtered.filter((r) => r.status === "partially_received").length;
    const received = filtered.filter((r) => r.status === "received").length;
    const overdue = filtered.filter(
      (r) =>
        ["sent", "reminder_sent", "partially_received"].includes(r.status) &&
        r.sentAt &&
        new Date(r.sentAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    ).length;

    return { total, draft, sent, partially, received, overdue };
  }, [filtered]);

  const requestColumns = [
    {
      accessorKey: "id",
      header: "Request ID",
      enableHiding: false,
      cell: ({ row }: { row: { original: DocumentRequest & { complianceCycle: any } } }) => (
        <div>
          <p className="font-medium text-sm">{row.original.id}</p>
          <p className="text-muted-foreground text-xs">{row.original.complianceCycle?.serviceName || "Unknown"}</p>
        </div>
      ),
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }: { row: { original: DocumentRequest & { complianceCycle: any } } }) => {
        const client = getClientById(row.original.clientId);
        return client ? (
          <ClientLink client={client} showStatus={true} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "matterId",
      header: "Matter",
      cell: ({ row }: { row: { original: DocumentRequest & { complianceCycle: any } } }) => {
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: DocumentRequest & { complianceCycle: any } } }) => (
        <DocumentRequestStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }: { row: { original: DocumentRequest & { complianceCycle: any } } }) => (
        <div className="max-h-24 space-y-1 overflow-y-auto">
          {row.original.items.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={cn("text-xs", item.isReceived ? "text-green-600" : "text-red-600")}>
                {item.isReceived ? "✓" : "✗"}
              </span>
              <span className="capitalize">{item.documentType.replace(/_/g, " ")}</span>
              {item.isMandatory && (
                <Badge variant="destructive" className="text-[10px]">
                  Required
                </Badge>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "sentAt",
      header: "Sent At",
      cell: ({ row }: { row: { original: DocumentRequest & { complianceCycle: any } } }) => (
        <span className="text-sm">{row.original.sentAt ? formatDateTime(row.original.sentAt) : "Not sent"}</span>
      ),
    },
    {
      accessorKey: "reminderCount",
      header: "Reminders",
      cell: ({ row }: { row: { original: DocumentRequest & { complianceCycle: any } } }) => (
        <span className="font-medium text-sm">{row.original.reminderCount}</span>
      ),
    },
    {
      accessorKey: "lastReminderAt",
      header: "Last Reminder",
      cell: ({ row }: { row: { original: DocumentRequest & { complianceCycle: any } } }) => (
        <span className="text-sm">
          {row.original.lastReminderAt ? formatDateTime(row.original.lastReminderAt) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "requestedById",
      header: "Requested By",
      cell: ({ row }: { row: { original: DocumentRequest & { complianceCycle: any } } }) => {
        const user = getUserById(row.original.requestedById);
        return <span className="text-sm">{user?.fullName || row.original.requestedById}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Document Requests"
        description="Track document requests sent to clients for compliance matters"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) =>
                router.push(`/dashboard/documents/requests${value !== "all" ? `?view=${value}` : ""}`)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Requests" />
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
            <Button size="sm" onClick={() => alert("Create new document request")}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Total" value={summary.total} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Draft" value={summary.draft} icon={<Edit className="h-5 w-5 text-gray-600" />} />
        <StatCard title="Sent" value={summary.sent} icon={<Upload className="h-5 w-5 text-blue-600" />} />
        <StatCard
          title="Partial"
          value={summary.partially}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
        <StatCard title="Received" value={summary.received} icon={<CheckCircle className="h-5 w-5 text-green-600" />} />
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search document requests..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filtered.length > 0 ? (
        <DataTable<any>
          data={filtered}
          columns={requestColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={15}
          emptyMessage="No document requests match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => alert(`View request ${row.id}`),
            },
            {
              label: "Send Reminder",
              action: (row) => alert(`Send reminder for request ${row.id}`),
              icon: <AlertTriangle className="h-3.5 w-3.5" />,
              show: (row) => ["sent", "reminder_sent", "partially_received"].includes(row.status),
            },
            {
              label: "Mark Received",
              action: (row) => alert(`Mark request ${row.id} as received`),
              icon: <CheckCircle className="h-3.5 w-3.5" />,
              show: (row) => ["sent", "reminder_sent", "partially_received"].includes(row.status),
            },
          ]}
        />
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No document requests found"
          description="Document requests will appear here when sent to clients for missing documents."
          action={
            <Button size="sm" onClick={() => alert("Create document request")}>
              <Upload className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          }
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
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
