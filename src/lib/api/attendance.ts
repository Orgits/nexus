import type { AttendanceRecord, Holiday, LeaveRequest } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const attendanceApi = {
  getAttendance: (params?: FilterParams) => api.get<PaginatedResponse<AttendanceRecord>>("/attendance", params),

  getMyAttendance: (params?: FilterParams) => api.get<PaginatedResponse<AttendanceRecord>>("/attendance/me", params),

  checkIn: (data: { location?: string; workMode: AttendanceRecord["workMode"] }) =>
    api.post<AttendanceRecord>("/attendance/check-in", data),

  checkOut: (data: { location?: string; notes?: string }) => api.post<AttendanceRecord>("/attendance/check-out", data),

  getLeaveRequests: (params?: FilterParams) => api.get<PaginatedResponse<LeaveRequest>>("/attendance/leave", params),

  getMyLeaveRequests: (params?: FilterParams) =>
    api.get<PaginatedResponse<LeaveRequest>>("/attendance/leave/me", params),

  createLeaveRequest: (data: Partial<LeaveRequest>) => api.post<LeaveRequest>("/attendance/leave", data),

  updateLeaveRequest: (id: UUID, data: Partial<LeaveRequest>) =>
    api.patch<LeaveRequest>(`/attendance/leave/${id}`, data),

  cancelLeaveRequest: (id: UUID) => api.post<LeaveRequest>(`/attendance/leave/${id}/cancel`, {}),

  approveLeaveRequest: (id: UUID) => api.post<LeaveRequest>(`/attendance/leave/${id}/approve`, {}),

  rejectLeaveRequest: (id: UUID, reason: string) =>
    api.post<LeaveRequest>(`/attendance/leave/${id}/reject`, { reason }),

  getLeaveBalance: (userId: UUID, year?: number) =>
    api.get<LeaveBalance[]>(`/attendance/leave/balance/${userId}`, { year }),

  getHolidays: (year?: number) => api.get<Holiday[]>(`/attendance/holidays`, { year }),

  createHoliday: (data: Partial<Holiday>) => api.post<Holiday>("/attendance/holidays", data),

  updateHoliday: (id: UUID, data: Partial<Holiday>) => api.patch<Holiday>(`/attendance/holidays/${id}`, data),

  deleteHoliday: (id: UUID) => api.delete<void>(`/attendance/holidays/${id}`),

  getTeamAvailability: (teamId: UUID, date: string) =>
    api.get<TeamAvailability>(`/attendance/teams/${teamId}/availability`, { date }),
};

export interface LeaveBalance {
  leaveType: LeaveRequest["leaveType"];
  totalEntitled: number;
  used: number;
  pending: number;
  balance: number;
  carryForward?: number;
}

export interface TeamAvailability {
  teamId: UUID;
  teamName: string;
  date: string;
  members: Array<{
    userId: UUID;
    userName: string;
    isAvailable: boolean;
    leaveType?: string;
    workMode?: string;
    checkInAt?: string;
    checkOutAt?: string;
  }>;
  availableCount: number;
  totalCount: number;
}
