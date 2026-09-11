import type { Notice } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const noticesApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Notice>>("/notices", params),

  get: (id: UUID) => api.get<Notice>(`/notices/${id}`),

  create: (data: Partial<Notice>) => api.post<Notice>("/notices", data),

  update: (id: UUID, data: Partial<Notice>) => api.patch<Notice>(`/notices/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/notices/${id}`),

  updateStatus: (id: UUID, status: Notice["status"]) => api.patch<Notice>(`/notices/${id}/status`, { status }),

  assign: (id: UUID, userId: UUID) => api.patch<Notice>(`/notices/${id}/assign`, { userId }),

  escalate: (id: UUID, level: number, reason: string) => api.post<Notice>(`/notices/${id}/escalate`, { level, reason }),

  addDocument: (noticeId: UUID, documentId: UUID, type: string, description?: string) =>
    api.post<void>(`/notices/${noticeId}/documents`, { documentId, type, description }),

  removeDocument: (noticeId: UUID, documentId: UUID) =>
    api.delete<void>(`/notices/${noticeId}/documents/${documentId}`),

  addTask: (noticeId: UUID, taskId: UUID) => api.post<void>(`/notices/${noticeId}/tasks`, { taskId }),

  removeTask: (noticeId: UUID, taskId: UUID) => api.delete<void>(`/notices/${noticeId}/tasks/${taskId}`),

  submitResponse: (id: UUID, data: { responseDraft: string; submissionReference: string }) =>
    api.post<Notice>(`/notices/${id}/submit-response`, data),

  addInternalNote: (id: UUID, note: string) => api.post<Notice>(`/notices/${id}/internal-notes`, { note }),

  getHistory: (id: UUID) =>
    api.get<Array<{ action: string; performedBy: string; performedAt: string; details: string }>>(
      `/notices/${id}/history`,
    ),
};
