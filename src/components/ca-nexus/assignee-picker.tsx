"use client";

import { useMemo, useState } from "react";

import { cn } from "cn";
import { ChevronDown, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface AssigneeOption {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  team?: string;
  workload?: {
    openTasks: number;
    capacity: number;
    utilization: number;
    isOverloaded?: boolean;
    isUnderutilized?: boolean;
  };
  isActive?: boolean;
}

export interface AssigneePickerProps {
  options: AssigneeOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  showWorkload?: boolean;
  showRole?: boolean;
  showTeam?: boolean;
  showAvatar?: boolean;
  filterByTeam?: string;
  filterByRole?: string;
  disabled?: boolean;
  className?: string;
  trigger?: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  clearable?: boolean;
  maxSelections?: number;
}

function formatRole(role: string): string {
  return role.split("_").join(" ");
}

function _renderAssigneeOption({
  opt,
  isSelected,
  isDisabled,
  showAvatar,
  showRole,
  showTeam,
  showWorkload,
  handleSelect,
  cn,
  getInitials,
}: {
  opt: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
    team?: string;
    workload?: {
      openTasks: number;
      capacity: number;
      utilization: number;
      isOverloaded?: boolean;
      isUnderutilized?: boolean;
    };
    isActive?: boolean;
  };
  isSelected: boolean;
  isDisabled: boolean;
  showAvatar: boolean;
  showRole: boolean;
  showTeam: boolean;
  showWorkload: boolean;
  handleSelect: (id: string) => void;
  cn: (classes: string) => string;
  getInitials: (name: string) => string;
}) {
  const optionId = `assignee-option-${opt.id}`;

  return (
    <button
      key={opt.id}
      id={optionId}
      type="button"
      tabIndex={0}
      onClick={() => !isDisabled && handleSelect(opt.id)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
          e.preventDefault();
          handleSelect(opt.id);
        }
      }}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded px-2 py-2 transition-colors hover:bg-accent",
        isSelected && "bg-primary/5 text-primary",
        isDisabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <Checkbox
        id={optionId}
        checked={isSelected}
        onCheckedChange={() => !isDisabled && handleSelect(opt.id)}
        disabled={isDisabled}
      />
      {showAvatar && (
        <Avatar className="h-6 w-6">
          <AvatarImage src={opt.avatarUrl} alt={opt.name} />
          <AvatarFallback>{getInitials(opt.name)}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("font-medium truncate", isSelected && "font-semibold")}>{opt.name}</span>
          {showRole && opt.role && (
            <Badge variant="outline" className="text-xs">
              {formatRole(opt.role)}
            </Badge>
          )}
          {showTeam && opt.team && (
            <Badge variant="secondary" className="text-xs">
              {opt.team}
            </Badge>
          )}
        </div>
        {opt.email && <span className="text-muted-foreground text-xs truncate max-w-[150px]">{opt.email}</span>}
        {showWorkload && opt.workload && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium",
                opt.workload.utilization > 100
                  ? "text-red-600 bg-red-50"
                  : opt.workload.utilization > 80
                    ? "text-amber-600 bg-amber-50"
                    : opt.workload.utilization < 50
                      ? "text-blue-600 bg-blue-50"
                      : "text-green-600 bg-green-50",
              )}
            >
              {opt.workload.utilization} %
            </span>
            {opt.workload.isOverloaded && <span className="text-red-600 text-xs">Overloaded</span>}
            {opt.workload.isUnderutilized && <span className="text-blue-600 text-xs">Available</span>}
          </div>
        )}
      </div>
    </button>
  );
}

export function AssigneePicker({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Select assignee...",
  showWorkload = true,
  showRole = true,
  showTeam = true,
  showAvatar = true,
  filterByTeam,
  filterByRole,
  disabled = false,
  className,
  trigger,
  label,
  required = false,
  error,
  clearable = true,
  maxSelections,
}: AssigneePickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selectedValuesArray = Array.isArray(value) ? value : value ? [value] : [];
  const selectedOptions = options.filter((o) => selectedValuesArray.includes(o.id));

  const filteredOptions = useMemo(() => {
    return options.filter((opt) => {
      if (opt.isActive === false) return false;
      if (filterByTeam && opt.team !== filterByTeam) return false;
      if (filterByRole && opt.role !== filterByRole) return false;
      if (search) {
        const query = search.toLowerCase();
        return (
          opt.name.toLowerCase().includes(query) ||
          opt.email.toLowerCase().includes(query) ||
          opt.role?.toLowerCase().includes(query) ||
          opt.team?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [options, search, filterByTeam, filterByRole]);

  const availableOptions = filteredOptions.filter((o) => !selectedValuesArray.includes(o.id));
  const isMaxReached = maxSelections && selectedValuesArray.length >= maxSelections;

  const handleSelect = (optionId: string) => {
    if (multiple) {
      if (selectedValuesArray.includes(optionId)) {
        onChange(selectedValuesArray.filter((id) => id !== optionId));
      } else if (!maxSelections || selectedValuesArray.length < maxSelections) {
        onChange([...selectedValuesArray, optionId]);
      }
    } else {
      onChange(optionId);
      setOpen(false);
    }
  };

  const handleRemove = (optionId: string) => {
    onChange(selectedValuesArray.filter((id) => id !== optionId));
  };

  const handleClear = () => {
    onChange(multiple ? [] : "");
    setOpen(false);
  };

  const _getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const _getWorkloadColor = (utilization: number) => {
    if (utilization > 100) return "text-red-600 bg-red-50";
    if (utilization > 80) return "text-amber-600 bg-amber-50";
    if (utilization < 50) return "text-blue-600 bg-blue-50";
    return "text-green-600 bg-green-50";
  };

  const renderSelected = () => {
    if (selectedOptions.length === 0) return null;

    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map((opt) => (
            <span
              key={opt.id}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary text-sm"
            >
              {showAvatar && (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={opt.avatarUrl} alt={opt.name} />
                  <AvatarFallback>
                    {opt.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="truncate max-w-[150px]">{opt.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(opt.id);
                }}
                className="ml-1 rounded p-0.5 hover:bg-primary/20 text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {isMaxReached && (
            <Badge variant="secondary" className="text-xs">
              Max reached
            </Badge>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        {showAvatar && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={selectedOptions[0]?.avatarUrl} alt={selectedOptions[0]?.name} />
            <AvatarFallback>
              {selectedOptions[0]?.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="truncate max-w-[200px]">{selectedOptions[0]?.name || placeholder}</span>
        {clearable && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="rounded p-0.5 hover:bg-accent text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {label && (
        <div className="text-sm font-medium mb-1">
          {label} {required && <span className="text-destructive">*</span>}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={error ? "outline" : "outline"}
            className={cn(
              "w-full justify-start text-left h-auto py-3",
              isMaxReached && "bg-muted/50",
              disabled && "opacity-50",
            )}
            disabled={disabled}
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex-1">{renderSelected()}</div>
              <ChevronDown className={cn("h-4 w-4 opacity-50", open && "rotate-180")} />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-[60vh] p-0" sideOffset={5}>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Select Assignee</h3>
                <p className="text-sm text-muted-foreground">
                  {multiple ? `Select up to ${maxSelections || "multiple"} assignees` : "Select an assignee"}
                </p>
              </div>
              {multiple && selectedOptions.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => onChange([])}>
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Clear all
                </Button>
              )}
            </div>

            <Input
              placeholder="Search by name, email, role, team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
              disabled={isMaxReached}
            />

            <ScrollArea className="max-h-[400px]">
              <div className="space-y-1">
                {availableOptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {search ? "No matching assignees found" : "No assignees available"}
                  </div>
                ) : (
                  availableOptions.map((opt) => {
                    const isSelected = selectedValuesArray.includes(opt.id);
                    const isDisabled = disabled || opt.isActive === false || (isMaxReached && !isSelected);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        tabIndex={0}
                        onClick={() => !isDisabled && handleSelect(opt.id)}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && !isDisabled) {
                            e.preventDefault();
                            handleSelect(opt.id);
                          }
                        }}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded px-2 py-2 transition-colors hover:bg-accent",
                          isSelected && "bg-primary/5 text-primary",
                          isDisabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => !isDisabled && handleSelect(opt.id)}
                          disabled={disabled || opt.isActive === false || (isMaxReached && !isSelected)}
                        />
                        {showAvatar && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={opt.avatarUrl} alt={opt.name} />
                            <AvatarFallback>
                              {opt.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-medium truncate", isSelected && "font-semibold")}>
                              {opt.name}
                            </span>
                            {showRole && opt.role && (
                              <Badge variant="outline" className="text-xs">
                                {opt.role.split("_").join(" ")}
                              </Badge>
                            )}
                            {showTeam && opt.team && (
                              <Badge variant="secondary" className="text-xs">
                                {opt.team}
                              </Badge>
                            )}
                          </div>
                          {opt.email && (
                            <span className="text-muted-foreground text-xs truncate max-w-[150px]">{opt.email}</span>
                          )}
                          {showWorkload && opt.workload && (
                            <div className="flex items-center gap-1.5 ml-auto">
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                                  opt.workload.utilization > 100
                                    ? "text-red-600 bg-red-50"
                                    : opt.workload.utilization > 80
                                      ? "text-amber-600 bg-amber-50"
                                      : opt.workload.utilization < 50
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-green-600 bg-green-50",
                                )}
                              >
                                {opt.workload.utilization} %
                              </span>
                              {opt.workload.isOverloaded && <span className="text-red-600 text-xs">Overloaded</span>}
                              {opt.workload.isUnderutilized && <span className="text-blue-600 text-xs">Available</span>}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {multiple && selectedOptions.length > 0 && (
              <div className="pt-2 border-t">
                <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  Done ({selectedOptions.length}
                  {maxSelections ? ` / ${maxSelections}` : ""})
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}
