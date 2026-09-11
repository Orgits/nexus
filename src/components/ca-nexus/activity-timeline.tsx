"use client";

import { useState } from "react";

import { cn } from "cn";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle, ExternalLink, FileText, MessageSquare, MoreHorizontal, Receipt } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { User as UserType, UUID } from "@/types";

import { StatusBadge } from "./status-badge";

export interface ActivityItem {
  id: string;
  type:
    | "task"
    | "document"
    | "communication"
    | "review"
    | "matter"
    | "invoice"
    | "payment"
    | "note"
    | "system"
    | "document_request"
    | "workpaper"
    | "query"
    | "signoff"
    | "expense";
  title: string;
  description?: string;
  user?: UserType;
  timestamp: string;
  entityType?: string;
  entityId?: UUID;
  entityUrl?: string;
  metadata?: Record<string, unknown>;
  status?: string;
}

const activityIcons: Record<ActivityItem["type"], React.ReactNode> = {
  task: <CheckCircle className="h-4 w-4 text-blue-500" />,
  document: <FileText className="h-4 w-4 text-green-500" />,
  communication: <MessageSquare className="h-4 w-4 text-purple-500" />,
  review: <AlertCircle className="h-4 w-4 text-orange-500" />,
  matter: <ExternalLink className="h-4 w-4 text-indigo-500" />,
  invoice: <FileText className="h-4 w-4 text-amber-500" />,
  payment: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  note: <MessageSquare className="h-4 w-4 text-gray-500" />,
  system: <AlertCircle className="h-4 w-4 text-red-500" />,
  document_request: <FileText className="h-4 w-4 text-cyan-500" />,
  workpaper: <FileText className="h-4 w-4 text-blue-500" />,
  query: <MessageSquare className="h-4 w-4 text-purple-500" />,
  signoff: <CheckCircle className="h-4 w-4 text-green-500" />,
  expense: <Receipt className="h-4 w-4 text-orange-500" />,
};

export function ActivityTimeline({
  activities,
  className,
  maxItems,
  showAvatar = true,
  showTimestamp = true,
  grouped = false,
}: {
  activities: ActivityItem[];
  className?: string;
  maxItems?: number;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  grouped?: boolean;
}) {
  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  if (grouped) {
    const groupedActivities = displayActivities.reduce(
      (acc, activity) => {
        const date = new Date(activity.timestamp).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(activity);
        return acc;
      },
      {} as Record<string, ActivityItem[]>,
    );

    return (
      <div className={cn("space-y-6", className)}>
        {Object.entries(groupedActivities).map(([date, items]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Separator className="flex-1" />
              <span className="px-2 font-medium">
                {new Date(date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Separator className="flex-1" />
            </div>
            <ActivityList activities={items} showAvatar={showAvatar} showTimestamp={showTimestamp} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ActivityList
      activities={displayActivities}
      showAvatar={showAvatar}
      showTimestamp={showTimestamp}
      className={className}
    />
  );
}

function ActivityList({
  activities,
  showAvatar,
  showTimestamp,
  className,
}: {
  activities: ActivityItem[];
  showAvatar: boolean;
  showTimestamp: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full font-medium text-xs",
                getActivityBgColor(activity.type),
              )}
            >
              {activityIcons[activity.type]}
            </div>
            {index < activities.length - 1 && <div className="absolute top-8 bottom-0 left-3.5 w-0.5 bg-border" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">
                  {activity.title}
                  {activity.entityUrl && (
                    <a href={activity.entityUrl} className="ml-2 text-primary text-xs hover:underline">
                      <ExternalLink className="inline h-3 w-3" />
                    </a>
                  )}
                </p>
                {activity.description && <p className="mt-0.5 text-muted-foreground text-sm">{activity.description}</p>}
                {activity.status && <StatusBadge status={activity.status} className="mt-1" />}
              </div>
              {showTimestamp && (
                <span className="whitespace-nowrap text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              )}
            </div>
            {showAvatar && activity.user && (
              <div className="mt-1 flex items-center gap-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activity.user.avatarUrl} alt={activity.user.fullName} />
                  <AvatarFallback>
                    {activity.user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground text-xs">{activity.user.fullName}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function getActivityBgColor(type: ActivityItem["type"]): string {
  const colors: Record<ActivityItem["type"], string> = {
    task: "bg-blue-100 dark:bg-blue-900/30",
    document: "bg-green-100 dark:bg-green-900/30",
    communication: "bg-purple-100 dark:bg-purple-900/30",
    review: "bg-orange-100 dark:bg-orange-900/30",
    matter: "bg-indigo-100 dark:bg-indigo-900/30",
    invoice: "bg-amber-100 dark:bg-amber-900/30",
    payment: "bg-emerald-100 dark:bg-emerald-900/30",
    note: "bg-gray-100 dark:bg-gray-900/30",
    system: "bg-red-100 dark:bg-red-900/30",
    document_request: "bg-cyan-100 dark:bg-cyan-900/30",
    workpaper: "bg-blue-100 dark:bg-blue-900/30",
    query: "bg-purple-100 dark:bg-purple-900/30",
    signoff: "bg-green-100 dark:bg-green-900/30",
    expense: "bg-orange-100 dark:bg-orange-900/30",
  };
  return colors[type] || colors.system;
}

export function ActivityFeed({
  activities,
  className,
  onLoadMore,
  hasMore,
  loading,
}: {
  activities: ActivityItem[];
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <ScrollArea className="h-[400px]">
        <ActivityTimeline activities={activities} showAvatar={true} showTimestamp={true} />
      </ScrollArea>
      {hasMore && (
        <div className="pt-4 text-center">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function CommentThread({
  comments,
  onAddComment,
  onReply,
  className,
  currentUserId,
}: {
  comments: Array<{
    id: string;
    content: string;
    user: UserType;
    createdAt: string;
    updatedAt?: string;
    parentId?: string;
    replies?: Array<{
      id: string;
      content: string;
      user: UserType;
      createdAt: string;
    }>;
    isInternal?: boolean;
  }>;
  onAddComment?: (content: string, parentId?: string) => void;
  onReply?: (commentId: string, content: string) => void;
  className?: string;
  currentUserId?: string;
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim() && onReply) {
      onReply(parentId, replyContent.trim());
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.user.avatarUrl} alt={comment.user.fullName} />
            <AvatarFallback>
              {comment.user.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.fullName}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  {comment.isInternal && (
                    <Badge variant="secondary" className="text-xs">
                      Internal
                    </Badge>
                  )}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <span className="text-muted-foreground text-xs">(edited)</span>
                  )}
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
              {currentUserId === comment.user.id && (
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2 ml-11 space-y-2 border-l-2 pl-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={reply.user.avatarUrl} alt={reply.user.fullName} />
                      <AvatarFallback>
                        {reply.user.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{reply.user.fullName}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {replyingTo === comment.id && (
              <div className="mt-2 ml-11 flex gap-2">
                <Input
                  value={replyContent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    e.key === "Enter" && handleSubmitReply(comment.id)
                  }
                  autoFocus
                />
                <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                  Reply
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </div>
            )}
            {!replyingTo && (
              <Button variant="ghost" size="sm" className="mt-1 ml-11" onClick={() => setReplyingTo(comment.id)}>
                Reply
              </Button>
            )}
          </div>
        </div>
      ))}
      {onAddComment && (
        <div className="flex gap-3 border-t pt-4">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              className="min-h-[80px] w-full resize-none rounded-lg border p-3 focus:ring-2 focus:ring-ring"
              placeholder="Add a comment..."
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const target = e.currentTarget;
                  if (target.value.trim()) {
                    onAddComment(target.value.trim());
                    target.value = "";
                  }
                }
              }}
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  const target = e.currentTarget;
                  const textarea = target.parentElement?.previousElementSibling as HTMLTextAreaElement | null;
                  if (textarea?.value.trim()) {
                    onAddComment(textarea.value.trim());
                    textarea.value = "";
                  }
                }}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
