"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { FileCheck } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink } from "@/components/ca-nexus/object-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { mockDocuments } from "@/mock-data/documents";
import { getMatterById } from "@/mock-data/matters";
import { getUDINByStatus, mockUDINRegisters } from "@/mock-data/registers";
import { mockUsers } from "@/mock-data/users";
import type { UDINRegister } from "@/types";

const udinTabs = [
  { id: "all", label: "All", count: mockUDINRegisters.length },
  { id: "generated", label: "Generated", count: mockUDINRegisters.filter((u) => u.status === "generated").length },
  { id: "used", label: "Used", count: mockUDINRegisters.filter((u) => u.status === "used").length },
  { id: "cancelled", label: "Cancelled", count: mockUDINRegisters.filter((u) => u.status === "cancelled").length },
];

const statuses: { value: UDINRegister["status"]; label: string }[] = [
  { value: "generated", label: "Generated" },
  { value: "used", label: "Used" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

export function UDINRegisterList() {
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

  let filteredUDINs = mockUDINRegisters;

  if (activeTab !== "all") {
    filteredUDINs = getUDINByStatus(activeTab as any);
  }

  filteredUDINs = filteredUDINs.filter((udin: UDINRegister) => {
    if (
      search &&
      !udin.udin.toLowerCase().includes(search.toLowerCase()) &&
      !udin.certificateType.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (udin as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleUDINClick = (udin: UDINRegister) => alert(`View UDIN ${udin.udin}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">UDIN Register</h1>
          <p className="text-muted-foreground text-sm">Manage Unique Document Identification Numbers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {udinTabs.map((tab) => (
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
        searchPlaceholder="Search UDIN by number, certificate type..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredUDINs.length > 0 ? (
        <DataTable<UDINRegister>
          data={filteredUDINs}
          columns={
            [
              {
                accessorKey: "udin",
                header: "UDIN",
                cell: ({ row }: { row: { original: UDINRegister } }) => (
                  <span className="font-medium font-mono text-sm">{row.original.udin}</span>
                ),
              },
              {
                accessorKey: "certificateType",
                header: "Certificate Type",
                cell: ({ row }: { row: { original: UDINRegister } }) => (
                  <span className="text-sm">{row.original.certificateType}</span>
                ),
              },
              {
                accessorKey: "financialYear",
                header: "FY",
                cell: ({ row }: { row: { original: UDINRegister } }) => (
                  <span className="text-sm">{row.original.financialYear}</span>
                ),
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }: { row: { original: UDINRegister } }) => {
                  const client = getClientById(row.original.clientId);
                  return <ClientLink client={client!} showStatus={true} />;
                },
              },
              {
                accessorKey: "matterId",
                header: "Matter",
                cell: ({ row }: { row: { original: UDINRegister } }) => {
                  if (!row.original.matterId) return <span className="text-muted-foreground text-sm">—</span>;
                  const matter = getMatterById(row.original.matterId);
                  return <span className="text-sm">{matter?.name || "—"}</span>;
                },
              },
              {
                accessorKey: "documentId",
                header: "Document",
                cell: ({ row }: { row: { original: UDINRegister } }) => {
                  if (!row.original.documentId) return <span className="text-muted-foreground text-sm">—</span>;
                  const doc = mockDocuments.find((d) => d.id === row.original.documentId);
                  return doc ? (
                    <span className="text-sm">{doc.originalFileName}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "generatedDate",
                header: "Generated",
                cell: ({ row }: { row: { original: UDINRegister } }) => (
                  <span className="text-sm">{formatDate(row.original.generatedDate)}</span>
                ),
              },
              {
                accessorKey: "generatedBy",
                header: "Generated By",
                cell: ({ row }: { row: { original: UDINRegister } }) => {
                  const user = mockUsers.find((u) => u.id === row.original.generatedBy);
                  return user ? (
                    <span className="text-sm">{user.fullName}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: UDINRegister } }) => (
                  <Badge
                    variant={
                      row.original.status === "used"
                        ? "default"
                        : row.original.status === "generated"
                          ? "secondary"
                          : row.original.status === "cancelled"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {row.original.status}
                  </Badge>
                ),
              },
              {
                accessorKey: "usedAt",
                header: "Used At",
                cell: ({ row }: { row: { original: UDINRegister } }) => (
                  <span className="text-sm">{row.original.usedAt ? formatDate(row.original.usedAt) : "—"}</span>
                ),
              },
              {
                accessorKey: "usedFor",
                header: "Used For",
                cell: ({ row }: { row: { original: UDINRegister } }) => (
                  <span className="text-muted-foreground text-sm">{row.original.usedFor || "—"}</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No UDINs match your search or filters"
          rowActions={[{ label: "View", action: handleUDINClick }]}
        />
      ) : (
        <EmptyState
          icon={<FileCheck className="h-12 w-12 text-muted-foreground/50" />}
          title="No UDINs found"
          description={
            search || Object.keys(filters).length > 0 ? "Try adjusting your search or filters" : "No UDIN records yet"
          }
        />
      )}
    </div>
  );
}
