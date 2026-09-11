import type { Client, ClientService, Contact, OnboardingItem, OnboardingStatus } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const clientsApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Client>>("/clients", params),

  get: (id: UUID) => api.get<Client>(`/clients/${id}`),

  create: (data: Partial<Client>) => api.post<Client>("/clients", data),

  update: (id: UUID, data: Partial<Client>) => api.patch<Client>(`/clients/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/clients/${id}`),

  bulkAction: (action: string, clientIds: UUID[], data?: unknown) =>
    api.post<{ success: number; failed: number }>("/clients/bulk", { action, clientIds, data }),

  getServices: (clientId: UUID) => api.get<ClientService[]>(`/clients/${clientId}/services`),

  addService: (clientId: UUID, data: Partial<ClientService>) =>
    api.post<ClientService>(`/clients/${clientId}/services`, data),

  updateService: (clientId: UUID, serviceId: UUID, data: Partial<ClientService>) =>
    api.patch<ClientService>(`/clients/${clientId}/services/${serviceId}`, data),

  removeService: (clientId: UUID, serviceId: UUID) => api.delete<void>(`/clients/${clientId}/services/${serviceId}`),

  getContacts: (clientId: UUID) => api.get<Contact[]>(`/clients/${clientId}/contacts`),

  addContact: (clientId: UUID, data: Partial<Contact>) => api.post<Contact>(`/clients/${clientId}/contacts`, data),

  updateContact: (clientId: UUID, contactId: UUID, data: Partial<Contact>) =>
    api.patch<Contact>(`/clients/${clientId}/contacts/${contactId}`, data),

  removeContact: (clientId: UUID, contactId: UUID) => api.delete<void>(`/clients/${clientId}/contacts/${contactId}`),

  getOnboardingStatus: (clientId: UUID) => api.get<OnboardingStatus>(`/clients/${clientId}/onboarding`),

  updateOnboardingItem: (clientId: UUID, itemId: string, data: Partial<OnboardingItem>) =>
    api.patch<OnboardingItem>(`/clients/${clientId}/onboarding/${itemId}`, data),

  completeOnboarding: (clientId: UUID) => api.post<OnboardingStatus>(`/clients/${clientId}/onboarding/complete`, {}),

  sendPortalInvitation: (clientId: UUID) => api.post<void>(`/clients/${clientId}/portal/invite`, {}),

  getMatters: (clientId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Client>>(`/clients/${clientId}/matters`, params),

  getCompliance: (clientId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Client>>(`/clients/${clientId}/compliance`, params),

  getTasks: (clientId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Client>>(`/clients/${clientId}/tasks`, params),

  getDocuments: (clientId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Client>>(`/clients/${clientId}/documents`, params),

  getCommunications: (clientId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Client>>(`/clients/${clientId}/communications`, params),

  getInvoices: (clientId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Client>>(`/clients/${clientId}/invoices`, params),

  getActivity: (clientId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Client>>(`/clients/${clientId}/activity`, params),
};
