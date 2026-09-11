"use client";

import { cn } from "cn";
import { Calendar, User as UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { mockTeams, mockUsers } from "@/mock-data/users";
import type {
  AuditEngagement,
  Client,
  Communication,
  ComplianceCycle,
  Document,
  Expense,
  Invoice,
  Matter,
  Notice,
  Priority,
  Review,
  Task,
  Team,
  User,
} from "@/types";

import { PriorityBadge, StatusBadge } from "./status-badge";

interface RecordHeaderProps {
  title: string;
  subtitle?: string;
  status?: string;
  priority?: Priority;
  assignee?: User;
  team?: Team;
  dueDate?: string;
  metadata?: Array<{ label: string; value: string | React.ReactNode; icon?: React.ReactNode }>;
  actions?: React.ReactNode;
  className?: string;
}

export function RecordHeader({
  title,
  subtitle,
  status,
  priority,
  assignee,
  team,
  dueDate,
  metadata,
  actions,
  className,
}: RecordHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 border bg-card p-4 md:p-6", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate font-semibold text-xl">{title}</h1>
          {subtitle && <p className="truncate text-muted-foreground text-sm">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status && <StatusBadge status={status} />}
          {priority && <PriorityBadge priority={priority} />}
          {actions}
        </div>
      </div>

      <Separator className="my-2" />

      <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
        {assignee && (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={assignee.avatarUrl} alt={assignee.fullName} />
              <AvatarFallback>
                {assignee.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5" />
              {assignee.fullName}
            </span>
          </div>
        )}
        {team && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5" />
              {team.name}
            </span>
          </div>
        )}
        {dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Due: {new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        )}
        {metadata?.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            {item.icon && <span className="h-3.5 w-3.5">{item.icon}</span>}
            <span>
              {item.label}: <span className="font-medium text-foreground">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ClientRecordHeaderProps {
  client: Client;
  actions?: React.ReactNode;
  className?: string;
}

export function ClientRecordHeader({ client, actions, className }: ClientRecordHeaderProps) {
  const pendingWork = client.services.filter((s) => s.isActive).length;
  const nextDeadline = client.services
    .filter((s) => s.isActive)
    .map((s) => s.complianceConfig?.dueDateRule?.referenceDate)
    .filter(Boolean)
    .sort()[0];

  return (
    <RecordHeader
      title={client.displayName || client.name}
      subtitle={client.legalName && client.legalName !== client.name ? client.legalName : undefined}
      status={client.status}
      priority="medium"
      assignee={mockUsers.find((u) => u.id === client.responsibleUserId)}
      team={mockTeams.find((t) => t.id === client.responsibleTeamId)}
      dueDate={nextDeadline}
      metadata={[
        { label: "Type", value: client.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
        { label: "Category", value: client.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
        { label: "Active Services", value: String(pendingWork) },
        { label: "PAN", value: client.identifiers.pan || "—" },
        { label: "GSTIN", value: client.identifiers.gstin || "—" },
      ]}
      actions={actions}
      className={className}
    />
  );
}

interface MatterRecordHeaderProps {
  matter: Matter;
  client?: Client;
  actions?: React.ReactNode;
  className?: string;
}

export function MatterRecordHeader({ matter, client, actions, className }: MatterRecordHeaderProps) {
  return (
    <RecordHeader
      title={matter.name}
      subtitle={`Matter ID: ${matter.matterNumber}`}
      status={matter.status}
      priority={matter.priority}
      assignee={mockUsers.find((u) => u.id === matter.assignedUserId)}
      team={mockTeams.find((t) => t.id === matter.assignedTeamId)}
      dueDate={matter.dueDate}
      metadata={[
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Service", value: matter.serviceName },
        { label: "Period", value: matter.period.label },
        { label: "Progress", value: `${matter.progress}%` },
        { label: "Stage", value: matter.stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
      ]}
      actions={actions}
      className={className}
    />
  );
}

interface TaskRecordHeaderProps {
  task: Task;
  matter?: Matter;
  client?: Client;
  actions?: React.ReactNode;
  className?: string;
}

export function TaskRecordHeader({ task, matter, client, actions, className }: TaskRecordHeaderProps) {
  return (
    <RecordHeader
      title={task.title}
      subtitle={`Task ID: ${task.taskNumber}`}
      status={task.status}
      priority={task.priority}
      assignee={mockUsers.find((u) => u.id === task.assignedUserId)}
      team={mockTeams.find((t) => t.id === task.assignedTeamId)}
      dueDate={task.dueDate}
      metadata={[
        { label: "Matter", value: matter?.name || "—" },
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Progress", value: `${task.progress}%` },
        { label: "Est. Hours", value: task.estimatedHours ? `${task.estimatedHours}h` : "—" },
        { label: "Actual Hours", value: `${task.actualHours}h` },
      ]}
      actions={actions}
      className={className}
    />
  );
}

export function ComplianceRecordHeader({
  cycle,
  client,
  matter,
  actions,
  className,
}: {
  cycle: ComplianceCycle;
  client?: Client;
  matter?: Matter;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <RecordHeader
      title={`${cycle.serviceName} - ${cycle.period.label}`}
      subtitle={`Cycle ID: ${cycle.cycleNumber}`}
      status={cycle.status}
      priority={cycle.priority}
      assignee={mockUsers.find((u) => u.id === cycle.assignedUserId)}
      team={mockTeams.find((t) => t.id === cycle.assignedTeamId)}
      dueDate={cycle.extendedDueDate || cycle.dueDate}
      metadata={[
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Matter", value: matter?.name || "—" },
        { label: "Type", value: cycle.serviceType.replace(/_/g, " ").toUpperCase() },
        {
          label: "Missing Docs",
          value: String(cycle.missingDocuments.filter((d) => d.isMandatory && !d.receivedAt).length),
        },
        { label: "Overdue", value: cycle.isOverdue ? `${cycle.daysOverdue} days` : "No" },
      ]}
      actions={actions}
      className={className}
    />
  );
}

export function DocumentRecordHeader({
  document,
  client,
  matter,
  actions,
  className,
}: {
  document: Document;
  client?: Client;
  matter?: Matter;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <RecordHeader
      title={document.originalFileName || document.fileName}
      subtitle={`Doc ID: ${document.documentNumber}`}
      status={document.category}
      priority="medium"
      assignee={mockUsers.find((u) => u.id === document.uploadedById)}
      dueDate={document.createdAt.split("T")[0]}
      metadata={[
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Matter", value: matter?.name || "—" },
        { label: "Category", value: document.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
        { label: "Type", value: document.documentType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
        { label: "Size", value: formatFileSize(document.fileSize) },
        { label: "Version", value: `v${document.version}` },
        { label: "OCR", value: document.ocrStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
      ]}
      actions={actions}
      className={className}
    />
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function InvoiceRecordHeader({
  invoice,
  client,
  matter,
  actions,
  className,
}: {
  invoice: Invoice;
  client?: Client;
  matter?: Matter;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <RecordHeader
      title={`Invoice ${invoice.invoiceNumber}`}
      subtitle={`Total: ₹${invoice.totalAmount.toLocaleString("en-IN")}`}
      status={invoice.status}
      priority={invoice.paymentStatus === "overdue" ? "urgent" : "medium"}
      assignee={mockUsers.find((u) => u.id === invoice.createdBy)}
      dueDate={invoice.dueDate}
      metadata={[
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Matter", value: matter?.name || "—" },
        { label: "Issue Date", value: new Date(invoice.issueDate).toLocaleDateString("en-IN") },
        {
          label: "Payment Status",
          value: invoice.paymentStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        },
        { label: "Paid", value: `₹${invoice.paidAmount.toLocaleString("en-IN")}` },
        { label: "Balance", value: `₹${invoice.balanceAmount.toLocaleString("en-IN")}` },
      ]}
      actions={actions}
      className={className}
    />
  );
}

export function CommunicationRecordHeader({
  communication,
  client,
  matter,
  actions,
  className,
}: {
  communication: Communication;
  client?: Client;
  matter?: Matter;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <RecordHeader
      title={communication.subject || `${communication.content.slice(0, 80)}...`}
      subtitle={`Comm ID: ${communication.communicationNumber}`}
      status={communication.status}
      priority={communication.isInternal ? "low" : "medium"}
      dueDate={communication.sentAt?.split("T")[0]}
      metadata={[
        { label: "Channel", value: communication.channel.toUpperCase() },
        { label: "Direction", value: communication.direction },
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Matter", value: matter?.name || "—" },
        { label: "From", value: communication.from.name },
        { label: "Internal", value: communication.isInternal ? "Yes" : "No" },
      ]}
      actions={actions}
      className={className}
    />
  );
}

interface ReviewRecordHeaderProps {
  review: Review;
  client?: Client;
  matter?: Matter;
  task?: Task;
  actions?: React.ReactNode;
  className?: string;
}

export function ReviewRecordHeader({ review, client, matter, task, actions, className }: ReviewRecordHeaderProps) {
  const completedStages = review.stages.filter((s) => s.status === "completed").length;
  const totalStages = review.stages.length;
  const currentStage = review.stages.find((s) => s.stageNumber === review.currentStage);

  return (
    <RecordHeader
      title={review.title}
      subtitle={`Review ID: ${review.reviewNumber}`}
      status={review.status}
      priority={review.priority}
      assignee={mockUsers.find((u) => u.id === review.assignedReviewerId)}
      dueDate={review.dueDate}
      metadata={[
        { label: "Type", value: review.reviewType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Matter", value: matter?.name || "—" },
        { label: "Stage", value: `${review.currentStage}/${totalStages}` },
        { label: "Current", value: currentStage?.name || "—" },
        {
          label: "Reviewer",
          value: currentStage ? mockUsers.find((u) => u.id === currentStage.reviewerId)?.fullName || "—" : "—",
        },
        { label: "Completed", value: `${completedStages}/${totalStages}` },
        { label: "Started", value: review.startedAt ? new Date(review.startedAt).toLocaleDateString("en-IN") : "—" },
      ]}
      actions={actions}
      className={className}
    />
  );
}

interface NoticeRecordHeaderProps {
  notice: Notice;
  client?: Client;
  matter?: Matter;
  actions?: React.ReactNode;
  className?: string;
}

export function NoticeRecordHeader({ notice, client, matter, actions, className }: NoticeRecordHeaderProps) {
  const daysUntilDue = Math.ceil((new Date(notice.responseDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const _isOverdue = daysUntilDue < 0 && notice.status !== "closed" && notice.status !== "submitted";

  return (
    <RecordHeader
      title={notice.subject}
      subtitle={`Notice ID: ${notice.noticeNumber}`}
      status={notice.status}
      priority={notice.priority}
      assignee={mockUsers.find((u) => u.id === notice.assignedUserId)}
      dueDate={notice.responseDueDate}
      metadata={[
        { label: "Authority", value: notice.authority },
        { label: "Authority Type", value: notice.authorityType.replace(/_/g, " ").toUpperCase() },
        { label: "Category", value: notice.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Matter", value: matter?.name || "—" },
        { label: "Reference", value: notice.referenceNumber },
        { label: "Received", value: new Date(notice.receivedDate).toLocaleDateString("en-IN") },
        {
          label: "Due",
          value: `${daysUntilDue > 0 ? daysUntilDue : Math.abs(daysUntilDue)} days ${daysUntilDue >= 0 ? "remaining" : "overdue"}`,
        },
        { label: "Escalation", value: `Level ${notice.escalationLevel}` },
        { label: "Urgent", value: notice.isUrgent ? "Yes" : "No" },
      ]}
      actions={actions}
      className={className}
    />
  );
}

interface AuditRecordHeaderProps {
  engagement: AuditEngagement;
  client?: Client;
  matter?: Matter;
  actions?: React.ReactNode;
  className?: string;
}

export function AuditRecordHeader({ engagement, client, matter, actions, className }: AuditRecordHeaderProps) {
  const completedPrograms = engagement.programs.filter((p) => p.status === "completed").length;
  const totalPrograms = engagement.programs.length;
  const openQueries = engagement.queries.filter((q) => q.status === "open" || q.status === "in_progress").length;
  const totalWorkpapers = engagement.workpapers.length;
  const reviewedWorkpapers = engagement.workpapers.filter(
    (w) => w.status === "reviewed" || w.status === "finalized",
  ).length;

  return (
    <RecordHeader
      title={engagement.name}
      subtitle={`Engagement ID: ${engagement.engagementNumber}`}
      status={engagement.status}
      priority={
        engagement.riskAssessment.overallRisk === "critical"
          ? "urgent"
          : engagement.riskAssessment.overallRisk === "high"
            ? "high"
            : engagement.riskAssessment.overallRisk === "medium"
              ? "medium"
              : "low"
      }
      assignee={mockUsers.find((u) => u.id === engagement.assignedTeam.partnerId)}
      dueDate={engagement.period.endDate}
      metadata={[
        { label: "Type", value: engagement.type.charAt(0).toUpperCase() + engagement.type.slice(1) },
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Matter", value: matter?.name || "—" },
        { label: "Period", value: engagement.period.label },
        { label: "Partner", value: mockUsers.find((u) => u.id === engagement.assignedTeam.partnerId)?.fullName || "—" },
        { label: "Programs", value: `${completedPrograms}/${totalPrograms}` },
        { label: "Workpapers", value: `${reviewedWorkpapers}/${totalWorkpapers} reviewed` },
        { label: "Open Queries", value: String(openQueries) },
        {
          label: "Risk Level",
          value: (
            <PriorityBadge
              priority={
                engagement.riskAssessment.overallRisk === "critical"
                  ? "urgent"
                  : engagement.riskAssessment.overallRisk === "high"
                    ? "high"
                    : engagement.riskAssessment.overallRisk === "medium"
                      ? "medium"
                      : "low"
              }
            />
          ),
        },
        { label: "Materiality", value: `₹${engagement.materiality.overallMateriality.toLocaleString("en-IN")}` },
      ]}
      actions={actions}
      className={className}
    />
  );
}

interface ExpenseRecordHeaderProps {
  expense: Expense;
  client?: Client;
  matter?: Matter;
  employee?: User;
  approvedBy?: User;
  actions?: React.ReactNode;
  className?: string;
}

export function ExpenseRecordHeader({
  expense,
  client,
  matter,
  employee,
  approvedBy,
  actions,
  className,
}: ExpenseRecordHeaderProps) {
  return (
    <RecordHeader
      title={`Expense ${expense.expenseNumber}`}
      subtitle={`${expense.category.replace(/_/g, " ")} • ${expense.amount.toLocaleString("en-IN")}`}
      status={expense.status}
      priority={expense.reimbursementStatus === "pending" ? "high" : "medium"}
      assignee={mockUsers.find((u) => u.id === expense.userId)}
      dueDate={expense.expenseDate}
      metadata={[
        { label: "Category", value: expense.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) },
        { label: "Employee", value: mockUsers.find((u) => u.id === expense.userId)?.fullName || "—" },
        { label: "Client", value: client?.displayName || client?.name || "—" },
        { label: "Matter", value: matter?.name || "—" },
        { label: "Date", value: new Date(expense.expenseDate).toLocaleDateString("en-IN") },
        { label: "Amount", value: `₹${expense.amount.toLocaleString("en-IN")}` },
        {
          label: "Reimbursement",
          value: expense.reimbursementStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        },
        { label: "Approved By", value: approvedBy?.fullName || "—" },
      ]}
      actions={actions}
      className={className}
    />
  );
}
