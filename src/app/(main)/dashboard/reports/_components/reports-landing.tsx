"use client";

import { useState } from "react";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clipboard,
  Clock,
  DollarSign,
  FileCheck,
  FileSearch,
  Loader2,
  Megaphone,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar } from "@/components/ca-nexus/filter-bar";
import { PageHeader, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatINR } from "@/lib/format";
import { mockClients } from "@/mock-data/clients";
import { mockCampaigns } from "@/mock-data/communications";
import { mockComplianceCycles } from "@/mock-data/compliance";
import { mockTeamWorkload } from "@/mock-data/dashboard";
import { mockNotices } from "@/mock-data/notices";
import { mockReviews } from "@/mock-data/reviews";
import { mockExpenses, mockInvoices } from "@/mock-data/time-billing";
import type { Report, ReportCategory } from "@/types";

const reportCategories: { value: ReportCategory; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "compliance",
    label: "Compliance",
    icon: <FileCheck className="h-5 w-5" />,
    description: "Filing status, deadlines, overdue returns",
  },
  {
    value: "notices_reviews",
    label: "Notices & Reviews",
    icon: <FileSearch className="h-5 w-5" />,
    description: "Notice tracking, review aging, responses",
  },
  {
    value: "communication",
    label: "Communication",
    icon: <Megaphone className="h-5 w-5" />,
    description: "Campaign performance, client responsiveness",
  },
  {
    value: "work",
    label: "Work & Productivity",
    icon: <Clipboard className="h-5 w-5" />,
    description: "Task completion, matter progress, workload",
  },
  {
    value: "finance",
    label: "Finance",
    icon: <DollarSign className="h-5 w-5" />,
    description: "Revenue, invoices, payments, expenses",
  },
  {
    value: "practice_health",
    label: "Practice Health",
    icon: <TrendingUp className="h-5 w-5" />,
    description: "Capacity, utilization, practice metrics",
  },
];

const reportTabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "compliance", label: "Compliance", icon: FileCheck },
  { id: "notices", label: "Notices & Reviews", icon: FileSearch },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "workload", label: "Workload", icon: Users },
  { id: "scheduled", label: "Scheduled", icon: Clock },
];

const reportStatuses = [
  { value: "generating", label: "Generating", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  { value: "ready", label: "Ready", icon: <CheckCircle className="h-3 w-3" /> },
  { value: "failed", label: "Failed", icon: <XCircle className="h-3 w-3" /> },
];

const generateComplianceMetrics = () => {
  const total = mockComplianceCycles.length;
  const completed = mockComplianceCycles.filter((c) => c.status === "completed" || c.status === "filed").length;
  const overdue = mockComplianceCycles.filter((c) => c.isOverdue).length;
  const pending = mockComplianceCycles.filter(
    (c) => c.status === "documents_pending" || c.status === "processing" || c.status === "ready_for_review",
  ).length;
  const notStarted = mockComplianceCycles.filter(
    (c) => c.status === "not_started" || c.status === "identification",
  ).length;

  return { total, completed, overdue, pending, notStarted };
};

const generateFinanceMetrics = () => {
  const totalInvoiced = mockInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = mockInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = mockInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);
  const overdueInvoices = mockInvoices.filter((i) => i.paymentStatus === "overdue").length;
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedExpenses = mockExpenses
    .filter((e) => e.status === "approved" || e.status === "reimbursed" || e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = mockExpenses
    .filter((e) => e.status === "submitted" || e.status === "draft")
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    totalInvoiced,
    totalPaid,
    totalOutstanding,
    overdueInvoices,
    totalExpenses,
    approvedExpenses,
    pendingExpenses,
  };
};

const generateWorkloadMetrics = () => {
  const totalUsers = mockTeamWorkload.length;
  const overloaded = mockTeamWorkload.filter((u) => u.isOverloaded).length;
  const underutilized = mockTeamWorkload.filter((u) => u.isUnderutilized).length;
  const optimal = totalUsers - overloaded - underutilized;
  const avgUtilization = Math.round(mockTeamWorkload.reduce((sum, u) => sum + u.utilization, 0) / totalUsers);
  const totalOpenTasks = mockTeamWorkload.reduce((sum, u) => sum + u.openTasks, 0);
  const totalOpenMatters = mockTeamWorkload.reduce((sum, u) => sum + u.openMatters, 0);

  return { totalUsers, overloaded, underutilized, optimal, avgUtilization, totalOpenTasks, totalOpenMatters };
};

const generateCommunicationMetrics = () => {
  const totalCampaigns = mockCampaigns.length;
  const sentCampaigns = mockCampaigns.filter((c) => c.status === "sent" || c.status === "completed").length;
  const totalSent = mockCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalDelivered = mockCampaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
  const totalOpened = mockCampaigns.reduce((sum, c) => sum + c.openedCount, 0);
  const totalClicked = mockCampaigns.reduce((sum, c) => sum + c.clickedCount, 0);
  const totalDocumentsReceived = mockCampaigns.reduce((sum, c) => sum + c.documentsReceived, 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0;

  return {
    totalCampaigns,
    sentCampaigns,
    totalSent,
    totalDelivered,
    totalOpened,
    totalClicked,
    totalDocumentsReceived,
    openRate,
    clickRate,
  };
};

const generateNoticeReviewMetrics = () => {
  const totalNotices = mockNotices.length;
  const urgentNotices = mockNotices.filter((n) => n.isUrgent).length;
  const overdueNotices = mockNotices.filter(
    (n) => new Date(n.responseDueDate) < new Date() && n.status !== "closed" && n.status !== "submitted",
  ).length;
  const noticesByStatus = mockNotices.reduce(
    (acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalReviews = mockReviews.length;
  const pendingReviews = mockReviews.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const overdueReviews = mockReviews.filter((r) => new Date(r.dueDate) < new Date() && r.status !== "completed").length;
  const reviewsByStatus = mockReviews.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalNotices,
    urgentNotices,
    overdueNotices,
    noticesByStatus,
    totalReviews,
    pendingReviews,
    overdueReviews,
    reviewsByStatus,
  };
};

export function ReportsLanding() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, _setSearch] = useState("");
  const [filters, _setFilters] = useState<Record<string, unknown>>({});

  const complianceMetrics = generateComplianceMetrics();
  const financeMetrics = generateFinanceMetrics();
  const workloadMetrics = generateWorkloadMetrics();
  const communicationMetrics = generateCommunicationMetrics();
  const noticeReviewMetrics = generateNoticeReviewMetrics();

  const mockReports: Report[] = [
    {
      id: "rpt-1",
      name: "Compliance Filing Status - Monthly",
      description: "Monthly compliance filing status across all clients and service types",
      category: "compliance",
      parameters: [
        {
          key: "month",
          label: "Month",
          type: "date",
          required: true,
          defaultValue: new Date().toISOString().split("T")[0],
        },
        {
          key: "serviceTypes",
          label: "Service Types",
          type: "multi_select",
          required: false,
          options: ["itr", "gst_monthly", "tds_24q", "mca_aoc4"].map((v) => ({ label: v, value: v })),
        },
      ],
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      generatedBy: "user-admin-001",
      status: "ready",
      fileUrl: "/reports/compliance-monthly-2024-07.pdf",
      schedule: {
        frequency: "monthly",
        recipients: ["user-partner-001", "user-manager-001"],
        format: "pdf",
        isActive: true,
      },
    },
    {
      id: "rpt-2",
      name: "Overdue Compliance Report",
      description: "All overdue compliance cycles with days overdue and responsible users",
      category: "compliance",
      parameters: [
        {
          key: "asOfDate",
          label: "As of Date",
          type: "date",
          required: true,
          defaultValue: new Date().toISOString().split("T")[0],
        },
      ],
      generatedAt: new Date().toISOString(),
      generatedBy: "user-admin-001",
      status: "ready",
      fileUrl: "/reports/overdue-compliance-2024-07-16.pdf",
      schedule: { frequency: "daily", recipients: ["user-partner-001"], format: "pdf", isActive: true },
    },
    {
      id: "rpt-3",
      name: "Notice Aging Report",
      description: "All active notices with aging, priority, and assigned users",
      category: "notices_reviews",
      parameters: [
        {
          key: "status",
          label: "Notice Status",
          type: "multi_select",
          required: false,
          options: ["received", "under_review", "response_drafting", "internal_review"].map((v) => ({
            label: v,
            value: v,
          })),
        },
      ],
      generatedAt: new Date(Date.now() - 172800000).toISOString(),
      generatedBy: "user-manager-001",
      status: "ready",
      fileUrl: "/reports/notice-aging-2024-07-14.pdf",
      schedule: {
        frequency: "weekly",
        recipients: ["user-partner-001", "user-manager-001"],
        format: "excel",
        isActive: true,
      },
    },
    {
      id: "rpt-4",
      name: "Review Aging Report",
      description: "Pending reviews with aging, stages, and assigned reviewers",
      category: "notices_reviews",
      parameters: [
        {
          key: "reviewType",
          label: "Review Type",
          type: "multi_select",
          required: false,
          options: ["compliance_filing", "financial_statement", "tax_return", "audit_workpaper"].map((v) => ({
            label: v,
            value: v,
          })),
        },
      ],
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      generatedBy: "user-manager-001",
      status: "ready",
      fileUrl: "/reports/review-aging-2024-07-15.pdf",
      schedule: { frequency: "weekly", recipients: ["user-partner-001"], format: "pdf", isActive: true },
    },
    {
      id: "rpt-5",
      name: "Campaign Performance Report",
      description: "Email/WhatsApp campaign performance with open/click rates and document collection",
      category: "communication",
      parameters: [
        {
          key: "dateRange",
          label: "Date Range",
          type: "date_range",
          required: true,
          defaultValue: { start: "2024-07-01", end: "2024-07-31" },
        },
        {
          key: "channel",
          label: "Channel",
          type: "select",
          required: false,
          options: ["email", "whatsapp", "sms"].map((v) => ({ label: v, value: v })),
        },
      ],
      generatedAt: new Date(Date.now() - 43200000).toISOString(),
      generatedBy: "user-manager-001",
      status: "ready",
      fileUrl: "/reports/campaign-performance-2024-07.pdf",
      schedule: { frequency: "monthly", recipients: ["user-partner-001"], format: "pdf", isActive: true },
    },
    {
      id: "rpt-6",
      name: "Client Responsiveness Report",
      description: "Client communication responsiveness, document submission times, follow-up tracking",
      category: "communication",
      parameters: [
        {
          key: "clientId",
          label: "Client",
          type: "select",
          required: false,
          options: mockClients.map((c) => ({ label: c.displayName || c.name, value: c.id })),
        },
        {
          key: "dateRange",
          label: "Date Range",
          type: "date_range",
          required: true,
          defaultValue: { start: "2024-07-01", end: "2024-07-31" },
        },
      ],
      generatedAt: new Date(Date.now() - 172800000).toISOString(),
      generatedBy: "user-admin-001",
      status: "generating",
      schedule: { frequency: "monthly", recipients: ["user-partner-001"], format: "excel", isActive: true },
    },
    {
      id: "rpt-7",
      name: "Workload & Capacity Report",
      description: "User and team workload with utilization, capacity, and task distribution",
      category: "work",
      parameters: [
        {
          key: "view",
          label: "View",
          type: "select",
          required: true,
          defaultValue: "user",
          options: [
            { label: "User", value: "user" },
            { label: "Team", value: "team" },
          ],
        },
        {
          key: "dateRange",
          label: "Date Range",
          type: "date_range",
          required: true,
          defaultValue: { start: "2024-07-01", end: "2024-07-31" },
        },
      ],
      generatedAt: new Date().toISOString(),
      generatedBy: "user-admin-001",
      status: "ready",
      fileUrl: "/reports/workload-capacity-2024-07-16.pdf",
      schedule: {
        frequency: "weekly",
        recipients: ["user-partner-001", "user-manager-001"],
        format: "pdf",
        isActive: true,
      },
    },
    {
      id: "rpt-8",
      name: "Task Productivity Report",
      description: "Task completion rates, estimated vs actual hours, overdue tasks by user/team",
      category: "work",
      parameters: [
        {
          key: "userId",
          label: "User",
          type: "select",
          required: false,
          options: mockTeamWorkload.map((u) => ({ label: u.userName, value: u.userId })),
        },
        {
          key: "dateRange",
          label: "Date Range",
          type: "date_range",
          required: true,
          defaultValue: { start: "2024-07-01", end: "2024-07-31" },
        },
      ],
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      generatedBy: "user-manager-001",
      status: "ready",
      fileUrl: "/reports/task-productivity-2024-07-15.pdf",
      schedule: { frequency: "weekly", recipients: ["user-manager-001"], format: "excel", isActive: false },
    },
    {
      id: "rpt-9",
      name: "Invoice Aging Report",
      description: "Outstanding invoices with aging buckets, client details, and payment history",
      category: "finance",
      parameters: [
        {
          key: "clientId",
          label: "Client",
          type: "select",
          required: false,
          options: mockClients.map((c) => ({ label: c.displayName || c.name, value: c.id })),
        },
        {
          key: "agingBuckets",
          label: "Aging Buckets",
          type: "multi_select",
          required: false,
          defaultValue: ["0-30", "31-60", "61-90", "90+"],
          options: ["0-30", "31-60", "61-90", "90+"].map((v) => ({ label: v, value: v })),
        },
      ],
      generatedAt: new Date().toISOString(),
      generatedBy: "user-admin-001",
      status: "ready",
      fileUrl: "/reports/invoice-aging-2024-07-16.pdf",
      schedule: {
        frequency: "daily",
        recipients: ["user-partner-001", "user-support-001"],
        format: "pdf",
        isActive: true,
      },
    },
    {
      id: "rpt-10",
      name: "Revenue & Collections Report",
      description: "Monthly revenue, collections, outstanding balances, and payment trends",
      category: "finance",
      parameters: [
        {
          key: "month",
          label: "Month",
          type: "date",
          required: true,
          defaultValue: new Date().toISOString().split("T")[0],
        },
        {
          key: "groupBy",
          label: "Group By",
          type: "select",
          required: true,
          defaultValue: "serviceType",
          options: [
            { label: "Service Type", value: "serviceType" },
            { label: "Client", value: "client" },
            { label: "Matter", value: "matter" },
          ],
        },
      ],
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      generatedBy: "user-admin-001",
      status: "ready",
      fileUrl: "/reports/revenue-collections-2024-07.pdf",
      schedule: { frequency: "monthly", recipients: ["user-partner-001"], format: "pdf", isActive: true },
    },
    {
      id: "rpt-11",
      name: "Expense Summary Report",
      description: "Expense breakdown by category, client, matter with approval and reimbursement status",
      category: "finance",
      parameters: [
        {
          key: "dateRange",
          label: "Date Range",
          type: "date_range",
          required: true,
          defaultValue: { start: "2024-07-01", end: "2024-07-31" },
        },
        {
          key: "category",
          label: "Category",
          type: "multi_select",
          required: false,
          options: ["travel", "meals", "office_supplies", "software", "professional_fees"].map((v) => ({
            label: v,
            value: v,
          })),
        },
      ],
      generatedAt: new Date(Date.now() - 172800000).toISOString(),
      generatedBy: "user-manager-001",
      status: "ready",
      fileUrl: "/reports/expense-summary-2024-07.pdf",
      schedule: { frequency: "monthly", recipients: ["user-partner-001"], format: "excel", isActive: true },
    },
    {
      id: "rpt-12",
      name: "Practice Health Dashboard",
      description: "Overall practice metrics: utilization, realization, client satisfaction, growth trends",
      category: "practice_health",
      parameters: [
        {
          key: "quarter",
          label: "Quarter",
          type: "select",
          required: true,
          defaultValue: "Q2-2024",
          options: ["Q1-2024", "Q2-2024", "Q3-2024", "Q4-2024"].map((v) => ({ label: v, value: v })),
        },
      ],
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      generatedBy: "user-partner-001",
      status: "ready",
      fileUrl: "/reports/practice-health-q2-2024.pdf",
      schedule: {
        frequency: "quarterly",
        recipients: ["user-partner-001", "user-partner-002"],
        format: "pdf",
        isActive: true,
      },
    },
  ];

  const filteredReports = mockReports.filter((report) => {
    if (
      search &&
      !report.name.toLowerCase().includes(search.toLowerCase()) &&
      !report.description?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (filters.category && report.category !== filters.category) return false;
    if (filters.status && report.status !== filters.status) return false;
    return true;
  });

  const reportsByCategory = filteredReports.reduce(
    (acc, report) => {
      if (!acc[report.category]) acc[report.category] = [];
      acc[report.category].push(report);
      return acc;
    },
    {} as Record<ReportCategory, Report[]>,
  );

  const categoryCounts = reportCategories.map((cat) => ({
    ...cat,
    count: reportsByCategory[cat.value]?.length || 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Generate, schedule, and view reports across all practice areas"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {reportTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ReportsOverviewTab
            complianceMetrics={complianceMetrics}
            financeMetrics={financeMetrics}
            workloadMetrics={workloadMetrics}
            communicationMetrics={communicationMetrics}
            noticeReviewMetrics={noticeReviewMetrics}
            categoryCounts={categoryCounts}
            recentReports={mockReports.slice(0, 5)}
            onTabChange={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ReportsCategoryTab
            category="compliance"
            reports={reportsByCategory.compliance || []}
            metrics={complianceMetrics}
          />
        </TabsContent>

        <TabsContent value="notices" className="space-y-6">
          <ReportsCategoryTab
            category="notices_reviews"
            reports={reportsByCategory.notices_reviews || []}
            metrics={noticeReviewMetrics}
          />
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <ReportsCategoryTab category="finance" reports={reportsByCategory.finance || []} metrics={financeMetrics} />
        </TabsContent>

        <TabsContent value="workload" className="space-y-6">
          <ReportsCategoryTab category="work" reports={reportsByCategory.work || []} metrics={workloadMetrics} />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <ScheduledReportsTab reports={mockReports} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportsOverviewTab({
  complianceMetrics,
  financeMetrics,
  workloadMetrics,
  communicationMetrics,
  noticeReviewMetrics,
  categoryCounts,
  recentReports,
  onTabChange,
}: {
  complianceMetrics: any;
  financeMetrics: any;
  workloadMetrics: any;
  communicationMetrics: any;
  noticeReviewMetrics: any;
  categoryCounts: any[];
  recentReports: Report[];
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatTile
          label="Total Compliance"
          value={complianceMetrics.total}
          icon={<FileCheck className="h-5 w-5 text-blue-600" />}
          hint={`${complianceMetrics.completed} completed • ${complianceMetrics.overdue} overdue`}
        />
        <StatTile
          label="Revenue (MTD)"
          value={formatINR(financeMetrics.totalInvoiced)}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          hint={`Collected: ${formatINR(financeMetrics.totalPaid)} • Outstanding: ${formatINR(financeMetrics.totalOutstanding)}`}
        />
        <StatTile
          label="Team Utilization"
          value={`${workloadMetrics.avgUtilization}%`}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          hint={`${workloadMetrics.optimal} optimal • ${workloadMetrics.overloaded} overloaded • ${workloadMetrics.underutilized} underutilized`}
        />
        <StatTile
          label="Campaign Reach"
          value={communicationMetrics.totalSent.toLocaleString()}
          icon={<Megaphone className="h-5 w-5 text-orange-600" />}
          hint={`Open: ${communicationMetrics.openRate}% • Click: ${communicationMetrics.clickRate}%`}
        />
        <StatTile
          label="Active Notices"
          value={noticeReviewMetrics.totalNotices}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          hint={`${noticeReviewMetrics.urgentNotices} urgent • ${noticeReviewMetrics.overdueNotices} overdue`}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoryCounts.map((cat) => (
          <Card key={cat.value} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">{cat.icon}</div>
                  <div>
                    <CardTitle className="text-base">{cat.label}</CardTitle>
                    <CardDescription className="text-xs">{cat.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{cat.count} reports</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" size="sm" className="w-full" onClick={() => onTabChange(cat.value)}>
                View Reports
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionCard title="Recent Reports">
        <DataTable<Report>
          data={recentReports}
          columns={
            [
              {
                accessorKey: "name",
                header: "Report Name",
                cell: ({ row }: { row: { original: Report } }) => (
                  <div>
                    <p className="font-medium text-sm">{row.original.name}</p>
                    <p className="line-clamp-1 text-muted-foreground text-xs">{row.original.description}</p>
                  </div>
                ),
              },
              {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }: { row: { original: Report } }) => (
                  <Badge variant="secondary">{row.original.category.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Report } }) => (
                  <span className="flex items-center gap-1.5">
                    {reportStatuses.find((s) => s.value === row.original.status)?.icon}
                    <span className="text-sm capitalize">{row.original.status}</span>
                  </span>
                ),
              },
              {
                accessorKey: "generatedAt",
                header: "Generated",
                cell: ({ row }: { row: { original: Report } }) => (
                  <span className="text-sm">
                    {row.original.generatedAt ? formatDate(row.original.generatedAt.split("T")[0]) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "schedule",
                header: "Schedule",
                cell: ({ row }: { row: { original: Report } }) => (
                  <Badge variant={row.original.schedule?.isActive ? "default" : "secondary"}>
                    {row.original.schedule ? `${row.original.schedule.frequency}` : "Manual"}
                  </Badge>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={5}
          emptyMessage="No recent reports"
        />
      </SectionCard>
    </div>
  );
}

function ReportsCategoryTab({
  category,
  reports,
  metrics,
}: {
  category: ReportCategory;
  reports: Report[];
  metrics: any;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredReports = reports.filter((report) => {
    if (
      search &&
      !report.name.toLowerCase().includes(search.toLowerCase()) &&
      !report.description?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter && report.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-xl capitalize">{category.replace(/_/g, " ")} Reports</h2>
          <p className="text-muted-foreground text-sm">{reports.length} report(s) in this category</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterBar
            filters={[
              {
                key: "status",
                label: "Status",
                type: "select",
                options: reportStatuses.map((s) => ({ value: s.value, label: s.label })),
              },
            ]}
            values={{ search, status: statusFilter }}
            searchPlaceholder="Search reports..."
            onSearch={setSearch}
            onChange={(values) => {
              const { search: s, ...rest } = values;
              if (typeof s === "string") setSearch(s);
              if (rest.status) setStatusFilter(rest.status as string);
            }}
            compact
          />
        </div>
      </div>

      {filteredReports.length > 0 ? (
        <DataTable<Report>
          data={filteredReports}
          columns={
            [
              {
                accessorKey: "name",
                header: "Report Name",
                cell: ({ row }: { row: { original: Report } }) => (
                  <div>
                    <p className="font-medium text-sm">{row.original.name}</p>
                    <p className="line-clamp-1 text-muted-foreground text-xs">{row.original.description}</p>
                  </div>
                ),
              },
              {
                accessorKey: "parameters",
                header: "Parameters",
                cell: ({ row }: { row: { original: Report } }) => (
                  <div className="flex flex-wrap gap-1">
                    {row.original.parameters.slice(0, 3).map((p, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {p.label}
                      </Badge>
                    ))}
                    {row.original.parameters.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{row.original.parameters.length - 3} more
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Report } }) => (
                  <span className="flex items-center gap-1.5">
                    {reportStatuses.find((s) => s.value === row.original.status)?.icon}
                    <span className="text-sm capitalize">{row.original.status}</span>
                  </span>
                ),
              },
              {
                accessorKey: "generatedAt",
                header: "Last Generated",
                cell: ({ row }: { row: { original: Report } }) => (
                  <span className="text-sm">
                    {row.original.generatedAt ? formatDate(row.original.generatedAt.split("T")[0]) : "Never"}
                  </span>
                ),
              },
              {
                accessorKey: "schedule",
                header: "Schedule",
                cell: ({ row }: { row: { original: Report } }) => (
                  <div className="flex items-center gap-2">
                    <Badge variant={row.original.schedule?.isActive ? "default" : "secondary"}>
                      {row.original.schedule ? row.original.schedule.frequency : "Manual"}
                    </Badge>
                    {row.original.schedule?.isActive && <span className="text-green-600 text-xs">●</span>}
                  </div>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No reports match your search or filters"
          rowActions={[{ label: "View", action: (r: Report) => alert(`View report ${r.name}`) }]}
        />
      ) : (
        <EmptyState
          icon={<BarChart3 className="h-12 w-12 text-muted-foreground/50" />}
          title="No reports found"
          description={
            search || statusFilter ? "Try adjusting your search or filters" : "No reports in this category yet"
          }
        />
      )}
    </div>
  );
}

function ScheduledReportsTab({ reports }: { reports: Report[] }) {
  const scheduledReports = reports.filter((r) => r.schedule?.isActive);
  const manualReports = reports.filter((r) => !r.schedule?.isActive);

  return (
    <div className="space-y-6">
      <SectionCard title="Scheduled Reports">
        {scheduledReports.length > 0 ? (
          <DataTable<Report>
            data={scheduledReports}
            columns={
              [
                {
                  accessorKey: "name",
                  header: "Report Name",
                  cell: ({ row }: { row: { original: Report } }) => (
                    <p className="font-medium text-sm">{row.original.name}</p>
                  ),
                },
                {
                  accessorKey: "schedule",
                  header: "Frequency",
                  cell: ({ row }: { row: { original: Report } }) => (
                    <Badge variant="default">{row.original.schedule?.frequency}</Badge>
                  ),
                },
                {
                  accessorKey: "schedule",
                  header: "Format",
                  cell: ({ row }: { row: { original: Report } }) => (
                    <span className="text-sm capitalize">{row.original.schedule?.format}</span>
                  ),
                },
                {
                  accessorKey: "schedule",
                  header: "Recipients",
                  cell: ({ row }: { row: { original: Report } }) => (
                    <span className="text-sm">{row.original.schedule?.recipients?.length || 0} recipient(s)</span>
                  ),
                },
                {
                  accessorKey: "generatedAt",
                  header: "Last Generated",
                  cell: ({ row }: { row: { original: Report } }) => (
                    <span className="text-sm">
                      {row.original.generatedAt ? formatDate(row.original.generatedAt.split("T")[0]) : "Never"}
                    </span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No scheduled reports"
          />
        ) : (
          <EmptyState
            icon={<Clock className="h-12 w-12 text-muted-foreground/50" />}
            title="No scheduled reports"
            description="Reports with active schedules will appear here"
          />
        )}
      </SectionCard>

      <SectionCard title="Manual Reports">
        {manualReports.length > 0 ? (
          <DataTable<Report>
            data={manualReports}
            columns={
              [
                {
                  accessorKey: "name",
                  header: "Report Name",
                  cell: ({ row }: { row: { original: Report } }) => (
                    <p className="font-medium text-sm">{row.original.name}</p>
                  ),
                },
                {
                  accessorKey: "category",
                  header: "Category",
                  cell: ({ row }: { row: { original: Report } }) => (
                    <Badge variant="secondary">{row.original.category.replace(/_/g, " ")}</Badge>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: Report } }) => (
                    <span className="flex items-center gap-1.5">
                      {reportStatuses.find((s) => s.value === row.original.status)?.icon}
                      <span className="text-sm capitalize">{row.original.status}</span>
                    </span>
                  ),
                },
                {
                  accessorKey: "generatedAt",
                  header: "Last Generated",
                  cell: ({ row }: { row: { original: Report } }) => (
                    <span className="text-sm">
                      {row.original.generatedAt ? formatDate(row.original.generatedAt.split("T")[0]) : "Never"}
                    </span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No manual reports"
          />
        ) : (
          <EmptyState
            icon={<FileSearch className="h-12 w-12 text-muted-foreground/50" />}
            title="No manual reports"
            description="Manually generated reports will appear here"
          />
        )}
      </SectionCard>
    </div>
  );
}
