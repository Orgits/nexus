"use client";

import { formatDate } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getMatterById, getTasksByUser, mockTasks } from "@/mock-data/matters";
import { getUserById } from "@/mock-data/users";
import type { Priority, TaskStatus } from "@/types";

export interface TaskRow {
  id: string;
  taskNumber: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  client: string;
  clientId: string;
  matter: string;
  matterId: string;
  dueDate: string;
  progress: number;
  estimatedHours: number | undefined;
  actualHours: number;
}

export function getTaskRows(): TaskRow[] {
  return mockTasks.map((task) => {
    const assignee = getUserById(task.assignedUserId);
    const client = task.clientId ? getClientById(task.clientId) : null;
    const matter = task.matterId ? getMatterById(task.matterId) : null;

    return {
      id: task.id,
      taskNumber: task.taskNumber,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: assignee?.fullName || task.assignedUserId,
      client: client?.displayName || client?.name || "—",
      clientId: client?.id || "",
      matter: matter?.name || "—",
      matterId: matter?.id || "",
      dueDate: formatDate(task.dueDate),
      progress: task.progress,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
    };
  });
}

export function getTaskRowsByUser(userId: string): TaskRow[] {
  const tasks = getTasksByUser(userId);
  return tasks.map((task) => {
    const assignee = getUserById(task.assignedUserId);
    const client = task.clientId ? getClientById(task.clientId) : null;
    const matter = task.matterId ? getMatterById(task.matterId) : null;

    return {
      id: task.id,
      taskNumber: task.taskNumber,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: assignee?.fullName || task.assignedUserId,
      client: client?.displayName || client?.name || "—",
      clientId: client?.id || "",
      matter: matter?.name || "—",
      matterId: matter?.id || "",
      dueDate: formatDate(task.dueDate),
      progress: task.progress,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
    };
  });
}

export const taskStatusOptions = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "rework", label: "Rework" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "on_hold", label: "On Hold" },
  { value: "blocked", label: "Blocked" },
];

export const taskPriorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
  { value: "urgent", label: "Urgent" },
];

export const taskLabelOptions = [
  { value: "itr", label: "ITR" },
  { value: "gst", label: "GST" },
  { value: "tds", label: "TDS" },
  { value: "audit", label: "Audit" },
  { value: "advisory", label: "Advisory" },
  { value: "compliance", label: "Compliance" },
];
