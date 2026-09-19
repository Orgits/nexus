"use client";

import { cn } from "cn";
import {
  Briefcase,
  CheckSquare,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
  FolderKanban,
  FolderOpen,
  Mail,
  MessageSquare,
  Receipt,
  Shield,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AuditEngagement,
  Client,
  Communication,
  ComplianceCycle,
  Conversation,
  Document,
  Invoice,
  Matter,
  Notice,
  Payment,
  Review,
  Task,
} from "@/types";

export interface LinkedRecordGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  children: LinkedRecordItem[];
}

export interface LinkedRecordItem {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface LinkedRecordsPanelProps {
  groups: LinkedRecordGroup[];
  title?: string;
  className?: string;
  maxItemsPerGroup?: number;
  showCounts?: boolean;
  onItemClick?: (item: LinkedRecordItem) => void;
  compact?: boolean;
  showEmptyState?: boolean;
}

export function LinkedRecordsPanel({
  groups,
  title = "Linked Records",
  className,
  maxItemsPerGroup = 5,
  showCounts = true,
  onItemClick,
  compact = false,
  showEmptyState = true,
}: LinkedRecordsPanelProps) {
  const hasData = groups.some((g) => g.children.length > 0);

  if (!hasData) {
    if (!showEmptyState) return null;
    return (
      <div className={cn("text-center py-8", className)}>
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
        <h3 className="font-medium text-muted-foreground">No linked records</h3>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{title}</h3>}
      <div className="space-y-4">
        {groups.map((group) => {
          const visibleItems = group.children.slice(0, maxItemsPerGroup);
          const remaining = group.children.length - maxItemsPerGroup;

          return (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{group.icon}</span>
                  <span className="font-medium text-sm">{group.label}</span>
                  {showCounts && group.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {group.count}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-1 ml-6">
                {visibleItems.map((item) => (
                  <LinkedRecordItemComponent key={item.id} item={item} onClick={onItemClick} compact={compact} />
                ))}
                {remaining > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      /* Could expand to show all */
                    }}
                  >
                    +{remaining} more
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LinkedRecordItemComponentProps {
  item: {
    id: string;
    label: string;
    subtitle?: string;
    href: string;
    badge?: string;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
    icon?: React.ReactNode;
    onClick?: () => void;
  };
  onClick?: (item: LinkedRecordItem) => void;
  compact?: boolean;
}

function LinkedRecordItemComponent({ item, onClick, compact }: LinkedRecordItemComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.(item);
  };

  return (
    <div className="flex items-center gap-2">
      {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
      <Button
        variant="ghost"
        size="sm"
        className={cn("w-full justify-start gap-2 text-left px-2 py-1", compact && "px-1 py-0.5")}
        onClick={handleClick}
      >
        {item.icon && <span>{item.icon}</span>}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="font-medium text-sm truncate">{item.label}</span>
          {item.subtitle && <span className="text-muted-foreground text-xs truncate">{item.subtitle}</span>}
        </div>
        {item.badge && (
          <Badge variant={item.badgeVariant ?? "secondary"} className="text-xs shrink-0">
            {item.badge}
          </Badge>
        )}
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 hover:opacity-100 transition-opacity" />
      </Button>
    </div>
  );
}

export function createClientLink(client: Client): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: client.id,
    label: client.displayName || client.name,
    subtitle: client.category.replace(/_/g, " "),
    href: `/dashboard/clients/${client.id}`,
    icon: <Users className="h-3.5 w-3.5" />,
  };
}

export function createMatterLink(
  matter: Matter,
  _client?: Client,
): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: matter.id,
    label: matter.name,
    subtitle: `${matter.serviceName} • ${matter.period.label}`,
    href: `/dashboard/matters/${matter.id}`,
    badge: matter.status.replace(/_/g, " "),
    badgeVariant: matter.status === "overdue" ? "destructive" : "secondary",
    icon: <Briefcase className="h-3.5 w-3.5" />,
  };
}

function getTaskBadgeVariant(status: TaskStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "completed") return "default";
  if (status === "in_review" || status === "rework") return "destructive";
  return "secondary";
}

export function createTaskLink(task: Task): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: task.id,
    label: task.title,
    subtitle: `Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}`,
    href: `/dashboard/tasks/${task.id}`,
    badge: task.status.replace(/_/g, " "),
    badgeVariant: getTaskBadgeVariant(task.status),
    icon: <CheckSquare className="h-3.5 w-3.5" />,
  };
}

export function createComplianceCycleLink(cycle: ComplianceCycle): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: cycle.id,
    label: cycle.serviceName,
    subtitle: `${cycle.period.label} • Due: ${cycle.dueDate ? new Date(cycle.dueDate).toLocaleDateString() : "—"}`,
    href: `/dashboard/compliance/${cycle.serviceType}/${cycle.id}`,
    badge: cycle.status.replace(/_/g, " "),
    badgeVariant: cycle.isOverdue ? "destructive" : "secondary",
    icon: <FileCheck className="h-3.5 w-3.5" />,
  };
}

function getDocumentBadgeVariant(ocrStatus: OCRStatus): "default" | "secondary" | "destructive" | "outline" {
  if (ocrStatus === "completed") return "default";
  if (ocrStatus === "failed") return "destructive";
  return "secondary";
}

export function createDocumentLink(doc: Document): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: doc.id,
    label: doc.originalFileName,
    subtitle: `${doc.category.replace(/_/g, " ")} • ${doc.fileSize > 0 ? formatFileSize(doc.fileSize) : "—"}`,
    href: `/dashboard/documents/${doc.id}`,
    badge: doc.ocrStatus.replace(/_/g, " "),
    badgeVariant: getDocumentBadgeVariant(doc.ocrStatus),
    icon: <FileText className="h-3.5 w-3.5" />,
  };
}

export function createCommunicationLink(comm: Communication): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="h-3.5 w-3.5 text-blue-600" />,
    whatsapp: <MessageSquare className="h-3.5 w-3.5 text-green-600" />,
    sms: <MessageSquare className="h-3.5 w-3.5 text-purple-600" />,
    call: <MessageSquare className="h-3.5 w-3.5 text-orange-600" />,
    post: <FileText className="h-3.5 w-3.5 text-gray-600" />,
  };

  return {
    id: comm.id,
    label: comm.subject ?? comm.content.slice(0, 50),
    subtitle: `${comm.channel.toUpperCase()} • ${comm.direction} • ${comm.sentAt ? new Date(comm.sentAt).toLocaleDateString() : "—"}`,
    href: `/dashboard/communications/${comm.id}`,
    badge: comm.status,
    badgeVariant: "secondary",
    icon: channelIcons[comm.channel] || <Mail className="h-3.5 w-3.5" />,
  };
}

export function createConversationLink(conv: Conversation): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: conv.id,
    label: conv.subject,
    subtitle: `${conv.channels.join(", ")} • ${conv.unreadCount > 0 ? `${conv.unreadCount} unread` : "Read"}`,
    href: `/dashboard/conversations/${conv.id}`,
    badge: conv.isArchived ? "Archived" : "Active",
    badgeVariant: conv.isArchived ? "secondary" : "default",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
  };
}

function getReviewBadgeVariant(status: ReviewStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "completed") return "default";
  if (status === "in_progress") return "secondary";
  return "outline";
}

export function createReviewLink(review: Review): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: review.id,
    label: review.title,
    subtitle: `${review.reviewType.replace(/_/g, " ")} • Stage ${review.currentStage}/${review.stages.length}`,
    href: `/dashboard/reviews/${review.id}`,
    badge: review.status,
    badgeVariant: getReviewBadgeVariant(review.status),
    icon: <Shield className="h-3.5 w-3.5" />,
  };
}

function getInvoiceBadgeVariant(paymentStatus: PaymentStatus): "default" | "secondary" | "destructive" | "outline" {
  if (paymentStatus === "overdue") return "destructive";
  if (paymentStatus === "paid") return "default";
  return "secondary";
}

export function createInvoiceLink(invoice: Invoice): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: invoice.id,
    label: invoice.invoiceNumber,
    subtitle: `${invoice.clientId} • ${formatCurrency(invoice.totalAmount)}`,
    href: `/dashboard/invoices/${invoice.id}`,
    badge: invoice.status,
    badgeVariant: getInvoiceBadgeVariant(invoice.paymentStatus),
    icon: <Receipt className="h-3.5 w-3.5" />,
  };
}

export function createPaymentLink(payment: Payment): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: payment.id,
    label: payment.paymentNumber,
    subtitle: `${formatCurrency(payment.amount)} • ${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "—"}`,
    href: `/dashboard/payments/${payment.id}`,
    badge: payment.status,
    badgeVariant: payment.status === "cleared" ? "default" : "secondary",
    icon: <CreditCard className="h-3.5 w-3.5" />,
  };
}

export function createNoticeLink(notice: Notice): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: notice.id,
    label: notice.subject,
    subtitle: `${notice.authority} • Due: ${notice.responseDueDate ? new Date(notice.responseDueDate).toLocaleDateString() : "—"}`,
    href: `/dashboard/notices/${notice.id}`,
    badge: notice.status.replace(/_/g, " "),
    badgeVariant: notice.isUrgent ? "destructive" : "secondary",
    icon: <Shield className="h-3.5 w-3.5" />,
  };
}

export function createAuditEngagementLink(engagement: AuditEngagement): {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: React.ReactNode;
} {
  return {
    id: engagement.id,
    label: engagement.name,
    subtitle: `${engagement.type} • ${engagement.period.label}`,
    href: `/dashboard/audit/${engagement.id}`,
    badge: engagement.status,
    badgeVariant: "secondary",
    icon: <FolderKanban className="h-3.5 w-3.5" />,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
