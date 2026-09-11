"use client";

import { useState } from "react";

import { cn } from "cn";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FilterParams } from "@/types";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "multi_select" | "date" | "date_range" | "number" | "boolean";
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: unknown;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: FilterParams;
  onChange: (values: FilterParams) => void;
  onSearch?: (search: string) => void;
  searchPlaceholder?: string;
  className?: string;
  showClearAll?: boolean;
  compact?: boolean;
}

export function FilterBar({
  filters,
  values,
  onChange,
  onSearch,
  searchPlaceholder = "Search...",
  className,
  showClearAll = true,
  compact = false,
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFiltersCount = Object.keys(values).filter(
    (k) =>
      values[k] !== undefined &&
      values[k] !== null &&
      values[k] !== "" &&
      k !== "page" &&
      k !== "pageSize" &&
      k !== "sortBy" &&
      k !== "sortOrder",
  ).length;

  const handleChange = (key: string, value: unknown) => {
    const newValues = { ...values };
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      delete newValues[key];
    } else {
      newValues[key] = value;
    }
    newValues.page = 1;
    onChange(newValues);
  };

  const handleClearAll = () => {
    const newValues = { page: 1, pageSize: values.pageSize };
    onChange(newValues);
    if (onSearch) onSearch("");
  };

  const basicFilters = filters.slice(0, compact ? 3 : 5);
  const advancedFilters = filters.slice(compact ? 3 : 5);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        {onSearch && (
          <div className="relative min-w-[200px] max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(values.search as string) || ""}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {basicFilters.map((filter) => (
          <FilterField
            key={filter.key}
            filter={filter}
            value={values[filter.key]}
            onChange={handleChange}
            compact={compact}
          />
        ))}

        {advancedFilters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="whitespace-nowrap"
          >
            <SlidersHorizontal className="mr-1.5 h-4 w-4" />
            Advanced ({advancedFilters.length})
          </Button>
        )}

        {showClearAll && activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <X className="mr-1.5 h-4 w-4" />
            Clear all ({activeFiltersCount})
          </Button>
        )}
      </div>

      {showAdvanced && advancedFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t pt-2">
          {advancedFilters.map((filter) => (
            <FilterField
              key={filter.key}
              filter={filter}
              value={values[filter.key]}
              onChange={handleChange}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterField({
  filter,
  value,
  onChange,
  compact,
}: {
  filter: FilterConfig;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  compact?: boolean;
}) {
  const isActive =
    value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0);

  switch (filter.type) {
    case "text":
      return (
        <div className={cn("relative min-w-[180px] max-w-[300px] flex-1", compact && "max-w-[200px]")}>
          <Input
            placeholder={filter.placeholder || filter.label}
            value={(value as string) || ""}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className={cn(isActive && "border-primary/20 bg-primary/5")}
          />
        </div>
      );

    case "select":
      return (
        <div className={cn("w-[180px]", compact && "w-[160px]")}>
          <Select value={(value as string) || ""} onValueChange={(v) => onChange(filter.key, v || undefined)}>
            <SelectTrigger className={cn(isActive && "border-primary/20 bg-primary/5")}>
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {filter.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "multi_select": {
      const selectedValues = (Array.isArray(value) ? value : []) as string[];
      const displayValue =
        selectedValues.length > 0
          ? selectedValues.map((v) => filter.options?.find((o) => o.value === v)?.label || v).join(", ")
          : filter.placeholder || filter.label;

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={false}
              className={cn(
                "w-[200px] justify-start text-left",
                compact && "w-[180px]",
                isActive && "border-primary/20 bg-primary/5",
                selectedValues.length === 0 && "text-muted-foreground",
              )}
            >
              {displayValue}
              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" sideOffset={5}>
            {filter.options?.map((opt) => {
              const checkboxId = `filter-${filter.key}-${opt.value}`;
              return (
                <label
                  key={opt.value}
                  htmlFor={checkboxId}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-accent"
                >
                  <Checkbox
                    id={checkboxId}
                    checked={selectedValues.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, opt.value]
                        : selectedValues.filter((v) => v !== opt.value);
                      onChange(filter.key, newValues);
                    }}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              );
            })}
            {selectedValues.length > 0 && (
              <div className="border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onChange(filter.key, [])}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Clear all
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      );
    }

    case "date":
      return (
        <div className={cn("w-[180px]", compact && "w-[160px]")}>
          <Input
            type="date"
            placeholder={filter.placeholder || filter.label}
            value={(value as string) || ""}
            onChange={(e) => onChange(filter.key, e.target.value || undefined)}
            className={cn(isActive && "border-primary/20 bg-primary/5")}
          />
        </div>
      );

    case "date_range":
      return (
        <div className={cn("w-[360px]", compact && "w-[320px]")} style={{ display: "flex", gap: "8px" }}>
          <Input
            type="date"
            placeholder="From"
            value={value && Array.isArray(value) && value[0] ? value[0] : ""}
            onChange={(e) => {
              const current = (value as string[]) || ["", ""];
              onChange(filter.key, [e.target.value, current[1]]);
            }}
            className={cn("w-[160px]", isActive && "border-primary/20 bg-primary/5")}
          />
          <span className="self-center text-muted-foreground">to</span>
          <Input
            type="date"
            placeholder="To"
            value={value && Array.isArray(value) && value[1] ? value[1] : ""}
            onChange={(e) => {
              const current = (value as string[]) || ["", ""];
              onChange(filter.key, [current[0], e.target.value]);
            }}
            className={cn("w-[160px]", isActive && "border-primary/20 bg-primary/5")}
          />
        </div>
      );

    case "number":
      return (
        <div className={cn("w-[120px]", compact && "w-[100px]")}>
          <Input
            type="number"
            placeholder={filter.placeholder || filter.label}
            value={(value as number) || ""}
            onChange={(e) => onChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
            className={cn(isActive && "border-primary/20 bg-primary/5")}
          />
        </div>
      );

    case "boolean":
      return (
        <div className="w-[140px]">
          <Select value={(value as string) || ""} onValueChange={(v) => onChange(filter.key, v || undefined)}>
            <SelectTrigger className={cn(isActive && "border-primary/20 bg-primary/5")}>
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    default:
      return null;
  }
}

export function FilterChips({
  filters,
  values,
  onRemove,
  className,
}: {
  filters: FilterConfig[];
  values: FilterParams;
  onRemove: (key: string) => void;
  className?: string;
}) {
  const activeFilters = filters
    .filter(
      (f) =>
        values[f.key] !== undefined &&
        values[f.key] !== null &&
        values[f.key] !== "" &&
        !(Array.isArray(values[f.key]) && (values[f.key] as unknown[]).length === 0),
    )
    .map((f) => {
      const value = values[f.key];
      let label = "";
      if (Array.isArray(value)) {
        label = value.map((v) => f.options?.find((o) => o.value === v)?.label || v).join(", ");
      } else if (typeof value === "boolean") {
        label = value ? "Yes" : "No";
      } else {
        label = f.options?.find((o) => o.value === value)?.label || String(value);
      }
      return { key: f.key, label: `${f.label}: ${label}` };
    });

  if (activeFilters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {activeFilters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary text-sm"
        >
          {f.label}
          <button
            type="button"
            onClick={() => onRemove(f.key)}
            className="ml-1 rounded p-0.5 hover:bg-primary/20"
            aria-label="Remove filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export function SavedViews({
  views,
  currentView,
  onSelect,
  onSave,
  onDelete,
  className,
}: {
  views: Array<{ id: string; name: string; isDefault?: boolean; isPublic?: boolean }>;
  currentView?: string;
  onSelect: (viewId: string) => void;
  onSave?: (name: string) => void;
  onDelete?: (viewId: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={currentView || ""} onValueChange={onSelect}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Saved views" />
        </SelectTrigger>
        <SelectContent>
          {views.map((view) => (
            <SelectItem key={view.id} value={view.id}>
              {view.name} {view.isDefault && "(Default)"} {view.isPublic && "(Public)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onSave && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const name = prompt("Enter view name:");
            if (name) onSave(name);
          }}
        >
          Save
        </Button>
      )}
      {onDelete && currentView && (
        <Button variant="ghost" size="icon" onClick={() => onDelete(currentView)} title="Delete view">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
