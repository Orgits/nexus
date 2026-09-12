"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { cn } from "cn";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Shield,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelativeTime } from "@/lib/format";
import { useNotificationStore } from "@/stores/notifications/notification-store";

const notificationIcons: Record<string, React.ReactNode> = {
  assignment: <Users className="h-4 w-4" />,
  deadline: <Clock className="h-4 w-4" />,
  overdue: <AlertTriangle className="h-4 w-4" />,
  review: <FileText className="h-4 w-4" />,
  mention: <MessageSquare className="h-4 w-4" />,
  communication_followup: <Mail className="h-4 w-4" />,
  document_received: <FileText className="h-4 w-4" />,
  campaign_event: <Mail className="h-4 w-4" />,
  payment: <Wallet className="h-4 w-4" />,
  approval: <CheckCircle className="h-4 w-4" />,
  system: <Shield className="h-4 w-4" />,
  reminder: <Bell className="h-4 w-4" />,
};

const notificationColors: Record<string, string> = {
  assignment: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  deadline: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  overdue: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  review: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  mention: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  communication_followup: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  document_received: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  campaign_event: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  payment: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  approval: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  system: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  reminder: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-amber-100 text-amber-600",
  critical: "bg-red-100 text-red-600",
  urgent: "bg-red-100 text-red-600 animate-pulse",
};

export function NotificationPanel() {
  const router = useRouter();
  const _pathname = usePathname();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setIsOpen(false);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(id);
  };

  const _unreadNotifications = notifications.filter((n) => !n.isRead);
  const recentNotifications = notifications.slice(0, 10);

  if (!mounted) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-10 w-10 rounded-full relative", unreadCount > 0 && "text-primary")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[600px]" align="end" sideOffset={5}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <DropdownMenuLabel className="font-medium">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                Mark all read
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1 p-2">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-3 rounded-lg transition-colors",
                      !notification.isRead ? "bg-primary/5" : "hover:bg-accent",
                    )}
                    onClick={() => handleNotificationClick(notification)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                        notificationColors[notification.type],
                      )}
                    >
                      {notificationIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("font-medium text-sm truncate", !notification.isRead && "font-semibold")}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="flex h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        <Badge variant="secondary" className={cn("text-[10px]", priorityColors[notification.priority])}>
                          {notification.priority}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDismiss(notification.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 10 && <DropdownMenuSeparator />}
          {notifications.length > 10 && (
            <DropdownMenuItem
              className="text-center text-sm text-primary hover:bg-accent"
              onClick={() => router.push("/dashboard/notifications")}
            >
              View all notifications
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
