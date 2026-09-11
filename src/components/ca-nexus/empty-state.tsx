"use client";

import { cn } from "cn";
import {
  AlertCircle,
  BarChart3,
  Briefcase,
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  Inbox,
  Plus,
  Search,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "card" | "inline";
}

export function EmptyState({ icon, title, description, action, className, variant = "default" }: EmptyStateProps) {
  const defaultIcons: Record<string, React.ReactNode> = {
    clients: <Users className="h-12 w-12 text-muted-foreground/50" />,
    matters: <Briefcase className="h-12 w-12 text-muted-foreground/50" />,
    tasks: <CheckSquare className="h-12 w-12 text-muted-foreground/50" />,
    documents: <FolderOpen className="h-12 w-12 text-muted-foreground/50" />,
    communications: <Inbox className="h-12 w-12 text-muted-foreground/50" />,
    compliance: <Shield className="h-12 w-12 text-muted-foreground/50" />,
    calendar: <Calendar className="h-12 w-12 text-muted-foreground/50" />,
    reports: <BarChart3 className="h-12 w-12 text-muted-foreground/50" />,
    settings: <Settings className="h-12 w-12 text-muted-foreground/50" />,
    search: <Search className="h-12 w-12 text-muted-foreground/50" />,
    default: <FileText className="h-12 w-12 text-muted-foreground/50" />,
  };

  const content = (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4">{icon || defaultIcons.default}</div>
      <h3 className="mb-2 font-semibold text-lg">{title}</h3>
      {description && <p className="mb-6 max-w-md text-muted-foreground text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );

  switch (variant) {
    case "card":
      return (
        <Card className={cn("border-dashed", className)}>
          <CardContent className="pt-8 pb-8">{content}</CardContent>
        </Card>
      );
    case "inline":
      return <div className={cn("py-8", className)}>{content}</div>;
    default:
      return <div className={cn("py-12", className)}>{content}</div>;
  }
}

export function EmptyClients({ onAddClient }: { onAddClient?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12 text-muted-foreground/50" />}
      title="No clients found"
      description="Get started by adding your first client. You can import clients or create them manually."
      action={
        onAddClient && (
          <Button onClick={onAddClient}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        )
      }
    />
  );
}

export function EmptyMatters({ onAddMatter }: { onAddMatter?: () => void }) {
  return (
    <EmptyState
      icon={<Briefcase className="h-12 w-12 text-muted-foreground/50" />}
      title="No matters found"
      description="Create a matter to track work for a client service. Matters can be created from the client profile or directly."
      action={
        onAddMatter && (
          <Button onClick={onAddMatter}>
            <Plus className="mr-2 h-4 w-4" />
            Create Matter
          </Button>
        )
      }
    />
  );
}

export function EmptyTasks({ onAddTask }: { onAddTask?: () => void }) {
  return (
    <EmptyState
      icon={<CheckSquare className="h-12 w-12 text-muted-foreground/50" />}
      title="No tasks found"
      description="Tasks help you track work items. Create tasks from matters, communications, or directly."
      action={
        onAddTask && (
          <Button onClick={onAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        )
      }
    />
  );
}

export function EmptyDocuments({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12 text-muted-foreground/50" />}
      title="No documents found"
      description="Upload documents or they will appear here when received from clients or created from communications."
      action={
        onUpload && (
          <Button onClick={onUpload}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )
      }
    />
  );
}

export function EmptyCommunications({ onCompose }: { onCompose?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="h-12 w-12 text-muted-foreground/50" />}
      title="No communications found"
      description="Your unified inbox will show emails, WhatsApp messages, SMS, and calls here."
      action={
        onCompose && (
          <Button onClick={onCompose}>
            <Plus className="mr-2 h-4 w-4" />
            Compose
          </Button>
        )
      }
    />
  );
}

export function EmptyCompliance({ onConfigure }: { onConfigure?: () => void }) {
  return (
    <EmptyState
      icon={<Shield className="h-12 w-12 text-muted-foreground/50" />}
      title="No compliance cycles found"
      description="Compliance cycles are generated based on client services and compliance rules. Configure rules to auto-generate cycles."
      action={
        onConfigure && (
          <Button onClick={onConfigure}>
            <Plus className="mr-2 h-4 w-4" />
            Configure Rules
          </Button>
        )
      }
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12 text-muted-foreground/50" />}
      title={query ? `No results for "${query}"` : "No results found"}
      description={
        query
          ? "Try adjusting your search terms or filters."
          : "Start typing to search across clients, matters, tasks, documents, and more."
      }
      variant="inline"
    />
  );
}

export function EmptyStateWithIllustration({
  illustration,
  title,
  description,
  action,
  className,
}: {
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-16 text-center", className)}>
      {illustration && <div className="mb-6 text-muted-foreground/30">{illustration}</div>}
      <h3 className="mb-2 font-semibold text-xl">{title}</h3>
      {description && <p className="mb-6 max-w-md text-base text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again or contact support.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-12 text-center", className)}>
      <AlertCircle className="mb-4 h-12 w-12 text-destructive/50" />
      <h3 className="mb-2 font-semibold text-lg">{title}</h3>
      <p className="mb-6 max-w-md text-muted-foreground text-sm">{description}</p>
      {onRetry && (
        <Button onClick={onRetry}>
          <Plus className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ message = "Loading...", className }: { message?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-12", className)}>
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4 text-left">
                <div className="h-4 w-[100px] animate-pulse bg-muted" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="p-4">
                  <div className="h-4 w-[100px] animate-pulse bg-muted" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="mt-4 h-32 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonList({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
