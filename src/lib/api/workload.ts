import type { User } from "@/types";

import { api, type FilterParams, type UUID } from "./client";

export const workloadApi = {
  getUserWorkload: (userId: UUID, params?: FilterParams) => api.get<UserWorkload>(`/workload/users/${userId}`, params),

  getTeamWorkload: (teamId: UUID, params?: FilterParams) => api.get<TeamWorkload>(`/workload/teams/${teamId}`, params),

  getFirmWorkload: (params?: FilterParams) => api.get<FirmWorkload>(`/workload/firm`, params),

  getCapacity: (userId: UUID, startDate: string, endDate: string) =>
    api.get<UserCapacity>(`/workload/users/${userId}/capacity`, { startDate, endDate }),

  getTeamCapacity: (teamId: UUID, startDate: string, endDate: string) =>
    api.get<TeamCapacity>(`/workload/teams/${teamId}/capacity`, { startDate, endDate }),

  reassignWork: (data: { fromUserId: UUID; toUserId: UUID; matterIds?: UUID[]; taskIds?: UUID[] }) =>
    api.post<void>(`/workload/reassign`, data),

  getAvailability: (userIds: UUID[], date: string) =>
    api.get<UserAvailability[]>(`/workload/availability`, { userIds: userIds.join(","), date }),

  getOverloadedUsers: (threshold?: number) => api.get<User[]>(`/workload/overloaded`, { threshold }),

  getUnderutilizedUsers: (threshold?: number) => api.get<User[]>(`/workload/underutilized`, { threshold }),
};

export interface UserWorkload {
  userId: UUID;
  userName: string;
  role: string;
  openTasks: number;
  openMatters: number;
  estimatedHours: number;
  actualHours: number;
  capacityHours: number;
  utilization: number;
  upcomingDeadlines: number;
  overdueItems: number;
  tasksByPriority: Record<string, number>;
  mattersByStatus: Record<string, number>;
  weeklyBreakdown: Array<{ week: string; estimatedHours: number; actualHours: number; capacity: number }>;
}

export interface TeamWorkload {
  teamId: UUID;
  teamName: string;
  memberCount: number;
  totalOpenTasks: number;
  totalOpenMatters: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  totalCapacityHours: number;
  utilization: number;
  members: Array<{
    userId: UUID;
    userName: string;
    openTasks: number;
    openMatters: number;
    estimatedHours: number;
    actualHours: number;
    capacityHours: number;
    utilization: number;
    isOverloaded: boolean;
    isUnderutilized: boolean;
  }>;
  weeklyBreakdown: Array<{ week: string; estimatedHours: number; actualHours: number; capacity: number }>;
}

export interface FirmWorkload {
  totalUsers: number;
  totalOpenTasks: number;
  totalOpenMatters: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  totalCapacityHours: number;
  overallUtilization: number;
  teams: Array<{
    teamId: UUID;
    teamName: string;
    memberCount: number;
    openTasks: number;
    openMatters: number;
    estimatedHours: number;
    actualHours: number;
    capacityHours: number;
    utilization: number;
  }>;
  overloadCount: number;
  underutilizedCount: number;
}

export interface UserCapacity {
  userId: UUID;
  userName: string;
  period: { start: string; end: string };
  workingDays: number;
  totalCapacityHours: number;
  allocatedHours: number;
  availableHours: number;
  dailyBreakdown: Array<{ date: string; capacityHours: number; allocatedHours: number; isAvailable: boolean }>;
  leaveDays: Array<{ date: string; type: string }>;
  holidayDays: string[];
}

export interface TeamCapacity {
  teamId: UUID;
  teamName: string;
  period: { start: string; end: string };
  members: UserCapacity[];
  totalCapacityHours: number;
  totalAllocatedHours: number;
  totalAvailableHours: number;
}

export interface UserAvailability {
  userId: UUID;
  userName: string;
  date: string;
  isAvailable: boolean;
  workingHours: number;
  allocatedHours: number;
  availableHours: number;
  leaveType?: string;
}
