import type { Expense, Invoice, InvoiceLineItem, Payment, TimeEntry } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const invoicesApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Invoice>>("/invoices", params),

  get: (id: UUID) => api.get<Invoice>(`/invoices/${id}`),

  create: (data: Partial<Invoice>) => api.post<Invoice>("/invoices", data),

  update: (id: UUID, data: Partial<Invoice>) => api.patch<Invoice>(`/invoices/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/invoices/${id}`),

  send: (id: UUID) => api.post<Invoice>(`/invoices/${id}/send`, {}),

  void: (id: UUID, reason: string) => api.post<Invoice>(`/invoices/${id}/void`, { reason }),

  addLineItem: (invoiceId: UUID, item: Partial<InvoiceLineItem>) =>
    api.post<InvoiceLineItem>(`/invoices/${invoiceId}/line-items`, item),

  updateLineItem: (invoiceId: UUID, itemId: UUID, item: Partial<InvoiceLineItem>) =>
    api.patch<InvoiceLineItem>(`/invoices/${invoiceId}/line-items/${itemId}`, item),

  removeLineItem: (invoiceId: UUID, itemId: UUID) => api.delete<void>(`/invoices/${invoiceId}/line-items/${itemId}`),

  generateFromTime: (data: {
    clientId: UUID;
    matterId?: UUID;
    startDate: string;
    endDate: string;
    billingMethod: string;
  }) => api.post<Invoice>("/invoices/generate-from-time", data),

  getPayments: (invoiceId: UUID) => api.get<Payment[]>(`/invoices/${invoiceId}/payments`),
};

export const paymentsApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Payment>>("/payments", params),

  get: (id: UUID) => api.get<Payment>(`/payments/${id}`),

  record: (data: Partial<Payment>) => api.post<Payment>("/payments", data),

  update: (id: UUID, data: Partial<Payment>) => api.patch<Payment>(`/payments/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/payments/${id}`),

  allocate: (paymentId: UUID, allocations: Array<{ invoiceId: UUID; amount: number }>) =>
    api.post<Payment>(`/payments/${paymentId}/allocate`, { allocations }),

  getOutstanding: (clientId: UUID) =>
    api.get<{ invoices: Invoice[]; totalOutstanding: number }>(`/payments/outstanding/${clientId}`),
};

export const expensesApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Expense>>("/expenses", params),

  get: (id: UUID) => api.get<Expense>(`/expenses/${id}`),

  create: (data: Partial<Expense>) => api.post<Expense>("/expenses", data),

  update: (id: UUID, data: Partial<Expense>) => api.patch<Expense>(`/expenses/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/expenses/${id}`),

  submit: (id: UUID) => api.post<Expense>(`/expenses/${id}/submit`, {}),

  approve: (id: UUID) => api.post<Expense>(`/expenses/${id}/approve`, {}),

  reject: (id: UUID, reason: string) => api.post<Expense>(`/expenses/${id}/reject`, { reason }),

  reimburse: (id: UUID, data: { paidDate: string; reference?: string }) =>
    api.post<Expense>(`/expenses/${id}/reimburse`, data),

  uploadReceipt: (id: UUID, file: File) => {
    const formData = new FormData();
    formData.append("receipt", file);
    return api.upload<{ receiptUrl: string }>(`/expenses/${id}/receipt`, formData);
  },
};

export const timeTrackingApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<TimeEntry>>("/time-entries", params),

  get: (id: UUID) => api.get<TimeEntry>(`/time-entries/${id}`),

  create: (data: Partial<TimeEntry>) => api.post<TimeEntry>("/time-entries", data),

  update: (id: UUID, data: Partial<TimeEntry>) => api.patch<TimeEntry>(`/time-entries/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/time-entries/${id}`),

  startTimer: (data: { matterId?: UUID; taskId?: UUID; description: string }) =>
    api.post<TimeEntry>("/time-entries/timer/start", data),

  stopTimer: (timeEntryId: UUID) => api.post<TimeEntry>(`/time-entries/${timeEntryId}/timer/stop`, {}),

  getActiveTimer: () => api.get<TimeEntry | null>("/time-entries/timer/active"),

  getWeeklyTimesheet: (userId: UUID, weekStart: string) =>
    api.get<TimeEntry[]>(`/time-entries/timesheet/${userId}`, { weekStart }),

  submitTimesheet: (userId: UUID, weekStart: string) =>
    api.post<void>(`/time-entries/timesheet/${userId}/submit`, { weekStart }),

  approveTimesheet: (userId: UUID, weekStart: string) =>
    api.post<void>(`/time-entries/timesheet/${userId}/approve`, { weekStart }),

  getSummary: (params?: FilterParams) => api.get<TimeSummary>(`/time-entries/summary`, params),
};

export interface TimeSummary {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  byMatter: Array<{ matterId: UUID; matterName: string; hours: number; billableHours: number }>;
  byTask: Array<{ taskId: UUID; taskTitle: string; hours: number }>;
  byUser: Array<{ userId: UUID; userName: string; hours: number; billableHours: number }>;
}
