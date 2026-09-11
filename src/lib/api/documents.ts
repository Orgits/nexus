import type { Document, DocumentRequest } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const documentsApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Document>>("/documents", params),

  get: (id: UUID) => api.get<Document>(`/documents/${id}`),

  upload: (file: File, metadata: Partial<Document>) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    return api.upload<Document>("/documents", formData);
  },

  update: (id: UUID, data: Partial<Document>) => api.patch<Document>(`/documents/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/documents/${id}`),

  bulkAction: (action: string, documentIds: UUID[], data?: unknown) =>
    api.post<{ success: number; failed: number }>("/documents/bulk", { action, documentIds, data }),

  getPreview: (id: UUID) =>
    api.get<{ url: string; type: "pdf" | "image" | "text" | "other" }>(`/documents/${id}/preview`),

  download: (id: UUID) =>
    api.get<Blob>(`/documents/${id}/download`, { headers: { Accept: "application/octet-stream" } }),

  getVersions: (id: UUID) => api.get<Document[]>(`/documents/${id}/versions`),

  restoreVersion: (id: UUID, versionId: UUID) =>
    api.post<Document>(`/documents/${id}/versions/${versionId}/restore`, {}),

  requestReview: (id: UUID, reviewerId: UUID, notes?: string) =>
    api.post<void>(`/documents/${id}/review-request`, { reviewerId, notes }),

  linkToMatter: (id: UUID, matterId: UUID) => api.post<void>(`/documents/${id}/link-matter`, { matterId }),

  linkToComplianceCycle: (id: UUID, cycleId: UUID) => api.post<void>(`/documents/${id}/link-compliance`, { cycleId }),

  unlink: (id: UUID, entityType: "matter" | "compliance_cycle", entityId: UUID) =>
    api.delete<void>(`/documents/${id}/unlink/${entityType}/${entityId}`),

  getRequests: (params?: FilterParams) => api.get<PaginatedResponse<DocumentRequest>>("/document-requests", params),

  createRequest: (data: Partial<DocumentRequest>) => api.post<DocumentRequest>("/document-requests", data),

  updateRequest: (id: UUID, data: Partial<DocumentRequest>) =>
    api.patch<DocumentRequest>(`/document-requests/${id}`, data),

  sendRequest: (id: UUID) => api.post<DocumentRequest>(`/document-requests/${id}/send`, {}),

  sendReminder: (id: UUID) => api.post<DocumentRequest>(`/document-requests/${id}/reminder`, {}),

  closeRequest: (id: UUID) => api.post<DocumentRequest>(`/document-requests/${id}/close`, {}),
};
