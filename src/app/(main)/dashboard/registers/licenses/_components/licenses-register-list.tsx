"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { AlertTriangle, Building } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink } from "@/components/ca-nexus/object-link";
import { LicenseStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getLicensesByStatus, mockLicenseRegisters } from "@/mock-data/registers";
import { mockUsers } from "@/mock-data/users";
import type { LicenseRegister, LicenseStatus, LicenseType } from "@/types";

const licenseTabs = [
  { id: "all", label: "All", count: mockLicenseRegisters.length },
  { id: "active", label: "Active", count: mockLicenseRegisters.filter((l) => l.status === "active").length },
  {
    id: "expiring_soon",
    label: "Expiring Soon",
    count: mockLicenseRegisters.filter((l) => l.status === "expiring_soon").length,
  },
  { id: "expired", label: "Expired", count: mockLicenseRegisters.filter((l) => l.status === "expired").length },
  {
    id: "renewal_in_progress",
    label: "Renewal in Progress",
    count: mockLicenseRegisters.filter((l) => l.status === "renewal_in_progress").length,
  },
];

const statuses: { value: LicenseStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "expiring_soon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
  { value: "renewal_in_progress", label: "Renewal in Progress" },
  { value: "cancelled", label: "Cancelled" },
  { value: "suspended", label: "Suspended" },
];

const licenseTypes: { value: LicenseType; label: string }[] = [
  { value: "shop_establishment", label: "Shop & Establishment" },
  { value: "professional_tax", label: "Professional Tax" },
  { value: "gst", label: "GST" },
  { value: "import_export", label: "Import Export" },
  { value: "fssai", label: "FSSAI" },
  { value: "drug_license", label: "Drug License" },
  { value: "environmental", label: "Environmental" },
  { value: "factory_license", label: "Factory License" },
  { value: "boiler_license", label: "Boiler License" },
  { value: "fire_safety", label: "Fire Safety" },
  { value: "pollution_control", label: "Pollution Control" },
  { value: "other", label: "Other" },
];

export function LicensesRegisterList() {
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
      key: "type",
      label: "Type",
      type: "select",
      options: licenseTypes.map((t) => ({ value: t.value, label: t.label })),
    },
    {
      key: "clientId",
      label: "Client",
      type: "select",
      options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
    },
  ];

  let filteredLicenses = mockLicenseRegisters;

  if (activeTab !== "all") {
    filteredLicenses = getLicensesByStatus(activeTab as any);
  }

  filteredLicenses = filteredLicenses.filter((license: LicenseRegister) => {
    if (
      search &&
      !license.name.toLowerCase().includes(search.toLowerCase()) &&
      !license.registrationNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (license as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleLicenseClick = (license: LicenseRegister) => alert(`View License ${license.name}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Licenses & Renewals Register</h1>
          <p className="text-muted-foreground text-sm">Manage licenses, registrations, and renewals</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {licenseTabs.map((tab) => (
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
        searchPlaceholder="Search licenses by name, registration number..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredLicenses.length > 0 ? (
        <DataTable<LicenseRegister>
          data={filteredLicenses}
          columns={
            [
              {
                accessorKey: "name",
                header: "License Name",
                cell: ({ row }: { row: { original: LicenseRegister } }) => (
                  <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-muted-foreground text-sm capitalize">{row.original.type.replace(/_/g, " ")}</p>
                  </div>
                ),
              },
              {
                accessorKey: "registrationNumber",
                header: "Reg. Number",
                cell: ({ row }: { row: { original: LicenseRegister } }) => (
                  <span className="font-mono text-sm">{row.original.registrationNumber}</span>
                ),
              },
              {
                accessorKey: "issuingAuthority",
                header: "Authority",
                cell: ({ row }: { row: { original: LicenseRegister } }) => (
                  <span className="text-sm">{row.original.issuingAuthority}</span>
                ),
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }: { row: { original: LicenseRegister } }) => {
                  if (!row.original.clientId) return <span className="text-muted-foreground text-sm">—</span>;
                  const client = getClientById(row.original.clientId);
                  return client ? (
                    <ClientLink client={client} showStatus={true} />
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "issueDate",
                header: "Issued",
                cell: ({ row }: { row: { original: LicenseRegister } }) => (
                  <span className="text-sm">{formatDate(row.original.issueDate)}</span>
                ),
              },
              {
                accessorKey: "expiryDate",
                header: "Expiry",
                cell: ({ row }: { row: { original: LicenseRegister } }) => {
                  const isExpiring = row.original.status === "expiring_soon";
                  const isExpired = row.original.status === "expired";
                  const daysLeft = Math.ceil(
                    (new Date(row.original.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  );
                  return (
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isExpired && "text-destructive",
                        isExpiring && "text-amber-600",
                      )}
                    >
                      {formatDate(row.original.expiryDate)}
                      {daysLeft > 0 && !isExpired && (
                        <span className="ml-2 text-muted-foreground text-xs">({daysLeft} days)</span>
                      )}
                      {isExpiring && <AlertTriangle className="ml-1 inline h-3.5 w-3.5" />}
                    </span>
                  );
                },
              },
              {
                accessorKey: "renewalDate",
                header: "Renewal By",
                cell: ({ row }: { row: { original: LicenseRegister } }) => (
                  <span className="text-sm">
                    {row.original.renewalDate ? formatDate(row.original.renewalDate) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "responsibleUserId",
                header: "Responsible",
                cell: ({ row }: { row: { original: LicenseRegister } }) => {
                  const user = mockUsers.find((u) => u.id === row.original.responsibleUserId);
                  return user ? (
                    <span className="text-sm">{user.fullName}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "cost",
                header: "Cost",
                cell: ({ row }: { row: { original: LicenseRegister } }) => (
                  <span className="text-sm">{formatINR(row.original.cost || 0)}</span>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: LicenseRegister } }) => (
                  <LicenseStatusBadge status={row.original.status} />
                ),
              },
              {
                accessorKey: "autoRenewal",
                header: "Auto Renew",
                cell: ({ row }: { row: { original: LicenseRegister } }) => (
                  <Badge variant={row.original.autoRenewal ? "default" : "secondary"}>
                    {row.original.autoRenewal ? "Yes" : "No"}
                  </Badge>
                ),
              },
              {
                accessorKey: "renewalReminderSent",
                header: "Reminder",
                cell: ({ row }: { row: { original: LicenseRegister } }) => (
                  <Badge variant={row.original.renewalReminderSent ? "default" : "secondary"}>
                    {row.original.renewalReminderSent ? "Sent" : "Not Sent"}
                  </Badge>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No licenses match your search or filters"
          rowActions={[{ label: "View", action: handleLicenseClick }]}
        />
      ) : (
        <EmptyState
          icon={<Building className="h-12 w-12 text-muted-foreground/50" />}
          title="No licenses found"
          description={
            search || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "No license records yet"
          }
        />
      )}
    </div>
  );
}

import { cn } from "cn";
