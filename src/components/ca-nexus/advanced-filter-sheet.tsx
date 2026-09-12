"use client";

import { useEffect, useState } from "react";

import { cn } from "cn";
import { ChevronDown, Filter as FilterIcon, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { FilterConfig, FilterParams } from "@/lib/preferences/preferences-config";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <title>Check icon</title>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface AdvancedFilterSheetProps {
  filters: FilterConfig[];
  values: FilterParams;
  onChange: (values: FilterParams) => void;
  onSearch?: (search: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  trigger?: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  isLoading?: boolean;
  onApply?: () => void;
  onReset?: () => void;
}

export function AdvancedFilterSheet({
  filters,
  values,
  onChange,
  onSearch,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  trigger,
  className,
  title = "Advanced Filters",
  description = "Refine your search with advanced filters",
  isLoading = false,
  onApply,
  onReset,
}: AdvancedFilterSheetProps) {
  const [_open, setOpen] = useState(false);
  const [localValues, setLocalValues] = useState<FilterParams>(values);
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    setLocalValues(values);
    setLocalSearch(searchValue);
  }, [values, searchValue]);

  const handleChange = (key: string, value: unknown) => {
    const newValues = { ...localValues };
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      delete newValues[key];
    } else {
      newValues[key] = value;
    }
    newValues.page = 1;
    setLocalValues(newValues);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  const handleClearAll = () => {
    setLocalValues({ page: 1, pageSize: values.pageSize });
    setLocalSearch("");
    onSearchChange?.("");
    onReset?.();
  };

  const handleApply = () => {
    onChange(localValues);
    onSearchChange?.(localSearch);
    onApply?.();
    setOpen(false);
  };

  const activeFiltersCount = Object.keys(localValues).filter(
    (k) =>
      localValues[k] !== undefined &&
      localValues[k] !== null &&
      localValues[k] !== "" &&
      k !== "page" &&
      k !== "pageSize" &&
      k !== "sortBy" &&
      k !== "sortOrder",
  ).length;

  const hasActiveFilters = activeFiltersCount > 0 || localSearch !== "";

  return (
    <>
      {trigger || (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "whitespace-nowrap gap-2",
                hasActiveFilters && "border-primary/20 bg-primary/5 text-primary",
                className,
              )}
              onClick={() => setOpen(true)}
            >
              <FilterIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced Filters</span>
              {hasActiveFilters && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-primary text-xs font-medium">
                  {activeFiltersCount + (searchValue ? 1 : 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-96 max-h-[90vh]">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              <p className="text-muted-foreground text-sm">{description}</p>
            </SheetHeader>
            <Separator />
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {onSearch && (
                <div>
                  <Label htmlFor="sheet-search" className="block text-sm font-medium mb-2">
                    Search
                  </Label>
                  <Input
                    id="sheet-search"
                    placeholder={searchPlaceholder}
                    value={localSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-4">
                {filters.map((filter) => (
                  <FilterField
                    key={filter.key}
                    filter={filter}
                    value={localValues[filter.key]}
                    onChange={handleChange}
                  />
                ))}
              </div>

              {(activeFiltersCount > 0 || localSearch) && (
                <div className="pt-4 border-t">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleClearAll}>
                    <X className="mr-1.5 h-4 w-4" />
                    Clear all filters ({activeFiltersCount + (searchValue ? 1 : 0)})
                  </Button>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Apply Filters
                  </>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

function FilterField({
  filter,
  value,
  onChange,
}: {
  filter: {
    key: string;
    label: string;
    type: "text" | "select" | "multi_select" | "date" | "date_range" | "number" | "boolean";
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    defaultValue?: unknown;
  };
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}) {
  const isActive =
    value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0);

  switch (filter.type) {
    case "text":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={`filter-${filter.key}`}>{filter.label}</Label>
          <Input
            id={`filter-${filter.key}`}
            placeholder={filter.placeholder || filter.label}
            value={(value as string) || ""}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className={isActive && "border-primary/20 bg-primary/5"}
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={`filter-${filter.key}`}>{filter.label}</Label>
          <Select value={(value as string) || ""} onValueChange={(v) => onChange(filter.key, v || undefined)}>
            <SelectTrigger className={isActive && "border-primary/20 bg-primary/5"}>
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
      const options = filter.options ?? [];
      const displayValue =
        selectedValues.length > 0
          ? selectedValues.map((v) => options.find((o) => o.value === v)?.label || v).join(", ")
          : filter.placeholder || filter.label;

      return (
        <div className="space-y-1.5">
          <Label htmlFor={`filter-${filter.key}`}>{filter.label}</Label>
          <div className="relative">
            <Select
              value={selectedValues.join(",")}
              onValueChange={(v) => onChange(filter.key, v.split(",").filter(Boolean))}
            >
              <SelectTrigger
                className={cn(
                  "w-full justify-start text-left",
                  isActive && "border-primary/20 bg-primary/5",
                  selectedValues.length === 0 && "text-muted-foreground",
                )}
              >
                {displayValue}
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent className="w-64 p-2" sideOffset={5}>
                {options.map((opt) => {
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
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    case "date":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={`filter-${filter.key}`}>{filter.label}</Label>
          <Input
            id={`filter-${filter.key}`}
            type="date"
            placeholder={filter.placeholder || filter.label}
            value={(value as string) || ""}
            onChange={(e) => onChange(filter.key, e.target.value || undefined)}
            className={isActive && "border-primary/20 bg-primary/5"}
          />
        </div>
      );

    case "date_range":
      return (
        <div className="space-y-1.5">
          <Label>{filter.label}</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="From"
              value={value && Array.isArray(value) && value[0] ? value[0] : ""}
              onChange={(e) => {
                const current = (value as string[]) || ["", ""];
                onChange(filter.key, [e.target.value, current[1]]);
              }}
              className="w-[160px]"
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
              className="w-[160px]"
            />
          </div>
        </div>
      );

    case "number":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={`filter-${filter.key}`}>{filter.label}</Label>
          <Input
            id={`filter-${filter.key}`}
            type="number"
            placeholder={filter.placeholder || filter.label}
            value={(value as number) || ""}
            onChange={(e) => onChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
            className={isActive && "border-primary/20 bg-primary/5"}
          />
        </div>
      );

    case "boolean":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={`filter-${filter.key}`}>{filter.label}</Label>
          <Select value={(value as string) || ""} onValueChange={(v) => onChange(filter.key, v || undefined)}>
            <SelectTrigger className={isActive && "border-primary/20 bg-primary/5"}>
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
