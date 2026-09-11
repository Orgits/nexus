import type { DSCRegister, EngagementDocument, LicenseRegister, UDINRegister } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const registersApi = {
  getDSC: (params?: FilterParams) => api.get<PaginatedResponse<DSCRegister>>("/registers/dsc", params),

  getDSCById: (id: UUID) => api.get<DSCRegister>(`/registers/dsc/${id}`),

  createDSC: (data: Partial<DSCRegister>) => api.post<DSCRegister>("/registers/dsc", data),

  updateDSC: (id: UUID, data: Partial<DSCRegister>) => api.patch<DSCRegister>(`/registers/dsc/${id}`, data),

  deleteDSC: (id: UUID) => api.delete<void>(`/registers/dsc/${id}`),

  renewDSC: (id: UUID, data: { newExpiryDate: string; newSerialNumber?: string; renewalCost?: number }) =>
    api.post<DSCRegister>(`/registers/dsc/${id}/renew`, data),

  getUDIN: (params?: FilterParams) => api.get<PaginatedResponse<UDINRegister>>("/registers/udin", params),

  getUDINById: (id: UUID) => api.get<UDINRegister>(`/registers/udin/${id}`),

  createUDIN: (data: Partial<UDINRegister>) => api.post<UDINRegister>("/registers/udin", data),

  updateUDIN: (id: UUID, data: Partial<UDINRegister>) => api.patch<UDINRegister>(`/registers/udin/${id}`, data),

  deleteUDIN: (id: UUID) => api.delete<void>(`/registers/udin/${id}`),

  markUDINUsed: (id: UUID, data: { usedFor: string; usedAt: string }) =>
    api.post<UDINRegister>(`/registers/udin/${id}/mark-used`, data),

  getLicenses: (params?: FilterParams) => api.get<PaginatedResponse<LicenseRegister>>("/registers/licenses", params),

  getLicenseById: (id: UUID) => api.get<LicenseRegister>(`/registers/licenses/${id}`),

  createLicense: (data: Partial<LicenseRegister>) => api.post<LicenseRegister>("/registers/licenses", data),

  updateLicense: (id: UUID, data: Partial<LicenseRegister>) =>
    api.patch<LicenseRegister>(`/registers/licenses/${id}`, data),

  deleteLicense: (id: UUID) => api.delete<void>(`/registers/licenses/${id}`),

  renewLicense: (id: UUID, data: { newExpiryDate: string; renewalCost?: number; documents?: UUID[] }) =>
    api.post<LicenseRegister>(`/registers/licenses/${id}/renew`, data),

  getEngagementDocuments: (params?: FilterParams) =>
    api.get<PaginatedResponse<EngagementDocument>>("/registers/engagement-documents", params),

  getEngagementDocumentById: (id: UUID) => api.get<EngagementDocument>(`/registers/engagement-documents/${id}`),

  createEngagementDocument: (data: Partial<EngagementDocument>) =>
    api.post<EngagementDocument>("/registers/engagement-documents", data),

  updateEngagementDocument: (id: UUID, data: Partial<EngagementDocument>) =>
    api.patch<EngagementDocument>(`/registers/engagement-documents/${id}`, data),

  deleteEngagementDocument: (id: UUID) => api.delete<void>(`/registers/engagement-documents/${id}`),

  sendForSignature: (
    id: UUID,
    data: { signers: Array<{ name: string; email: string; role: string; order: number }> },
  ) => api.post<EngagementDocument>(`/registers/engagement-documents/${id}/send-for-signature`, data),

  sendReminder: (id: UUID, signerId?: UUID) =>
    api.post<void>(`/registers/engagement-documents/${id}/reminder`, { signerId }),

  downloadSigned: (id: UUID) =>
    api.get<Blob>(`/registers/engagement-documents/${id}/download-signed`, {
      headers: { Accept: "application/octet-stream" },
    }),
};
