"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  AlertTriangle,
  BarChart2,
  CheckCircle,
  Clock,
  Download,
  Mail,
  MessageSquare,
  Plus,
  Send,
  Smartphone,
} from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { CampaignStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import { mockCampaigns } from "@/mock-data/communications";
import { getUserById, mockUsers } from "@/mock-data/users";
import type { Campaign } from "@/types";

const filterConfigs: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "scheduled", label: "Scheduled" },
      { value: "sending", label: "Sending" },
      { value: "sent", label: "Sent" },
      { value: "completed", label: "Completed" },
      { value: "paused", label: "Paused" },
      { value: "cancelled", label: "Cancelled" },
      { value: "failed", label: "Failed" },
    ],
  },
  {
    key: "objective",
    label: "Objective",
    type: "select",
    options: [
      { value: "compliance_reminder", label: "Compliance Reminder" },
      { value: "document_collection", label: "Document Collection" },
      { value: "filing_confirmation", label: "Filing Confirmation" },
      { value: "payment_reminder", label: "Payment Reminder" },
      { value: "announcement", label: "Announcement" },
      { value: "newsletter", label: "Newsletter" },
      { value: "survey", label: "Survey" },
      { value: "custom", label: "Custom" },
    ],
  },
  {
    key: "createdById",
    label: "Created By",
    type: "select",
    options: mockUsers.map((u) => ({ value: u.id, label: u.fullName })),
  },
  {
    key: "approvedById",
    label: "Approved By",
    type: "select",
    options: mockUsers.map((u) => ({ value: u.id, label: u.fullName })),
  },
];

const VIEW_OPTIONS = [
  { id: "all", label: "All Campaigns", icon: Send },
  { id: "active", label: "Active", icon: Send },
  { id: "draft", label: "Draft", icon: FileText },
  { id: "completed", label: "Completed", icon: CheckCircle },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "documents", label: "Doc Collection", icon: MessageSquare },
] as const;

export function CampaignsList() {
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
    let result = [...mockCampaigns];

    if (view !== "all") {
      switch (view) {
        case "active":
          result = result.filter((c) => ["scheduled", "sending", "sent"].includes(c.status));
          break;
        case "draft":
          result = result.filter((c) => c.status === "draft");
          break;
        case "completed":
          result = result.filter((c) => ["completed", "sent"].includes(c.status));
          break;
        case "compliance":
          result = result.filter((c) => c.objective === "compliance_reminder");
          break;
        case "documents":
          result = result.filter((c) => c.objective === "document_collection");
          break;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      result = result.filter((c) => (c as unknown as Record<string, unknown>)[key] === value);
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Campaign] as string | number | Date | undefined;
      const bVal = b[sortConfig.key as keyof Campaign] as string | number | Date | undefined;
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
    const draft = filtered.filter((c) => c.status === "draft").length;
    const scheduled = filtered.filter((c) => c.status === "scheduled").length;
    const sending = filtered.filter((c) => c.status === "sending").length;
    const sent = filtered.filter((c) => c.status === "sent").length;
    const completed = filtered.filter((c) => c.status === "completed").length;
    const paused = filtered.filter((c) => c.status === "paused").length;
    const totalSent = filtered.reduce((sum, c) => sum + c.sentCount, 0);
    const totalDelivered = filtered.reduce((sum, c) => sum + c.deliveredCount, 0);
    const totalOpened = filtered.reduce((sum, c) => sum + c.openedCount, 0);
    const totalClicked = filtered.reduce((sum, c) => sum + c.clickedCount, 0);
    const totalReplied = filtered.reduce((sum, c) => sum + c.repliedCount, 0);
    const totalDocsReceived = filtered.reduce((sum, c) => sum + c.documentsReceived, 0);
    const totalTasksCreated = filtered.reduce((sum, c) => sum + c.tasksCreated, 0);

    return {
      total,
      draft,
      scheduled,
      sending,
      sent,
      completed,
      paused,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalReplied,
      totalDocsReceived,
      totalTasksCreated,
    };
  }, [filtered]);

  const campaignColumns = [
    {
      accessorKey: "name",
      header: "Campaign",
      enableHiding: false,
      cell: ({ row }: { row: { original: Campaign } }) => (
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-muted-foreground text-xs">{row.original.description?.slice(0, 100) || "No description"}</p>
        </div>
      ),
    },
    {
      accessorKey: "objective",
      header: "Objective",
      cell: ({ row }: { row: { original: Campaign } }) => (
        <Badge variant="secondary" className="gap-1 capitalize">
          {row.original.objective === "compliance_reminder" && <Shield className="h-3 w-3" />}
          {row.original.objective === "document_collection" && <MessageSquare className="h-3 w-3" />}
          {row.original.objective === "filing_confirmation" && <CheckCircle className="h-3 w-3" />}
          {row.original.objective === "payment_reminder" && <AlertTriangle className="h-3 w-3" />}
          {row.original.objective === "announcement" && <Mail className="h-3 w-3" />}
          {row.original.objective === "newsletter" && <BarChart2 className="h-3 w-3" />}
          {row.original.objective === "survey" && <ClipboardList className="h-3 w-3" />}
          {row.original.objective.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Campaign } }) => <CampaignStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "channels",
      header: "Channels",
      cell: ({ row }: { row: { original: Campaign } }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.channels.map((channel, i) => (
            <Badge key={i} variant="outline" className="gap-1 text-xs">
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
      accessorKey: "schedule",
      header: "Schedule",
      cell: ({ row }: { row: { original: Campaign } }) => (
        <div className="text-sm">
          <span className="capitalize">{row.original.schedule.type}</span>
          {row.original.schedule.scheduledAt && (
            <span className="ml-2 text-muted-foreground">{formatDateTime(row.original.schedule.scheduledAt)}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "sentCount",
      header: "Sent",
      cell: ({ row }: { row: { original: Campaign } }) => (
        <span className="font-medium text-sm">{row.original.sentCount.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "deliveredCount",
      header: "Delivered",
      cell: ({ row }: { row: { original: Campaign } }) => (
        <span className="font-medium text-green-600 text-sm">{row.original.deliveredCount.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "openRate",
      header: "Open Rate",
      cell: ({ row }: { row: { original: Campaign } }) => {
        const rate =
          row.original.sentCount > 0 ? ((row.original.openedCount / row.original.sentCount) * 100).toFixed(1) : 0;
        return <span className="font-medium text-sm">{rate}%</span>;
      },
    },
    {
      accessorKey: "clickRate",
      header: "Click Rate",
      cell: ({ row }: { row: { original: Campaign } }) => {
        const rate =
          row.original.deliveredCount > 0
            ? ((row.original.clickedCount / row.original.deliveredCount) * 100).toFixed(1)
            : 0;
        return <span className="font-medium text-sm">{rate}%</span>;
      },
    },
    {
      accessorKey: "replyRate",
      header: "Reply Rate",
      cell: ({ row }: { row: { original: Campaign } }) => {
        const rate =
          row.original.deliveredCount > 0
            ? ((row.original.repliedCount / row.original.deliveredCount) * 100).toFixed(1)
            : 0;
        return <span className="font-medium text-sm">{rate}%</span>;
      },
    },
    {
      accessorKey: "documentsReceived",
      header: "Docs Received",
      cell: ({ row }: { row: { original: Campaign } }) => (
        <span className="font-medium text-blue-600 text-sm">{row.original.documentsReceived}</span>
      ),
    },
    {
      accessorKey: "tasksCreated",
      header: "Tasks Created",
      cell: ({ row }: { row: { original: Campaign } }) => (
        <span className="font-medium text-purple-600 text-sm">{row.original.tasksCreated}</span>
      ),
    },
    {
      accessorKey: "complianceProgress",
      header: "Compliance %",
      cell: ({ row }: { row: { original: Campaign } }) => (
        <div className="w-24">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${row.original.complianceProgress}%` }} />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdById",
      header: "Created By",
      cell: ({ row }: { row: { original: Campaign } }) => {
        const user = getUserById(row.original.createdById);
        return <span className="text-sm">{user?.fullName || row.original.createdById}</span>;
      },
    },
    {
      accessorKey: "approvedById",
      header: "Approved By",
      cell: ({ row }: { row: { original: Campaign } }) => {
        if (!row.original.approvedById) return <span className="text-muted-foreground text-sm">—</span>;
        const user = getUserById(row.original.approvedById);
        return <span className="text-sm">{user?.fullName || row.original.approvedById}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      enableSorting: true,
      cell: ({ row }: { row: { original: Campaign } }) => (
        <span className="whitespace-nowrap text-sm">{formatDateTime(row.original.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Outreach & Campaigns"
        description="Manage multi-channel outreach campaigns for compliance reminders, document collection, and client communications"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) => router.push(`/dashboard/campaigns${value !== "all" ? `?view=${value}` : ""}`)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Campaigns" />
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
            <Button size="sm" onClick={() => alert("Create new campaign")}>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
        <StatCard title="Total Campaigns" value={summary.total} icon={<Send className="h-5 w-5" />} />
        <StatCard title="Draft" value={summary.draft} icon={<FileText className="h-5 w-5 text-gray-600" />} />
        <StatCard title="Scheduled" value={summary.scheduled} icon={<Clock className="h-5 w-5 text-blue-600" />} />
        <StatCard title="Sending" value={summary.sending} icon={<Send className="h-5 w-5 text-amber-600" />} />
        <StatCard title="Sent" value={summary.sent} icon={<CheckCircle className="h-5 w-5 text-green-600" />} />
        <StatCard
          title="Completed"
          value={summary.completed}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard title="Paused" value={summary.paused} icon={<Pause className="h-5 w-5 text-gray-600" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Total Sent" value={summary.totalSent} icon={<Send className="h-5 w-5" />} />
        <StatCard
          title="Delivered"
          value={summary.totalDelivered}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatCard title="Opened" value={summary.totalOpened} icon={<Mail className="h-5 w-5 text-blue-600" />} />
        <StatCard
          title="Clicked"
          value={summary.totalClicked}
          icon={<MousePointer className="h-5 w-5 text-purple-600" />}
        />
        <StatCard title="Replied" value={summary.totalReplied} icon={<Reply className="h-5 w-5 text-amber-600" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Docs Received"
          value={summary.totalDocsReceived}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Tasks Created"
          value={summary.totalTasksCreated}
          icon={<Plus className="h-5 w-5 text-purple-600" />}
        />
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search campaigns..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filtered.length > 0 ? (
        <DataTable<Campaign>
          data={filtered}
          columns={campaignColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={15}
          emptyMessage="No campaigns match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/campaigns/${row.id}`),
            },
            {
              label: "Duplicate",
              action: (row) => alert(`Duplicate campaign ${row.name}`),
              icon: <Plus className="h-3.5 w-3.5" />,
            },
          ]}
        />
      ) : (
        <EmptyState
          icon={<Send className="h-12 w-12 text-muted-foreground/50" />}
          title="No campaigns found"
          description="Create your first outreach campaign to automate client communications."
          action={
            <Button size="sm" onClick={() => alert("Create new campaign")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          }
        />
      )}
    </div>
  );
}

import { ClipboardList, FileText, MousePointer, Pause, Reply, Shield } from "lucide-react";

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="font-bold text-2xl">{value.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-muted p-2">{icon}</div>
      </div>
    </div>
  );
}
