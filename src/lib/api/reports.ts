import type { Report } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const reportsApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Report>>("/reports", params),

  get: (id: UUID) => api.get<Report>(`/reports/${id}`),

  generate: (reportId: UUID, parameters: Record<string, unknown>) =>
    api.post<Report>(`/reports/${reportId}/generate`, { parameters }),

  download: (id: UUID, format: "pdf" | "excel" | "csv" = "pdf") =>
    api.get<Blob>(`/reports/${id}/download`, {
      params: { format },
      headers: { Accept: "application/octet-stream" },
    }),

  schedule: (reportId: UUID, schedule: Report["schedule"]) =>
    api.patch<Report>(`/reports/${reportId}/schedule`, { schedule }),

  getComplianceReports: (params?: FilterParams) => api.get<PaginatedResponse<Report>>("/reports/compliance", params),

  getFinanceReports: (params?: FilterParams) => api.get<PaginatedResponse<Report>>("/reports/finance", params),

  getWorkReports: (params?: FilterParams) => api.get<PaginatedResponse<Report>>("/reports/work", params),

  getCommunicationReports: (params?: FilterParams) =>
    api.get<PaginatedResponse<Report>>("/reports/communication", params),

  getPracticeHealthReports: (params?: FilterParams) =>
    api.get<PaginatedResponse<Report>>("/reports/practice-health", params),

  getDashboardMetrics: (params?: FilterParams) => api.get<DashboardMetrics>("/reports/dashboard-metrics", params),

  getWorkloadReport: (params?: FilterParams) => api.get<WorkloadReport>(`/reports/workload`, params),

  getProductivityReport: (params?: FilterParams) => api.get<ProductivityReport>(`/reports/productivity`, params),

  getRevenueReport: (params?: FilterParams) => api.get<RevenueReport>(`/reports/revenue`, params),
};

export interface DashboardMetrics {
  criticalDeadlines: number;
  myTasks: number;
  pendingCompliance: number;
  missingInformation: number;
  pendingReviews: number;
  paymentsDue: number;
  urgentWork: UrgentWorkItem[];
  teamWorkload: TeamWorkload[];
  invoiceSummary: InvoiceSummary;
  complianceStatus: ComplianceStatusSummary;
}

export interface UrgentWorkItem {
  id: UUID;
  type: "task" | "compliance" | "notice" | "review";
  title: string;
  clientName: string;
  matterName?: string;
  dueDate: string;
  daysOverdue: number;
  priority: "low" | "medium" | "high" | "critical" | "urgent";
  assigneeName: string;
}

export interface TeamWorkload {
  userId: UUID;
  userName: string;
  openTasks: number;
  openMatters: number;
  estimatedHours: number;
  actualHours: number;
  capacity: number;
  utilization: number;
  isOverloaded: boolean;
}

export interface InvoiceSummary {
  totalOutstanding: number;
  overdueAmount: number;
  dueThisWeek: number;
  paidThisMonth: number;
  invoicesCount: number;
}

export interface ComplianceStatusSummary {
  itr: { pending: number; overdue: number; completed: number };
  gst: { pending: number; overdue: number; completed: number };
  tds: { pending: number; overdue: number; completed: number };
  mca: { pending: number; overdue: number; completed: number };
}

export interface WorkloadReport {
  byUser: Array<{
    userId: UUID;
    userName: string;
    role: string;
    openTasks: number;
    openMatters: number;
    estimatedHours: number;
    actualHours: number;
    capacityHours: number;
    utilization: number;
    upcomingDeadlines: number;
  }>;
  byTeam: Array<{
    teamId: UUID;
    teamName: string;
    memberCount: number;
    totalCapacity: number;
    totalAllocated: number;
    utilization: number;
  }>;
  overloadUsers: UUID[];
  underutilizedUsers: UUID[];
}

export interface ProductivityReport {
  period: { start: string; end: string };
  totalTasksCompleted: number;
  totalMattersCompleted: number;
  averageCompletionTime: number;
  onTimeCompletionRate: number;
  byUser: Array<{
    userId: UUID;
    userName: string;
    tasksCompleted: number;
    mattersCompleted: number;
    hoursLogged: number;
    billableHours: number;
    efficiency: number;
  }>;
  byServiceType: Array<{
    serviceType: string;
    mattersCompleted: number;
    averageHours: number;
    onTimeRate: number;
  }>;
}

export interface RevenueReport {
  period: { start: string; end: string };
  totalInvoiced: number;
  totalCollected: number;
  outstandingReceivables: number;
  averageCollectionDays: number;
  byClient: Array<{
    clientId: UUID;
    clientName: string;
    invoiced: number;
    collected: number;
    outstanding: number;
  }>;
  byServiceType: Array<{
    serviceType: string;
    invoiced: number;
    collected: number;
  }>;
  aging: Array<{ bucket: string; amount: number; count: number }>;
}
