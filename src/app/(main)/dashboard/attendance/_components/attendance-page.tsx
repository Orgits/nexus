"use client";

import { useState } from "react";

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCheck,
  XCircle,
} from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { UserLink } from "@/components/ca-nexus/object-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/format";
import { getUserById, mockTeams, mockUsers } from "@/mock-data/users";
import type { AttendanceRecord, AttendanceStatus, WorkMode } from "@/types";

// Mock attendance data
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceStatus[] = [
    "present",
    "absent",
    "late",
    "half_day",
    "on_leave",
    "holiday",
    "work_from_home",
  ];
  const workModes: WorkMode[] = ["office", "remote", "hybrid", "client_site"];

  mockUsers
    .filter((u) => u.isActive)
    .forEach((user) => {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        if (isWeekend) continue;

        const status = Math.random() > 0.15 ? "present" : statuses[Math.floor(Math.random() * statuses.length)];

        records.push({
          id: `att-${user.id}-${i}` as any,
          tenantId: "tenant-001",
          createdAt: date.toISOString(),
          updatedAt: date.toISOString(),
          createdBy: user.id,
          updatedBy: user.id,
          userId: user.id,
          date: date.toISOString().split("T")[0],
          checkInAt:
            status === "present" || status === "late" || status === "half_day"
              ? new Date(date.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))).toISOString()
              : undefined,
          checkOutAt:
            status === "present" || status === "half_day"
              ? new Date(
                  date.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60)),
                ).toISOString()
              : undefined,
          breakMinutes: status === "present" ? 60 : 0,
          status,
          workMode: workModes[Math.floor(Math.random() * workModes.length)],
          location: status === "present" ? "Office" : status === "work_from_home" ? "Home" : undefined,
          notes: status === "late" ? "Traffic delay" : status === "on_leave" ? "Sick leave" : undefined,
        });
      }
    });

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const mockAttendance: AttendanceRecord[] = generateMockAttendance();

export function AttendancePage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "present", label: "Present" },
        { value: "absent", label: "Absent" },
        { value: "late", label: "Late" },
        { value: "half_day", label: "Half Day" },
        { value: "on_leave", label: "On Leave" },
        { value: "holiday", label: "Holiday" },
        { value: "work_from_home", label: "Work from Home" },
      ],
    },
    {
      key: "workMode",
      label: "Work Mode",
      type: "select",
      options: [
        { value: "office", label: "Office" },
        { value: "remote", label: "Remote" },
        { value: "hybrid", label: "Hybrid" },
        { value: "client_site", label: "Client Site" },
      ],
    },
    { key: "teamId", label: "Team", type: "select", options: mockTeams.map((t) => ({ value: t.id, label: t.name })) },
  ];

  const filteredAttendance = mockAttendance.filter((record) => {
    if (search) {
      const user = getUserById(record.userId);
      if (!user?.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    }
    if (filters.date && record.date !== filters.date) return false;
    for (const [key, value] of Object.entries(filters)) {
      if (key !== "date" && value && (record as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const todayRecords = mockAttendance.filter((r) => r.date === selectedDate);
  const presentCount = todayRecords.filter((r) => r.status === "present").length;
  const absentCount = todayRecords.filter((r) => r.status === "absent").length;
  const lateCount = todayRecords.filter((r) => r.status === "late").length;
  const onLeaveCount = todayRecords.filter((r) => r.status === "on_leave").length;
  const wfhCount = todayRecords.filter((r) => r.status === "work_from_home").length;
  const totalUsers = mockUsers.filter((u) => u.isActive).length;

  const handlePrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Attendance</h1>
          <p className="text-muted-foreground text-sm">Track daily attendance, leaves, and work modes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button variant="outline" size="sm" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Total Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Late</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-amber-600">{lateCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-blue-600">{onLeaveCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">WFH</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-purple-600">{wfhCount}</div>
          </CardContent>
        </Card>
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters, date: selectedDate }}
        searchPlaceholder="Search by user name..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredAttendance.length > 0 ? (
        <DataTable<AttendanceRecord>
          data={filteredAttendance}
          columns={
            [
              {
                accessorKey: "date",
                header: "Date",
                cell: ({ row }: { row: { original: AttendanceRecord } }) => (
                  <span className="font-medium text-sm">{formatDate(row.original.date)}</span>
                ),
              },
              {
                accessorKey: "userId",
                header: "User",
                cell: ({ row }: { row: { original: AttendanceRecord } }) => {
                  const user = getUserById(row.original.userId);
                  return user ? (
                    <UserLink user={user} showRole={true} />
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  );
                },
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: AttendanceRecord } }) => (
                  <Badge
                    variant={
                      row.original.status === "present"
                        ? "default"
                        : row.original.status === "absent"
                          ? "destructive"
                          : row.original.status === "late"
                            ? "secondary"
                            : row.original.status === "on_leave"
                              ? "outline"
                              : row.original.status === "work_from_home"
                                ? "secondary"
                                : "outline"
                    }
                  >
                    {row.original.status.replace(/_/g, " ")}
                  </Badge>
                ),
              },
              {
                accessorKey: "workMode",
                header: "Work Mode",
                cell: ({ row }: { row: { original: AttendanceRecord } }) => (
                  <Badge variant="secondary">{row.original.workMode.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "checkInAt",
                header: "Check In",
                cell: ({ row }: { row: { original: AttendanceRecord } }) => (
                  <span className="text-sm">
                    {row.original.checkInAt ? formatDateTime(row.original.checkInAt) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "checkOutAt",
                header: "Check Out",
                cell: ({ row }: { row: { original: AttendanceRecord } }) => (
                  <span className="text-sm">
                    {row.original.checkOutAt ? formatDateTime(row.original.checkOutAt) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "breakMinutes",
                header: "Break",
                cell: ({ row }: { row: { original: AttendanceRecord } }) => (
                  <span className="text-sm">
                    {row.original.breakMinutes > 0 ? `${row.original.breakMinutes}m` : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "location",
                header: "Location",
                cell: ({ row }: { row: { original: AttendanceRecord } }) => (
                  <span className="text-sm">{row.original.location || "—"}</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={20}
          emptyMessage="No attendance records match your filters"
        />
      ) : (
        <EmptyState
          icon={<Calendar className="h-12 w-12 text-muted-foreground/50" />}
          title="No attendance records"
          description="Try adjusting your filters or date selection"
        />
      )}
    </div>
  );
}
