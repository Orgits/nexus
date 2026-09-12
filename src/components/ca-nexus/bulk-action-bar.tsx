"use client";

import { useState } from "react";

import { cn } from "cn";
import { MoreHorizontal, X } from "lucide-react";

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

export interface BulkAction<TData> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (rows: TData[]) => void | Promise<void>;
  destructive?: boolean;
  disabled?: boolean;
  requireConfirmation?: boolean;
  confirmationMessage?: string;
  confirmationTitle?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
}

export interface BulkActionBarProps<TData> {
  selectedRows: TData[];
  actions: BulkAction<TData>[];
  onClearSelection: () => void;
  className?: string;
  showSelectionCount?: boolean;
  customActions?: React.ReactNode;
}

export function BulkActionBar<TData>({
  selectedRows,
  actions,
  onClearSelection,
  className,
  showSelectionCount = true,
  customActions,
}: BulkActionBarProps<TData>) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: BulkAction<TData> | null;
  }>({ open: false, action: null });

  const handleActionClick = async (action: BulkAction<TData>) => {
    if (action.requireConfirmation) {
      setConfirmDialog({ open: true, action });
    } else {
      try {
        await action.action(selectedRows);
      } catch (error) {
        console.error("Bulk action failed:", error);
      }
    }
  };

  const _handleConfirm = async () => {
    if (confirmDialog.action) {
      await confirmDialog.action.action(selectedRows);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const _handleCancel = () => {
    setConfirmDialog({ open: false, action: null });
  };

  if (selectedRows.length === 0) return null;

  const count = selectedRows.length;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg bg-primary/5 border-primary/20 animate-in slide-in-from-bottom-2",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {showSelectionCount && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {count} {count === 1 ? "item" : "items"} selected
            </Badge>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {actions.slice(0, 4).map((action) => (
            <Button
              key={action.id}
              variant={action.variant || (action.destructive ? "destructive" : "outline")}
              size="sm"
              onClick={() => handleActionClick(action)}
              disabled={action.disabled || selectedRows.length === 0}
              className="whitespace-nowrap gap-1.5"
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          ))}

          {actions.length > 4 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <MoreHorizontal className="mr-1.5 h-4 w-4" />
                  More ({actions.length - 4})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={5}>
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actions.slice(4).map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onSelect={() => handleActionClick(action)}
                    disabled={action.disabled || selectedRows.length === 0}
                    className={cn("flex items-center gap-2", action.destructive && "text-destructive")}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {customActions}
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Clear selection</span>
        </Button>
      </div>
    </div>
  );
}
