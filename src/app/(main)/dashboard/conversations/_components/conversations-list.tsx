"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import { Archive, Bell, Download, Mail, MessageSquare, Plus, Smartphone } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyCommunications } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { mockConversations } from "@/mock-data/communications";
import { getMatterById, mockMatters } from "@/mock-data/matters";
import { getUserById } from "@/mock-data/users";
import type { Conversation } from "@/types";

const filterConfigs: FilterConfig[] = [
  {
    key: "isArchived",
    label: "Archived",
    type: "select",
    options: [
      { value: "true", label: "Archived" },
      { value: "false", label: "Active" },
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
];

const VIEW_OPTIONS = [
  { id: "all", label: "All", icon: MessageSquare },
  { id: "active", label: "Active", icon: MessageSquare },
  { id: "archived", label: "Archived", icon: Archive },
  { id: "unread", label: "Unread", icon: Bell },
] as const;

export function ConversationsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "lastMessageAt",
    direction: "desc",
  });

  const filtered = useMemo(() => {
    let result = [...mockConversations];

    if (view !== "all") {
      switch (view) {
        case "active":
          result = result.filter((c) => !c.isArchived);
          break;
        case "archived":
          result = result.filter((c) => c.isArchived);
          break;
        case "unread":
          result = result.filter((c) => c.unreadCount > 0);
          break;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.subject.toLowerCase().includes(q) ||
          c.lastMessagePreview.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      if (key === "isArchived") {
        result = result.filter((c) => (value === "true") === c.isArchived);
      } else {
        result = result.filter((c) => (c as unknown as Record<string, unknown>)[key] === value);
      }
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Conversation] as string | number | Date | undefined;
      const bVal = b[sortConfig.key as keyof Conversation] as string | number | Date | undefined;
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
    const active = filtered.filter((c) => !c.isArchived).length;
    const archived = filtered.filter((c) => c.isArchived).length;
    const unread = filtered.filter((c) => c.unreadCount > 0).length;

    return { total, active, archived, unread };
  }, [filtered]);

  const conversationColumns = [
    {
      accessorKey: "subject",
      header: "Subject",
      enableHiding: false,
      cell: ({ row }: { row: { original: Conversation } }) => (
        <div>
          <p className="font-medium text-sm">{row.original.subject}</p>
          <p className="text-muted-foreground text-xs">{row.original.lastMessagePreview}</p>
        </div>
      ),
    },
    {
      accessorKey: "channels",
      header: "Channels",
      cell: ({ row }: { row: { original: Conversation } }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.channels.map((channel, i) => (
            <Badge key={i} variant="secondary" className="gap-1 text-xs">
              {channel === "email" && <Mail className="h-3 w-3" />}
              {channel === "whatsapp" && <MessageSquare className="h-3 w-3" />}
              {channel === "sms" && <Smartphone className="h-3 w-3" />}
              {channel.toUpperCase()}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }: { row: { original: Conversation } }) => {
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
      cell: ({ row }: { row: { original: Conversation } }) => {
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
      accessorKey: "participants",
      header: "Participants",
      cell: ({ row }: { row: { original: Conversation } }) => (
        <div className="flex items-center gap-1">
          {row.original.participants.slice(0, 3).map((p, i) => {
            const user = p.userId ? getUserById(p.userId) : null;
            const name = user?.fullName || p.contactId || "Unknown";
            return (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-background bg-primary/10 font-medium text-primary text-xs"
                title={name}
              >
                {name[0]}
              </div>
            );
          })}
          {row.original.participants.length > 3 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-background bg-muted font-medium text-muted-foreground text-xs">
              +{row.original.participants.length - 3}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "lastMessageAt",
      header: "Last Message",
      enableSorting: true,
      cell: ({ row }: { row: { original: Conversation } }) => (
        <span className="whitespace-nowrap text-sm">{formatDateTime(row.original.lastMessageAt)}</span>
      ),
    },
    {
      accessorKey: "unreadCount",
      header: "Unread",
      cell: ({ row }: { row: { original: Conversation } }) => (
        <span className={cn("font-medium text-sm", row.original.unreadCount > 0 && "text-destructive")}>
          {row.original.unreadCount}
        </span>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }: { row: { original: Conversation } }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "isArchived",
      header: "Status",
      cell: ({ row }: { row: { original: Conversation } }) => (
        <Badge variant={row.original.isArchived ? "secondary" : "outline"}>
          {row.original.isArchived ? "Archived" : "Active"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Conversations"
        description="Threaded conversations across email, WhatsApp, SMS, and calls"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) =>
                router.push(`/dashboard/conversations${value !== "all" ? `?view=${value}` : ""}`)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Conversations" />
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
            <Button size="sm" onClick={() => alert("Start new conversation")}>
              <Plus className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total" value={summary.total} icon={<MessageSquare className="h-5 w-5" />} />
        <StatCard title="Active" value={summary.active} icon={<MessageSquare className="h-5 w-5 text-green-600" />} />
        <StatCard title="Archived" value={summary.archived} icon={<Archive className="h-5 w-5 text-gray-600" />} />
        <StatCard title="Unread" value={summary.unread} icon={<Bell className="h-5 w-5 text-amber-600" />} />
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search conversations..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filtered.length > 0 ? (
        <DataTable<Conversation>
          data={filtered}
          columns={conversationColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={20}
          emptyMessage="No conversations match your search or filters"
          rowActions={[
            {
              label: "Open Conversation",
              action: (row: Conversation) => router.push(`/dashboard/conversations/${row.id}`),
            },
            {
              label: "Archive/Unarchive",
              action: (row: Conversation) =>
                alert(`${row.isArchived ? "Unarchive" : "Archive"} conversation ${row.subject}`),
              icon: <Archive className="h-3.5 w-3.5" />,
            },
          ]}
        />
      ) : (
        <EmptyCommunications onCompose={() => alert("Start new conversation")} />
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
