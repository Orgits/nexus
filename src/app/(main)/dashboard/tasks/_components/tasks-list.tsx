"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "cn";
import { Filter } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyTasks } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ObjectLink } from "@/components/ca-nexus/object-link";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { PriorityBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/mock-data/users";

import type { TaskRow } from "./ca-nexus-tasks";
import { getTaskRows, taskPriorityOptions, taskStatusOptions } from "./ca-nexus-tasks";

const filterConfigs: FilterConfig[] = [
  { key: "status", label: "Status", type: "select", options: taskStatusOptions },
  { key: "priority", label: "Priority", type: "select", options: taskPriorityOptions },
  {
    key: "assignee",
    label: "Assignee",
    type: "select",
    options: mockUsers.map((u) => ({ value: u.fullName, label: u.fullName })),
  },
];

const VIEW_OPTIONS = [
  { id: "all", label: "All Tasks", icon: Filter },
  { id: "my", label: "My Tasks", icon: Filter },
  { id: "todo", label: "Todo", icon: Filter },
  { id: "in_progress", label: "In Progress", icon: Filter },
  { id: "in_review", label: "In Review", icon: Filter },
  { id: "completed", label: "Completed", icon: Filter },
  { id: "overdue", label: "Overdue", icon: Filter },
] as const;

export function TasksList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [tasks] = useState<TaskRow[]>(getTaskRows());

  const filtered = useMemo(() => {
    let result = [...tasks];

    if (view !== "all") {
      switch (view) {
        case "my":
          result = result.filter((t) => t.assignee === "Rajesh Kumar");
          break;
        case "todo":
          result = result.filter((t) => t.status === "todo");
          break;
        case "in_progress":
          result = result.filter((t) => t.status === "in_progress");
          break;
        case "in_review":
          result = result.filter((t) => t.status === "in_review");
          break;
        case "completed":
          result = result.filter((t) => t.status === "completed");
          break;
        case "overdue":
          result = result.filter((t) => t.status !== "completed" && new Date(t.dueDate) < new Date());
          break;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.taskNumber.toLowerCase().includes(q) ||
          t.client.toLowerCase().includes(q) ||
          t.matter.toLowerCase().includes(q),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      if (key === "assignee") {
        result = result.filter((t) => t.assignee === value);
      } else {
        result = result.filter((t) => (t as unknown as Record<string, unknown>)[key] === value);
      }
    }

    return result;
  }, [tasks, search, filters, view]);

  const taskColumns = [
    {
      accessorKey: "title",
      header: "Task",
      enableHiding: false,
      cell: ({ row }: { row: { original: TaskRow } }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-muted-foreground text-xs">{row.original.taskNumber}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: TaskRow } }) => <TaskStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: { row: { original: TaskRow } }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "assignee",
      header: "Assignee",
      cell: ({ row }: { row: { original: TaskRow } }) => <span className="text-sm">{row.original.assignee}</span>,
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }: { row: { original: TaskRow } }) => (
        <ObjectLink href={`/dashboard/clients/${row.original.clientId || ""}`} label={row.original.client} />
      ),
    },
    {
      accessorKey: "matter",
      header: "Matter",
      cell: ({ row }: { row: { original: TaskRow } }) => (
        <ObjectLink href={`/dashboard/matters/${row.original.matterId || ""}`} label={row.original.matter} />
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      enableSorting: true,
      cell: ({ row }: { row: { original: TaskRow } }) => (
        <span
          className={cn(
            "text-sm",
            new Date(row.original.dueDate) < new Date() && row.original.status !== "completed" && "text-destructive",
          )}
        >
          {row.original.dueDate}
        </span>
      ),
    },
    {
      accessorKey: "progress",
      header: "Progress",
      enableSorting: true,
      cell: ({ row }: { row: { original: TaskRow } }) => (
        <div className="w-24">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${row.original.progress}%` }} />
          </div>
          <span className="text-muted-foreground text-xs">{row.original.progress}%</span>
        </div>
      ),
    },
    {
      accessorKey: "estimatedHours",
      header: "Est. Hours",
      cell: ({ row }: { row: { original: TaskRow } }) => (
        <span className="text-sm">{row.original.estimatedHours ? `${row.original.estimatedHours}h` : "—"}</span>
      ),
    },
    {
      accessorKey: "actualHours",
      header: "Actual",
      cell: ({ row }: { row: { original: TaskRow } }) => <span className="text-sm">{row.original.actualHours}h</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Tasks" description="Manage and track your work items across all matters" />

      <div className="mb-4 flex flex-wrap gap-2">
        {VIEW_OPTIONS.map((v) => (
          <Button
            key={v.id}
            variant={view === v.id ? "default" : "outline"}
            size="sm"
            onClick={() => router.push(`/dashboard/tasks${v.id !== "all" ? `?view=${v.id}` : ""}`)}
            className="gap-1.5"
          >
            <v.icon className="h-3.5 w-3.5" />
            {v.label}
          </Button>
        ))}
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search tasks..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filtered.length > 0 ? (
        <DataTable<TaskRow>
          data={filtered}
          columns={taskColumns as any}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={10}
          emptyMessage="No tasks match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/tasks/${row.id}`),
            },
          ]}
        />
      ) : (
        <EmptyTasks />
      )}
    </div>
  );
}
