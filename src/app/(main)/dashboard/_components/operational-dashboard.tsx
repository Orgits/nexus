"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle,
  CheckSquare,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck,
  FileSearch,
  FileText,
  LayoutDashboard,
  Mail,
  Plus,
  Users,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState, SkeletonCard } from "@/components/ca-nexus/empty-state";
import { ClientLink, MatterLink, ObjectLink } from "@/components/ca-nexus/object-link";
import { SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { ComplianceStatusBadge, PriorityBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatINR } from "@/lib/format";
import { mockClients } from "@/mock-data/clients";
import { mockCommunications } from "@/mock-data/communications";
import { getComplianceSummary, getOverdueComplianceCycles, mockComplianceCycles } from "@/mock-data/compliance";
import type {
  CommunicationFollowupItem,
  MissingDocumentItem,
  PendingReviewItem,
  RecentClientItem,
  RecentMatterItem,
  TeamWorkloadItem,
  UpcomingDeadlineItem,
  UrgentWorkItem,
} from "@/mock-data/dashboard";
import { mockTeamWorkload } from "@/mock-data/dashboard";
import { getOverdueTasks, getTasksByStatus, mockMatters, mockTasks } from "@/mock-data/matters";
import { getOverdueNotices, getUrgentNotices, mockNotices } from "@/mock-data/notices";
import { getOverdueReviews, mockReviews } from "@/mock-data/reviews";
import { getOverdueInvoices, mockInvoices } from "@/mock-data/time-billing";
import type { ComplianceCycle, TaskStatus } from "@/types";

const taskTabs = [
  { id: "all", label: "All", count: mockTasks.length },
  { id: "overdue", label: "Overdue", count: getOverdueTasks().length },
  { id: "todo", label: "Todo", count: getTasksByStatus("todo").length },
  { id: "in_progress", label: "In Progress", count: getTasksByStatus("in_progress").length },
  { id: "in_review", label: "In Review", count: getTasksByStatus("in_review").length },
  { id: "completed", label: "Completed", count: getTasksByStatus("completed").length },
];

const complianceTabs = [
  { id: "all", label: "All", count: mockComplianceCycles.length },
  { id: "overdue", label: "Overdue", count: getOverdueComplianceCycles().length },
  {
    id: "pending",
    label: "Pending Docs",
    count: mockComplianceCycles.filter((c) => c.missingDocuments.some((d) => d.isMandatory && !d.receivedAt)).length,
  },
  {
    id: "review",
    label: "In Review",
    count: mockComplianceCycles.filter((c) => c.status === "in_review" || c.status === "ready_for_review").length,
  },
];

const _noticeTabs = [
  { id: "all", label: "All", count: mockNotices.length },
  { id: "urgent", label: "Urgent", count: getUrgentNotices().length },
  { id: "overdue", label: "Overdue", count: getOverdueNotices().length },
  {
    id: "response",
    label: "Response Drafting",
    count: mockNotices.filter((n) => n.status === "response_drafting").length,
  },
];

const _reviewTabs = [
  { id: "all", label: "All", count: mockReviews.length },
  { id: "overdue", label: "Overdue", count: getOverdueReviews().length },
  { id: "pending", label: "Pending", count: mockReviews.filter((r) => r.status === "pending").length },
  { id: "in_progress", label: "In Progress", count: mockReviews.filter((r) => r.status === "in_progress").length },
];

const formatDaysRemaining = (days: number): string => {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  return `${days}d`;
};

const getWorkloadStatus = (
  item: TeamWorkloadItem,
): { variant: "destructive" | "secondary" | "default"; label: string } => {
  if (item.isOverloaded) return { variant: "destructive", label: "Overloaded" };
  if (item.isUnderutilized) return { variant: "secondary", label: "Underutilized" };
  return { variant: "default", label: "Optimal" };
};

export function OperationalDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [taskFilter, setTaskFilter] = useState("all");
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [_noticeFilter, _setNoticeFilter] = useState("all");
  const [_reviewFilter, _setReviewFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const complianceSummary = getComplianceSummary();
  const overdueInvoices = getOverdueInvoices();
  const urgentNotices = getUrgentNotices();
  const urgentNoticesMapped = urgentNotices.slice(0, 5).map((n) => ({
    ...n,
    clientName: mockClients.find((cl) => cl.id === n.clientId)?.displayName || "Unknown",
    href: `/dashboard/notices/${n.id}`,
  }));

  const urgentWorkItems = [
    ...getOverdueTasks()
      .slice(0, 3)
      .map((t) => ({
        id: `task-${t.id}`,
        type: "task" as const,
        title: t.title,
        clientName: mockClients.find((c) => c.id === t.clientId)?.displayName || "Unknown",
        matterName: mockMatters.find((m) => m.id === t.matterId)?.name,
        dueDate: t.dueDate,
        daysOverdue: Math.ceil((Date.now() - new Date(t.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
        priority: t.priority,
        assigneeName: t.assignedUserId,
        href: `/dashboard/tasks/${t.id}`,
      })),
    ...getOverdueComplianceCycles()
      .slice(0, 2)
      .map((c) => ({
        id: `compliance-${c.id}`,
        type: "compliance" as const,
        title: c.serviceName,
        clientName: mockClients.find((cl) => cl.id === c.clientId)?.displayName || "Unknown",
        matterName: c.matterId
          ? (mockMatters.find((m) => m.id === c.matterId)?.name ?? "Compliance Cycle")
          : "Compliance Cycle",
        dueDate: c.dueDate,
        daysOverdue: c.daysOverdue,
        priority: c.priority,
        assigneeName: c.assignedUserId,
        href: `/dashboard/compliance/${c.serviceType}/${c.id}`,
      })),
    ...getUrgentNotices()
      .slice(0, 1)
      .map((n) => ({
        id: `notice-${n.id}`,
        type: "notice" as const,
        title: n.subject,
        clientName: mockClients.find((cl) => cl.id === n.clientId)?.displayName || "Unknown",
        matterName: n.matterId ? mockMatters.find((m) => m.id === n.matterId)?.name : undefined,
        dueDate: n.responseDueDate,
        daysOverdue: Math.ceil((Date.now() - new Date(n.responseDueDate).getTime()) / (1000 * 60 * 60 * 24)),
        priority: n.priority,
        assigneeName: n.assignedUserId,
        href: `/dashboard/notices/${n.id}`,
      })),
    ...getOverdueReviews()
      .slice(0, 1)
      .map((r) => ({
        id: `review-${r.id}`,
        type: "review" as const,
        title: r.title,
        clientName: mockClients.find((cl) => cl.id === r.clientId)?.displayName || "Unknown",
        matterName: r.matterId ? mockMatters.find((m) => m.id === r.matterId)?.name : undefined,
        dueDate: r.dueDate,
        daysOverdue: Math.ceil((Date.now() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
        priority: r.priority,
        assigneeName: r.assignedReviewerId,
        href: `/dashboard/reviews/${r.id}`,
      })),
  ]
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 8);

  const upcomingDeadlines = [
    ...mockTasks
      .filter((t) => t.status !== "completed" && new Date(t.dueDate) >= new Date())
      .slice(0, 3)
      .map((t) => ({
        id: `task-${t.id}`,
        type: "task" as const,
        title: t.title,
        clientName: mockClients.find((c) => c.id === t.clientId)?.displayName || "Unknown",
        dueDate: t.dueDate,
        daysRemaining: Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        priority: t.priority,
        href: `/dashboard/tasks/${t.id}`,
      })),
    ...mockComplianceCycles
      .filter((c) => !c.isOverdue && c.status !== "completed" && c.status !== "closed" && c.status !== "filed")
      .slice(0, 3)
      .map((c) => ({
        id: `compliance-${c.id}`,
        type: "compliance" as const,
        title: c.serviceName,
        clientName: mockClients.find((cl) => cl.id === c.clientId)?.displayName || "Unknown",
        dueDate: c.dueDate,
        daysRemaining: Math.ceil((new Date(c.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        priority: c.priority,
        href: `/dashboard/compliance/${c.serviceType}/${c.id}`,
      })),
    ...mockNotices
      .filter((n) => new Date(n.responseDueDate) >= new Date() && n.status !== "closed")
      .slice(0, 2)
      .map((n) => ({
        id: `notice-${n.id}`,
        type: "notice" as const,
        title: n.subject,
        clientName: mockClients.find((cl) => cl.id === n.clientId)?.displayName || "Unknown",
        dueDate: n.responseDueDate,
        daysRemaining: Math.ceil((new Date(n.responseDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        priority: n.priority,
        href: `/dashboard/notices/${n.id}`,
      })),
  ]
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 8);

  const missingDocuments = mockComplianceCycles
    .flatMap((c) =>
      c.missingDocuments
        .filter((d) => d.isMandatory && !d.receivedAt)
        .map((d) => ({
          id: `md-${c.id}-${d.documentType}`,
          clientName: mockClients.find((cl) => cl.id === c.clientId)?.displayName || "Unknown",
          matterName: c.matterId
            ? (mockMatters.find((m) => m.id === c.matterId)?.name ?? "Compliance Cycle")
            : "Compliance Cycle",
          documentName: d.documentType.replace(/_/g, " "),
          requestedDate: d.requestedAt || c.createdAt,
          reminderCount: c.documentRequests.reduce((sum, dr) => sum + dr.reminderCount, 0),
          daysWaiting: Math.ceil(
            (Date.now() - new Date(d.requestedAt || c.createdAt).getTime()) / (1000 * 60 * 60 * 24),
          ),
          status: "not_sent" as const,
          href: `/dashboard/compliance/${c.serviceType}/${c.id}`,
        })),
    )
    .sort((a, b) => b.daysWaiting - a.daysWaiting)
    .slice(0, 6);

  const getObjectType = (reviewType: string): "matter" | "task" | "document" | "compliance" => {
    switch (reviewType) {
      case "compliance_filing":
        return "compliance";
      case "financial_statement":
        return "matter";
      default:
        return "task";
    }
  };

  const pendingReviews: PendingReviewItem[] = mockReviews
    .filter((r) => r.status === "pending" || r.status === "in_progress")
    .slice(0, 6)
    .map((r) => ({
      id: r.id,
      objectType: getObjectType(r.reviewType),
      objectName: r.title,
      clientName: mockClients.find((cl) => cl.id === r.clientId)?.displayName || "Unknown",
      submitterName: mockClients.find((cl) => cl.id === r.assignedReviewerId)?.displayName || "Unknown",
      stage: r.reviewType.replace(/_/g, " "),
      submittedDate: r.createdAt,
      daysAging: Math.ceil((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      priority: r.priority,
      href: `/dashboard/reviews/${r.id}`,
    }));

  const communicationFollowups = mockCommunications
    .filter((c) => c.direction === "outbound" && (c.status === "sent" || c.status === "delivered") && !c.repliedAt)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      type: c.channel as "email" | "whatsapp" | "sms" | "call",
      clientName: mockClients.find((cl) => cl.id === c.clientId)?.displayName || "Unknown",
      subject: c.subject || c.content.slice(0, 50),
      lastActivity: c.sentAt || c.createdAt,
      daysSinceActivity: Math.ceil((Date.now() - new Date(c.sentAt || c.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      followUpDue: c.sentAt ? new Date(new Date(c.sentAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : "Soon",
      href: `/dashboard/communications/${c.id}`,
    }));

  const recentClients = mockClients
    .filter((c) => c.status === "active")
    .slice(0, 5)
    .map((c) => {
      const clientMatters = mockMatters.filter(
        (m) => m.clientId === c.id && !["completed", "closed"].includes(m.status),
      );
      const clientTasks = mockTasks.filter((t) => t.clientId === c.id && t.status !== "completed");
      return {
        id: c.id,
        name: c.displayName || c.name,
        type: c.category.replace(/_/g, " "),
        pendingWork: clientMatters.length + clientTasks.length,
        nextDeadline:
          clientMatters.length > 0
            ? clientMatters.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate
            : undefined,
        status: c.status,
        href: `/dashboard/clients/${c.id}`,
      };
    });

  const recentMatters = mockMatters
    .filter((m) => !["completed", "closed"].includes(m.status))
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      name: m.name,
      clientName: mockClients.find((c) => c.id === m.clientId)?.displayName || "Unknown",
      status: m.status.replace(/_/g, " "),
      progress: m.progress,
      dueDate: m.dueDate,
      href: `/dashboard/matters/${m.id}`,
    }));

  const invoiceSummary = {
    totalInvoiced: mockInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
    totalOutstanding: mockInvoices.reduce((sum, i) => sum + i.balanceAmount, 0),
    overdueCount: overdueInvoices.length,
    overdueAmount: overdueInvoices.reduce((sum, i) => sum + i.balanceAmount, 0),
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <SkeletonCard className="h-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Operational overview -{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/time-tracking")}>
            <Plus className="mr-1.5 h-4 w-4" />
            Log Time
          </Button>
          <Button size="sm" onClick={() => router.push("/dashboard/clients/new")}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatTile
          label="Active Matters"
          value={mockMatters.filter((m) => !["completed", "closed"].includes(m.status)).length}
          icon={<Briefcase className="h-5 w-5 text-blue-600" />}
          hint={`${mockMatters.filter((m) => m.status === "overdue").length} overdue`}
        />
        <StatTile
          label="Pending Tasks"
          value={mockTasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status)).length}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          hint={`${getOverdueTasks().length} overdue`}
        />
        <StatTile
          label="Compliance Cycles"
          value={complianceSummary.total}
          icon={<FileCheck className="h-5 w-5 text-purple-600" />}
          hint={`${complianceSummary.overdue} overdue • ${complianceSummary.pendingDocuments} pending docs`}
        />
        <StatTile
          label="Outstanding"
          value={formatINR(invoiceSummary.totalOutstanding)}
          icon={<DollarSign className="h-5 w-5 text-amber-600" />}
          hint={`${invoiceSummary.overdueCount} overdue invoices`}
        />
        <StatTile
          label="Team Utilization"
          value={`${Math.round(mockTeamWorkload.reduce((s, u) => s + u.utilization, 0) / mockTeamWorkload.length)}%`}
          icon={<Users className="h-5 w-5 text-indigo-600" />}
          hint={`${mockTeamWorkload.filter((u) => u.isOverloaded).length} overloaded`}
        />
      </SectionCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview" className="gap-1 px-2 py-1.5">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="urgent" className="gap-1 px-2 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Urgent Work</span>
            <Badge variant="destructive" className="ml-1">
              {urgentWorkItems.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="gap-1 px-2 py-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Deadlines</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1 px-2 py-1.5">
            <CheckSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1 px-2 py-1.5">
            <FileCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Compliance</span>
            <Badge variant={complianceSummary.overdue > 0 ? "destructive" : "secondary"} className="ml-1">
              {complianceSummary.overdue}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1 px-2 py-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SectionCard title="Urgent Work" className="md:col-span-2 lg:col-span-2">
              {urgentWorkItems.length > 0 ? (
                <DataTable<UrgentWorkItem>
                  data={urgentWorkItems}
                  columns={[
                    {
                      accessorKey: "title",
                      header: "Item",
                      cell: ({ row }) => (
                        <div>
                          <p className="font-medium text-sm">{row.original.title}</p>
                          <p className="text-muted-foreground text-xs flex items-center gap-1">
                            <span className="capitalize">{row.original.type}</span>
                            {row.original.matterName && ` • ${row.original.matterName}`}
                          </p>
                        </div>
                      ),
                    },
                    {
                      accessorKey: "clientName",
                      header: "Client",
                      cell: ({ row }) => <ObjectLink href={row.original.href} label={row.original.clientName} />,
                    },
                    {
                      accessorKey: "daysOverdue",
                      header: "Overdue",
                      cell: ({ row }) => (
                        <span className={cn("font-medium", row.original.daysOverdue > 0 && "text-destructive")}>
                          {row.original.daysOverdue > 0 ? `${row.original.daysOverdue}d` : "Due today"}
                        </span>
                      ),
                    },
                    {
                      accessorKey: "priority",
                      header: "Priority",
                      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
                    },
                    {
                      accessorKey: "assigneeName",
                      header: "Assignee",
                      cell: ({ row }) => <span className="text-sm">{row.original.assigneeName}</span>,
                    },
                  ]}
                  getRowId={(row) => row.id}
                  pageSize={8}
                  emptyMessage="No urgent work"
                />
              ) : (
                <EmptyState
                  icon={<CheckCircle className="h-12 w-12 text-green-600" />}
                  title="No urgent work"
                  description="All caught up! No overdue items at the moment."
                />
              )}
            </SectionCard>

            <SectionCard title="Upcoming Deadlines" className="md:col-span-2 lg:col-span-2">
              {upcomingDeadlines.length > 0 ? (
                <DataTable<UpcomingDeadlineItem>
                  data={upcomingDeadlines}
                  columns={[
                    {
                      accessorKey: "title",
                      header: "Deadline",
                      cell: ({ row }) => (
                        <div>
                          <p className="font-medium text-sm">{row.original.title}</p>
                          <p className="text-muted-foreground text-xs capitalize">{row.original.type}</p>
                        </div>
                      ),
                    },
                    {
                      accessorKey: "clientName",
                      header: "Client",
                      cell: ({ row }) => <ObjectLink href={row.original.href} label={row.original.clientName} />,
                    },
                    {
                      accessorKey: "dueDate",
                      header: "Due",
                      cell: ({ row }) => (
                        <span
                          className={cn("font-medium text-sm", row.original.daysRemaining <= 2 && "text-destructive")}
                        >
                          {formatDate(row.original.dueDate)}
                          <span className="ml-1 text-xs">{formatDaysRemaining(row.original.daysRemaining)}</span>
                        </span>
                      ),
                    },
                    {
                      accessorKey: "priority",
                      header: "Priority",
                      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
                    },
                  ]}
                  getRowId={(row) => row.id}
                  pageSize={8}
                  emptyMessage="No upcoming deadlines"
                />
              ) : (
                <EmptyState
                  icon={<Clock className="h-12 w-12 text-muted-foreground/50" />}
                  title="No upcoming deadlines"
                  description="All clear for the next period."
                />
              )}
            </SectionCard>

            <SectionCard title="Team Workload" className="lg:col-span-3">
              <DataTable<TeamWorkloadItem>
                data={mockTeamWorkload}
                columns={[
                  {
                    accessorKey: "userName",
                    header: "Team Member",
                    cell: ({ row }) => (
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {row.original.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{row.original.userName}</p>
                          <p className="text-muted-foreground text-xs">{row.original.role}</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    accessorKey: "openTasks",
                    header: "Tasks",
                    cell: ({ row }) => <span className="font-medium">{row.original.openTasks}</span>,
                  },
                  {
                    accessorKey: "openMatters",
                    header: "Matters",
                    cell: ({ row }) => <span className="text-sm">{row.original.openMatters}</span>,
                  },
                  {
                    accessorKey: "utilization",
                    header: "Utilization",
                    cell: ({ row }) => (
                      <div className="w-32">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(row.original.utilization, 100)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs">{row.original.utilization}%</span>
                      </div>
                    ),
                  },
                  {
                    accessorKey: "isOverloaded",
                    header: "Status",
                    cell: ({ row }) => {
                      const status = getWorkloadStatus(row.original);
                      return <Badge variant={status.variant}>{status.label}</Badge>;
                    },
                  },
                ]}
                getRowId={(row) => row.userId}
                pageSize={6}
                emptyMessage="No team data"
              />
            </SectionCard>

            <SectionCard title="Missing Documents" className="lg:col-span-3">
              {missingDocuments.length > 0 ? (
                <DataTable<MissingDocumentItem>
                  data={missingDocuments}
                  columns={[
                    {
                      accessorKey: "documentName",
                      header: "Document",
                      cell: ({ row }) => <p className="font-medium text-sm">{row.original.documentName}</p>,
                    },
                    {
                      accessorKey: "clientName",
                      header: "Client",
                      cell: ({ row }) => <ObjectLink href={row.original.href} label={row.original.clientName} />,
                    },
                    {
                      accessorKey: "matterName",
                      header: "Matter",
                      cell: ({ row }) => <span className="text-sm">{row.original.matterName}</span>,
                    },
                    {
                      accessorKey: "daysWaiting",
                      header: "Waiting",
                      cell: ({ row }) => (
                        <span
                          className={cn("font-medium text-sm", row.original.daysWaiting > 30 && "text-destructive")}
                        >
                          {row.original.daysWaiting}d
                        </span>
                      ),
                    },
                    {
                      accessorKey: "reminderCount",
                      header: "Reminders",
                      cell: ({ row }) => (
                        <Badge variant={row.original.reminderCount > 0 ? "secondary" : "outline"}>
                          {row.original.reminderCount}
                        </Badge>
                      ),
                    },
                  ]}
                  getRowId={(row) => row.id}
                  pageSize={6}
                  emptyMessage="No missing documents"
                />
              ) : (
                <EmptyState
                  icon={<FileCheck className="h-12 w-12 text-green-600" />}
                  title="No missing documents"
                  description="All mandatory documents have been received."
                />
              )}
            </SectionCard>

            <SectionCard title="Pending Reviews" className="lg:col-span-3">
              {pendingReviews.length > 0 ? (
                <DataTable<PendingReviewItem>
                  data={pendingReviews}
                  columns={[
                    {
                      accessorKey: "objectName",
                      header: "Review",
                      cell: ({ row }) => <p className="font-medium text-sm">{row.original.objectName}</p>,
                    },
                    {
                      accessorKey: "clientName",
                      header: "Client",
                      cell: ({ row }) => <ObjectLink href={row.original.href} label={row.original.clientName} />,
                    },
                    {
                      accessorKey: "submitterName",
                      header: "Submitted By",
                      cell: ({ row }) => <span className="text-sm">{row.original.submitterName}</span>,
                    },
                    {
                      accessorKey: "stage",
                      header: "Stage",
                      cell: ({ row }) => <Badge variant="secondary">{row.original.stage}</Badge>,
                    },
                    {
                      accessorKey: "daysAging",
                      header: "Aging",
                      cell: ({ row }) => (
                        <span className={cn("font-medium text-sm", row.original.daysAging > 14 && "text-destructive")}>
                          {row.original.daysAging}d
                        </span>
                      ),
                    },
                    {
                      accessorKey: "priority",
                      header: "Priority",
                      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
                    },
                  ]}
                  getRowId={(row) => row.id}
                  pageSize={6}
                  emptyMessage="No pending reviews"
                />
              ) : (
                <EmptyState
                  icon={<FileSearch className="h-12 w-12 text-muted-foreground/50" />}
                  title="No pending reviews"
                  description="All reviews are up to date."
                />
              )}
            </SectionCard>

            <SectionCard title="Communication Follow-ups" className="md:col-span-2 lg:col-span-2">
              {communicationFollowups.length > 0 ? (
                <DataTable<CommunicationFollowupItem>
                  data={communicationFollowups}
                  columns={[
                    {
                      accessorKey: "subject",
                      header: "Communication",
                      cell: ({ row }) => <p className="font-medium text-sm line-clamp-1">{row.original.subject}</p>,
                    },
                    {
                      accessorKey: "clientName",
                      header: "Client",
                      cell: ({ row }) => <ObjectLink href={row.original.href} label={row.original.clientName} />,
                    },
                    {
                      accessorKey: "type",
                      header: "Channel",
                      cell: ({ row }) => (
                        <Badge variant="secondary" className="capitalize">
                          {row.original.type}
                        </Badge>
                      ),
                    },
                    {
                      accessorKey: "daysSinceActivity",
                      header: "Last Activity",
                      cell: ({ row }) => <span className="text-sm">{row.original.daysSinceActivity}d ago</span>,
                    },
                    {
                      accessorKey: "followUpDue",
                      header: "Follow-up Due",
                      cell: ({ row }) => <span className="text-sm">{row.original.followUpDue}</span>,
                    },
                  ]}
                  getRowId={(row) => row.id}
                  pageSize={5}
                  emptyMessage="No follow-ups"
                />
              ) : (
                <EmptyState
                  icon={<Mail className="h-12 w-12 text-muted-foreground/50" />}
                  title="No follow-ups needed"
                  description="All communications are up to date."
                />
              )}
            </SectionCard>

            <SectionCard title="Recent Clients" className="md:col-span-2 lg:col-span-2">
              <DataTable<RecentClientItem>
                data={recentClients}
                columns={[
                  {
                    accessorKey: "name",
                    header: "Client",
                    cell: ({ row }) => {
                      const client = mockClients.find((c) => c.id === row.original.id);
                      return client ? <ClientLink client={client} showStatus={true} /> : null;
                    },
                  },
                  {
                    accessorKey: "type",
                    header: "Category",
                    cell: ({ row }) => <span className="text-sm">{row.original.type}</span>,
                  },
                  {
                    accessorKey: "pendingWork",
                    header: "Pending",
                    cell: ({ row }) => <span className="font-medium">{row.original.pendingWork}</span>,
                  },
                  {
                    accessorKey: "nextDeadline",
                    header: "Next Deadline",
                    cell: ({ row }) => (
                      <span className="text-sm">
                        {row.original.nextDeadline ? formatDate(row.original.nextDeadline) : "—"}
                      </span>
                    ),
                  },
                ]}
                getRowId={(row) => row.id}
                pageSize={5}
                emptyMessage="No recent clients"
              />
            </SectionCard>

            <SectionCard title="Recent Matters" className="md:col-span-2 lg:col-span-2">
              <DataTable<RecentMatterItem>
                data={recentMatters}
                columns={[
                  {
                    accessorKey: "name",
                    header: "Matter",
                    cell: ({ row }) => {
                      const matter = mockMatters.find((m) => m.id === row.original.id);
                      return matter ? <MatterLink matter={matter} showStatus={true} /> : null;
                    },
                  },
                  {
                    accessorKey: "clientName",
                    header: "Client",
                    cell: ({ row }) => <ObjectLink href={row.original.href} label={row.original.clientName} />,
                  },
                  {
                    accessorKey: "progress",
                    header: "Progress",
                    cell: ({ row }) => (
                      <div className="w-32">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${row.original.progress}%` }} />
                        </div>
                        <span className="text-muted-foreground text-xs">{row.original.progress}%</span>
                      </div>
                    ),
                  },
                  {
                    accessorKey: "dueDate",
                    header: "Due Date",
                    cell: ({ row }) => (
                      <span
                        className={cn("text-sm", new Date(row.original.dueDate) < new Date() && "text-destructive")}
                      >
                        {formatDate(row.original.dueDate)}
                      </span>
                    ),
                  },
                ]}
                getRowId={(row) => row.id}
                pageSize={5}
                emptyMessage="No recent matters"
              />
            </SectionCard>

            <SectionCard title="Financial Snapshot" className="lg:col-span-3">
              <div className="grid gap-4 md:grid-cols-4">
                <StatTile
                  label="Total Invoiced"
                  value={formatINR(invoiceSummary.totalInvoiced)}
                  icon={<DollarSign className="h-5 w-5 text-green-600" />}
                />
                <StatTile
                  label="Outstanding"
                  value={formatINR(invoiceSummary.totalOutstanding)}
                  hint={`${invoiceSummary.overdueCount} overdue`}
                  icon={<CreditCard className="h-5 w-5 text-amber-600" />}
                />
                <StatTile
                  label="Overdue Amount"
                  value={formatINR(invoiceSummary.overdueAmount)}
                  icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
                />
                <StatTile
                  label="Unpaid Invoices"
                  value={mockInvoices.filter((i) => i.paymentStatus === "unpaid").length}
                  icon={<FileText className="h-5 w-5 text-blue-600" />}
                />
              </div>
            </SectionCard>

            <SectionCard title="Notice Alerts" className="lg:col-span-3">
              {urgentNotices.length > 0 ? (
                <DataTable
                  data={urgentNoticesMapped}
                  columns={[
                    {
                      accessorKey: "subject",
                      header: "Notice",
                      cell: ({ row }) => <p className="font-medium text-sm line-clamp-1">{row.original.subject}</p>,
                    },
                    {
                      accessorKey: "authority",
                      header: "Authority",
                      cell: ({ row }) => <Badge variant="secondary">{row.original.authority}</Badge>,
                    },
                    {
                      accessorKey: "clientName",
                      header: "Client",
                      cell: ({ row }) => <ObjectLink href={row.original.href} label={row.original.clientName} />,
                    },
                    {
                      accessorKey: "responseDueDate",
                      header: "Due Date",
                      cell: ({ row }) => (
                        <span className="font-medium text-destructive text-sm">
                          {formatDate(row.original.responseDueDate)}
                        </span>
                      ),
                    },
                    {
                      accessorKey: "priority",
                      header: "Priority",
                      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
                    },
                  ]}
                  getRowId={(row) => row.id}
                  pageSize={5}
                  emptyMessage="No urgent notices"
                />
              ) : (
                <EmptyState
                  icon={<FileSearch className="h-12 w-12 text-green-600" />}
                  title="No urgent notices"
                  description="All notices are within their response deadlines."
                />
              )}
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SectionCard title="Urgent Work Items">
              <DataTable<UrgentWorkItem>
                data={urgentWorkItems}
                columns={[
                  {
                    accessorKey: "title",
                    header: "Item",
                    cell: ({ row }) => (
                      <div>
                        <p className="font-medium text-sm">{row.original.title}</p>
                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                          <span className="capitalize">{row.original.type}</span>
                          {row.original.matterName && ` • ${row.original.matterName}`}
                        </p>
                      </div>
                    ),
                  },
                  {
                    accessorKey: "clientName",
                    header: "Client",
                    cell: ({ row }) => <ObjectLink href={row.original.href} label={row.original.clientName} />,
                  },
                  {
                    accessorKey: "daysOverdue",
                    header: "Overdue",
                    cell: ({ row }) => (
                      <span className={cn("font-medium", row.original.daysOverdue > 0 && "text-destructive")}>
                        {row.original.daysOverdue > 0 ? `${row.original.daysOverdue}d` : "Due today"}
                      </span>
                    ),
                  },
                  {
                    accessorKey: "priority",
                    header: "Priority",
                    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
                  },
                ]}
                getRowId={(row) => row.id}
                pageSize={15}
                emptyMessage="No urgent work"
              />
            </SectionCard>

            <SectionCard title="Overdue Compliance">
              <DataTable<ComplianceCycle>
                data={getOverdueComplianceCycles()}
                columns={[
                  {
                    accessorKey: "serviceName",
                    header: "Cycle",
                    cell: ({ row }) => (
                      <div>
                        <p className="font-medium text-sm">{row.original.serviceName}</p>
                        <p className="text-muted-foreground text-xs">{row.original.period.label}</p>
                      </div>
                    ),
                  },
                  {
                    accessorKey: "clientId",
                    header: "Client",
                    cell: ({ row }) => {
                      const client = mockClients.find((c) => c.id === row.original.clientId);
                      return client ? <ClientLink client={client} showStatus={true} /> : null;
                    },
                  },
                  {
                    accessorKey: "daysOverdue",
                    header: "Days Overdue",
                    cell: ({ row }) => (
                      <span className="font-medium text-destructive text-sm">{row.original.daysOverdue}d</span>
                    ),
                  },
                  {
                    accessorKey: "priority",
                    header: "Priority",
                    cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
                  },
                ]}
                getRowId={(row) => row.id}
                pageSize={10}
                emptyMessage="No overdue compliance"
              />
            </SectionCard>

            <SectionCard title="Urgent Notices">
              <DataTable
                data={urgentNotices}
                columns={[
                  {
                    accessorKey: "subject",
                    header: "Notice",
                    cell: ({ row }) => <p className="font-medium text-sm line-clamp-1">{row.original.subject}</p>,
                  },
                  {
                    accessorKey: "authority",
                    header: "Authority",
                    cell: ({ row }) => <Badge variant="secondary">{row.original.authority}</Badge>,
                  },
                  {
                    accessorKey: "clientId",
                    header: "Client",
                    cell: ({ row }) => {
                      const client = mockClients.find((c) => c.id === row.original.clientId);
                      return client ? <ClientLink client={client} showStatus={true} /> : null;
                    },
                  },
                  {
                    accessorKey: "responseDueDate",
                    header: "Due Date",
                    cell: ({ row }) => (
                      <span className="font-medium text-destructive text-sm">
                        {formatDate(row.original.responseDueDate)}
                      </span>
                    ),
                  },
                ]}
                getRowId={(row) => row.id}
                pageSize={10}
                emptyMessage="No urgent notices"
              />
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-6">
          <SectionCard title="Upcoming Deadlines">
            <DataTable<UpcomingDeadlineItem>
              data={upcomingDeadlines}
              columns={[
                {
                  accessorKey: "title",
                  header: "Deadline",
                  cell: ({ row }) => (
                    <div>
                      <p className="font-medium text-sm">{row.original.title}</p>
                      <p className="text-muted-foreground text-xs capitalize">{row.original.type}</p>
                    </div>
                  ),
                },
                {
                  accessorKey: "clientName",
                  header: "Client",
                  cell: ({ row }) => <ObjectLink href={row.original.href} label={row.original.clientName} />,
                },
                {
                  accessorKey: "dueDate",
                  header: "Due Date",
                  cell: ({ row }) => (
                    <span className={cn("font-medium text-sm", row.original.daysRemaining <= 2 && "text-destructive")}>
                      {formatDate(row.original.dueDate)}
                      <span className="ml-1 text-xs">{formatDaysRemaining(row.original.daysRemaining)}</span>
                    </span>
                  ),
                },
                {
                  accessorKey: "priority",
                  header: "Priority",
                  cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
                },
              ]}
              getRowId={(row) => row.id}
              pageSize={15}
              emptyMessage="No upcoming deadlines"
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="mb-4 flex flex-wrap gap-1">
            {taskTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={taskFilter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTaskFilter(tab.id)}
                className="whitespace-nowrap"
              >
                {tab.label} <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs">{tab.count}</span>
              </Button>
            ))}
          </div>
          <DataTable
            data={taskFilter === "all" ? mockTasks : getTasksByStatus(taskFilter as TaskStatus)}
            columns={[
              {
                accessorKey: "title",
                header: "Task",
                cell: ({ row }) => <p className="font-medium text-sm">{row.original.title}</p>,
              },
              {
                accessorKey: "taskNumber",
                header: "ID",
                cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.taskNumber}</span>,
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }) => {
                  const client = mockClients.find((c) => c.id === row.original.clientId);
                  return client ? <ClientLink client={client} showStatus={true} /> : null;
                },
              },
              {
                accessorKey: "matterId",
                header: "Matter",
                cell: ({ row }) => {
                  const matter = mockMatters.find((m) => m.id === row.original.matterId);
                  return matter ? (
                    <MatterLink matter={matter} showStatus={false} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  );
                },
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
              },
              {
                accessorKey: "priority",
                header: "Priority",
                cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
              },
              {
                accessorKey: "dueDate",
                header: "Due Date",
                cell: ({ row }) => (
                  <span
                    className={cn(
                      "text-sm",
                      new Date(row.original.dueDate) < new Date() &&
                        row.original.status !== "completed" &&
                        "text-destructive",
                    )}
                  >
                    {formatDate(row.original.dueDate)}
                  </span>
                ),
              },
            ]}
            getRowId={(row) => row.id}
            pageSize={15}
            emptyMessage="No tasks"
            rowActions={[{ label: "View", action: (row) => router.push(`/dashboard/tasks/${row.id}`) }]}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="mb-4 flex flex-wrap gap-1">
            {complianceTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={complianceFilter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setComplianceFilter(tab.id)}
                className="whitespace-nowrap"
              >
                {tab.label} <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs">{tab.count}</span>
              </Button>
            ))}
          </div>
          {(() => {
            let complianceData: ComplianceCycle[];
            if (complianceFilter === "all") {
              complianceData = mockComplianceCycles;
            } else if (complianceFilter === "overdue") {
              complianceData = getOverdueComplianceCycles();
            } else if (complianceFilter === "pending") {
              complianceData = mockComplianceCycles.filter((c) =>
                c.missingDocuments.some((d) => d.isMandatory && !d.receivedAt),
              );
            } else {
              complianceData = mockComplianceCycles.filter(
                (c) => c.status === "in_review" || c.status === "ready_for_review",
              );
            }
            return (
              <DataTable<ComplianceCycle>
                data={complianceData}
                columns={[
                  {
                    accessorKey: "cycleNumber",
                    header: "Cycle",
                    cell: ({ row }) => (
                      <div>
                        <p className="font-medium text-sm">{row.original.cycleNumber}</p>
                        <p className="text-muted-foreground text-xs">{row.original.period.label}</p>
                      </div>
                    ),
                  },
                  {
                    accessorKey: "serviceType",
                    header: "Type",
                    cell: ({ row }) => (
                      <Badge variant="secondary" className="capitalize">
                        {row.original.serviceType.replace(/_/g, " ")}
                      </Badge>
                    ),
                  },
                  {
                    accessorKey: "clientId",
                    header: "Client",
                    cell: ({ row }) => {
                      const client = mockClients.find((c) => c.id === row.original.clientId);
                      return client ? <ClientLink client={client} showStatus={true} /> : null;
                    },
                  },
                  {
                    accessorKey: "status",
                    header: "Status",
                    cell: ({ row }) => <ComplianceStatusBadge status={row.original.status} />,
                  },
                  {
                    accessorKey: "dueDate",
                    header: "Due Date",
                    cell: ({ row }) => (
                      <span className={cn("font-medium text-sm", row.original.isOverdue && "text-destructive")}>
                        {formatDate(row.original.dueDate)}
                        {row.original.isOverdue && ` (${row.original.daysOverdue}d overdue)`}
                      </span>
                    ),
                  },
                ]}
                getRowId={(row) => row.id}
                pageSize={15}
                emptyMessage="No compliance cycles"
                rowActions={[
                  { label: "View", action: (row) => router.push(`/dashboard/compliance/${row.serviceType}/${row.id}`) },
                ]}
              />
            );
          })()}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <SectionCard title="Recent Activity">
            <ActivityTimeline
              activities={[
                ...mockTasks.slice(0, 5).map((t) => ({
                  id: `task-${t.id}`,
                  type: "task" as const,
                  title: `Task ${t.taskNumber}: ${t.title}`,
                  description: `Status: ${t.status.replace(/_/g, " ")} • Due: ${formatDate(t.dueDate)}`,
                  timestamp: t.updatedAt,
                  entityUrl: `/dashboard/tasks/${t.id}`,
                })),
                ...mockMatters.slice(0, 3).map((m) => ({
                  id: `matter-${m.id}`,
                  type: "matter" as const,
                  title: `Matter ${m.matterNumber}: ${m.name}`,
                  description: `Status: ${m.status.replace(/_/g, " ")} • Progress: ${m.progress}%`,
                  timestamp: m.updatedAt,
                  entityUrl: `/dashboard/matters/${m.id}`,
                })),
                ...mockCommunications.slice(0, 3).map((c) => ({
                  id: `comm-${c.id}`,
                  type: "communication" as const,
                  title: c.subject || c.content.slice(0, 60),
                  description: `${c.channel.toUpperCase()} • ${c.direction}`,
                  timestamp: c.sentAt || c.createdAt,
                  entityUrl: `/dashboard/communications/${c.id}`,
                })),
                ...mockComplianceCycles.slice(0, 2).map((c) => ({
                  id: `compliance-${c.id}`,
                  type: "compliance" as const,
                  title: `Compliance: ${c.serviceName}`,
                  description: `Status: ${c.status.replace(/_/g, " ")} • Due: ${formatDate(c.dueDate)}`,
                  timestamp: c.updatedAt,
                  entityUrl: `/dashboard/compliance/${c.serviceType}/${c.id}`,
                })),
              ]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 20)}
              maxItems={20}
              grouped
            />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
