"use client";

import { useState } from "react";

import { cn } from "cn";
import { AlertCircle, CheckCircle, Clock, RotateCcw, User, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import type { ReviewAction, ReviewStage, UserRole } from "@/types";

export interface ReviewStepperProps {
  stages: ReviewStage[];
  currentStageIndex: number;
  onAction?: (stageId: string, action: ReviewAction, comments?: string) => void;
  onAddComment?: (stageId: string, comment: string) => void;
  showActions?: boolean;
  showHistory?: boolean;
  showComments?: boolean;
  currentUserId?: string;
  currentUserRole?: UserRole;
  className?: string;
  compact?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  allowRework?: boolean;
}

const stageStatusConfig = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", icon: Clock },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle,
  },
  skipped: {
    label: "Skipped",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    icon: XCircle,
  },
  rework: { label: "Rework", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", icon: RotateCcw },
} as const;

function AddCommentForm({
  stageId,
  onAddComment,
}: {
  stageId: string;
  onAddComment: (stageId: string, comment: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    onAddComment(stageId, comment.trim());
    setComment("");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <Textarea
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="flex-1 min-h-[60px] resize-none"
        rows={2}
      />
      <Button type="submit" size="sm" disabled={!comment.trim() || isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Comment"}
      </Button>
    </form>
  );
}

export function ReviewStepper({
  stages,
  currentStageIndex,
  onAction,
  onAddComment,
  showActions = true,
  showHistory = true,
  showComments = true,
  currentUserId,
  currentUserRole: _currentUserRole,
  className,
  compact = false,
  showProgress = true,
  allowSkip = false,
  allowRework = true,
}: ReviewStepperProps) {
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const progress = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  const isCurrentUserReviewer = (stage: ReviewStage) => {
    if (!currentUserId) return false;
    return stage.reviewerId === currentUserId;
  };

  const canActOnStage = (stage: ReviewStage, stageIdx: number) => {
    if (stage.status === "completed" || stage.status === "skipped") return false;
    if (stageIdx < currentStageIndex && stage.status !== "rework") return false;
    if (stageIdx > currentStageIndex) return false;
    return isCurrentUserReviewer(stage) || !stage.reviewerId;
  };

  const getStageId = (stage: ReviewStage): string => {
    const id = stage.id;
    return (id ?? String(stage.stageNumber)) as string;
  };

  const getCircleClass = (isCompleted: boolean, isCurrent: boolean, status: ReviewStage["status"]) => {
    if (isCompleted) return "bg-green-500 text-white";
    if (isCurrent) return "bg-primary text-white";
    if (status === "rework") return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    return "bg-muted text-muted-foreground";
  };

  const getCircleContent = (
    isCompleted: boolean,
    isCurrent: boolean,
    config: (typeof stageStatusConfig)[keyof typeof stageStatusConfig],
    index: number,
  ) => {
    if (isCompleted) return <CheckCircle className="h-5 w-5" />;
    if (isCurrent) return <config.icon className="h-5 w-5" />;
    return index + 1;
  };

  const getTitleClass = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCurrent) return "text-primary";
    if (isCompleted) return "text-green-700 dark:text-green-300";
    return "";
  };

  const getActionBadgeVariant = (action: ReviewAction) => {
    if (action === "approve") return "default";
    if (action === "reject") return "destructive";
    return "outline";
  };

  const handleAction = (stage: ReviewStage, action: ReviewAction) => {
    if (!onAction) return;
    const comments =
      action === "reject" || action === "rework"
        ? (prompt(`${action.charAt(0).toUpperCase() + action.slice(1)} reason (optional):`) ?? undefined)
        : undefined;
    onAction(getStageId(stage), action, comments);
  };

  const renderStage = (stage: ReviewStage, index: number) => {
    const isCurrent = index === currentStageIndex;
    const isCompleted = index < currentStageIndex;
    const isFuture = index > currentStageIndex;
    const config = stageStatusConfig[stage.status];
    const canAct = canActOnStage(stage, index) && showActions;

    const stageClassName = cn(
      "relative rounded-lg border p-4 transition-colors",
      isCurrent && "border-primary/30 bg-primary/5 dark:border-primary/70 dark:bg-primary/900/10",
      isCompleted && "bg-green-50/30 dark:bg-green-900/10",
      isFuture && "bg-muted/30",
      compact && "p-3",
    );

    const circleClassName = cn(
      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-medium text-sm",
      getCircleClass(isCompleted, isCurrent, stage.status),
    );

    const titleClassName = cn("font-medium", getTitleClass(isCompleted, isCurrent));

    const badgeClassName = cn("text-xs", config.color);

    return (
      <div key={stage.id ?? `stage-${stage.stageNumber}`} className={stageClassName}>
        <div className="flex items-start gap-3">
          <div className={circleClassName}>{getCircleContent(isCompleted, isCurrent, config, index)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={titleClassName}>
                Stage {stage.stageNumber}: {stage.name}
              </span>
              {isCurrent && (
                <Badge variant="secondary" className="text-xs animate-pulse">
                  Current
                </Badge>
              )}
              <Badge variant="outline" className={badgeClassName}>
                {config.label}
              </Badge>
              {stage.status === "rework" && (
                <Badge variant="destructive" className="text-xs">
                  Rework Required
                </Badge>
              )}
              {stage.dueDate && (
                <Badge variant="outline" className="text-xs">
                  Due: {formatDate(stage.dueDate)}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>
                {stage.reviewerName ?? stage.reviewerRole.replace(/_/g, " ") ?? "Unassigned"}
                <span className="ml-1">({stage.reviewerRole.replace(/_/g, " ")})</span>
              </span>
              {stage.startedAt && (
                <>
                  <span className="mx-1">\u2022</span>
                  <span>Started: {formatDate(stage.startedAt)}</span>
                </>
              )}
              {stage.completedAt && (
                <>
                  <span className="mx-1">\u2022</span>
                  <span>Completed: {formatDate(stage.completedAt)}</span>
                </>
              )}
            </div>
          </div>

          {canAct && showActions && (
            <div className="flex flex-wrap gap-2 ml-auto">
              {stage.status !== "completed" && stage.status !== "skipped" && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAction(stage, "approve")}
                    disabled={!onAction}
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(stage, "reject")}
                    disabled={!onAction}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Reject
                  </Button>
                  {allowRework && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(stage, "rework")}
                      disabled={!onAction}
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Request Rework
                    </Button>
                  )}
                  {allowSkip && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAction(stage, "comment")}
                      disabled={!onAction}
                    >
                      Skip
                    </Button>
                  )}
                </>
              )}
              {stage.status === "completed" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAction(stage, "rework")}
                  disabled={!onAction || !allowRework}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reopen
                </Button>
              )}
            </div>
          )}

          {(showComments === true || showHistory === true) && (
            <div className={cn("mt-4 pt-4 border-t space-y-3 w-full", compact && "mt-2 pt-2")}>
              {showComments && stage.comments && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Comments</h5>
                  <div className="ml-4 space-y-1 text-sm text-muted-foreground">
                    <p className="whitespace-pre-wrap">{stage.comments}</p>
                  </div>
                  {onAddComment && canAct && (
                    <AddCommentForm stageId={stage.id ?? `stage-${stage.stageNumber}`} onAddComment={onAddComment} />
                  )}
                </div>
              )}

              {showHistory && (stage.startedAt != null || stage.completedAt != null || stage.comments != null) && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">History</h5>
                  <div className="ml-4 space-y-1 text-sm text-muted-foreground">
                    {stage.startedAt && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                        <span>Stage started: {formatDate(stage.startedAt)}</span>
                      </div>
                    )}
                    {stage.completedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        <span>Stage completed: {formatDate(stage.completedAt)}</span>
                      </div>
                    )}
                    {stage.action && (
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionBadgeVariant(stage.action)}>
                          {stage.action.charAt(0).toUpperCase() + stage.action.slice(1)}
                        </Badge>
                        {stage.comments && <span className="ml-2 truncate max-w-xs">{stage.comments}</span>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Review Progress</span>
            <span className="text-muted-foreground">
              {completedCount}/{stages.length} stages complete
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-3">{stages.map((stage, index) => renderStage(stage, index))}</div>
    </div>
  );
}
