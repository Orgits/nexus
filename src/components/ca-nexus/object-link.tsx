"use client";

import Link from "next/link";

import { cn } from "cn";
import { ChevronRight, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  AuditEngagement,
  Campaign,
  Client,
  Communication,
  ComplianceCycle,
  Conversation,
  Document,
  DSCRegister,
  EngagementDocument,
  Expense,
  Invoice,
  LicenseRegister,
  Matter,
  Notice,
  Payment,
  Review,
  Task,
  Team,
  UDINRegister,
  User,
} from "@/types";

import {
  AuditStatusBadge,
  ClientStatusBadge,
  ComplianceStatusBadge,
  DSCStatusBadge,
  EngagementDocumentStatusBadge,
  ExpenseStatusBadge,
  InvoiceStatusBadge,
  LicenseStatusBadge,
  MatterStatusBadge,
  NoticeStatusBadge,
  ReviewStatusBadge,
  TaskStatusBadge,
} from "./status-badge";

interface ObjectLinkProps {
  href: string;
  label: string;
  external?: boolean;
  className?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export function ObjectLink({ href, label, external, className, icon, badge }: ObjectLinkProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn("inline-flex items-center gap-1 font-medium text-primary text-sm hover:underline", className)}
    >
      {icon}
      {label}
      {badge && <span className="ml-1">{badge}</span>}
      {external && <ExternalLink className="h-3 w-3" />}
    </Link>
  );
}

export function ClientLink({
  client,
  className,
  showStatus = true,
}: {
  client: Client;
  className?: string;
  showStatus?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ObjectLink href={`/dashboard/clients/${client.id}`} label={client.displayName || client.name} />
      {showStatus && <ClientStatusBadge status={client.status} />}
    </div>
  );
}

export function MatterLink({
  matter,
  className,
  showStatus = true,
  showClient = false,
  client,
}: {
  matter: Matter;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/matters/${matter.id}`} label={matter.name} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showStatus && <MatterStatusBadge status={matter.status} />}
    </div>
  );
}

export function TaskLink({
  task,
  className,
  showStatus = true,
  showMatter = false,
  matter,
}: {
  task: Task;
  className?: string;
  showStatus?: boolean;
  showMatter?: boolean;
  matter?: Matter;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/tasks/${task.id}`} label={task.title} />
      {showMatter && matter && <MatterLink matter={matter} showStatus={false} />}
      {showStatus && <TaskStatusBadge status={task.status} />}
    </div>
  );
}

export function ComplianceCycleLink({
  cycle,
  className,
  showStatus = true,
  showClient = false,
  client,
}: {
  cycle: ComplianceCycle;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink
        href={`/dashboard/compliance/${cycle.serviceType}/${cycle.id}`}
        label={`${cycle.serviceName} - ${cycle.period.label}`}
      />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showStatus && <ComplianceStatusBadge status={cycle.status} />}
    </div>
  );
}

export function DocumentLink({
  document,
  className,
  showClient = false,
  client,
  showMatter = false,
  matter,
}: {
  document: Document;
  className?: string;
  showClient?: boolean;
  client?: Client;
  showMatter?: boolean;
  matter?: Matter;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/documents/${document.id}`} label={document.originalFileName || document.fileName} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showMatter && matter && <MatterLink matter={matter} showStatus={false} />}
    </div>
  );
}

export function CommunicationLink({
  communication,
  className,
  showClient = false,
  client,
  showMatter = false,
  matter,
}: {
  communication: Communication;
  className?: string;
  showClient?: boolean;
  client?: Client;
  showMatter?: boolean;
  matter?: Matter;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink
        href={`/dashboard/communications/${communication.id}`}
        label={communication.subject || `${communication.content.slice(0, 60)}...`}
      />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showMatter && matter && <MatterLink matter={matter} showStatus={false} />}
    </div>
  );
}

export function ConversationLink({
  conversation,
  className,
  showClient = false,
  client,
  showMatter = false,
  matter,
}: {
  conversation: Conversation;
  className?: string;
  showClient?: boolean;
  client?: Client;
  showMatter?: boolean;
  matter?: Matter;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/conversations/${conversation.id}`} label={conversation.subject} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showMatter && matter && <MatterLink matter={matter} showStatus={false} />}
    </div>
  );
}

export function CampaignLink({
  campaign,
  className,
  showCreatedBy = false,
  createdBy,
}: {
  campaign: Campaign;
  className?: string;
  showCreatedBy?: boolean;
  createdBy?: User;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/campaigns/${campaign.id}`} label={campaign.name} />
      {showCreatedBy && createdBy && (
        <Badge variant="outline" className="text-xs">
          By: {createdBy.fullName}
        </Badge>
      )}
    </div>
  );
}

export function InvoiceLink({
  invoice,
  className,
  showStatus = true,
  showClient = false,
  client,
}: {
  invoice: Invoice;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/invoices/${invoice.id}`} label={invoice.invoiceNumber} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showStatus && <InvoiceStatusBadge status={invoice.status} />}
    </div>
  );
}

export function PaymentLink({
  payment,
  className,
  showClient = false,
  client,
}: {
  payment: Payment;
  className?: string;
  showClient?: boolean;
  client?: Client;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/payments/${payment.id}`} label={payment.paymentNumber} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
    </div>
  );
}

export function UserLink({
  user,
  className,
  showRole = false,
}: {
  user: User;
  className?: string;
  showRole?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ObjectLink href={`/dashboard/users/${user.id}`} label={user.fullName} />
      {showRole && (
        <Badge variant="outline" className="text-xs">
          {user.role.replace(/_/g, " ")}
        </Badge>
      )}
    </div>
  );
}

export function TeamLink({ team, className }: { team: Team; className?: string }) {
  return <ObjectLink href={`/dashboard/teams/${team.id}`} label={team.name} className={className} />;
}

export function ReviewLink({
  review,
  className,
  showStatus = true,
  showClient = false,
  client,
  showMatter = false,
  matter,
}: {
  review: Review;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
  showMatter?: boolean;
  matter?: Matter;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/reviews/${review.id}`} label={review.title} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showMatter && matter && <MatterLink matter={matter} showStatus={false} />}
      {showStatus && <ReviewStatusBadge status={review.status} />}
    </div>
  );
}

export function NoticeLink({
  notice,
  className,
  showStatus = true,
  showClient = false,
  client,
  showMatter = false,
  matter,
}: {
  notice: Notice;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
  showMatter?: boolean;
  matter?: Matter;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/notices/${notice.id}`} label={notice.subject} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showMatter && matter && <MatterLink matter={matter} showStatus={false} />}
      {showStatus && <NoticeStatusBadge status={notice.status} />}
    </div>
  );
}

export function AuditEngagementLink({
  engagement,
  className,
  showStatus = true,
  showClient = false,
  client,
  showMatter = false,
  matter,
}: {
  engagement: AuditEngagement;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
  showMatter?: boolean;
  matter?: Matter;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/audit/${engagement.id}`} label={engagement.name} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showMatter && matter && <MatterLink matter={matter} showStatus={false} />}
      {showStatus && <AuditStatusBadge status={engagement.status} />}
    </div>
  );
}

export function DSCRegisterLink({
  dsc,
  className,
  showStatus = true,
  showClient = false,
  client,
}: {
  dsc: DSCRegister;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/registers/dsc/${dsc.id}`} label={dsc.holderName} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showStatus && <DSCStatusBadge status={dsc.status} />}
    </div>
  );
}

export function ExpenseLink({
  expense,
  className,
  showStatus = true,
  showClient = false,
  client,
  showMatter = false,
  matter,
}: {
  expense: Expense;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
  showMatter?: boolean;
  matter?: Matter;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/expenses/${expense.id}`} label={expense.expenseNumber} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showMatter && matter && <MatterLink matter={matter} showStatus={false} />}
      {showStatus && <ExpenseStatusBadge status={expense.status} />}
    </div>
  );
}

export function UDINRegisterLink({
  udin,
  className,
  showStatus = true,
  showClient = false,
  client,
}: {
  udin: UDINRegister;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/registers/udin/${udin.id}`} label={udin.udin} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showStatus && (
        <Badge
          variant={
            udin.status === "used"
              ? "default"
              : udin.status === "generated"
                ? "secondary"
                : udin.status === "cancelled"
                  ? "destructive"
                  : "outline"
          }
        >
          {udin.status}
        </Badge>
      )}
    </div>
  );
}

export function LicenseRegisterLink({
  license,
  className,
  showStatus = true,
  showClient = false,
  client,
}: {
  license: LicenseRegister;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/registers/licenses/${license.id}`} label={license.name} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showStatus && <LicenseStatusBadge status={license.status} />}
    </div>
  );
}

export function EngagementDocumentLink({
  engagement,
  className,
  showStatus = true,
  showClient = false,
  client,
}: {
  engagement: EngagementDocument;
  className?: string;
  showStatus?: boolean;
  showClient?: boolean;
  client?: Client;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ObjectLink href={`/dashboard/registers/engagement-documents/${engagement.id}`} label={engagement.name} />
      {showClient && client && <ClientLink client={client} showStatus={false} />}
      {showStatus && <EngagementDocumentStatusBadge status={engagement.status} />}
    </div>
  );
}

export function BreadcrumbItem({ label, href, isLast = false }: { label: string; href?: string; isLast?: boolean }) {
  return (
    <span className="flex items-center gap-1 text-sm">
      {href ? (
        <Link href={href} className="text-muted-foreground transition-colors hover:text-foreground">
          {label}
        </Link>
      ) : (
        <span className={cn("font-medium", isLast ? "text-foreground" : "text-muted-foreground")}>{label}</span>
      )}
      {!isLast && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
    </span>
  );
}

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <BreadcrumbItem key={index} label={item.label} href={item.href} isLast={index === items.length - 1} />
      ))}
    </nav>
  );
}
