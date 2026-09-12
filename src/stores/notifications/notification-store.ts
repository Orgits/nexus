"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType =
  | "assignment"
  | "deadline"
  | "overdue"
  | "review"
  | "mention"
  | "communication_followup"
  | "document_received"
  | "campaign_event"
  | "payment"
  | "approval"
  | "system"
  | "reminder";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical" | "urgent";
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => void;
  addNotifications: (notifications: Omit<Notification, "id" | "createdAt" | "isRead">[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "deadline",
    title: "GST Q1 Return Due Tomorrow",
    message: "ABC Pvt Ltd - GST Q1 2024-25 return is due on 2024-07-11",
    priority: "high",
    entityType: "compliance_cycle",
    entityId: "cycle-abc-gst-apr",
    actionUrl: "/dashboard/compliance/gst/cycle-abc-gst-apr",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-2",
    type: "review",
    title: "Review Request: GST Reconciliation",
    message: "Anjali Gupta submitted ABC Pvt Ltd - GST Q1 2024-25 for Partner Review",
    priority: "high",
    entityType: "matter",
    entityId: "matter-abc-gst-001",
    actionUrl: "/dashboard/reviews/matter-abc-gst-001",
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-3",
    type: "assignment",
    title: "New Task Assigned",
    message: "You have been assigned: TDS Challan Verification for Q1",
    priority: "medium",
    entityType: "task",
    entityId: "task-abc-tds-001",
    actionUrl: "/dashboard/tasks/task-abc-tds-001",
    isRead: true,
    readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-4",
    type: "document_received",
    title: "Document Received",
    message: "RetailMax Chain uploaded Multi-state Sales Invoices (April) for GST Q1 2024-25",
    priority: "medium",
    entityType: "document",
    entityId: "doc-rtl-gst-apr",
    actionUrl: "/dashboard/documents/doc-rtl-gst-apr",
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-5",
    type: "communication_followup",
    title: "Follow-up Due",
    message: "No response from ABC Pvt Ltd on ITR Documents request (8 days)",
    priority: "medium",
    entityType: "communication",
    entityId: "comm-abc-email-001",
    actionUrl: "/dashboard/communications/comm-abc-email-001",
    isRead: true,
    readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-6",
    type: "overdue",
    title: "Overdue Compliance: GST April Return",
    message: "RetailMax Chain - GST Q1 2024-25 is 55 days overdue",
    priority: "urgent",
    entityType: "compliance_cycle",
    entityId: "cycle-rtl-gst-apr",
    actionUrl: "/dashboard/compliance/gst/cycle-rtl-gst-apr",
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-7",
    type: "approval",
    title: "Invoice Approved",
    message: "Invoice INV-2024-0042 for ABC Pvt Ltd has been approved",
    priority: "low",
    entityType: "invoice",
    entityId: "inv-abc-042",
    actionUrl: "/dashboard/invoices/inv-abc-042",
    isRead: true,
    readAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-8",
    type: "campaign_event",
    title: "Campaign Completed",
    message: "ITR Reminder Campaign sent to 147 clients",
    priority: "low",
    entityType: "campaign",
    entityId: "camp-itr-jul",
    actionUrl: "/dashboard/campaigns/camp-itr-jul",
    isRead: false,
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: initialNotifications,
      unreadCount: initialNotifications.filter((n) => !n.isRead).length,

      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            createdAt: new Date().toISOString(),
            isRead: false,
          };
          return {
            notifications: [newNotification, ...state.notifications].slice(0, 100),
            unreadCount: state.unreadCount + 1,
          };
        }),

      addNotifications: (notifications) =>
        set((state) => {
          const newNotifications = notifications.map((n) => ({
            ...n,
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            createdAt: new Date().toISOString(),
            isRead: false,
          }));
          const unreadAdded = newNotifications.filter((n) => !n.isRead).length;
          return {
            notifications: [...newNotifications, ...state.notifications].slice(0, 100),
            unreadCount: state.unreadCount + unreadAdded,
          };
        }),

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (!notification || notification.isRead) return state;
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
            ),
            unreadCount: state.unreadCount - 1,
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() },
          ),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const unreadChange = notification && !notification.isRead ? -1 : 0;
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: Math.max(0, state.unreadCount + unreadChange),
          };
        }),

      clearAll: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),
    }),
    {
      name: "ca-nexus-notifications",
    },
  ),
);
