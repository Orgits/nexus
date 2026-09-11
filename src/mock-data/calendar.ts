import type { CalendarEvent, CalendarEventType, EventReminder, ISODateTimeString, UUID } from "@/types";

import { IDS } from "./ids";

const now = new Date().toISOString();
const _tenantId = IDS.TENANT;

const baseEntity = {
  tenantId: IDS.TENANT as UUID,
  createdAt: now as ISODateTimeString,
  updatedAt: now as ISODateTimeString,
  createdBy: IDS.USERS.ADMIN as UUID,
  updatedBy: IDS.USERS.ADMIN as UUID,
};

const createReminders = (minutes: number[]): EventReminder[] =>
  minutes.map((m) => ({ type: "popup" as const, minutesBefore: m }));

const asUUID = (s: string) => s as UUID;
const asISODateTime = (s: string) => s as ISODateTimeString;

export const mockCalendarEvents: CalendarEvent[] = [
  {
    ...baseEntity,
    id: asUUID(IDS.CALENDAR_EVENTS.ABC_ITR_DEADLINE),
    title: "ABC Pvt Ltd - ITR Filing Deadline (AY 2025-26)",
    description: "Final deadline for filing ITR-6 for ABC Private Limited for AY 2025-26",
    eventType: "compliance_deadline",
    startAt: asISODateTime("2024-10-31T23:59:00Z"),
    endAt: asISODateTime("2024-10-31T23:59:00Z"),
    allDay: true,
    clientId: asUUID(IDS.CLIENTS.ABC_PVT_LTD),
    matterId: asUUID(IDS.MATTERS.ABC_ITR_FY24),
    complianceCycleId: asUUID(IDS.COMPLIANCE_CYCLES.ABC_ITR_FY24),
    assignedUserIds: [asUUID(IDS.USERS.SENIOR_1), asUUID(IDS.USERS.PARTNER_1)],
    reminders: createReminders([10080, 1440, 60]),
    color: "#ef4444",
    isPrivate: false,
  },
  {
    ...baseEntity,
    id: asUUID(IDS.CALENDAR_EVENTS.ABC_GST_DEADLINE),
    title: "ABC Pvt Ltd - GST Q1 Return Deadline",
    description: "GSTR-1 & GSTR-3B filing deadline for Q1 FY 2024-25",
    eventType: "compliance_deadline",
    startAt: asISODateTime("2024-07-11T23:59:00Z"),
    endAt: asISODateTime("2024-07-11T23:59:00Z"),
    allDay: true,
    clientId: asUUID(IDS.CLIENTS.ABC_PVT_LTD),
    matterId: asUUID(IDS.MATTERS.ABC_GST_Q1),
    complianceCycleId: asUUID(IDS.COMPLIANCE_CYCLES.ABC_GST_APR),
    assignedUserIds: [asUUID(IDS.USERS.SENIOR_1)],
    reminders: createReminders([1440, 60]),
    color: "#f97316",
    isPrivate: false,
  },
  {
    ...baseEntity,
    id: asUUID(IDS.CALENDAR_EVENTS.XYZ_ITR_DEADLINE),
    title: "XYZ LLP - ITR Filing Deadline (AY 2025-26)",
    description: "Final deadline for filing ITR-5 for XYZ LLP",
    eventType: "compliance_deadline",
    startAt: asISODateTime("2024-10-31T23:59:00Z"),
    endAt: asISODateTime("2024-10-31T23:59:00Z"),
    allDay: true,
    clientId: asUUID(IDS.CLIENTS.XYZ_LLP),
    matterId: asUUID(IDS.MATTERS.XYZ_ITR_FY24),
    complianceCycleId: asUUID(IDS.COMPLIANCE_CYCLES.XYZ_ITR_FY24),
    assignedUserIds: [asUUID(IDS.USERS.SENIOR_1), asUUID(IDS.USERS.PARTNER_1)],
    reminders: createReminders([10080, 1440]),
    color: "#ef4444",
    isPrivate: false,
  },
  {
    ...baseEntity,
    id: asUUID("cal-global-tds-deadline"),
    title: "Global Corp - TDS Q1 Return Deadline (26Q)",
    description: "Form 26Q filing deadline for Q1 FY 2024-25",
    eventType: "compliance_deadline",
    startAt: asISODateTime("2024-07-31T23:59:00Z"),
    endAt: asISODateTime("2024-07-31T23:59:00Z"),
    allDay: true,
    clientId: asUUID(IDS.CLIENTS.GLOBAL_CORP),
    matterId: asUUID(IDS.MATTERS.GLOBAL_TDS_Q1),
    complianceCycleId: asUUID(IDS.COMPLIANCE_CYCLES.GLOBAL_TDS_Q1),
    assignedUserIds: [asUUID(IDS.USERS.ASSOCIATE_2), asUUID(IDS.USERS.PARTNER_2)],
    reminders: createReminders([1440, 60]),
    color: "#f97316",
    isPrivate: false,
  },
  {
    ...baseEntity,
    id: asUUID("cal-rtl-gst-overdue"),
    title: "URGENT: RetailMax - GST April Overdue",
    description: "GST return for April 2024 is OVERDUE. Immediate action required.",
    eventType: "compliance_deadline",
    startAt: asISODateTime("2024-05-11T23:59:00Z"),
    endAt: asISODateTime("2024-05-11T23:59:00Z"),
    allDay: true,
    clientId: asUUID(IDS.CLIENTS.RETAIL_CHAIN),
    matterId: asUUID(IDS.MATTERS.RETAIL_GST_Q1),
    complianceCycleId: asUUID(IDS.COMPLIANCE_CYCLES.RETAIL_GST_APR),
    assignedUserIds: [asUUID(IDS.USERS.SENIOR_1), asUUID(IDS.USERS.PARTNER_1)],
    reminders: createReminders([0]),
    color: "#dc2626",
    isPrivate: false,
  },
  {
    ...baseEntity,
    id: asUUID("cal-abc-audit-meeting"),
    title: "Audit Planning Meeting - ABC Pvt Ltd",
    description: "Planning meeting with client for statutory audit FY 2024-25",
    eventType: "client_meeting",
    startAt: asISODateTime("2024-07-20T10:00:00Z"),
    endAt: asISODateTime("2024-07-20T11:30:00Z"),
    allDay: false,
    clientId: asUUID(IDS.CLIENTS.ABC_PVT_LTD),
    matterId: asUUID(IDS.MATTERS.ABC_AUDIT_FY24),
    assignedUserIds: [asUUID(IDS.USERS.MANAGER_2), asUUID(IDS.USERS.PARTNER_2)],
    location: "ABC Pvt Ltd, Gurugram / Virtual",
    meetingUrl: "https://meet.canexus.com/abc-audit-planning",
    reminders: createReminders([1440, 60, 15]),
    color: "#3b82f6",
    isPrivate: false,
  },
  {
    ...baseEntity,
    id: asUUID("cal-team-review"),
    title: "Weekly Team Review - Taxation",
    description: "Weekly review of all taxation matters, deadlines, and work allocation",
    eventType: "internal_meeting",
    startAt: asISODateTime("2024-07-15T09:00:00Z"),
    endAt: asISODateTime("2024-07-15T10:00:00Z"),
    allDay: false,
    assignedUserIds: [
      asUUID(IDS.USERS.PARTNER_1),
      asUUID(IDS.USERS.MANAGER_1),
      asUUID(IDS.USERS.SENIOR_1),
      asUUID(IDS.USERS.ASSOCIATE_1),
      asUUID(IDS.USERS.ASSOCIATE_2),
    ],
    location: "Conference Room A / Virtual",
    meetingUrl: "https://meet.canexus.com/tax-weekly",
    recurrenceRule: "FREQ=WEEKLY;BYDAY=MO",
    reminders: createReminders([60, 15]),
    color: "#8b5cf6",
    isPrivate: false,
  },
  {
    ...baseEntity,
    id: asUUID("cal-partner-meeting"),
    title: "Partner Strategy Meeting",
    description: "Monthly partner meeting - practice growth, resource planning, client acquisitions",
    eventType: "internal_meeting",
    startAt: asISODateTime("2024-07-18T14:00:00Z"),
    endAt: asISODateTime("2024-07-18T16:00:00Z"),
    allDay: false,
    assignedUserIds: [asUUID(IDS.USERS.PARTNER_1), asUUID(IDS.USERS.PARTNER_2), asUUID(IDS.USERS.ADMIN)],
    location: "Board Room",
    reminders: createReminders([1440, 60]),
    color: "#8b5cf6",
    isPrivate: true,
  },
  {
    ...baseEntity,
    id: asUUID("cal-global-tp-review"),
    title: "Transfer Pricing Review - Global Corp",
    description: "Review meeting for TP documentation and Form 3CEB",
    eventType: "review_meeting",
    startAt: asISODateTime("2024-07-25T11:00:00Z"),
    endAt: asISODateTime("2024-07-25T12:30:00Z"),
    allDay: false,
    clientId: asUUID(IDS.CLIENTS.GLOBAL_CORP),
    matterId: asUUID(IDS.MATTERS.GLOBAL_ITR_FY24),
    assignedUserIds: [asUUID(IDS.USERS.SENIOR_2), asUUID(IDS.USERS.PARTNER_2), asUUID(IDS.USERS.MANAGER_1)],
    location: "Virtual",
    meetingUrl: "https://meet.canexus.com/global-tp-review",
    reminders: createReminders([1440, 60]),
    color: "#06b6d4",
    isPrivate: false,
  },
  {
    ...baseEntity,
    id: asUUID("cal-followup-rtl"),
    title: "Follow-up: RetailMax GST Documents",
    description: "Follow up with RetailMax for missing April GST invoices from 3 states",
    eventType: "follow_up",
    startAt: asISODateTime("2024-07-16T10:00:00Z"),
    endAt: asISODateTime("2024-07-16T10:30:00Z"),
    allDay: false,
    clientId: asUUID(IDS.CLIENTS.RETAIL_CHAIN),
    matterId: asUUID(IDS.MATTERS.RETAIL_GST_Q1),
    assignedUserIds: [asUUID(IDS.USERS.SENIOR_1)],
    reminders: createReminders([60]),
    color: "#f97316",
    isPrivate: false,
  },
];

export const getEventsByDateRange = (startDate: string, endDate: string): CalendarEvent[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return mockCalendarEvents.filter((e) => {
    const eventStart = new Date(e.startAt);
    return eventStart >= start && eventStart <= end;
  });
};

export const getEventsByUser = (userId: string): CalendarEvent[] =>
  mockCalendarEvents.filter((e) => e.assignedUserIds.includes(userId as UUID));

export const getEventsByClient = (clientId: string): CalendarEvent[] =>
  mockCalendarEvents.filter((e) => e.clientId === (clientId as UUID));

export const getEventsByType = (eventType: CalendarEventType): CalendarEvent[] =>
  mockCalendarEvents.filter((e) => e.eventType === eventType);

export const getUpcomingDeadlines = (days = 30): CalendarEvent[] => {
  const today = new Date();
  const future = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return mockCalendarEvents
    .filter((e) => {
      const eventDate = new Date(e.startAt);
      return eventDate >= today && eventDate <= future && e.eventType === "compliance_deadline";
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
};

export const getOverdueDeadlines = (): CalendarEvent[] => {
  const today = new Date();
  return mockCalendarEvents
    .filter((e) => new Date(e.startAt) < today && e.eventType === "compliance_deadline")
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
};

export const getEventById = (id: string): CalendarEvent | undefined => mockCalendarEvents.find((e) => e.id === id);
