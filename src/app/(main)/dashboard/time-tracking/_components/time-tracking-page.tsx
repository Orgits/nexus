"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Calendar, CheckSquare, Clock, Pause, Play, Plus, Square } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { MatterLink, TaskLink, UserLink } from "@/components/ca-nexus/object-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatNumber } from "@/lib/format";
import { getMatterById, getTasksByMatter, mockMatters, mockTasks } from "@/mock-data/matters";
import { mockTimeEntries } from "@/mock-data/time-billing";
import { getUserById, mockUsers } from "@/mock-data/users";
import type { TimeEntry } from "@/types";

interface TimeEntryFormData {
  matterId: string;
  taskId: string;
  description: string;
  startTime: string;
  endTime: string;
  isBillable: boolean;
  billingRate: number;
}

export function TimeTrackingPage() {
  const _router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("timer");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerMatterId, setTimerMatterId] = useState("");
  const [timerTaskId, setTimerTaskId] = useState("");
  const [timerDescription, setTimerDescription] = useState("");
  const [timerIsBillable, setTimerIsBillable] = useState(true);
  const [timerBillingRate, setTimerBillingRate] = useState(2500);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pausedTimeRef = useRef<number>(0);

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "draft", label: "Draft" },
        { value: "submitted", label: "Submitted" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "billed", label: "Billed" },
        { value: "invoiced", label: "Invoiced" },
      ],
    },
    {
      key: "userId",
      label: "User",
      type: "select",
      options: mockUsers.filter((u) => u.isActive).map((u) => ({ value: u.id, label: u.fullName })),
    },
    {
      key: "matterId",
      label: "Matter",
      type: "select",
      options: mockMatters.map((m) => ({ value: m.id, label: m.name })),
    },
  ];

  const allEntries = [...mockTimeEntries].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  const filteredEntries = allEntries.filter((entry: TimeEntry) => {
    if (search) {
      const user = getUserById(entry.userId);
      const matter = getMatterById(entry.matterId || "");
      const task = mockTasks.find((t) => t.id === entry.taskId);
      const searchLower = search.toLowerCase();
      if (
        !user?.fullName.toLowerCase().includes(searchLower) &&
        !matter?.name.toLowerCase().includes(searchLower) &&
        !task?.title.toLowerCase().includes(searchLower) &&
        !entry.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (entry as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  // Timer functions
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (isPaused) {
      setIsPaused(false);
      startTimeRef.current = new Date(Date.now() - pausedTimeRef.current * 1000);
    } else {
      startTimeRef.current = new Date();
      pausedTimeRef.current = 0;
    }
    setIsRunning(true);
    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000) + pausedTimeRef.current;
        setElapsedSeconds(elapsed);
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (startTimeRef.current) {
      pausedTimeRef.current = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000) + pausedTimeRef.current;
    }
    setIsRunning(false);
    setIsPaused(true);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const finalSeconds = elapsedSeconds;
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;

    // Create time entry
    if (finalSeconds > 0 && timerMatterId) {
      const _newEntry: TimeEntry = {
        id: `time-${Date.now()}` as any,
        tenantId: "tenant-001",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: mockUsers[0].id,
        updatedBy: mockUsers[0].id,
        userId: mockUsers[0].id,
        matterId: timerMatterId,
        taskId: timerTaskId || undefined,
        clientId: getMatterById(timerMatterId)?.clientId,
        description: timerDescription,
        startTime: new Date(Date.now() - finalSeconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        durationMinutes: Math.round(finalSeconds / 60),
        isBillable: timerIsBillable,
        billingRate: timerBillingRate,
        billedAmount: timerIsBillable ? Math.round((finalSeconds / 3600) * timerBillingRate) : 0,
        status: "draft",
        isRunning: false,
      };
      // In a real app, this would be added to the mock data or sent to API
      alert(`Time entry created: ${formatTime(finalSeconds)} (${Math.round(finalSeconds / 60)} minutes)`);
    }
  };

  const handleManualEntry = (data: TimeEntryFormData) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    const _newEntry: TimeEntry = {
      id: `time-${Date.now()}` as any,
      tenantId: "tenant-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: mockUsers[0].id,
      updatedBy: mockUsers[0].id,
      userId: mockUsers[0].id,
      matterId: data.matterId,
      taskId: data.taskId || undefined,
      clientId: getMatterById(data.matterId)?.clientId,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      durationMinutes,
      isBillable: data.isBillable,
      billingRate: data.billingRate,
      billedAmount: data.isBillable ? Math.round((durationMinutes / 60) * data.billingRate) : 0,
      status: "draft",
      isRunning: false,
    };
    alert(`Manual time entry created: ${durationMinutes} minutes`);
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
  };

  const handleDeleteEntry = (entry: TimeEntry) => {
    if (confirm(`Delete time entry "${entry.description}"?`)) {
      alert(`Deleted time entry: ${entry.description}`);
    }
  };

  const totalHours = allEntries.reduce((sum, e) => sum + e.durationMinutes, 0) / 60;
  const billableHours = allEntries.filter((e) => e.isBillable).reduce((sum, e) => sum + e.durationMinutes, 0) / 60;
  const thisWeekEntries = allEntries.filter((e) => {
    const entryDate = new Date(e.startTime);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });
  const thisWeekHours = thisWeekEntries.reduce((sum, e) => sum + e.durationMinutes, 0) / 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Time Tracking</h1>
          <p className="text-muted-foreground text-sm">Track time, manage entries, and view timesheets</p>
        </div>
        <Button onClick={() => setShowEntryForm(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Manual Entry
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{formatNumber(totalHours)}h</div>
            <p className="text-muted-foreground text-xs">All time entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Billable Hours</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">{formatNumber(billableHours)}h</div>
            <p className="text-muted-foreground text-xs">Billable time entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{formatNumber(thisWeekHours)}h</div>
            <p className="text-muted-foreground text-xs">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Active Timer</CardTitle>
            <Clock className={cn("h-4 w-4", isRunning && "animate-pulse text-primary")} />
          </CardHeader>
          <CardContent>
            <div className="font-bold font-mono text-2xl text-primary">{formatTime(elapsedSeconds)}</div>
            <p className="text-muted-foreground text-xs">{isRunning ? (isPaused ? "Paused" : "Running") : "Stopped"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="timer"
            className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Timer</span>
          </TabsTrigger>
          <TabsTrigger
            value="entries"
            className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Entries</span>
          </TabsTrigger>
          <TabsTrigger
            value="timesheet"
            className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Timesheet</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Timer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="py-8 text-center">
                <div className="mb-4 font-bold font-mono text-5xl text-primary">{formatTime(elapsedSeconds)}</div>
                <div className="flex justify-center gap-4">
                  {!isRunning && !isPaused && elapsedSeconds === 0 ? (
                    <Button size="lg" onClick={startTimer} className="w-32">
                      <Play className="mr-2 h-5 w-5" />
                      Start
                    </Button>
                  ) : isRunning ? (
                    <>
                      <Button size="lg" variant="outline" onClick={pauseTimer} className="w-32">
                        <Pause className="mr-2 h-5 w-5" />
                        Pause
                      </Button>
                      <Button size="lg" variant="destructive" onClick={stopTimer} className="w-32">
                        <Square className="mr-2 h-5 w-5" />
                        Stop
                      </Button>
                    </>
                  ) : isPaused ? (
                    <>
                      <Button size="lg" onClick={startTimer} className="w-32">
                        <Play className="mr-2 h-5 w-5" />
                        Resume
                      </Button>
                      <Button size="lg" variant="destructive" onClick={stopTimer} className="w-32">
                        <Square className="mr-2 h-5 w-5" />
                        Stop
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
                <div>
                  <label htmlFor="timer-matter" className="mb-1 block font-medium text-sm">
                    Matter *
                  </label>
                  <select
                    id="timer-matter"
                    value={timerMatterId}
                    onChange={(e) => setTimerMatterId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={isRunning && !isPaused}
                  >
                    <option value="">Select a matter</option>
                    {mockMatters.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="timer-task" className="mb-1 block font-medium text-sm">
                    Task
                  </label>
                  <select
                    id="timer-task"
                    value={timerTaskId}
                    onChange={(e) => setTimerTaskId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={isRunning && !isPaused}
                  >
                    <option value="">Select a task (optional)</option>
                    {timerMatterId &&
                      getTasksByMatter(timerMatterId).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="timer-description" className="mb-1 block font-medium text-sm">
                    Description *
                  </label>
                  <textarea
                    id="timer-description"
                    value={timerDescription}
                    onChange={(e) => setTimerDescription(e.target.value)}
                    placeholder="What are you working on?"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                    disabled={isRunning && !isPaused}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={timerIsBillable}
                      onChange={(e) => setTimerIsBillable(e.target.checked)}
                      disabled={isRunning && !isPaused}
                    />
                    <span className="text-sm">Billable</span>
                  </label>
                  <div>
                    <label htmlFor="timer-billing-rate" className="mb-1 block font-medium text-sm">
                      Billing Rate (₹/hr)
                    </label>
                    <input
                      id="timer-billing-rate"
                      type="number"
                      value={timerBillingRate}
                      onChange={(e) => setTimerBillingRate(Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={(isRunning && !isPaused) || !timerIsBillable}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="mt-4 space-y-4">
          <FilterBar
            filters={filterConfigs}
            values={{ search, ...filters }}
            searchPlaceholder="Search time entries..."
            onSearch={setSearch}
            onChange={(values) => {
              const { search: s, ...rest } = values;
              if (typeof s === "string") setSearch(s);
              setFilters(rest);
            }}
            compact
          />
          {filteredEntries.length > 0 ? (
            <DataTable<TimeEntry>
              data={filteredEntries}
              columns={
                [
                  {
                    accessorKey: "id",
                    header: "Date",
                    cell: ({ row }: { row: { original: TimeEntry } }) => (
                      <span className="text-sm">{formatDate(row.original.startTime)}</span>
                    ),
                  },
                  {
                    accessorKey: "userId",
                    header: "User",
                    cell: ({ row }: { row: { original: TimeEntry } }) => (
                      <UserLink user={getUserById(row.original.userId)!} showRole={false} />
                    ),
                  },
                  {
                    accessorKey: "matterId",
                    header: "Matter",
                    cell: ({ row }: { row: { original: TimeEntry } }) =>
                      row.original.matterId ? (
                        <MatterLink matter={getMatterById(row.original.matterId)!} showStatus={false} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      ),
                  },
                  {
                    accessorKey: "taskId",
                    header: "Task",
                    cell: ({ row }: { row: { original: TimeEntry } }) =>
                      row.original.taskId ? (
                        <TaskLink task={mockTasks.find((t) => t.id === row.original.taskId)!} showStatus={false} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      ),
                  },
                  {
                    accessorKey: "description",
                    header: "Description",
                    cell: ({ row }: { row: { original: TimeEntry } }) => (
                      <span className="line-clamp-1 text-sm">{row.original.description}</span>
                    ),
                  },
                  {
                    accessorKey: "durationMinutes",
                    header: "Duration",
                    cell: ({ row }: { row: { original: TimeEntry } }) => (
                      <span className="font-medium">
                        {Math.floor(row.original.durationMinutes / 60)}h {row.original.durationMinutes % 60}m
                      </span>
                    ),
                  },
                  {
                    accessorKey: "isBillable",
                    header: "Billable",
                    cell: ({ row }: { row: { original: TimeEntry } }) =>
                      row.original.isBillable ? (
                        <Badge variant="default" className="text-xs">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          No
                        </Badge>
                      ),
                  },
                  {
                    accessorKey: "billingRate",
                    header: "Rate",
                    cell: ({ row }: { row: { original: TimeEntry } }) => (
                      <span className="text-sm">₹{row.original.billingRate}/hr</span>
                    ),
                  },
                  {
                    accessorKey: "billedAmount",
                    header: "Amount",
                    cell: ({ row }: { row: { original: TimeEntry } }) => (
                      <span className="font-medium text-green-600">₹{formatNumber(row.original.billedAmount)}</span>
                    ),
                  },
                  {
                    accessorKey: "status",
                    header: "Status",
                    cell: ({ row }: { row: { original: TimeEntry } }) => (
                      <Badge
                        variant={
                          row.original.status === "approved"
                            ? "default"
                            : row.original.status === "submitted"
                              ? "secondary"
                              : row.original.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {row.original.status}
                      </Badge>
                    ),
                  },
                ] as any
              }
              getRowId={(row) => row.id}
              pageSize={15}
              emptyMessage="No time entries match your search or filters"
              rowActions={[
                { label: "Edit", action: handleEditEntry },
                { label: "Delete", action: handleDeleteEntry, destructive: true },
              ]}
            />
          ) : (
            <EmptyState
              icon={<Clock className="h-12 w-12 text-muted-foreground/50" />}
              title="No time entries found"
              description={
                search || Object.keys(filters).length > 0
                  ? "Try adjusting your search or filters"
                  : "No time entries recorded yet"
              }
            />
          )}
        </TabsContent>

        <TabsContent value="timesheet" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={mockUsers[0].id}
              >
                {mockUsers
                  .filter((u) => u.isActive)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
              </select>
              <input
                type="week"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Timesheet</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable<TimeEntry>
                  data={allEntries.slice(0, 20)}
                  columns={
                    [
                      {
                        accessorKey: "startTime",
                        header: "Date",
                        cell: ({ row }: { row: { original: TimeEntry } }) => (
                          <span className="text-sm">{formatDate(row.original.startTime)}</span>
                        ),
                      },
                      {
                        accessorKey: "matterId",
                        header: "Matter",
                        cell: ({ row }: { row: { original: TimeEntry } }) =>
                          row.original.matterId ? (
                            <MatterLink matter={getMatterById(row.original.matterId)!} showStatus={false} />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          ),
                      },
                      {
                        accessorKey: "taskId",
                        header: "Task",
                        cell: ({ row }: { row: { original: TimeEntry } }) =>
                          row.original.taskId ? (
                            <TaskLink task={mockTasks.find((t) => t.id === row.original.taskId)!} showStatus={false} />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          ),
                      },
                      {
                        accessorKey: "description",
                        header: "Description",
                        cell: ({ row }: { row: { original: TimeEntry } }) => (
                          <span className="text-sm">{row.original.description}</span>
                        ),
                      },
                      {
                        accessorKey: "durationMinutes",
                        header: "Duration",
                        cell: ({ row }: { row: { original: TimeEntry } }) => (
                          <span className="font-medium">
                            {Math.floor(row.original.durationMinutes / 60)}h {row.original.durationMinutes % 60}m
                          </span>
                        ),
                      },
                      {
                        accessorKey: "isBillable",
                        header: "Billable",
                        cell: ({ row }: { row: { original: TimeEntry } }) =>
                          row.original.isBillable ? (
                            <Badge variant="default" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              No
                            </Badge>
                          ),
                      },
                    ] as any
                  }
                  getRowId={(row) => row.id}
                  pageSize={10}
                  emptyMessage="No entries for this period"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showEntryForm && (
        <TimeEntryForm
          entry={editingEntry}
          onClose={() => {
            setShowEntryForm(false);
            setEditingEntry(null);
          }}
          onSubmit={
            editingEntry
              ? (data) => {
                  alert(`Updated time entry: ${data.description}`);
                  setShowEntryForm(false);
                  setEditingEntry(null);
                }
              : handleManualEntry
          }
        />
      )}
    </div>
  );
}

function TimeEntryForm({
  entry,
  onClose,
  onSubmit,
}: {
  entry: TimeEntry | null;
  onClose: () => void;
  onSubmit: (data: TimeEntryFormData) => void;
}) {
  const [formData, setFormData] = useState<TimeEntryFormData>({
    matterId: entry?.matterId || "",
    taskId: entry?.taskId || "",
    description: entry?.description || "",
    startTime: entry ? entry.startTime.slice(0, 16) : new Date().toISOString().slice(0, 16),
    endTime: entry ? entry.endTime.slice(0, 16) : new Date().toISOString().slice(0, 16),
    isBillable: entry?.isBillable ?? true,
    billingRate: entry?.billingRate || 2500,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const availableTasks = formData.matterId ? getTasksByMatter(formData.matterId) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold text-lg">{entry ? "Edit Time Entry" : "Add Manual Time Entry"}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label htmlFor="manual-matter" className="mb-1 block font-medium text-sm">
              Matter *
            </label>
            <select
              id="manual-matter"
              value={formData.matterId}
              onChange={(e) => setFormData({ ...formData, matterId: e.target.value, taskId: "" })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select a matter</option>
              {mockMatters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="manual-task" className="mb-1 block font-medium text-sm">
              Task
            </label>
            <select
              id="manual-task"
              value={formData.taskId}
              onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a task (optional)</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="manual-description" className="mb-1 block font-medium text-sm">
              Description *
            </label>
            <textarea
              id="manual-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the work performed"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="manual-start-time" className="mb-1 block font-medium text-sm">
                Start Time *
              </label>
              <input
                id="manual-start-time"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="manual-end-time" className="mb-1 block font-medium text-sm">
                End Time *
              </label>
              <input
                id="manual-end-time"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isBillable}
                onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
              />
              <span className="text-sm">Billable</span>
            </label>
            <div>
              <label htmlFor="manual-billing-rate" className="mb-1 block font-medium text-sm">
                Billing Rate (₹/hr)
              </label>
              <input
                id="manual-billing-rate"
                type="number"
                value={formData.billingRate}
                onChange={(e) => setFormData({ ...formData, billingRate: Number(e.target.value) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{entry ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { cn } from "cn";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
