"use client";

import { useState } from "react";

import { cn } from "cn";
import { ChevronDown, Plus } from "lucide-react";

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

export interface SavedView {
  id: string;
  name: string;
  isDefault?: boolean;
  isPublic?: boolean;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  columns?: string[];
  pageSize?: number;
}

export interface SavedViewTabsProps {
  views: SavedView[];
  currentViewId?: string;
  onSelect: (viewId: string) => void;
  onSave?: (name: string, viewConfig: Partial<SavedView>) => void;
  onUpdate?: (viewId: string, updates: Partial<SavedView>) => void;
  onDelete?: (viewId: string) => void;
  onSetDefault?: (viewId: string) => void;
  className?: string;
  allowSave?: boolean;
  allowDelete?: boolean;
  allowSetDefault?: boolean;
  showCounts?: boolean;
  counts?: Record<string, number>;
}

export function SavedViewTabs({
  views,
  currentViewId,
  onSelect,
  onSave,
  onUpdate,
  onDelete,
  onSetDefault,
  className,
  allowSave = true,
  allowDelete = true,
  allowSetDefault = true,
  showCounts = false,
  counts = {},
}: SavedViewTabsProps) {
  const [_showSaveDialog, setShowSaveDialog] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [viewToUpdate, setViewToUpdate] = useState<SavedView | null>(null);
  const [editName, setEditName] = useState("");

  const _handleSave = () => {
    if (!newViewName.trim() || !onSave) return;
    onSave(newViewName.trim(), {
      filters: {},
      sortBy: undefined,
      sortOrder: undefined,
      columns: undefined,
      pageSize: undefined,
    });
    setNewViewName("");
    setShowSaveDialog(false);
  };

  const _handleUpdate = () => {
    if (!viewToUpdate || !editName.trim() || !onUpdate) return;
    onUpdate(viewToUpdate.id, { name: editName.trim() });
    setViewToUpdate(null);
    setEditName("");
  };

  const _handleDelete = (viewId: string) => {
    if (!onDelete) return;
    if (confirm(`Delete view "${views.find((v) => v.id === viewId)?.name}"?`)) {
      onDelete(viewId);
    }
  };

  const _handleSetDefault = (viewId: string) => {
    if (!onSetDefault) return;
    onSetDefault(viewId);
  };

  const _startEdit = (view: SavedView) => {
    setViewToUpdate(view);
    setEditName(view.name);
  };

  const defaultView = views.find((v) => v.isDefault);
  const currentView = views.find((v) => v.id === currentViewId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("w-[220px] justify-start", currentView && "bg-primary/5 border-primary/20")}
          >
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            <span className="truncate">{currentView?.name || defaultView?.name || "Saved views"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72" sideOffset={5}>
          <DropdownMenuLabel className="font-medium">Saved Views</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {views.map((view) => (
            <DropdownMenuItem
              key={view.id}
              onSelect={() => onSelect(view.id)}
              className={cn(
                "flex items-center justify-between gap-2",
                view.id === currentViewId && "bg-primary/5 text-primary",
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {view.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
                {view.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                )}
                <span className="truncate">{view.name}</span>
              </div>
              {showCounts && counts[view.id] !== undefined && (
                <Badge variant="outline" className="text-xs ml-2">
                  {counts[view.id]}
                </Badge>
              )}
              {view.id === currentViewId && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {allowSave && (
            <DropdownMenuItem onSelect={() => setShowSaveDialog(true)} className="text-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Save Current View
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {views.length > 0 && (
        <div className="flex items-center gap-1 border-l pl-3 ml-2">
          {views.slice(0, 5).map((view) => (
            <Button
              key={view.id}
              variant={view.id === currentViewId ? "default" : "outline"}
              size="sm"
              onClick={() => onSelect(view.id)}
              className="whitespace-nowrap px-2 py-1"
              title={view.name}
            >
              {view.name}
              {showCounts && counts[view.id] !== undefined && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {counts[view.id]}
                </Badge>
              )}
            </Button>
          ))}
          {views.length > 5 && (
            <Button variant="ghost" size="sm" className="whitespace-nowrap px-1">
              +{views.length - 5}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <title>Check icon</title>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
