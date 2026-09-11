"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import { AlertTriangle, FileText } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { NoticeStatusBadge, PriorityBadge } from "@/components/ca-nexus/status-badge";
import { Button } from "@/components/ui/button";
import { daysOverdue, formatDate } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import { getNoticesByStatus, getOverdueNotices, getUrgentNotices, mockNotices } from "@/mock-data/notices";
import { mockUsers } from "@/mock-data/users";
import type { AuthorityType, Notice, NoticeCategory, NoticeStatus, Priority } from "@/types";

const noticeTabs = [
  { id: "all", label: "All", count: mockNotices.length },
  { id: "received", label: "Received", count: mockNotices.filter((n) => n.status === "received").length },
  { id: "under_review", label: "Under Review", count: mockNotices.filter((n) => n.status === "under_review").length },
  {
    id: "evidence_collection",
    label: "Evidence Collection",
    count: mockNotices.filter((n) => n.status === "evidence_collection").length,
  },
  {
    id: "response_drafting",
    label: "Response Drafting",
    count: mockNotices.filter((n) => n.status === "response_drafting").length,
  },
  {
    id: "internal_review",
    label: "Internal Review",
    count: mockNotices.filter((n) => n.status === "internal_review").length,
  },
  { id: "submitted", label: "Submitted", count: mockNotices.filter((n) => n.status === "submitted").length },
  { id: "overdue", label: "Overdue", count: getOverdueNotices().length },
  { id: "urgent", label: "Urgent", count: getUrgentNotices().length },
];

const noticeCategories: { value: NoticeCategory; label: string }[] = [
  { value: "scrutiny", label: "Scrutiny" },
  { value: "assessment", label: "Assessment" },
  { value: "demand", label: "Demand" },
  { value: "refund", label: "Refund" },
  { value: "penalty", label: "Penalty" },
  { value: "prosecution", label: "Prosecution" },
  { value: "survey", label: "Survey" },
  { value: "search", label: "Search" },
  { value: "summons", label: "Summons" },
  { value: "show_cause", label: "Show Cause" },
  { value: "rectification", label: "Rectification" },
  { value: "appeal", label: "Appeal" },
  { value: "other", label: "Other" },
];

const authorityTypes: { value: AuthorityType; label: string }[] = [
  { value: "income_tax", label: "Income Tax" },
  { value: "gst", label: "GST" },
  { value: "tds", label: "TDS" },
  { value: "mca_roc", label: "MCA/ROC" },
  { value: "customs", label: "Customs" },
  { value: "rbi", label: "RBI" },
  { value: "sebi", label: "SEBI" },
  { value: "high_court", label: "High Court" },
  { value: "supreme_court", label: "Supreme Court" },
  { value: "tribunal", label: "Tribunal" },
  { value: "other", label: "Other" },
];

const priorities: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
  { value: "urgent", label: "Urgent" },
];

const statuses: { value: NoticeStatus; label: string }[] = [
  { value: "received", label: "Received" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "under_review", label: "Under Review" },
  { value: "evidence_collection", label: "Evidence Collection" },
  { value: "response_drafting", label: "Response Drafting" },
  { value: "internal_review", label: "Internal Review" },
  { value: "approved_for_submission", label: "Approved for Submission" },
  { value: "submitted", label: "Submitted" },
  { value: "hearing_scheduled", label: "Hearing Scheduled" },
  { value: "hearing_completed", label: "Hearing Completed" },
  { value: "order_received", label: "Order Received" },
  { value: "closed", label: "Closed" },
  { value: "escalated", label: "Escalated" },
];

export function NoticesList() {
  const router = useRouter();
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
      key: "category",
      label: "Category",
      type: "select",
      options: noticeCategories.map((c) => ({ value: c.value, label: c.label })),
    },
    {
      key: "authorityType",
      label: "Authority",
      type: "select",
      options: authorityTypes.map((a) => ({ value: a.value, label: a.label })),
    },
    {
      key: "priority",
      label: "Priority",
      type: "select",
      options: priorities.map((p) => ({ value: p.value, label: p.label })),
    },
    {
      key: "assignedUserId",
      label: "Assigned To",
      type: "select",
      options: mockUsers.map((u) => ({ value: u.id, label: u.fullName })),
    },
    {
      key: "clientId",
      label: "Client",
      type: "select",
      options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
    },
  ];

  let filteredNotices = mockNotices;

  if (activeTab !== "all") {
    if (activeTab === "overdue") {
      filteredNotices = getOverdueNotices();
    } else if (activeTab === "urgent") {
      filteredNotices = getUrgentNotices();
    } else {
      filteredNotices = getNoticesByStatus(activeTab as NoticeStatus);
    }
  }

  filteredNotices = filteredNotices.filter((n: Notice) => {
    if (
      search &&
      !n.subject.toLowerCase().includes(search.toLowerCase()) &&
      !n.noticeNumber.toLowerCase().includes(search.toLowerCase()) &&
      !n.referenceNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (n as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleNoticeClick = (notice: Notice) => router.push(`/dashboard/notices/${notice.id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Notice Register</h1>
          <p className="text-muted-foreground text-sm">Track and manage regulatory notices</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {noticeTabs.map((tab) => (
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
        searchPlaceholder="Search notices by subject, number, reference..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredNotices.length > 0 ? (
        <DataTable<Notice>
          data={filteredNotices}
          columns={
            [
              {
                accessorKey: "noticeNumber",
                header: "Notice #",
                cell: ({ row }: { row: { original: Notice } }) => (
                  <span className="font-medium text-sm">{row.original.noticeNumber}</span>
                ),
              },
              {
                accessorKey: "referenceNumber",
                header: "Reference #",
                cell: ({ row }: { row: { original: Notice } }) => (
                  <span className="font-mono text-muted-foreground text-sm">{row.original.referenceNumber}</span>
                ),
              },
              {
                accessorKey: "authority",
                header: "Authority",
                cell: ({ row }: { row: { original: Notice } }) => (
                  <div>
                    <p className="font-medium text-sm">{row.original.authority}</p>
                    <p className="text-muted-foreground text-xs capitalize">
                      {row.original.authorityType.replace(/_/g, " ")}
                    </p>
                  </div>
                ),
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }: { row: { original: Notice } }) => {
                  const client = getClientById(row.original.clientId);
                  return <ClientLink client={client!} showStatus={true} />;
                },
              },
              {
                accessorKey: "matterId",
                header: "Matter",
                cell: ({ row }: { row: { original: Notice } }) => {
                  if (!row.original.matterId) return <span className="text-muted-foreground text-sm">—</span>;
                  const matter = getMatterById(row.original.matterId);
                  return <MatterLink matter={matter!} showStatus={true} />;
                },
              },
              {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }: { row: { original: Notice } }) => (
                  <span className="text-sm capitalize">{row.original.category.replace(/_/g, " ")}</span>
                ),
              },
              {
                accessorKey: "assignedUserId",
                header: "Assigned To",
                cell: ({ row }: { row: { original: Notice } }) => {
                  const user = mockUsers.find((u) => u.id === row.original.assignedUserId);
                  return user ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{user.fullName}</span>
                      <span className="text-muted-foreground text-xs">{user.role.replace(/_/g, " ")}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "receivedDate",
                header: "Received",
                cell: ({ row }: { row: { original: Notice } }) => (
                  <span className="text-sm">{formatDate(row.original.receivedDate)}</span>
                ),
              },
              {
                accessorKey: "responseDueDate",
                header: "Due Date",
                cell: ({ row }: { row: { original: Notice } }) => {
                  const overdue =
                    daysOverdue(row.original.responseDueDate) > 0 &&
                    row.original.status !== "closed" &&
                    row.original.status !== "submitted";
                  return (
                    <span className={cn("text-sm", overdue && "font-medium text-destructive")}>
                      {formatDate(row.original.responseDueDate)}
                      {overdue && <AlertTriangle className="ml-1 inline h-3.5 w-3.5" />}
                    </span>
                  );
                },
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Notice } }) => <NoticeStatusBadge status={row.original.status} />,
              },
              {
                accessorKey: "priority",
                header: "Priority",
                cell: ({ row }: { row: { original: Notice } }) => <PriorityBadge priority={row.original.priority} />,
              },
              {
                accessorKey: "isUrgent",
                header: "Urgent",
                cell: ({ row }: { row: { original: Notice } }) => (
                  <span className="flex items-center justify-center">
                    {row.original.isUrgent ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </span>
                ),
              },
              {
                accessorKey: "escalationLevel",
                header: "Escalation",
                cell: ({ row }: { row: { original: Notice } }) => (
                  <span className={cn("font-medium text-sm", row.original.escalationLevel > 0 && "text-destructive")}>
                    Level {row.original.escalationLevel}
                  </span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No notices match your search or filters"
          rowActions={[{ label: "View Details", action: handleNoticeClick }]}
        />
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No notices found"
          description={
            search || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "No notices in the register yet"
          }
        />
      )}
    </div>
  );
}
