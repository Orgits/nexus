"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { AlertTriangle, Shield } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { DSCStatusBadge } from "@/components/ca-nexus/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { mockClients } from "@/mock-data/clients";
import { getDSCByStatus, mockDSCRegisters } from "@/mock-data/registers";
import { mockUsers } from "@/mock-data/users";
import type { DSCRegister, DSCStatus } from "@/types";

const dscTabs = [
  { id: "all", label: "All", count: mockDSCRegisters.length },
  { id: "valid", label: "Valid", count: mockDSCRegisters.filter((d) => d.status === "valid").length },
  {
    id: "expiring_soon",
    label: "Expiring Soon",
    count: mockDSCRegisters.filter((d) => d.status === "expiring_soon").length,
  },
  { id: "expired", label: "Expired", count: mockDSCRegisters.filter((d) => d.status === "expired").length },
  { id: "revoked", label: "Revoked", count: mockDSCRegisters.filter((d) => d.status === "revoked").length },
];

const statuses: { value: DSCStatus; label: string }[] = [
  { value: "valid", label: "Valid" },
  { value: "expiring_soon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
  { value: "suspended", label: "Suspended" },
  { value: "lost", label: "Lost" },
];

export function DSCRegisterList() {
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
      key: "holderType",
      label: "Holder Type",
      type: "select",
      options: [
        { value: "individual", label: "Individual" },
        { value: "company", label: "Company" },
        { value: "llp", label: "LLP" },
        { value: "partner", label: "Partner" },
        { value: "director", label: "Director" },
        { value: "authorized_signatory", label: "Authorized Signatory" },
      ],
    },
    {
      key: "certificateType",
      label: "Cert Type",
      type: "select",
      options: [
        { value: "class2", label: "Class 2" },
        { value: "class3", label: "Class 3" },
        { value: "dfc", label: "DFC" },
      ],
    },
    {
      key: "clientId",
      label: "Client",
      type: "select",
      options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
    },
  ];

  let filteredDSCs = mockDSCRegisters;

  if (activeTab !== "all") {
    filteredDSCs = getDSCByStatus(activeTab as any);
  }

  filteredDSCs = filteredDSCs.filter((dsc: DSCRegister) => {
    if (
      search &&
      !dsc.holderName.toLowerCase().includes(search.toLowerCase()) &&
      !dsc.serialNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (dsc as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleDSCClick = (dsc: DSCRegister) => alert(`View DSC ${dsc.serialNumber}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">DSC Register</h1>
          <p className="text-muted-foreground text-sm">Manage Digital Signature Certificates</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dscTabs.map((tab) => (
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
        searchPlaceholder="Search DSC by holder name, serial number..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredDSCs.length > 0 ? (
        <DataTable<DSCRegister>
          data={filteredDSCs}
          columns={
            [
              {
                accessorKey: "serialNumber",
                header: "Serial Number",
                cell: ({ row }: { row: { original: DSCRegister } }) => (
                  <span className="font-medium font-mono text-sm">{row.original.serialNumber}</span>
                ),
              },
              {
                accessorKey: "holderName",
                header: "Holder",
                cell: ({ row }: { row: { original: DSCRegister } }) => (
                  <div>
                    <p className="font-medium">{row.original.holderName}</p>
                    <p className="text-muted-foreground text-sm capitalize">
                      {row.original.holderType.replace(/_/g, " ")}
                    </p>
                  </div>
                ),
              },
              {
                accessorKey: "certifyingAuthority",
                header: "CA",
                cell: ({ row }: { row: { original: DSCRegister } }) => (
                  <span className="text-sm">{row.original.certifyingAuthority}</span>
                ),
              },
              {
                accessorKey: "certificateType",
                header: "Type",
                cell: ({ row }: { row: { original: DSCRegister } }) => (
                  <Badge variant="secondary">{row.original.certificateType.toUpperCase()}</Badge>
                ),
              },
              {
                accessorKey: "issuedDate",
                header: "Issued",
                cell: ({ row }: { row: { original: DSCRegister } }) => (
                  <span className="text-sm">{formatDate(row.original.issuedDate)}</span>
                ),
              },
              {
                accessorKey: "expiryDate",
                header: "Expiry",
                cell: ({ row }: { row: { original: DSCRegister } }) => {
                  const isExpiring = row.original.status === "expiring_soon";
                  const isExpired = row.original.status === "expired";
                  return (
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isExpired && "text-destructive",
                        isExpiring && "text-amber-600",
                      )}
                    >
                      {formatDate(row.original.expiryDate)}
                      {isExpiring && <AlertTriangle className="ml-1 inline h-3.5 w-3.5" />}
                    </span>
                  );
                },
              },
              {
                accessorKey: "tokenType",
                header: "Token",
                cell: ({ row }: { row: { original: DSCRegister } }) => (
                  <Badge variant="outline">{row.original.tokenType.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "custodianId",
                header: "Custodian",
                cell: ({ row }: { row: { original: DSCRegister } }) => {
                  const custodian = mockUsers.find((u) => u.id === row.original.custodianId);
                  return custodian ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{custodian.fullName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: DSCRegister } }) => <DSCStatusBadge status={row.original.status} />,
              },
              {
                accessorKey: "renewalReminderSent",
                header: "Reminder",
                cell: ({ row }: { row: { original: DSCRegister } }) => (
                  <Badge variant={row.original.renewalReminderSent ? "default" : "secondary"}>
                    {row.original.renewalReminderSent ? "Sent" : "Not Sent"}
                  </Badge>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No DSCs match your search or filters"
          rowActions={[{ label: "View", action: handleDSCClick }]}
        />
      ) : (
        <EmptyState
          icon={<Shield className="h-12 w-12 text-muted-foreground/50" />}
          title="No DSCs found"
          description={
            search || Object.keys(filters).length > 0 ? "Try adjusting your search or filters" : "No DSC records yet"
          }
        />
      )}
    </div>
  );
}

import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
