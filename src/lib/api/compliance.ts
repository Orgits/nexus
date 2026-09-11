import type { CampaignSummary, ComplianceCycle, DocumentRequest, MissingDocument } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const complianceApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<ComplianceCycle>>("/compliance", params),

  get: (id: UUID) => api.get<ComplianceCycle>(`/compliance/${id}`),

  getOverview: (params?: FilterParams) => api.get<ComplianceOverview>(`/compliance/overview`, params),

  getITR: (params?: FilterParams) => api.get<PaginatedResponse<ComplianceCycle>>("/compliance/itr", params),

  getGST: (params?: FilterParams) => api.get<PaginatedResponse<ComplianceCycle>>("/compliance/gst", params),

  getTDS: (params?: FilterParams) => api.get<PaginatedResponse<ComplianceCycle>>("/compliance/tds", params),

  getMCA: (params?: FilterParams) => api.get<PaginatedResponse<ComplianceCycle>>("/compliance/mca-roc", params),

  bulkAction: (action: string, cycleIds: UUID[], data?: unknown) =>
    api.post<{ success: number; failed: number }>("/compliance/bulk", { action, cycleIds, data }),

  sendOutreach: (cycleIds: UUID[], campaignData: { templateId: UUID; channels: string[] }) =>
    api.post<CampaignSummary[]>("/compliance/outreach", { cycleIds, ...campaignData }),

  requestDocuments: (cycleId: UUID, items: Partial<DocumentRequest>["items"]) =>
    api.post<DocumentRequest>(`/compliance/${cycleId}/documents/request`, { items }),

  getMissingDocuments: (cycleId: UUID) => api.get<MissingDocument[]>(`/compliance/${cycleId}/documents/missing`),

  updateFilingStatus: (cycleId: UUID, status: ComplianceCycle["status"], acknowledgmentNumber?: string) =>
    api.patch<ComplianceCycle>(`/compliance/${cycleId}/filing-status`, { status, acknowledgmentNumber }),

  overrideDueDate: (periodId: UUID, newDueDate: string, reason: string) =>
    api.post<void>(`/compliance/periods/${periodId}/override-due-date`, { newDueDate, reason }),

  getRules: (params?: FilterParams) => api.get<PaginatedResponse<ComplianceRule>>("/compliance/rules", params),

  createRule: (data: Partial<ComplianceRule>) => api.post<ComplianceRule>("/compliance/rules", data),

  updateRule: (id: UUID, data: Partial<ComplianceRule>) => api.patch<ComplianceRule>(`/compliance/rules/${id}`, data),

  deleteRule: (id: UUID) => api.delete<void>(`/compliance/rules/${id}`),
};

export interface ComplianceOverview {
  dueSoon: number;
  overdue: number;
  pendingDocuments: number;
  readyForReview: number;
  completed: number;
  byServiceType: Record<string, { total: number; pending: number; overdue: number; completed: number }>;
  byPeriod: Record<string, { total: number; pending: number; overdue: number; completed: number }>;
}

export interface ComplianceRule {
  id: UUID;
  name: string;
  serviceType: string;
  frequency: string;
  applicabilityCriteria: Record<string, unknown>;
  dueDateRule: Record<string, unknown>;
  checklistTemplateId?: UUID;
  documentRequestTemplateId?: UUID;
  reminderTemplateId?: UUID;
  reviewStages: ReviewStageConfig[];
  completionRules: Record<string, unknown>;
  isActive: boolean;
}

export interface ReviewStageConfig {
  stageNumber: number;
  name: string;
  reviewerRole: string;
  reviewerAssignment: "specific" | "role_based" | "round_robin";
  specificReviewerId?: UUID;
  isMandatory: boolean;
  slaDays?: number;
}
