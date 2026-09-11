"use client";

import Link from "next/link";

import { cn } from "cn";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";

import { ClientStatusBadge, DocumentRequestStatusBadge, MatterStatusBadge, PriorityBadge } from "@/components/ca-nexus";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type CommunicationFollowupItem,
  mockCommunicationFollowups,
  mockMissingDocuments,
  mockPendingReviews,
  mockRecentClients,
  mockRecentMatters,
  mockTeamWorkload,
  mockUpcomingDeadlines,
  mockUrgentWork,
  type PendingReviewItem,
  type UpcomingDeadlineItem,
  type UrgentWorkItem,
} from "@/mock-data/dashboard";

export function UrgentWork({ className, limit = 5 }: { className?: string; limit?: number }) {
  const items = mockUrgentWork.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Urgent Work
        </CardTitle>
        <Link href="/dashboard/work/urgent" className="text-primary text-sm hover:underline">
          View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                  getTypeBg(item.type),
                )}
              >
                {getTypeIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {item.clientName}
                  </span>
                  {item.matterName && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {item.matterName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due: {new Date(item.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {item.daysOverdue > 0 && (
                      <Badge variant="destructive" className="ml-1">
                        {item.daysOverdue}d overdue
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={item.priority} showDot={false} />
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>
            </Link>
          ))}
          {items.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
              <p>No urgent work items</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getTypeBg(type: UrgentWorkItem["type"]): string {
  const colors = {
    task: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    compliance: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    notice: "bg-red-100 dark:bg-red-900/30 text-red-600",
    review: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  };
  return colors[type];
}

function getTypeIcon(type: UrgentWorkItem["type"]) {
  const icons = {
    task: <CheckCircle className="h-5 w-5" />,
    compliance: <FileText className="h-5 w-5" />,
    notice: <AlertTriangle className="h-5 w-5" />,
    review: <Briefcase className="h-5 w-5" />,
  };
  return icons[type];
}

export function UpcomingDeadlines({ className, limit = 8 }: { className?: string; limit?: number }) {
  const items = mockUpcomingDeadlines.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Upcoming Deadlines
        </CardTitle>
        <Link href="/calendar" className="text-primary text-sm hover:underline">
          View calendar <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                  getDeadlineTypeBg(item.type),
                )}
              >
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                  <span>{item.clientName}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDaysRemaining(item.daysRemaining)}
                  </span>
                </div>
              </div>
              <PriorityBadge priority={item.priority} showDot={false} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDaysRemaining(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days}d remaining`;
}

function getDeadlineTypeBg(type: UpcomingDeadlineItem["type"]): string {
  const colors = {
    compliance: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    task: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    notice: "bg-red-100 dark:bg-red-900/30 text-red-600",
    meeting: "bg-green-100 dark:bg-green-900/30 text-green-600",
  };
  return colors[type];
}

export function MissingDocuments({ className, limit = 5 }: { className?: string; limit?: number }) {
  const items = mockMissingDocuments.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-600" />
          Missing Documents
        </CardTitle>
        <Link href="/dashboard/documents/requests" className="text-primary text-sm hover:underline">
          View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{item.documentName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                  <span>{item.clientName}</span>
                  <span>{item.matterName}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.daysWaiting}d waiting
                  </span>
                  {item.reminderCount > 0 && <Badge variant="secondary">{item.reminderCount} reminders</Badge>}
                </div>
              </div>
              <DocumentRequestStatusBadge status={item.status} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PendingReviews({ className, limit = 5 }: { className?: string; limit?: number }) {
  const items = mockPendingReviews.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-purple-600" />
          Pending Reviews
        </CardTitle>
        <Link href="/dashboard/reviews" className="text-primary text-sm hover:underline">
          Review inbox <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                  getReviewTypeBg(item.objectType),
                )}
              >
                {getReviewTypeIcon(item.objectType)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{item.objectName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                  <span>{item.clientName}</span>
                  <span>Submitted by {item.submitterName}</span>
                  <span>Stage: {item.stage}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.daysAging}d ago
                  </span>
                </div>
              </div>
              <PriorityBadge priority={item.priority} showDot={false} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getReviewTypeBg(type: PendingReviewItem["objectType"]): string {
  const colors = {
    matter: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    task: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    document: "bg-green-100 dark:bg-green-900/30 text-green-600",
    compliance: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  };
  return colors[type];
}

function getReviewTypeIcon(type: PendingReviewItem["objectType"]) {
  const icons = {
    matter: <Briefcase className="h-5 w-5" />,
    task: <CheckCircle className="h-5 w-5" />,
    document: <FileText className="h-5 w-5" />,
    compliance: <FileText className="h-5 w-5" />,
  };
  return icons[type];
}

export function RecentClients({ className, limit = 5 }: { className?: string; limit?: number }) {
  const items = mockRecentClients.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Recent Clients
        </CardTitle>
        <Link href="/dashboard/clients" className="text-primary text-sm hover:underline">
          View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{item.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  <span>{item.pendingWork} pending</span>
                  {item.nextDeadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due: {new Date(item.nextDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              </div>
              <ClientStatusBadge status={item.status as any} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentMatters({ className, limit = 5 }: { className?: string; limit?: number }) {
  const items = mockRecentMatters.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600" />
          Recent Matters
        </CardTitle>
        <Link href="/dashboard/matters" className="text-primary text-sm hover:underline">
          View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Briefcase className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{item.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                  <span>{item.clientName}</span>
                  <span>Progress: {item.progress}%</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due: {new Date(item.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
              <MatterStatusBadge status={item.status as any} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamWorkloadSummary({ className, limit = 6 }: { className?: string; limit?: number }) {
  const items = mockTeamWorkload.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Team Workload
        </CardTitle>
        <Link href="/dashboard/workload" className="text-primary text-sm hover:underline">
          View details <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.userId}
              href={item.href}
              className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{item.userName}</p>
                  <Badge variant="outline" className="text-xs">
                    {item.role}
                  </Badge>
                  {item.isOverloaded && (
                    <Badge variant="destructive" className="text-xs">
                      Overloaded
                    </Badge>
                  )}
                  {item.isUnderutilized && (
                    <Badge variant="secondary" className="text-xs">
                      Underutilized
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
                  <span>{item.openTasks} tasks</span>
                  <span>{item.openMatters} matters</span>
                  <span>
                    {item.actualHours}h / {item.capacity}h
                  </span>
                  <div className="max-w-[150px] flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(item.utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-medium">{Math.round(item.utilization)}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunicationFollowups({ className, limit = 5 }: { className?: string; limit?: number }) {
  const items = mockCommunicationFollowups.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          Communication Follow-ups
        </CardTitle>
        <Link href="/dashboard/communications?filter=followup" className="text-primary text-sm hover:underline">
          View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                  getCommTypeBg(item.type),
                )}
              >
                {getCommTypeIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{item.subject}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                  <span>{item.clientName}</span>
                  <span>Last: {formatDistanceToNowShort(item.lastActivity)}</span>
                  <span className="flex items-center gap-1 text-orange-600">
                    <Clock className="h-3 w-3" />
                    Follow-up: {item.followUpDue}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getCommTypeBg(type: CommunicationFollowupItem["type"]): string {
  const colors = {
    email: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    whatsapp: "bg-green-100 dark:bg-green-900/30 text-green-600",
    sms: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    call: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  };
  return colors[type];
}

function getCommTypeIcon(type: CommunicationFollowupItem["type"]) {
  const icons = {
    email: <MessageSquare className="h-5 w-5" />,
    whatsapp: <MessageSquare className="h-5 w-5" />,
    sms: <MessageSquare className="h-5 w-5" />,
    call: <MessageSquare className="h-5 w-5" />,
  };
  return icons[type];
}

function formatDistanceToNowShort(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}
