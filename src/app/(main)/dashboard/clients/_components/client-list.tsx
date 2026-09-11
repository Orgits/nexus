"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientCategoryLabel, clientTypeLabel } from "@/lib/labels";
import { mockClients } from "@/mock-data/clients";
import { mockTeams, mockUsers } from "@/mock-data/users";
import type { Client, ClientStatus, ClientType } from "@/types";

import { clientColumns } from "./client-columns";

const filterConfigs: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "prospect", label: "Prospect" },
      { value: "onboarding", label: "Onboarding" },
      { value: "inactive", label: "Inactive" },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: (
      Object.keys({
        individual: "",
        proprietorship: "",
        partnership: "",
        llp: "",
        private_limited: "",
        public_limited: "",
        one_person_company: "",
        trust: "",
        society: "",
        huf: "",
      }) as ClientType[]
    ).map((t) => ({ value: t, label: clientTypeLabel(t) })),
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "multi_service", label: "Multi-Service" },
      { value: "taxation", label: "Taxation" },
      { value: "compliance", label: "Compliance" },
      { value: "audit", label: "Audit" },
      { value: "advisory", label: "Advisory" },
      { value: "outsourcing", label: "Outsourcing" },
    ],
  },
  {
    key: "responsibleUserId",
    label: "Responsible",
    type: "select",
    options: mockUsers.map((u) => ({ value: u.id, label: u.fullName })),
  },
  {
    key: "responsibleTeamId",
    label: "Team",
    type: "select",
    options: mockTeams.map((t) => ({ value: t.id, label: t.name })),
  },
];

export function ClientList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>(mockClients);

  const filtered = useMemo(() => {
    let result = [...clients];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.displayName.toLowerCase().includes(q) ||
          (c.legalName?.toLowerCase().includes(q) ?? false) ||
          (c.identifiers.pan?.toLowerCase().includes(q) ?? false) ||
          (c.identifiers.gstin?.toLowerCase().includes(q) ?? false),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      result = result.filter((c) => (c as unknown as Record<string, unknown>)[key] === value);
    }

    return result;
  }, [clients, search, filters]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Clients"
        description="Manage client profiles, services, and relationships"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" />
            New Client
          </Button>
        }
      />

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search clients..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      <DataTable<Client>
        data={filtered}
        columns={clientColumns}
        getRowId={(row) => row.id}
        enableRowSelection
        pageSize={10}
        emptyMessage="No clients match your search or filters"
        rowActions={[
          {
            label: "View details",
            action: (row) => router.push(`/dashboard/clients/${row.id}`),
          },
        ]}
      />

      <CreateClientDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(client) => setClients((prev) => [client, ...prev])}
      />
    </div>
  );
}

function CreateClientDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (client: Client) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    type: "private_limited" as ClientType,
    category: "multi_service" as Client["category"],
    status: "active" as ClientStatus,
    pan: "",
    gstin: "",
    city: "",
    state: "",
    responsibleUserId: mockUsers[0].id,
    primaryContactName: "",
  });

  const submit = () => {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    const client: Client = {
      id: `client-${Date.now()}`,
      name: form.name.trim(),
      displayName: form.name.trim(),
      type: form.type,
      category: form.category,
      status: form.status,
      primaryContactId: "",
      contacts: [],
      identifiers: { pan: form.pan || undefined, gstin: form.gstin || undefined },
      address: { line1: "", city: form.city, state: form.state, postalCode: "", country: "India" },
      responsibleUserId: form.responsibleUserId,
      services: [],
      complianceProfile: {
        applicableComplianceTypes: [],
        financialYearStart: 4,
        tdsApplicable: false,
        mcaApplicable: false,
        auditApplicable: false,
      },
      onboardingStatus: {
        stage: "profile_created",
        progress: 20,
        completedStages: ["profile_created"],
        pendingItems: [],
      },
      tags: [],
      portalAccessEnabled: false,
      tenantId: "tenant-001",
      createdAt: now,
      updatedAt: now,
      createdBy: "user-admin-001",
      updatedBy: "user-admin-001",
    };
    onCreate(client);
    onOpenChange(false);
    setForm({
      name: "",
      type: "private_limited",
      category: "multi_service",
      status: "active",
      pan: "",
      gstin: "",
      city: "",
      state: "",
      responsibleUserId: mockUsers[0].id,
      primaryContactName: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
          <DialogDescription>Create a new client profile. You can complete onboarding details later.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Client name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="ABC Private Limited"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Entity type</Label>
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as ClientType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    "private_limited",
                    "llp",
                    "partnership",
                    "proprietorship",
                    "one_person_company",
                    "public_limited",
                    "trust",
                    "society",
                    "huf",
                  ] as ClientType[]
                ).map((t) => (
                  <SelectItem key={t} value={t}>
                    {clientTypeLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v as Client["category"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    "multi_service",
                    "taxation",
                    "compliance",
                    "audit",
                    "advisory",
                    "outsourcing",
                  ] as Client["category"][]
                ).map((c) => (
                  <SelectItem key={c} value={c}>
                    {clientCategoryLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as ClientStatus }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>PAN</Label>
            <Input
              value={form.pan}
              onChange={(e) => setForm((f) => ({ ...f, pan: e.target.value }))}
              placeholder="AABCA1234A"
            />
          </div>
          <div className="space-y-1.5">
            <Label>GSTIN</Label>
            <Input
              value={form.gstin}
              onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
              placeholder="06AABCA1234A1Z5"
            />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Gurugram"
            />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              placeholder="Haryana"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Responsible user</Label>
            <Select
              value={form.responsibleUserId}
              onValueChange={(v) => setForm((f) => ({ ...f, responsibleUserId: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!form.name.trim()}>
            Create client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
