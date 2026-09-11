"use client";

import { useMemo, useState } from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  Subscribe,
  useTable,
} from "@tanstack/react-table";
import { cn } from "cn";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  Download,
  MoreHorizontal,
  Settings2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type DataTableFeatures, dataTableFeatures } from "@/lib/data-table-features";

export interface DataTableAction<TData> {
  label: string;
  icon?: React.ReactNode;
  action: (row: TData) => void;
  destructive?: boolean;
  show?: (row: TData) => boolean;
}

export interface DataTableBulkAction<TData> {
  label: string;
  icon?: React.ReactNode;
  action: (rows: TData[]) => void;
  destructive?: boolean;
}

interface DataTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<DataTableFeatures, TData>[];
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (rows: TData[]) => void;
  getRowId?: (row: TData) => string;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  rowActions?: DataTableAction<TData>[];
  bulkActions?: DataTableBulkAction<TData>[];
  exportable?: boolean;
  onExport?: () => void;
  className?: string;
}

function preventPaginationNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

function getPageNumbers(currentPage: number, pageCount: number) {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, 4, 5];
  if (currentPage >= pageCount - 2) {
    return [pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }

  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
}

const selectionColumn: ColumnDef<DataTableFeatures, RowData> = {
  id: "__select__",
  header: ({ table }) => (
    <Subscribe
      source={table.atoms.rowSelection}
      selector={() =>
        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate") || false
      }
    >
      {(checked) => (
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      )}
    </Subscribe>
  ),
  cell: ({ row }) => (
    <Subscribe source={row.table.atoms.rowSelection} selector={(selection) => Boolean(selection?.[row.id])}>
      {(checked) => (
        <Checkbox checked={checked} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
      )}
    </Subscribe>
  ),
  enableSorting: false,
  enableHiding: false,
};

export function DataTable<TData extends RowData>({
  data,
  columns,
  title,
  description,
  toolbar,
  enableRowSelection = false,
  onRowSelectionChange,
  getRowId,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50],
  showPagination = true,
  loading = false,
  emptyMessage = "No results",
  emptyAction,
  rowActions = [],
  bulkActions = [],
  exportable = false,
  onExport,
  className,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const tableColumns = useMemo(() => {
    const base = columns as ColumnDef<DataTableFeatures, TData>[];

    if (rowActions.length > 0) {
      const actionsColumn: ColumnDef<DataTableFeatures, TData> = {
        id: "__actions__",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const visible = rowActions.filter((action) => !action.show || action.show(row.original));

          if (visible.length === 0) {
            return null;
          }

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground data-[state=open]:bg-muted">
                    <MoreHorizontal />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {visible.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onSelect={() => action.action(row.original)}
                      className={cn(action.destructive && "text-destructive focus:text-destructive")}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      };

      return [...base, actionsColumn];
    }

    return base;
  }, [columns, rowActions]);

  const finalColumns = useMemo(() => {
    if (!enableRowSelection) {
      return tableColumns;
    }

    return [selectionColumn as ColumnDef<DataTableFeatures, TData>, ...tableColumns];
  }, [enableRowSelection, tableColumns]);

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: finalColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId,
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      if (onRowSelectionChange && getRowId) {
        const ids = new Set(
          Object.entries(next)
            .filter(([, v]) => v)
            .map(([k]) => k),
        );
        onRowSelectionChange(data.filter((row) => ids.has(getRowId(row))));
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });

  const hideableColumns = table.getAllColumns().filter((column) => column.getCanHide());
  const hiddenCount = hideableColumns.filter((column) => !column.getIsVisible()).length;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const pageIndex = table.state.pagination.pageIndex;
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = Math.min(pageIndex + 1, pageCount);
  const pageNumbers = getPageNumbers(currentPage, pageCount);
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {(title || description || toolbar) && (
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              {title && <div className="font-semibold text-lg">{title}</div>}
              {description && <div className="text-muted-foreground text-sm">{description}</div>}
            </div>
            {toolbar}
          </div>
        )}
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {table.getVisibleLeafColumns().map((column) => (
                  <TableHead key={column.id}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(title || description || toolbar || exportable || hideableColumns.length > 0) && (
        <div className="space-y-3">
          {(title || description) && (
            <div className="flex flex-col gap-0.5">
              {title && <h3 className="font-semibold text-lg">{title}</h3>}
              {description && <p className="text-muted-foreground text-sm">{description}</p>}
            </div>
          )}
          {(toolbar || exportable || hideableColumns.length > 0) && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0 flex-1">{toolbar}</div>
              <div className="flex items-center gap-2">
                {exportable && (
                  <Button variant="outline" size="sm" onClick={onExport}>
                    <Download data-icon="inline-start" />
                    Export
                  </Button>
                )}
                {hideableColumns.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn("hidden lg:flex", hiddenCount > 0 && "bg-muted text-foreground")}
                      >
                        <Settings2 data-icon="inline-start" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {hideableColumns.map((column) => (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          >
                            {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="h-11 font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={() => header.column.toggleSorting(header.column.getIsSorted() !== "asc")}
                          className={cn(
                            "flex items-center gap-1",
                            canSort && "cursor-pointer select-none",
                            !canSort && "cursor-default",
                          )}
                        >
                          <table.FlexRender header={header} />
                          {canSort && (
                            <span className="text-muted-foreground">
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp data-icon="inline-end" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown data-icon="inline-end" />
                              ) : (
                                <ArrowUpDown data-icon="inline-end" />
                              )}
                            </span>
                          )}
                        </button>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/60 hover:bg-muted/20"
                  data-state={table.state.rowSelection[row.id] && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 align-middle">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <p className="text-muted-foreground text-sm">{emptyMessage}</p>
                    {emptyAction}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(showPagination || bulkActions.length > 0) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-muted-foreground text-sm">
            {enableRowSelection && bulkActions.length > 0 ? (
              <span className="flex items-center gap-2">
                {selectedCount > 0 ? (
                  <span className="font-medium text-foreground">{selectedCount} selected</span>
                ) : (
                  <span>
                    {table.getFilteredRowModel().rows.length} result
                    {table.getFilteredRowModel().rows.length === 1 ? "" : "s"}
                  </span>
                )}
                {selectedCount > 0 && (
                  <span className="flex items-center gap-1">
                    {bulkActions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={action.destructive ? "destructive" : "outline"}
                        onClick={() => action.action(table.getFilteredSelectedRowModel().rows.map((r) => r.original))}
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                    <Button size="sm" variant="ghost" onClick={() => table.toggleAllPageRowsSelected(false)}>
                      <X data-icon="inline-start" />
                      Clear
                    </Button>
                  </span>
                )}
              </span>
            ) : (
              <span>
                {table.getFilteredRowModel().rows.length} result
                {table.getFilteredRowModel().rows.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {showPagination && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6 lg:gap-8">
              <div className="flex items-center gap-2">
                <p className="font-medium text-muted-foreground text-sm">Rows per page</p>
                <Select
                  value={`${table.state.pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-18">
                    <SelectValue placeholder={table.state.pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center font-medium text-sm">
                Page {currentPage} of {pageCount}
              </div>
              <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                <PaginationContent className="gap-1">
                  <PaginationItem className="hidden lg:block">
                    <PaginationLink
                      href="#"
                      aria-label="Go to first page"
                      aria-disabled={!canPreviousPage}
                      className={cn(!canPreviousPage && "pointer-events-none opacity-50")}
                      onClick={(event) => {
                        preventPaginationNavigation(event);
                        if (canPreviousPage) table.setPageIndex(0);
                      }}
                    >
                      <ChevronsLeft />
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      text="Prev"
                      aria-disabled={!canPreviousPage}
                      className={cn(!canPreviousPage && "pointer-events-none opacity-50")}
                      onClick={(event) => {
                        preventPaginationNavigation(event);
                        if (canPreviousPage) table.previousPage();
                      }}
                    />
                  </PaginationItem>
                  {pageNumbers[0] > 1 ? (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : null}
                  {pageNumbers.map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageIndex === pageNumber - 1}
                        onClick={(event) => {
                          preventPaginationNavigation(event);
                          table.setPageIndex(pageNumber - 1);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {pageNumbers[pageNumbers.length - 1] < pageCount ? (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : null}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={!canNextPage}
                      className={cn(!canNextPage && "pointer-events-none opacity-50")}
                      onClick={(event) => {
                        preventPaginationNavigation(event);
                        if (canNextPage) table.nextPage();
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem className="hidden lg:block">
                    <PaginationLink
                      href="#"
                      aria-label="Go to last page"
                      aria-disabled={!canNextPage}
                      className={cn(!canNextPage && "pointer-events-none opacity-50")}
                      onClick={(event) => {
                        preventPaginationNavigation(event);
                        if (canNextPage) table.setPageIndex(pageCount - 1);
                      }}
                    >
                      <ChevronsRight />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
