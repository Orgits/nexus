import type {
  Campaign,
  CampaignAudience,
  CampaignTemplate,
  Communication,
  Conversation,
  TemplateVariable,
} from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const communicationsApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Communication>>("/communications", params),

  get: (id: UUID) => api.get<Communication>(`/communications/${id}`),

  send: (data: Partial<Communication>) => api.post<Communication>("/communications", data),

  reply: (id: UUID, data: { content: string; attachments?: UUID[] }) =>
    api.post<Communication>(`/communications/${id}/reply`, data),

  forward: (id: UUID, data: { to: string[]; content?: string }) =>
    api.post<Communication>(`/communications/${id}/forward`, data),

  convertToTask: (
    id: UUID,
    taskData: { title: string; description?: string; matterId?: UUID; priority?: string; dueDate: string },
  ) => api.post<{ taskId: UUID }>(`/communications/${id}/convert-to-task`, taskData),

  linkClient: (id: UUID, clientId: UUID) => api.post<void>(`/communications/${id}/link-client`, { clientId }),

  linkMatter: (id: UUID, matterId: UUID) => api.post<void>(`/communications/${id}/link-matter`, { matterId }),

  addInternalNote: (id: UUID, note: string) =>
    api.post<Communication>(`/communications/${id}/internal-notes`, { note }),

  getAttachments: (id: UUID) => api.get<Communication["attachments"]>(`/communications/${id}/attachments`),

  captureAttachment: (communicationId: UUID, attachmentId: UUID, documentData: Partial<import("@/types").Document>) =>
    api.post<import("@/types").Document>(
      `/communications/${communicationId}/attachments/${attachmentId}/capture`,
      documentData,
    ),
};

export const conversationsApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Conversation>>("/conversations", params),

  get: (id: UUID) => api.get<Conversation>(`/conversations/${id}`),

  getMessages: (conversationId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Communication>>(`/conversations/${conversationId}/messages`, params),

  create: (data: Partial<Conversation>) => api.post<Conversation>("/conversations", data),

  archive: (id: UUID) => api.patch<Conversation>(`/conversations/${id}/archive`, { isArchived: true }),

  unarchive: (id: UUID) => api.patch<Conversation>(`/conversations/${id}/archive`, { isArchived: false }),
};

export const campaignsApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Campaign>>("/campaigns", params),

  get: (id: UUID) => api.get<Campaign>(`/campaigns/${id}`),

  create: (data: Partial<Campaign>) => api.post<Campaign>("/campaigns", data),

  update: (id: UUID, data: Partial<Campaign>) => api.patch<Campaign>(`/campaigns/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/campaigns/${id}`),

  duplicate: (id: UUID) => api.post<Campaign>(`/campaigns/${id}/duplicate`, {}),

  previewAudience: (audience: CampaignAudience) =>
    api.post<{ clients: Array<{ id: UUID; name: string; email?: string; phone?: string }>; estimatedCount: number }>(
      "/campaigns/preview-audience",
      audience,
    ),

  previewMessage: (template: CampaignTemplate, sampleData: Record<string, string>) =>
    api.post<{ subject?: string; content: string }>("/campaigns/preview-message", { template, sampleData }),

  schedule: (id: UUID, schedule: Campaign["schedule"]) => api.post<Campaign>(`/campaigns/${id}/schedule`, { schedule }),

  send: (id: UUID) => api.post<Campaign>(`/campaigns/${id}/send`, {}),

  pause: (id: UUID) => api.post<Campaign>(`/campaigns/${id}/pause`, {}),

  cancel: (id: UUID) => api.post<Campaign>(`/campaigns/${id}/cancel`, {}),

  getResults: (id: UUID) => api.get<CampaignResults>(`/campaigns/${id}/results`),

  getDeliveryReport: (id: UUID) => api.get<DeliveryReport[]>(`/campaigns/${id}/delivery-report`),

  getTemplates: (channel?: string) => api.get<CampaignTemplate[]>(`/campaigns/templates`, { channel }),

  createTemplate: (data: Partial<CampaignTemplate>) => api.post<CampaignTemplate>("/campaigns/templates", data),

  updateTemplate: (id: UUID, data: Partial<CampaignTemplate>) =>
    api.patch<CampaignTemplate>(`/campaigns/templates/${id}`, data),

  deleteTemplate: (id: UUID) => api.delete<void>(`/campaigns/templates/${id}`),

  getVariables: () => api.get<TemplateVariable[]>("/campaigns/variables"),
};

export interface CampaignResults {
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  replied: number;
  documentsReceived: number;
  tasksCreated: number;
  complianceProgress: number;
  byChannel: Record<string, { sent: number; delivered: number; failed: number }>;
  timeline: Array<{ date: string; sent: number; delivered: number; responses: number }>;
}

export interface DeliveryReport {
  clientId: UUID;
  clientName: string;
  channel: string;
  status: "sent" | "delivered" | "failed" | "bounced" | "read" | "replied";
  sentAt: string;
  deliveredAt?: string;
  errorMessage?: string;
}
