import type { CalendarEvent } from "@/types";

import { api, type FilterParams, type PaginatedResponse, type UUID } from "./client";

export const calendarApi = {
  list: (params?: FilterParams) => api.get<PaginatedResponse<CalendarEvent>>("/calendar", params),

  get: (id: UUID) => api.get<CalendarEvent>(`/calendar/${id}`),

  create: (data: Partial<CalendarEvent>) => api.post<CalendarEvent>("/calendar", data),

  update: (id: UUID, data: Partial<CalendarEvent>) => api.patch<CalendarEvent>(`/calendar/${id}`, data),

  delete: (id: UUID) => api.delete<void>(`/calendar/${id}`),

  getMonthView: (year: number, month: number, params?: FilterParams) =>
    api.get<CalendarEvent[]>(`/calendar/month/${year}/${month}`, params),

  getWeekView: (date: string, params?: FilterParams) => api.get<CalendarEvent[]>(`/calendar/week`, { ...params, date }),

  getDayView: (date: string, params?: FilterParams) => api.get<CalendarEvent[]>(`/calendar/day`, { ...params, date }),

  getAgendaView: (startDate: string, endDate: string, params?: FilterParams) =>
    api.get<CalendarEvent[]>(`/calendar/agenda`, { ...params, startDate, endDate }),

  getUpcomingDeadlines: (days = 30) => api.get<CalendarEvent[]>(`/calendar/upcoming-deadlines`, { days }),
};
