"use client";

import { cn } from "cn";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        <h1 className="font-bold text-2xl tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  noPadding = false,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description || actions) && (
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              {title && <CardTitle className="font-semibold text-base">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(noPadding && "p-0")}>{children}</CardContent>
    </Card>
  );
}

export function DetailSection({
  title,
  showDivider = true,
  children,
  className,
}: {
  title?: React.ReactNode;
  showDivider?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && <h3 className="font-semibold text-sm">{title}</h3>}
      {children}
      {showDivider && <Separator className="mt-4" />}
    </div>
  );
}

export function KeyValue({
  label,
  value,
  icon,
  className,
  valueClassName,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs">
        {icon}
        {label}
      </div>
      <div className={cn("font-medium text-sm", valueClassName)}>{value ?? "—"}</div>
    </div>
  );
}

export function KeyValueList({
  items,
  className,
}: {
  items: Array<{ label: string; value?: React.ReactNode; icon?: React.ReactNode }>;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {items.map((item, index) => (
        <KeyValue key={index} label={item.label} value={item.value} icon={item.icon} />
      ))}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-2", className)}>
      <CardContent className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-muted-foreground text-xs">{label}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className="font-bold text-2xl tracking-tight">{value}</div>
        {hint && <div className="text-muted-foreground text-xs">{hint}</div>}
      </CardContent>
    </Card>
  );
}
