import type { ChecklistItem, Matter, Subtask, Task } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const mattersApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Matter>>("/matters", params),

  get: (id: UUID) => api.get<Matter>(`/matters/${id}`),

  create: (data: Partial<Matter>) => api.post<Matter>("/matters", data),

  update: (id: UUID, data: Partial<Matter>) => api.patch<Matter>(`/matters/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/matters/${id}`),

  bulkAction: (action: string, matterIds: UUID[], data?: unknown) =>
    api.post<{ success: number; failed: number }>("/matters/bulk", { action, matterIds, data }),

  updateStage: (id: UUID, stage: Matter["stage"], notes?: string) =>
    api.patch<Matter>(`/matters/${id}/stage`, { stage, notes }),

  getTasks: (matterId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Task>>(`/matters/${matterId}/tasks`, params),

  createTask: (matterId: UUID, data: Partial<Task>) => api.post<Task>(`/matters/${matterId}/tasks`, data),

  getDocuments: (matterId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Matter>>(`/matters/${matterId}/documents`, params),

  getCommunications: (matterId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Matter>>(`/matters/${matterId}/communications`, params),

  getTimeEntries: (matterId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Matter>>(`/matters/${matterId}/time-entries`, params),

  getBilling: (matterId: UUID) => api.get<Matter>(`/matters/${matterId}/billing`),

  getActivity: (matterId: UUID, params?: FilterParams) =>
    api.get<PaginatedResponse<Matter>>(`/matters/${matterId}/activity`, params),
};

export const tasksApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<Task>>("/tasks", params),

  get: (id: UUID) => api.get<Task>(`/tasks/${id}`),

  create: (data: Partial<Task>) => api.post<Task>("/tasks", data),

  update: (id: UUID, data: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/tasks/${id}`),

  bulkAction: (action: string, taskIds: UUID[], data?: unknown) =>
    api.post<{ success: number; failed: number }>("/tasks/bulk", { action, taskIds, data }),

  updateStatus: (id: UUID, status: Task["status"]) => api.patch<Task>(`/tasks/${id}/status`, { status }),

  reassign: (id: UUID, userId: UUID, teamId?: UUID) => api.patch<Task>(`/tasks/${id}/reassign`, { userId, teamId }),

  addComment: (id: UUID, content: string, isInternal = false) =>
    api.post<Task>(`/tasks/${id}/comments`, { content, isInternal }),

  getSubtasks: (taskId: UUID) => api.get<Subtask[]>(`/tasks/${taskId}/subtasks`),

  createSubtask: (taskId: UUID, data: Partial<Subtask>) => api.post<Subtask>(`/tasks/${taskId}/subtasks`, data),

  updateSubtask: (taskId: UUID, subtaskId: UUID, data: Partial<Subtask>) =>
    api.patch<Subtask>(`/tasks/${taskId}/subtasks/${subtaskId}`, data),

  deleteSubtask: (taskId: UUID, subtaskId: UUID) => api.delete<void>(`/tasks/${taskId}/subtasks/${subtaskId}`),

  getChecklistItems: (taskId: UUID) => api.get<ChecklistItem[]>(`/tasks/${taskId}/checklist`),

  updateChecklistItem: (taskId: UUID, itemId: UUID, data: Partial<ChecklistItem>) =>
    api.patch<ChecklistItem>(`/tasks/${taskId}/checklist/${itemId}`, data),

  startTimer: (taskId: UUID) => api.post<Task>(`/tasks/${taskId}/timer/start`, {}),

  stopTimer: (taskId: UUID) => api.post<Task>(`/tasks/${taskId}/timer/stop`, {}),

  logTime: (taskId: UUID, data: { durationMinutes: number; description: string; date: string }) =>
    api.post<Task>(`/tasks/${taskId}/time-entries`, data),

  submitForReview: (id: UUID) => api.post<Task>(`/tasks/${id}/submit-review`, {}),
};
