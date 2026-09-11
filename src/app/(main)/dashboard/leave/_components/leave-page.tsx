"use client";

import { useState } from "react";

import { Calendar, CheckCircle, Clock as ClockIcon, FileText, Plus, UserCheck, XCircle } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { UserLink } from "@/components/ca-nexus/object-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { mockLeaveRequests } from "@/mock-data/leave";
import { getUserById, mockTeams, mockUsers } from "@/mock-data/users";

export function LeavePage() {
  const [activeTab, setActiveTab] = useState<string>("requests");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<any>(null);

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "cancelled", label: "Cancelled" },
        { value: "withdrawn", label: "Withdrawn" },
      ],
    },
    {
      key: "leaveType",
      label: "Leave Type",
      type: "select",
      options: [
        { value: "annual", label: "Annual" },
        { value: "sick", label: "Sick" },
        { value: "casual", label: "Casual" },
        { value: "maternity", label: "Maternity" },
        { value: "paternity", label: "Paternity" },
        { value: "bereavement", label: "Bereavement" },
        { value: "marriage", label: "Marriage" },
        { value: "compensatory", label: "Compensatory" },
        { value: "unpaid", label: "Unpaid" },
        { value: "study", label: "Study" },
        { value: "sabbatical", label: "Sabbatical" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "userId",
      label: "User",
      type: "select",
      options: mockUsers.filter((u) => u.isActive).map((u) => ({ value: u.id, label: u.fullName })),
    },
  ];

  const allLeaves = [...mockLeaveRequests].sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
  );

  const filteredLeaves = allLeaves.filter((leave) => {
    if (search) {
      const user = getUserById(leave.userId);
      if (!user?.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (leave as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const pendingCount = allLeaves.filter((l) => l.status === "pending").length;
  const approvedCount = allLeaves.filter((l) => l.status === "approved").length;
  const rejectedCount = allLeaves.filter((l) => l.status === "rejected").length;
  const totalDaysThisMonth = allLeaves
    .filter((l) => l.status === "approved" && new Date(l.startDate).getMonth() === new Date().getMonth())
    .reduce((sum, l) => sum + l.totalDays, 0);

  const handleApprove = (leave: any) => {
    alert(`Approved leave request for ${getUserById(leave.userId)?.fullName}`);
  };

  const handleReject = (leave: any) => {
    alert(`Rejected leave request for ${getUserById(leave.userId)?.fullName}`);
  };

  const handleCancel = (leave: any) => {
    if (confirm(`Cancel leave request for ${getUserById(leave.userId)?.fullName}?`)) {
      alert("Leave request cancelled");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Leave Management</h1>
          <p className="text-muted-foreground text-sm">Manage leave requests, balances, and team availability</p>
        </div>
        <Button
          onClick={() => {
            setEditingLeave(null);
            setShowForm(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Leave Request
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Pending Approval</CardTitle>
            <ClockIcon className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-amber-600">{pendingCount}</div>
            <p className="text-muted-foreground text-xs">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">Days This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalDaysThisMonth}</div>
            <p className="text-muted-foreground text-xs">Approved leave days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="requests"
            className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Requests</span>
          </TabsTrigger>
          <TabsTrigger
            value="balance"
            className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Balance</span>
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4 space-y-4">
          <FilterBar
            filters={filterConfigs}
            values={{ search, ...filters }}
            searchPlaceholder="Search leave requests..."
            onSearch={setSearch}
            onChange={(values) => {
              const { search: s, ...rest } = values;
              if (typeof s === "string") setSearch(s);
              setFilters(rest);
            }}
            compact
          />
          {filteredLeaves.length > 0 ? (
            <DataTable<any>
              data={filteredLeaves}
              columns={
                [
                  {
                    accessorKey: "id",
                    header: "Request #",
                    cell: ({ row }: { row: { original: any } }) => (
                      <span className="font-medium text-sm">{row.original.id}</span>
                    ),
                  },
                  {
                    accessorKey: "userId",
                    header: "Employee",
                    cell: ({ row }: { row: { original: any } }) => (
                      <UserLink user={getUserById(row.original.userId)!} showRole={true} />
                    ),
                  },
                  {
                    accessorKey: "leaveType",
                    header: "Type",
                    cell: ({ row }: { row: { original: any } }) => (
                      <Badge variant="secondary">{row.original.leaveType}</Badge>
                    ),
                  },
                  {
                    accessorKey: "startDate",
                    header: "From",
                    cell: ({ row }: { row: { original: any } }) => (
                      <span className="text-sm">{formatDate(row.original.startDate)}</span>
                    ),
                  },
                  {
                    accessorKey: "endDate",
                    header: "To",
                    cell: ({ row }: { row: { original: any } }) => (
                      <span className="text-sm">{formatDate(row.original.endDate)}</span>
                    ),
                  },
                  {
                    accessorKey: "totalDays",
                    header: "Days",
                    cell: ({ row }: { row: { original: any } }) => (
                      <span className="font-medium">{row.original.totalDays}</span>
                    ),
                  },
                  {
                    accessorKey: "status",
                    header: "Status",
                    cell: ({ row }: { row: { original: any } }) => (
                      <Badge
                        variant={
                          row.original.status === "pending"
                            ? "secondary"
                            : row.original.status === "approved"
                              ? "default"
                              : row.original.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {row.original.status}
                      </Badge>
                    ),
                  },
                  {
                    accessorKey: "reason",
                    header: "Reason",
                    cell: ({ row }: { row: { original: any } }) => (
                      <span className="line-clamp-1 text-sm">{row.original.reason}</span>
                    ),
                  },
                ] as any
              }
              getRowId={(row) => row.id}
              pageSize={15}
              emptyMessage="No leave requests match your search or filters"
              rowActions={[
                { label: "View", action: (l: any) => alert(`View leave request ${l.id}`) },
                { label: "Approve", action: handleApprove, show: (l: any) => l.status === "pending" },
                { label: "Reject", action: handleReject, destructive: true, show: (l: any) => l.status === "pending" },
                {
                  label: "Cancel",
                  action: handleCancel,
                  destructive: true,
                  show: (l: any) => l.status === "pending" || l.status === "approved",
                },
              ]}
            />
          ) : (
            <EmptyState
              icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
              title="No leave requests found"
              description="Try adjusting your search or filters"
            />
          )}
        </TabsContent>

        <TabsContent value="balance" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">All Teams</option>
                {mockTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <DataTable<any>
              data={mockUsers
                .filter((u) => u.isActive)
                .map((user) => ({
                  user,
                  annualBalance: 20 - Math.floor(Math.random() * 10),
                  sickBalance: 10 - Math.floor(Math.random() * 5),
                  casualBalance: 5 - Math.floor(Math.random() * 3),
                  usedThisYear: Math.floor(Math.random() * 15),
                }))}
              columns={
                [
                  {
                    accessorKey: "user",
                    header: "Employee",
                    cell: ({ row }: { row: { original: any } }) => (
                      <UserLink user={row.original.user} showRole={true} />
                    ),
                  },
                  {
                    accessorKey: "annualBalance",
                    header: "Annual Leave",
                    cell: ({ row }: { row: { original: any } }) => (
                      <span className="font-medium">{row.original.annualBalance} days</span>
                    ),
                  },
                  {
                    accessorKey: "sickBalance",
                    header: "Sick Leave",
                    cell: ({ row }: { row: { original: any } }) => (
                      <span className="font-medium">{row.original.sickBalance} days</span>
                    ),
                  },
                  {
                    accessorKey: "casualBalance",
                    header: "Casual Leave",
                    cell: ({ row }: { row: { original: any } }) => (
                      <span className="font-medium">{row.original.casualBalance} days</span>
                    ),
                  },
                  {
                    accessorKey: "usedThisYear",
                    header: "Used This Year",
                    cell: ({ row }: { row: { original: any } }) => (
                      <span className="font-medium">{row.original.usedThisYear} days</span>
                    ),
                  },
                ] as any
              }
              getRowId={(row) => row.user.id}
              pageSize={15}
              emptyMessage="No users found"
            />
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <input
                type="month"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={new Date().toISOString().slice(0, 7)}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Leave Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 grid grid-cols-7 gap-1 text-center font-medium text-muted-foreground text-sm">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid min-h-[300px] grid-cols-7 gap-1">
                  {/* Calendar days would be rendered here */}
                  {[...Array(35)].map((_, i) => (
                    <div key={i} className="relative min-h-[80px] border p-2">
                      <span className="font-medium text-sm">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showForm && (
        <LeaveForm
          leave={editingLeave}
          onClose={() => {
            setShowForm(false);
            setEditingLeave(null);
          }}
          onSubmit={(_data) => {
            alert(`${editingLeave ? "Updated" : "Created"} leave request`);
            setShowForm(false);
            setEditingLeave(null);
          }}
        />
      )}
    </div>
  );
}

function LeaveForm({ leave, onClose, onSubmit }: { leave: any; onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    userId: leave?.userId || mockUsers[0].id,
    leaveType: leave?.leaveType || "annual",
    startDate: leave?.startDate || new Date().toISOString().split("T")[0],
    endDate: leave?.endDate || new Date().toISOString().split("T")[0],
    reason: leave?.reason || "",
    totalDays: leave?.totalDays || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold text-lg">{leave ? "Edit Leave Request" : "New Leave Request"}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label htmlFor="leave-employee" className="mb-1 block font-medium text-sm">
              Employee *
            </label>
            <select
              id="leave-employee"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              {mockUsers
                .filter((u) => u.isActive)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="leave-type" className="mb-1 block font-medium text-sm">
              Leave Type *
            </label>
            <select
              id="leave-type"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="maternity">Maternity</option>
              <option value="paternity">Paternity</option>
              <option value="bereavement">Bereavement</option>
              <option value="marriage">Marriage</option>
              <option value="compensatory">Compensatory</option>
              <option value="unpaid">Unpaid</option>
              <option value="study">Study</option>
              <option value="sabbatical">Sabbatical</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="leave-start" className="mb-1 block font-medium text-sm">
                Start Date *
              </label>
              <input
                id="leave-start"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="leave-end" className="mb-1 block font-medium text-sm">
                End Date *
              </label>
              <input
                id="leave-end"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="leave-total-days" className="mb-1 block font-medium text-sm">
              Total Days
            </label>
            <input
              id="leave-total-days"
              type="number"
              value={formData.totalDays}
              onChange={(e) => setFormData({ ...formData, totalDays: Number(e.target.value) })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="leave-reason" className="mb-1 block font-medium text-sm">
              Reason *
            </label>
            <textarea
              id="leave-reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Reason for leave"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{leave ? "Update" : "Submit"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
