"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import { AlertTriangle, FileText } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, ComplianceCycleLink, MatterLink } from "@/components/ca-nexus/object-link";
import { PriorityBadge, ReviewStatusBadge } from "@/components/ca-nexus/status-badge";
import { Button } from "@/components/ui/button";
import { daysOverdue, formatDate } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getComplianceCycleById } from "@/mock-data/compliance";
import { getMatterById } from "@/mock-data/matters";
import { getOverdueReviews, getReviewsByStatus, mockReviews } from "@/mock-data/reviews";
import { getUserById, mockUsers } from "@/mock-data/users";
import type { Priority, Review, ReviewStatus, ReviewType } from "@/types";

const reviewTabs = [
  { id: "all", label: "All", count: mockReviews.length },
  { id: "pending", label: "Pending", count: mockReviews.filter((r) => r.status === "pending").length },
  { id: "in_progress", label: "In Progress", count: mockReviews.filter((r) => r.status === "in_progress").length },
  { id: "completed", label: "Completed", count: mockReviews.filter((r) => r.status === "completed").length },
  { id: "overdue", label: "Overdue", count: getOverdueReviews().length },
];

const reviewTypes: { value: ReviewType; label: string }[] = [
  { value: "compliance_filing", label: "Compliance Filing" },
  { value: "financial_statement", label: "Financial Statement" },
  { value: "tax_return", label: "Tax Return" },
  { value: "audit_workpaper", label: "Audit Workpaper" },
  { value: "document_verification", label: "Document Verification" },
  { value: "notice_response", label: "Notice Response" },
  { value: "engagement_letter", label: "Engagement Letter" },
  { value: "other", label: "Other" },
];

const priorities: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
  { value: "urgent", label: "Urgent" },
];

const statuses: { value: ReviewStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "skipped", label: "Skipped" },
];

export function ReviewsList() {
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
      key: "reviewType",
      label: "Type",
      type: "select",
      options: reviewTypes.map((t) => ({ value: t.value, label: t.label })),
    },
    {
      key: "priority",
      label: "Priority",
      type: "select",
      options: priorities.map((p) => ({ value: p.value, label: p.label })),
    },
    {
      key: "assignedReviewerId",
      label: "Reviewer",
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

  let filteredReviews = mockReviews;

  if (activeTab !== "all") {
    if (activeTab === "overdue") {
      filteredReviews = getOverdueReviews();
    } else {
      filteredReviews = getReviewsByStatus(activeTab as ReviewStatus);
    }
  }

  filteredReviews = filteredReviews.filter((r: Review) => {
    if (
      search &&
      !r.title.toLowerCase().includes(search.toLowerCase()) &&
      !r.reviewNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (r as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleReviewClick = (review: Review) => router.push(`/dashboard/reviews/${review.id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Review Inbox</h1>
          <p className="text-muted-foreground text-sm">Manage and track all review assignments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {reviewTabs.map((tab) => (
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
        searchPlaceholder="Search reviews by title, number..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredReviews.length > 0 ? (
        <DataTable<Review>
          data={filteredReviews}
          columns={
            [
              {
                accessorKey: "reviewNumber",
                header: "Review #",
                cell: ({ row }: { row: { original: Review } }) => (
                  <span className="font-medium text-sm">{row.original.reviewNumber}</span>
                ),
              },
              {
                accessorKey: "title",
                header: "Title",
                cell: ({ row }: { row: { original: Review } }) => (
                  <p className="line-clamp-1 font-medium">{row.original.title}</p>
                ),
              },
              {
                accessorKey: "reviewType",
                header: "Type",
                cell: ({ row }: { row: { original: Review } }) => (
                  <span className="text-sm capitalize">{row.original.reviewType.replace(/_/g, " ")}</span>
                ),
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }: { row: { original: Review } }) => {
                  const client = getClientById(row.original.clientId);
                  return <ClientLink client={client!} showStatus={true} />;
                },
              },
              {
                accessorKey: "matterId",
                header: "Matter",
                cell: ({ row }: { row: { original: Review } }) => {
                  if (!row.original.matterId) return <span className="text-muted-foreground text-sm">—</span>;
                  const matter = getMatterById(row.original.matterId);
                  return <MatterLink matter={matter!} showStatus={true} />;
                },
              },
              {
                accessorKey: "complianceCycleId",
                header: "Compliance",
                cell: ({ row }: { row: { original: Review } }) => {
                  if (!row.original.complianceCycleId) return <span className="text-muted-foreground text-sm">—</span>;
                  const cycle = getComplianceCycleById(row.original.complianceCycleId);
                  return cycle ? (
                    <ComplianceCycleLink cycle={cycle} showStatus={true} showClient={false} />
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "assignedReviewerId",
                header: "Reviewer",
                cell: ({ row }: { row: { original: Review } }) => {
                  const reviewer = getUserById(row.original.assignedReviewerId);
                  return reviewer ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{reviewer.fullName}</span>
                      <span className="text-muted-foreground text-xs">{reviewer.role.replace(/_/g, " ")}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Review } }) => <ReviewStatusBadge status={row.original.status} />,
              },
              {
                accessorKey: "priority",
                header: "Priority",
                cell: ({ row }: { row: { original: Review } }) => <PriorityBadge priority={row.original.priority} />,
              },
              {
                accessorKey: "dueDate",
                header: "Due Date",
                cell: ({ row }: { row: { original: Review } }) => {
                  const overdue = daysOverdue(row.original.dueDate) > 0 && row.original.status !== "completed";
                  return (
                    <span className={cn("text-sm", overdue && "font-medium text-destructive")}>
                      {formatDate(row.original.dueDate)}
                      {overdue && <AlertTriangle className="ml-1 inline h-3.5 w-3.5" />}
                    </span>
                  );
                },
              },
              {
                accessorKey: "stages",
                header: "Progress",
                cell: ({ row }: { row: { original: Review } }) => {
                  const completed = row.original.stages.filter((s) => s.status === "completed").length;
                  const total = row.original.stages.length;
                  return (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {completed}/{total}
                      </span>
                    </div>
                  );
                },
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No reviews match your search or filters"
          rowActions={[{ label: "View Details", action: handleReviewClick }]}
        />
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No reviews found"
          description={
            search || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "No reviews in the system yet"
          }
        />
      )}
    </div>
  );
}
