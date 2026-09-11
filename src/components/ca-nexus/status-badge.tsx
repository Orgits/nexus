"use client";

import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import type {
  AttendanceStatus,
  AuditQueryStatus,
  AuditStatus,
  CampaignStatus,
  ClientStatus,
  CommunicationStatus,
  ComplianceStatus,
  DocumentRequestStatus,
  DSCStatus,
  EngagementDocumentStatus,
  ExpenseStatus,
  InvoiceStatus,
  LeaveStatus,
  LicenseStatus,
  MatterStatus,
  NoticeStatus,
  PaymentRecordStatus,
  PaymentStatus,
  Priority,
  ReimbursementStatus,
  ReviewStatus,
  TaskStatus,
  WorkMode,
  WorkpaperStatus,
} from "@/types";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  partially_paid: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  void: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  rework: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  filed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",

  not_started: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  identification: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  outreach_sent: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  documents_pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  documents_received: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ready_for_review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  in_review: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  rework_required: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  not_applicable: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",

  created: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  information_pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  documents_pending_matter: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ready_for_review_matter: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  rework_matter: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  approved_matter: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  filed_matter: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed_matter: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  billing_followup: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  closed_matter: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  on_hold: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  cancelled_matter: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",

  todo: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  in_progress_task: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_review_task: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  rework_task: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  completed_task: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled_task: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  on_hold_task: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  blocked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",

  issued: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  overdue_invoice: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",

  unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  partially_paid_payment: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid_payment: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  overdue_payment: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  written_off: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",

  received: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  acknowledged: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  evidence_collection: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  response_drafting: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  internal_review: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  approved_for_submission: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  submitted: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  hearing_scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  hearing_completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  order_received: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  closed_notice: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  escalated: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",

  onboarding: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  prospect: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",

  pending_signature: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  partially_signed: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  signed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",

  valid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expiring_soon: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  expired_dsc: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  revoked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  suspended: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",

  renewal_in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",

  prepared: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  under_review_wp: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  reviewed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  finalized: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  archived_wp: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",

  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress_query: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  responded: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed_query: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  escalated_query: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",

  present: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  late: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  half_day: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  on_leave: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  holiday: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  work_from_home: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",

  submitted_expense: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  reimbursed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending_reimbursement: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved_reimbursement: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  rejected_reimbursement: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  processing_reimbursement: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",

  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  sending: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  sent_campaign: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed_campaign: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  cancelled_campaign: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  failed_campaign: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",

  not_sent: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  reminder_sent: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  partially_received: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  received_doc: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed_doc: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  cancelled_doc: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",

  queued: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  sending_comm: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed_comm: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  bounced: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  read: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  replied: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  archived_comm: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",

  office: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  remote: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  hybrid: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  client_site: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const statusLabels: Record<string, string> = {
  in_progress: "In Progress",
  in_progress_task: "In Progress",
  in_progress_query: "In Progress",
  partially_paid: "Partially Paid",
  partially_paid_payment: "Partially Paid",
  overdue_invoice: "Overdue",
  overdue_payment: "Overdue",
  documents_pending_matter: "Documents Pending",
  ready_for_review_matter: "Ready for Review",
  rework_matter: "Rework",
  approved_matter: "Approved",
  filed_matter: "Filed",
  completed_matter: "Completed",
  billing_followup: "Billing Follow-up",
  closed_matter: "Closed",
  cancelled_matter: "Cancelled",
  on_hold_task: "On Hold",
  cancelled_task: "Cancelled",
  closed_notice: "Closed",
  expired_dsc: "Expired",
  closed_query: "Closed",
  under_review_wp: "Under Review",
  archived_wp: "Archived",
  escalated_query: "Escalated",
  sent_campaign: "Sent",
  completed_campaign: "Completed",
  cancelled_campaign: "Cancelled",
  failed_campaign: "Failed",
  sending_comm: "Sending",
  delivered: "Delivered",
  failed_comm: "Failed",
  archived_comm: "Archived",
  work_from_home: "Work from Home",
  on_leave: "On Leave",
  submitted_expense: "Submitted",
  reimbursed: "Reimbursed",
  pending_reimbursement: "Pending",
  approved_reimbursement: "Approved",
  rejected_reimbursement: "Rejected",
  processing_reimbursement: "Processing",
  not_sent: "Not Sent",
  reminder_sent: "Reminder Sent",
  partially_received: "Partially Received",
  received_doc: "Received",
  closed_doc: "Closed",
  cancelled_doc: "Cancelled",
};

export function StatusBadge({
  status,
  className,
  showDot = true,
}: {
  status: string;
  className?: string;
  showDot?: boolean;
}) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  const label = statusLabels[status] || status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Badge className={cn(style, "capitalize", className)} variant="outline">
      {showDot && <span className="relative top-[-1px] mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </Badge>
  );
}

export function PriorityBadge({
  priority,
  className,
  showDot = true,
}: {
  priority: Priority;
  className?: string;
  showDot?: boolean;
}) {
  const styles: Record<Priority, string> = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const style = styles[priority] || styles.medium;

  return (
    <Badge className={cn(style, "capitalize", className)} variant="outline">
      {showDot && <span className="relative top-[-1px] mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />}
      {priority}
    </Badge>
  );
}

export function ComplianceStatusBadge({ status, className }: { status: ComplianceStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function MatterStatusBadge({ status, className }: { status: MatterStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function NoticeStatusBadge({ status, className }: { status: NoticeStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function EngagementDocumentStatusBadge({
  status,
  className,
}: {
  status: EngagementDocumentStatus;
  className?: string;
}) {
  return <StatusBadge status={status} className={className} />;
}

export function DSCStatusBadge({ status, className }: { status: DSCStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function LicenseStatusBadge({ status, className }: { status: LicenseStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function WorkpaperStatusBadge({ status, className }: { status: WorkpaperStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function AuditQueryStatusBadge({ status, className }: { status: AuditQueryStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function LeaveStatusBadge({ status, className }: { status: LeaveStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function AttendanceStatusBadge({ status, className }: { status: AttendanceStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function ExpenseStatusBadge({ status, className }: { status: ExpenseStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function CampaignStatusBadge({ status, className }: { status: CampaignStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function DocumentRequestStatusBadge({
  status,
  className,
}: {
  status: DocumentRequestStatus;
  className?: string;
}) {
  return <StatusBadge status={status} className={className} />;
}

export function CommunicationStatusBadge({ status, className }: { status: CommunicationStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function WorkModeBadge({ mode, className }: { mode: WorkMode; className?: string }) {
  return <StatusBadge status={mode} className={className} />;
}

export function ClientStatusBadge({ status, className }: { status: ClientStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function AuditStatusBadge({ status, className }: { status: AuditStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function ReimbursementStatusBadge({ status, className }: { status: ReimbursementStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function PaymentRecordStatusBadge({ status, className }: { status: PaymentRecordStatus; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}
