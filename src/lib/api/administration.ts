import type { Department, FirmSettings, Permission, Team, User } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const administrationApi = {
  getFirmSettings: () => api.get<FirmSettings>("/administration/firm-settings"),

  updateFirmSettings: (data: Partial<FirmSettings>) => api.patch<FirmSettings>("/administration/firm-settings", data),

  getUsers: (params?: FilterParams) => api.get<PaginatedResponse<User>>("/administration/users", params),

  getUser: (id: UUID) => api.get<User>(`/administration/users/${id}`),

  createUser: (data: Partial<User>) => api.post<User>("/administration/users", data),

  updateUser: (id: UUID, data: Partial<User>) => api.patch<User>(`/administration/users/${id}`, data),

  deleteUser: (id: UUID) => api.delete<void>(`/administration/users/${id}`),

  activateUser: (id: UUID) => api.post<void>(`/administration/users/${id}/activate`, {}),

  deactivateUser: (id: UUID) => api.post<void>(`/administration/users/${id}/deactivate`, {}),

  resetPassword: (id: UUID) =>
    api.post<{ temporaryPassword: string }>(`/administration/users/${id}/reset-password`, {}),

  getTeams: (params?: FilterParams) => api.get<PaginatedResponse<Team>>("/administration/teams", params),

  getTeam: (id: UUID) => api.get<Team>(`/administration/teams/${id}`),

  createTeam: (data: Partial<Team>) => api.post<Team>("/administration/teams", data),

  updateTeam: (id: UUID, data: Partial<Team>) => api.patch<Team>(`/administration/teams/${id}`, data),

  deleteTeam: (id: UUID) => api.delete<void>(`/administration/teams/${id}`),

  addTeamMember: (teamId: UUID, userId: UUID) => api.post<void>(`/administration/teams/${teamId}/members`, { userId }),

  removeTeamMember: (teamId: UUID, userId: UUID) =>
    api.delete<void>(`/administration/teams/${teamId}/members/${userId}`),

  getDepartments: (params?: FilterParams) =>
    api.get<PaginatedResponse<Department>>("/administration/departments", params),

  getRoles: (params?: FilterParams) => api.get<PaginatedResponse<Role>>("/administration/roles", params),

  getRole: (id: UUID) => api.get<Role>(`/administration/roles/${id}`),

  createRole: (data: Partial<Role>) => api.post<Role>("/administration/roles", data),

  updateRole: (id: UUID, data: Partial<Role>) => api.patch<Role>(`/administration/roles/${id}`, data),

  deleteRole: (id: UUID) => api.delete<void>(`/administration/roles/${id}`),

  getPermissions: () => api.get<Permission[]>(`/administration/permissions`),

  getPermissionMatrix: () => api.get<PermissionMatrix>(`/administration/permission-matrix`),

  updatePermissionMatrix: (matrix: PermissionMatrix) =>
    api.patch<PermissionMatrix>(`/administration/permission-matrix`, matrix),

  getTemplates: (params?: FilterParams) => api.get<PaginatedResponse<Template>>("/administration/templates", params),

  createTemplate: (data: Partial<Template>) => api.post<Template>("/administration/templates", data),

  updateTemplate: (id: UUID, data: Partial<Template>) => api.patch<Template>(`/administration/templates/${id}`, data),

  deleteTemplate: (id: UUID) => api.delete<void>(`/administration/templates/${id}`),

  getComplianceRules: (params?: FilterParams) =>
    api.get<PaginatedResponse<ComplianceRule>>("/administration/compliance-rules", params),

  getIntegrations: () => api.get<Integration[]>(`/administration/integrations`),

  updateIntegration: (id: UUID, data: Partial<Integration>) =>
    api.patch<Integration>(`/administration/integrations/${id}`, data),

  testIntegration: (id: UUID) =>
    api.post<{ success: boolean; message: string }>(`/administration/integrations/${id}/test`, {}),
};

export interface PermissionMatrix {
  roles: Array<{
    roleId: UUID;
    roleName: string;
    permissions: Array<{
      module: string;
      actions: Record<string, boolean>;
    }>;
  }>;
}

export interface Role {
  id: UUID;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
}

export interface Template {
  id: UUID;
  name: string;
  type: "communication" | "document_request" | "checklist" | "engagement" | "invoice" | "report";
  channel?: string;
  subject?: string;
  content: string;
  variables: Array<{ key: string; label: string; type: string; required: boolean }>;
  isActive: boolean;
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
  reviewStages: Array<{ stageNumber: number; name: string; reviewerRole: string; isMandatory: boolean }>;
  completionRules: Record<string, unknown>;
  isActive: boolean;
}

export interface Integration {
  id: UUID;
  name: string;
  type: "accounting" | "communication" | "payment" | "esignature" | "government" | "other";
  provider: string;
  status: "connected" | "disconnected" | "error" | "pending";
  config: Record<string, unknown>;
  lastSyncAt?: string;
  errorMessage?: string;
}
