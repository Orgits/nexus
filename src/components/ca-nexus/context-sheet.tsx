"use client";

import { useState } from "react";

import { cn } from "cn";
import { ChevronDown, ChevronRight, MoreHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export interface ContextAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
  disabled?: boolean;
  destructive?: boolean;
}

export interface ContextSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  count?: number;
}

interface ContextSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  actions?: ContextAction[];
  sections: ContextSection[];
  footer?: React.ReactNode;
  className?: string;
  side?: "right" | "left";
  width?: "sm" | "md" | "lg" | "xl" | "full";
  showHeader?: boolean;
}

const widthClasses = {
  sm: "w-80",
  md: "w-96",
  lg: "w-[36rem]",
  xl: "w-[42rem]",
  full: "w-full max-w-full",
};

export function ContextSheet({
  isOpen,
  onOpenChange,
  title,
  description,
  subtitle,
  avatar,
  actions = [],
  sections,
  footer,
  className,
  side = "right",
  width = "lg",
  showHeader = true,
}: ContextSheetProps) {
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of sections) {
      initial[section.id] = section.defaultOpen !== false;
    }
    return initial;
  });

  const toggleSection = (id: string) => {
    setActiveSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn(widthClasses[width], "max-h-full", className)}>
        {showHeader ? (
          <SheetHeader className="border-b pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {avatar && <div className="flex-shrink-0">{avatar}</div>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="truncate">{title}</SheetTitle>
                    {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
                  </div>
                  {description && <SheetDescription className="mt-1">{description}</SheetDescription>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {actions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={5}>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {actions.map((action) => (
                        <DropdownMenuItem
                          key={action.id}
                          onSelect={action.onClick}
                          disabled={action.disabled}
                          className={cn("flex items-center gap-2", action.destructive && "text-destructive")}
                        >
                          {action.icon}
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-9 w-9">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>
        ) : null}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sections.map((section) => {
            const isOpen = activeSections[section.id] !== false;
            return (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {section.collapsible && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 p-0"
                        onClick={() => toggleSection(section.id)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    )}
                    {section.icon && <span className="text-muted-foreground">{section.icon}</span>}
                    <h3 className="font-medium text-sm">{section.title}</h3>
                    {section.count !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {section.count}
                      </Badge>
                    )}
                  </div>
                </div>
                {isOpen && <div className="ml-7 space-y-3">{section.children}</div>}
                {!section.collapsible && <div className="ml-7 space-y-3">{section.children}</div>}
              </div>
            );
          })}
        </div>
        {footer && <div className="border-t pt-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
