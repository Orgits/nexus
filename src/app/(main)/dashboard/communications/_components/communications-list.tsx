"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import { CheckSquare, Download, FileText, Mail, MessageSquare, Phone, Smartphone } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyCommunications } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink, TaskLink } from "@/components/ca-nexus/object-link";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { CommunicationStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { mockCommunications } from "@/mock-data/communications";
import { getMatterById, getTaskById, mockMatters } from "@/mock-data/matters";
import { mockTeams, mockUsers } from "@/mock-data/users";
import type { Communication, CommunicationChannel } from "@/types";

const filterConfigs: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "queued", label: "Queued" },
      { value: "sending", label: "Sending" },
      { value: "sent", label: "Sent" },
      { value: "delivered", label: "Delivered" },
      { value: "failed", label: "Failed" },
      { value: "bounced", label: "Bounced" },
      { value: "read", label: "Read" },
      { value: "replied", label: "Replied" },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    key: "channel",
    label: "Channel",
    type: "select",
    options: [
      { value: "email", label: "Email" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "sms", label: "SMS" },
      { value: "call", label: "Call" },
      { value: "post", label: "Post" },
    ],
  },
  {
    key: "direction",
    label: "Direction",
    type: "select",
    options: [
      { value: "inbound", label: "Inbound" },
      { value: "outbound", label: "Outbound" },
    ],
  },
  {
    key: "isInternal",
    label: "Type",
    type: "select",
    options: [
      { value: "true", label: "Internal" },
      { value: "false", label: "External" },
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
    key: "matterId",
    label: "Matter",
    type: "select",
    options: mockMatters.map((m) => ({ value: m.id, label: m.name })),
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
  {
    key: "hasAttachments",
    label: "Attachments",
    type: "select",
    options: [
      { value: "true", label: "Has Attachments" },
      { value: "false", label: "No Attachments" },
    ],
  },
  {
    key: "hasLinkedTask",
    label: "Linked Task",
    type: "select",
    options: [
      { value: "true", label: "Has Task" },
      { value: "false", label: "No Task" },
    ],
  },
];

const VIEW_OPTIONS = [
  { id: "all", label: "All", icon: Inbox },
  { id: "unread", label: "Unread", icon: Mail },
  { id: "internal", label: "Internal", icon: Users },
  { id: "with_attachments", label: "Attachments", icon: FileText },
  { id: "with_tasks", label: "Linked Tasks", icon: CheckSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "sms", label: "SMS", icon: Smartphone },
  { id: "call", label: "Calls", icon: Phone },
] as const;

import { Inbox, Users } from "lucide-react";

export function CommunicationsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "sentAt",
    direction: "desc",
  });

  const filtered = useMemo(() => {
    let result = [...mockCommunications];

    if (view !== "all") {
      switch (view) {
        case "unread":
          result = result.filter((c) => c.status === "sent" || c.status === "delivered" || c.status === "queued");
          break;
        case "internal":
          result = result.filter((c) => c.isInternal);
          break;
        case "with_attachments":
          result = result.filter((c) => c.attachments.length > 0);
          break;
        case "with_tasks":
          result = result.filter((c) => c.linkedTaskId);
          break;
        case "email":
          result = result.filter((c) => c.channel === "email");
          break;
        case "whatsapp":
          result = result.filter((c) => c.channel === "whatsapp");
          break;
        case "sms":
          result = result.filter((c) => c.channel === "sms");
          break;
        case "call":
          result = result.filter((c) => c.channel === "call");
          break;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.communicationNumber.toLowerCase().includes(q) ||
          c.subject?.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q) ||
          c.from.name.toLowerCase().includes(q) ||
          c.to.some((t) => t.name.toLowerCase().includes(q)),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      if (key === "hasAttachments") {
        result = result.filter((c) => (value === "true") === c.attachments.length > 0);
      } else if (key === "hasLinkedTask") {
        result = result.filter((c) => (value === "true") === !!c.linkedTaskId);
      } else if (key === "isInternal") {
        result = result.filter((c) => (value === "true") === c.isInternal);
      } else {
        result = result.filter((c) => (c as unknown as Record<string, unknown>)[key] === value);
      }
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Communication] as string | number | Date | undefined;
      const bVal = b[sortConfig.key as keyof Communication] as string | number | Date | undefined;
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
    const unread = filtered.filter((c) => ["sent", "delivered", "queued"].includes(c.status)).length;
    const internal = filtered.filter((c) => c.isInternal).length;
    const withAttachments = filtered.filter((c) => c.attachments.length > 0).length;
    const withTasks = filtered.filter((c) => c.linkedTaskId).length;
    const email = filtered.filter((c) => c.channel === "email").length;
    const whatsapp = filtered.filter((c) => c.channel === "whatsapp").length;
    const sms = filtered.filter((c) => c.channel === "sms").length;
    const calls = filtered.filter((c) => c.channel === "call").length;

    return { total, unread, internal, withAttachments, withTasks, email, whatsapp, sms, calls };
  }, [filtered]);

  const communicationColumns = [
    {
      accessorKey: "communicationNumber",
      header: "ID",
      enableHiding: false,
      cell: ({ row }: { row: { original: Communication } }) => (
        <div>
          <p className="font-medium text-sm">{row.original.communicationNumber}</p>
          <p className="text-muted-foreground text-xs">{row.original.channel.toUpperCase()}</p>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject / Preview",
      cell: ({ row }: { row: { original: Communication } }) => (
        <div>
          <p className="font-medium text-sm">{row.original.subject || `${row.original.content.slice(0, 80)}...`}</p>
          <p className="text-muted-foreground text-xs">From: {row.original.from.name}</p>
        </div>
      ),
    },
    {
      accessorKey: "channel",
      header: "Channel",
      cell: ({ row }: { row: { original: Communication } }) => {
        const icons: Record<CommunicationChannel, React.ReactNode> = {
          email: <Mail className="h-3.5 w-3.5 text-blue-600" />,
          whatsapp: <MessageSquare className="h-3.5 w-3.5 text-green-600" />,
          sms: <Smartphone className="h-3.5 w-3.5 text-purple-600" />,
          call: <Phone className="h-3.5 w-3.5 text-orange-600" />,
          post: <FileText className="h-3.5 w-3.5 text-gray-600" />,
        };
        return (
          <Badge variant="secondary" className="gap-1">
            {icons[row.original.channel]}
            {row.original.channel.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: "direction",
      header: "Direction",
      cell: ({ row }: { row: { original: Communication } }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.direction}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Communication } }) => (
        <CommunicationStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }: { row: { original: Communication } }) => {
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
      cell: ({ row }: { row: { original: Communication } }) => {
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
      accessorKey: "sentAt",
      header: "Sent / Received",
      enableSorting: true,
      cell: ({ row }: { row: { original: Communication } }) => (
        <span className="whitespace-nowrap text-sm">
          {row.original.sentAt ? formatDateTime(row.original.sentAt) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "attachments",
      header: "Attachments",
      cell: ({ row }: { row: { original: Communication } }) => (
        <span className={cn("font-medium text-sm", row.original.attachments.length > 0 && "text-primary")}>
          {row.original.attachments.length}
        </span>
      ),
    },
    {
      accessorKey: "linkedTaskId",
      header: "Linked Task",
      cell: ({ row }: { row: { original: Communication } }) => {
        if (!row.original.linkedTaskId) return <span className="text-muted-foreground text-sm">—</span>;
        const task = getTaskById(row.original.linkedTaskId);
        return task ? (
          <TaskLink task={task} showStatus={true} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Communications Hub"
        description="Unified inbox for emails, WhatsApp, SMS, calls, and internal notes"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) =>
                router.push(`/dashboard/communications${value !== "all" ? `?view=${value}` : ""}`)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Communications" />
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
            <Button size="sm" onClick={() => alert("Compose new communication")}>
              <Plus className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
        <StatCard title="Total" value={summary.total} icon={<Inbox className="h-5 w-5" />} />
        <StatCard title="Unread" value={summary.unread} icon={<Mail className="h-5 w-5 text-blue-600" />} />
        <StatCard title="Internal" value={summary.internal} icon={<Users className="h-5 w-5 text-purple-600" />} />
        <StatCard
          title="Attachments"
          value={summary.withAttachments}
          icon={<FileText className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          title="Linked Tasks"
          value={summary.withTasks}
          icon={<CheckSquare className="h-5 w-5 text-green-600" />}
        />
        <StatCard title="Email" value={summary.email} icon={<Mail className="h-5 w-5 text-blue-600" />} />
        <StatCard
          title="WhatsApp"
          value={summary.whatsapp}
          icon={<MessageSquare className="h-5 w-5 text-green-600" />}
        />
        <StatCard title="SMS" value={summary.sms} icon={<Smartphone className="h-5 w-5 text-purple-600" />} />
        <StatCard title="Calls" value={summary.calls} icon={<Phone className="h-5 w-5 text-orange-600" />} />
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search communications..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filtered.length > 0 ? (
        <DataTable<Communication>
          data={filtered}
          columns={communicationColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={20}
          emptyMessage="No communications match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/communications/${row.id}`),
            },
            {
              label: "Create Task",
              action: (row) => alert(`Create task from communication ${row.communicationNumber}`),
              icon: <Plus className="h-3.5 w-3.5" />,
            },
          ]}
        />
      ) : (
        <EmptyCommunications />
      )}
    </div>
  );
}

import { Plus } from "lucide-react";

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
