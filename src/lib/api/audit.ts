import type { AuditEngagement, AuditQuery, ReviewNote, SignOff, Workpaper } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const auditApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<AuditEngagement>>("/audit", params),

  get: (id: UUID) => api.get<AuditEngagement>(`/audit/${id}`),

  create: (data: Partial<AuditEngagement>) => api.post<AuditEngagement>("/audit", data),

  update: (id: UUID, data: Partial<AuditEngagement>) => api.patch<AuditEngagement>(`/audit/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/audit/${id}`),

  updateStatus: (id: UUID, status: AuditEngagement["status"]) =>
    api.patch<AuditEngagement>(`/audit/${id}/status`, { status }),

  getWorkpapers: (engagementId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Workpaper>>(`/audit/${engagementId}/workpapers`, params),

  getWorkpaper: (engagementId: UUID, workpaperId: UUID) =>
    api.get<Workpaper>(`/audit/${engagementId}/workpapers/${workpaperId}`),

  createWorkpaper: (engagementId: UUID, data: Partial<Workpaper>) =>
    api.post<Workpaper>(`/audit/${engagementId}/workpapers`, data),

  updateWorkpaper: (engagementId: UUID, workpaperId: UUID, data: Partial<Workpaper>) =>
    api.patch<Workpaper>(`/audit/${engagementId}/workpapers/${workpaperId}`, data),

  deleteWorkpaper: (engagementId: UUID, workpaperId: UUID) =>
    api.delete<void>(`/audit/${engagementId}/workpapers/${workpaperId}`),

  submitWorkpaper: (engagementId: UUID, workpaperId: UUID) =>
    api.post<Workpaper>(`/audit/${engagementId}/workpapers/${workpaperId}/submit`, {}),

  reviewWorkpaper: (
    engagementId: UUID,
    workpaperId: UUID,
    data: { status: Workpaper["status"]; reviewNotes?: string },
  ) => api.patch<Workpaper>(`/audit/${engagementId}/workpapers/${workpaperId}/review`, data),

  signOffWorkpaper: (
    engagementId: UUID,
    workpaperId: UUID,
    data: { role: "preparer" | "reviewer" | "partner"; comments?: string },
  ) => api.post<Workpaper>(`/audit/${engagementId}/workpapers/${workpaperId}/sign-off`, data),

  getQueries: (engagementId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<AuditQuery>>(`/audit/${engagementId}/queries`, params),

  createQuery: (engagementId: UUID, data: Partial<AuditQuery>) =>
    api.post<AuditQuery>(`/audit/${engagementId}/queries`, data),

  updateQuery: (engagementId: UUID, queryId: UUID, data: Partial<AuditQuery>) =>
    api.patch<AuditQuery>(`/audit/${engagementId}/queries/${queryId}`, data),

  respondToQuery: (engagementId: UUID, queryId: UUID, response: string) =>
    api.post<AuditQuery>(`/audit/${engagementId}/queries/${queryId}/respond`, { response }),

  resolveQuery: (engagementId: UUID, queryId: UUID) =>
    api.post<AuditQuery>(`/audit/${engagementId}/queries/${queryId}/resolve`, {}),

  getReviewNotes: (engagementId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<ReviewNote>>(`/audit/${engagementId}/review-notes`, params),

  createReviewNote: (engagementId: UUID, data: Partial<ReviewNote>) =>
    api.post<ReviewNote>(`/audit/${engagementId}/review-notes`, data),

  updateReviewNote: (engagementId: UUID, noteId: UUID, data: Partial<ReviewNote>) =>
    api.patch<ReviewNote>(`/audit/${engagementId}/review-notes/${noteId}`, data),

  getSignOffs: (engagementId: UUID) => api.get<SignOff[]>(`/audit/${engagementId}/sign-offs`),

  createSignOff: (engagementId: UUID, data: Partial<SignOff>) =>
    api.post<SignOff>(`/audit/${engagementId}/sign-offs`, data),
};
