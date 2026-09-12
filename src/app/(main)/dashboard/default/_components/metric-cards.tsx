"use client";

import Link from "next/link";

import { cn } from "cn";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MessageSquare,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  href?: string;
  status?: "normal" | "warning" | "critical";
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg,
  href,
  status = "normal",
  actionLabel,
  actionHref,
  className,
}: KPICardProps) {
  const statusStyles = {
    normal: "border-l-4 border-primary",
    warning: "border-l-4 border-yellow-500",
    critical: "border-l-4 border-red-500",
  };

  return (
    <Card className={cn("relative transition-all hover:shadow-md", statusStyles[status], className)}>
      {href && <Link href={href} className="absolute inset-0 z-10" aria-label={`View ${title} details`} />}
      <CardContent className="relative z-20 p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-muted-foreground text-sm">{title}</p>
            <p className="mt-1 font-bold text-3xl">{value}</p>
            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                {change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={cn("font-medium", change >= 0 ? "text-green-600" : "text-red-600")}>
                  {Math.abs(change)}%
                </span>
                {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
              </div>
            )}
            {actionLabel && actionHref && (
              <Link
                href={actionHref}
                className="mt-3 inline-flex items-center gap-1 text-primary text-sm hover:underline"
              >
                {actionLabel}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <div className={cn("rounded-xl p-3", iconBg)}>{icon}</div>
        </div>
        {status === "critical" && (
          <Badge variant="destructive" className="absolute top-3 right-3 text-xs">
            Critical
          </Badge>
        )}
        {status === "warning" && (
          <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
            Warning
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

interface KPICardsProps {
  className?: string;
}

export function KPICards({ className }: KPICardsProps) {
  const kpis = [
    {
      title: "Critical Deadlines",
      value: 7,
      change: 12,
      changeLabel: "vs last week",
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      iconBg: "bg-red-50 dark:bg-red-900/20",
      href: "/dashboard/compliance?filter=overdue",
      status: "critical" as const,
      actionLabel: "View all",
      actionHref: "/dashboard/compliance?filter=overdue",
    },
    {
      title: "My Tasks",
      value: 24,
      change: -5,
      changeLabel: "completed today",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      iconBg: "bg-green-50 dark:bg-green-900/20",
      href: "/dashboard/tasks?view=my",
      actionLabel: "View inbox",
      actionHref: "/dashboard/tasks?view=my",
    },
    {
      title: "Pending Compliance",
      value: 18,
      change: 3,
      changeLabel: "new this week",
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      href: "/dashboard/compliance",
      status: "warning" as const,
      actionLabel: "View overview",
      actionHref: "/dashboard/compliance",
    },
    {
      title: "Missing Information",
      value: 12,
      change: -2,
      changeLabel: "resolved",
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      href: "/dashboard/compliance?filter=documents-pending",
      actionLabel: "Request docs",
      actionHref: "/dashboard/compliance?filter=documents-pending",
    },
    {
      title: "Pending Reviews",
      value: 5,
      change: 0,
      changeLabel: "awaiting action",
      icon: <Briefcase className="h-6 w-6 text-purple-600" />,
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      href: "/dashboard/reviews",
      actionLabel: "Review inbox",
      actionHref: "/dashboard/reviews",
    },
    {
      title: "Payments Due",
      value: "₹4.2L",
      change: 8,
      changeLabel: "overdue amount",
      icon: <DollarSign className="h-6 w-6 text-red-600" />,
      iconBg: "bg-red-50 dark:bg-red-900/20",
      href: "/dashboard/invoices?filter=overdue",
      status: "critical" as const,
      actionLabel: "View payments",
      actionHref: "/dashboard/invoices?filter=overdue",
    },
    {
      title: "Communication",
      value: 8,
      change: 3,
      changeLabel: "unread messages",
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      href: "/dashboard/communications",
      actionLabel: "Open inbox",
      actionHref: "/dashboard/communications",
    },
    {
      title: "Notifications",
      value: 12,
      change: 5,
      changeLabel: "new alerts",
      icon: <Bell className="h-6 w-6 text-purple-600" />,
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      href: "/dashboard/notices",
      actionLabel: "View all",
      actionHref: "/dashboard/notices",
    },
  ];

  return (
    <div className={cn("relative", className)}>
      <div
        data-kpi-scroll
        className="flex min-w-0 scroll-fade-x snap-x snap-mandatory scroll-px-1 scrollbar-none gap-4 overflow-x-auto overscroll-x-contain py-1"
      >
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} className="flex-none snap-start min-w-[280px] max-w-[320px]" />
        ))}
      </div>
      <div
        className="absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-20 rounded-full bg-background/80 hover:bg-background shadow-md"
        onClick={() => {
          const container = document.querySelector("[data-kpi-scroll]");
          if (container) container.scrollBy({ left: -300, behavior: "smooth" });
        }}
        aria-label="Scroll left"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-20 rounded-full bg-background/80 hover:bg-background shadow-md"
        onClick={() => {
          const container = document.querySelector("[data-kpi-scroll]");
          if (container) container.scrollBy({ left: 300, behavior: "smooth" });
        }}
        aria-label="Scroll right"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
