"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Plus,
  Trash2,
  Truck,
} from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getMatterById, mockMatters } from "@/mock-data/matters";
import { mockPhysicalFiles } from "@/mock-data/registers";
import { getUserById, mockUsers } from "@/mock-data/users";
import type { PhysicalFile, PhysicalFileLocation, PhysicalFileStatus } from "@/types";

const filterConfigs: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "stored", label: "Stored" },
      { value: "checked_out", label: "Checked Out" },
      { value: "in_transit", label: "In Transit" },
      { value: "missing", label: "Missing" },
      { value: "archived", label: "Archived" },
      { value: "disposed", label: "Disposed" },
      { value: "digitized", label: "Digitized" },
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
    key: "custodianId",
    label: "Custodian",
    type: "select",
    options: mockUsers.map((u) => ({ value: u.id, label: u.fullName })),
  },
];

const VIEW_OPTIONS = [
  { id: "all", label: "All Files", icon: FileText },
  { id: "stored", label: "Stored", icon: Archive },
  { id: "checked_out", label: "Checked Out", icon: Truck },
  { id: "overdue", label: "Overdue", icon: AlertTriangle },
  { id: "missing", label: "Missing", icon: AlertCircle },
  { id: "archived", label: "Archived", icon: Archive },
] as const;

export function PhysicalFilesList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  });

  const filtered = useMemo(() => {
    let result = [...mockPhysicalFiles];

    if (view !== "all") {
      switch (view) {
        case "stored":
          result = result.filter((f) => f.status === "stored");
          break;
        case "checked_out":
          result = result.filter((f) => f.status === "checked_out");
          break;
        case "overdue":
          result = result.filter(
            (f) => f.status === "checked_out" && f.dueBackAt && new Date(f.dueBackAt) < new Date(),
          );
          break;
        case "missing":
          result = result.filter((f) => f.status === "missing");
          break;
        case "archived":
          result = result.filter((f) => f.status === "archived");
          break;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.fileNumber.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      result = result.filter((f) => (f as unknown as Record<string, unknown>)[key] === value);
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
  }, [search, filters, view, sortConfig]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const stored = filtered.filter((f) => f.status === "stored").length;
    const checkedOut = filtered.filter((f) => f.status === "checked_out").length;
    const overdue = filtered.filter(
      (f) => f.status === "checked_out" && f.dueBackAt && new Date(f.dueBackAt) < new Date(),
    ).length;
    const missing = filtered.filter((f) => f.status === "missing").length;
    const archived = filtered.filter((f) => f.status === "archived").length;

    return { total, stored, checkedOut, overdue, missing, archived };
  }, [filtered]);

  const formatLocation = (location: PhysicalFileLocation | undefined): string => {
    if (!location) return "—";
    const parts = [
      location.building,
      location.room,
      location.cabinet,
      location.shelf,
      location.box,
      location.slot,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" > ") : location.description || "—";
  };

  const fileColumns = [
    {
      accessorKey: "fileNumber",
      header: "File #",
      enableHiding: false,
      cell: ({ row }: { row: { original: PhysicalFile } }) => (
        <div>
          <p className="font-medium text-sm">{row.original.fileNumber}</p>
          <p className="text-muted-foreground text-xs">{row.original.title}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: PhysicalFile } }) => {
        const statusColors: Record<PhysicalFileStatus, { bg: string; text: string; icon: React.ReactNode }> = {
          stored: { bg: "bg-green-100", text: "text-green-800", icon: <Archive className="h-3 w-3" /> },
          checked_out: { bg: "bg-blue-100", text: "text-blue-800", icon: <Truck className="h-3 w-3" /> },
          in_transit: { bg: "bg-amber-100", text: "text-amber-800", icon: <Truck className="h-3 w-3" /> },
          missing: { bg: "bg-red-100", text: "text-red-800", icon: <AlertCircle className="h-3 w-3" /> },
          archived: { bg: "bg-gray-100", text: "text-gray-800", icon: <Archive className="h-3 w-3" /> },
          disposed: { bg: "bg-slate-100", text: "text-slate-800", icon: <Trash2 className="h-3 w-3" /> },
          digitized: { bg: "bg-purple-100", text: "text-purple-800", icon: <FileText className="h-3 w-3" /> },
        };
        const config = statusColors[row.original.status] || {
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: <FileText className="h-3 w-3" />,
        };
        return (
          <Badge variant="secondary" className={`${config.bg} ${config.text} gap-1`}>
            {config.icon}
            {row.original.status.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }: { row: { original: PhysicalFile } }) => {
        const client = getClientById(row.original.clientId || "");
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
      cell: ({ row }: { row: { original: PhysicalFile } }) => {
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
      accessorKey: "storageLocation",
      header: "Storage Location",
      cell: ({ row }: { row: { original: PhysicalFile } }) => (
        <span className="font-mono text-sm text-xs">{formatLocation(row.original.storageLocation)}</span>
      ),
    },
    {
      accessorKey: "currentLocation",
      header: "Current Location",
      cell: ({ row }: { row: { original: PhysicalFile } }) => (
        <span className="font-mono text-sm text-xs">{formatLocation(row.original.currentLocation)}</span>
      ),
    },
    {
      accessorKey: "custodianId",
      header: "Custodian",
      cell: ({ row }: { row: { original: PhysicalFile } }) => {
        if (!row.original.custodianId) return <span className="text-muted-foreground text-sm">—</span>;
        const user = getUserById(row.original.custodianId);
        return <span className="text-sm">{user?.fullName || row.original.custodianId}</span>;
      },
    },
    {
      accessorKey: "checkedOutById",
      header: "Checked Out By",
      cell: ({ row }: { row: { original: PhysicalFile } }) => {
        if (!row.original.checkedOutById) return <span className="text-muted-foreground text-sm">—</span>;
        const user = getUserById(row.original.checkedOutById);
        return <span className="text-sm">{user?.fullName || row.original.checkedOutById}</span>;
      },
    },
    {
      accessorKey: "dueBackAt",
      header: "Due Back",
      cell: ({ row }: { row: { original: PhysicalFile } }) => {
        if (!row.original.dueBackAt) return <span className="text-muted-foreground text-sm">—</span>;
        const isOverdue = new Date(row.original.dueBackAt) < new Date();
        return (
          <span className={cn("font-medium text-sm", isOverdue && "text-destructive")}>
            {formatDate(row.original.dueBackAt)}
            {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }: { row: { original: PhysicalFile } }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Physical Files Register"
        description="Track physical file storage, checkouts, movements, and locations"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) =>
                router.push(`/dashboard/physical-files${value !== "all" ? `?view=${value}` : ""}`)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Files" />
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
            <Button size="sm" onClick={() => alert("Register new physical file")}>
              <Plus className="mr-2 h-4 w-4" />
              New File
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Total Files" value={summary.total} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Stored" value={summary.stored} icon={<Archive className="h-5 w-5 text-green-600" />} />
        <StatCard title="Checked Out" value={summary.checkedOut} icon={<Truck className="h-5 w-5 text-blue-600" />} />
        <StatCard
          title="Overdue"
          value={summary.overdue}
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          variant="destructive"
        />
        <StatCard title="Missing" value={summary.missing} icon={<AlertCircle className="h-5 w-5 text-red-600" />} />
        <StatCard title="Archived" value={summary.archived} icon={<Archive className="h-5 w-5 text-gray-600" />} />
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search physical files by number, title, tags..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filtered.length > 0 ? (
        <DataTable<PhysicalFile>
          data={filtered}
          columns={fileColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={20}
          emptyMessage="No physical files match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/physical-files/${row.id}`),
            },
            {
              label: "Check Out",
              action: (row) => alert(`Check out file ${row.fileNumber}`),
              icon: <Truck className="h-3.5 w-3.5" />,
              show: (row) => row.status === "stored",
            },
            {
              label: "Check In",
              action: (row) => alert(`Check in file ${row.fileNumber}`),
              icon: <CheckCircle className="h-3.5 w-3.5" />,
              show: (row) => row.status === "checked_out",
            },
            {
              label: "View Movement History",
              action: (row) => alert(`View movement history for ${row.fileNumber}`),
              icon: <Eye className="h-3.5 w-3.5" />,
            },
          ]}
        />
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No physical files found"
          description="Register physical files to track their storage, checkouts, and movements."
          action={
            <Button size="sm" onClick={() => alert("Register new physical file")}>
              <Plus className="mr-2 h-4 w-4" />
              Register File
            </Button>
          }
        />
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
