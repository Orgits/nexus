"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "cn";
import {
  Activity,
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  CheckSquare,
  CreditCard,
  FileCheck,
  FileText,
  FolderOpen,
  Key,
  Mail,
  MessageSquare,
  Plus,
  Shield,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import {
  EmptyCommunications,
  EmptyDocuments,
  EmptyMatters,
  EmptyState,
  EmptyTasks,
} from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { Breadcrumb } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { ClientRecordHeader } from "@/components/ca-nexus/record-header";
import {
  ClientStatusBadge,
  MatterStatusBadge,
  PriorityBadge,
  StatusBadge,
  TaskStatusBadge,
} from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { formatDate } from "@/lib/format";
import { clientCategoryLabel, clientTypeLabel, formatCurrency, serviceTypeLabel } from "@/lib/labels";
import { getClientById, getContactsByClient } from "@/mock-data/clients";
import { getCommunicationsByClient, getConversationsByClient } from "@/mock-data/communications";
import { getDocumentsByClient } from "@/mock-data/documents";
import { getMattersByClient, getTasksByClient } from "@/mock-data/matters";
import { getInvoicesByClient } from "@/mock-data/time-billing";
import { getTeamById, getUserById, type mockTeams, type mockUsers } from "@/mock-data/users";
import type {
  Client,
  Communication,
  Contact,
  Conversation,
  Document,
  Invoice,
  Matter,
  OnboardingStage,
  Task,
} from "@/types";

interface ClientDetailProps {
  clientId: string;
}

const clientTabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "matters", label: "Matters", icon: Briefcase },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "communications", label: "Communications", icon: Mail },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "profile", label: "Profile", icon: User },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "registrations", label: "Registrations", icon: FileText },
  { id: "licenses", label: "Licenses", icon: Key },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "onboarding", label: "Onboarding", icon: Plus },
];

const _matterTabs = [
  { id: "overview", label: "Overview" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "tasks", label: "Tasks" },
  { id: "checklist", label: "Checklist" },
  { id: "subtasks", label: "Subtasks" },
  { id: "documents", label: "Documents" },
  { id: "communications", label: "Communications" },
  { id: "time", label: "Time" },
  { id: "review", label: "Review" },
  { id: "collaboration", label: "Collaboration" },
  { id: "billing", label: "Billing" },
  { id: "activity", label: "Activity" },
];

export function ClientDetail({ clientId }: ClientDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [_search, _setSearch] = useState("");
  const [_filters, _setFilters] = useState<Record<string, unknown>>({});

  const client = getClientById(clientId);
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Client not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The client you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/clients")}
          className="text-primary hover:underline"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const matters = getMattersByClient(clientId);
  const tasks = getTasksByClient(clientId);
  const documents = getDocumentsByClient(clientId);
  const communications = getCommunicationsByClient(clientId);
  const conversations = getConversationsByClient(clientId);
  const invoices = getInvoicesByClient(clientId);
  const contacts = getContactsByClient(clientId);
  const responsibleUser = getUserById(client.responsibleUserId);
  const responsibleTeam = client.responsibleTeamId ? getTeamById(client.responsibleTeamId) : undefined;

  const _activeMatters = matters.filter((m) => !["completed", "closed", "cancelled"].includes(m.status));
  const _overdueMatters = matters.filter(
    (m) =>
      m.status === "overdue" ||
      (new Date(m.dueDate) < new Date() && !["completed", "closed", "cancelled"].includes(m.status)),
  );
  const _pendingTasks = tasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const _overdueTasks = tasks.filter((t) => t.status !== "completed" && new Date(t.dueDate) < new Date());
  const _unpaidInvoices = invoices.filter((i) => ["issued", "sent", "partially_paid", "overdue"].includes(i.status));

  const handleMatterClick = (matter: Matter) => router.push(`/dashboard/matters/${matter.id}`);
  const handleTaskClick = (task: Task) => router.push(`/dashboard/tasks/${task.id}`);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[{ label: "Clients", href: "/dashboard/clients" }, { label: client.displayName || client.name }]}
      />
      <ClientRecordHeader client={client} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 md:grid-cols-14">
          {clientTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ClientOverviewTab
            client={client}
            matters={matters}
            tasks={tasks}
            invoices={invoices}
            contacts={contacts}
            communications={communications}
          />
        </TabsContent>

        <TabsContent value="matters" className="space-y-4">
          <ClientMattersTab matters={matters} onMatterClick={handleMatterClick} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ClientComplianceTab client={client} matters={matters} router={router} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <ClientTasksTab tasks={tasks} onTaskClick={handleTaskClick} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ClientDocumentsTab documents={documents} router={router} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <ClientCommunicationsTab communications={communications} router={router} />
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <ClientConversationsTab conversations={conversations} router={router} />
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <ClientBillingTab invoices={invoices} client={client} router={router} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <ClientProfileTab client={client} responsibleUser={responsibleUser} responsibleTeam={responsibleTeam} />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <ClientContactsTab contacts={contacts} client={client} />
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          <ClientRegistrationsTab client={client} />
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <ClientLicensesTab _client={client} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ClientActivityTab _client={client} matters={matters} tasks={tasks} communications={communications} />
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <ClientOnboardingTab client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClientOverviewTab({
  client,
  matters,
  tasks,
  invoices,
  contacts,
  communications,
}: {
  client: Client;
  matters: Matter[];
  tasks: Task[];
  invoices: Invoice[];
  contacts: Contact[];
  communications: Communication[];
}) {
  const activeMatters = matters.filter((m) => !["completed", "closed", "cancelled"].includes(m.status));
  const pendingTasks = tasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && new Date(t.dueDate) < new Date());
  const unpaidInvoices = invoices.filter((i) => ["issued", "sent", "partially_paid", "overdue"].includes(i.status));
  const totalOutstanding = unpaidInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Active Matters" value={activeMatters.length} icon={<Briefcase className="h-5 w-5" />} />
        <StatTile
          label="Pending Tasks"
          value={pendingTasks.length}
          hint={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : undefined}
          icon={<CheckSquare className="h-5 w-5" />}
        />
        <StatTile label="Contacts" value={contacts.length} icon={<Users className="h-5 w-5" />} />
        <StatTile
          label="Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Client Information">
          <KeyValueList
            items={[
              { label: "Legal Name", value: client.legalName ?? "—" },
              { label: "Entity Type", value: clientTypeLabel(client.type) },
              { label: "Category", value: clientCategoryLabel(client.category) },
              { label: "Status", value: <ClientStatusBadge status={client.status} /> },
              { label: "PAN", value: client.identifiers.pan ?? "—" },
              { label: "GSTIN", value: client.identifiers.gstin ?? "—" },
              { label: "CIN", value: client.identifiers.cin ?? "—" },
              { label: "Financial Year Start", value: `Month ${client.complianceProfile.financialYearStart}` },
            ]}
          />
        </SectionCard>

        <SectionCard title="Address & Contact">
          <KeyValueList
            items={[
              {
                label: "Address",
                value: `${client.address.line1}${client.address.line2 ? `, ${client.address.line2}` : ""}, ${client.address.city}, ${client.address.state} - ${client.address.postalCode}`,
              },
              {
                label: "Billing Address",
                value: client.billingAddress
                  ? `${client.billingAddress.line1}, ${client.billingAddress.city}`
                  : "Same as above",
              },
              {
                label: "Primary Contact",
                value: (() => {
                  if (!client.primaryContactId) return "—";
                  const contact = contacts.find((c) => c.id === client.primaryContactId);
                  return contact ? `${contact.firstName} ${contact.lastName}` : "—";
                })(),
              },
              { label: "Portal Access", value: client.portalAccessEnabled ? "Enabled" : "Disabled" },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Active Services">
        <div className="space-y-3">
          {client.services
            .filter((s) => s.isActive)
            .map((service) => (
              <div key={service.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{serviceTypeLabel(service.serviceType)}</Badge>
                  <span className="font-medium">{service.serviceName}</span>
                  <Badge variant="outline" className="text-xs">
                    {service.frequency}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(service.rate || 0)}</div>
                  <div className="text-muted-foreground text-xs">{service.billingMethod.replace(/_/g, " ")}</div>
                </div>
              </div>
            ))}
        </div>
      </SectionCard>

      <SectionCard title="Recent Activity">
        <ActivityTimeline
          activities={[
            ...matters.slice(0, 3).map((m) => ({
              id: `matter-${m.id}`,
              type: "matter" as const,
              title: `Matter ${m.matterNumber}: ${m.name}`,
              description: `Status: ${m.status.replace(/_/g, " ")} • Progress: ${m.progress}%`,
              timestamp: m.updatedAt,
              entityUrl: `/dashboard/matters/${m.id}`,
            })),
            ...tasks.slice(0, 3).map((t) => ({
              id: `task-${t.id}`,
              type: "task" as const,
              title: `Task ${t.taskNumber}: ${t.title}`,
              description: `Status: ${t.status.replace(/_/g, " ")} • Due: ${formatDate(t.dueDate)}`,
              timestamp: t.updatedAt,
              entityUrl: `/dashboard/tasks/${t.id}`,
            })),
            ...communications.slice(0, 2).map((c) => ({
              id: `comm-${c.id}`,
              type: "communication" as const,
              title: c.subject ?? c.content.slice(0, 60),
              description: `Channel: ${c.channel} • ${c.direction}`,
              timestamp: c.sentAt || c.createdAt,
              entityUrl: `/dashboard/communications/${c.id}`,
            })),
          ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
          maxItems={10}
          grouped
        />
      </SectionCard>
    </div>
  );
}

function ClientMattersTab({ matters, onMatterClick }: { matters: Matter[]; onMatterClick: (matter: Matter) => void }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "created", label: "Created" },
        { value: "information_pending", label: "Information Pending" },
        { value: "documents_pending", label: "Documents Pending" },
        { value: "in_progress", label: "In Progress" },
        { value: "ready_for_review", label: "Ready for Review" },
        { value: "rework", label: "Rework" },
        { value: "approved", label: "Approved" },
        { value: "filed", label: "Filed" },
        { value: "completed", label: "Completed" },
        { value: "billing_followup", label: "Billing Follow-up" },
        { value: "closed", label: "Closed" },
        { value: "on_hold", label: "On Hold" },
        { value: "overdue", label: "Overdue" },
      ],
    },
    {
      key: "serviceType",
      label: "Service",
      type: "select",
      options: [
        { value: "itr", label: "ITR" },
        { value: "gst_monthly", label: "GST Monthly" },
        { value: "gst_quarterly", label: "GST Quarterly" },
        { value: "tds_24q", label: "TDS 24Q" },
        { value: "tds_26q", label: "TDS 26Q" },
        { value: "audit_statutory", label: "Statutory Audit" },
        { value: "advisory_tax", label: "Tax Advisory" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
        { value: "urgent", label: "Urgent" },
      ],
    },
  ];

  const filteredMatters = matters.filter((m: Matter) => {
    if (
      search &&
      !m.name.toLowerCase().includes(search.toLowerCase()) &&
      !m.matterNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (m as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const matterColumns: ColumnDef<DataTableFeatures, Matter>[] = [
    {
      accessorKey: "name",
      header: "Matter",
      cell: ({ row }: { row: { original: Matter } }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-muted-foreground text-xs">{row.original.matterNumber}</p>
        </div>
      ),
    },
    {
      accessorKey: "serviceName",
      header: "Service",
      cell: ({ row }: { row: { original: Matter } }) => <span className="text-sm">{row.original.serviceName}</span>,
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }: { row: { original: Matter } }) => <span className="text-sm">{row.original.period.label}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Matter } }) => <MatterStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: { row: { original: Matter } }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }: { row: { original: Matter } }) => (
        <div className="w-32">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${row.original.progress}%` }} />
          </div>
          <span className="text-muted-foreground text-xs">{row.original.progress}%</span>
        </div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }: { row: { original: Matter } }) => (
        <span
          className={cn(
            "text-sm",
            new Date(row.original.dueDate) < new Date() && row.original.status !== "completed" && "text-destructive",
          )}
        >
          {formatDate(row.original.dueDate)}
        </span>
      ),
    },
    {
      accessorKey: "assignedUserId",
      header: "Assignee",
      cell: ({ row }: { row: { original: Matter } }) => {
        const user = getUserById(row.original.assignedUserId);
        return <span className="text-sm">{user?.fullName ?? row.original.assignedUserId}</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search matters..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />
      {filteredMatters.length > 0 ? (
        <DataTable<Matter>
          data={filteredMatters}
          columns={matterColumns}
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No matters match your search or filters"
          rowActions={[{ label: "View Details", action: onMatterClick }]}
        />
      ) : (
        <EmptyMatters />
      )}
    </div>
  );
}

function ClientComplianceTab({
  client,
  matters,
  router,
}: {
  client: Client;
  matters: Matter[];
  router: ReturnType<typeof useRouter>;
}) {
  const complianceMatters = matters.filter((m) =>
    ["itr", "gst_monthly", "gst_quarterly", "tds_24q", "tds_26q", "mca_aoc4", "mca_mgt7"].includes(m.serviceType),
  );

  return (
    <div className="space-y-4">
      <SectionCard title="Compliance Overview">
        <p className="mb-4 text-muted-foreground text-sm">
          {client.complianceProfile.applicableComplianceTypes.length} compliance types configured.{" "}
          {complianceMatters.length} active matters.
        </p>
        <KeyValueList
          items={[
            { label: "GST Filing", value: client.complianceProfile.gstFilingFrequency ?? "Not configured" },
            { label: "TDS Applicable", value: client.complianceProfile.tdsApplicable ? "Yes" : "No" },
            { label: "MCA Applicable", value: client.complianceProfile.mcaApplicable ? "Yes" : "No" },
            { label: "Audit Applicable", value: client.complianceProfile.auditApplicable ? "Yes" : "No" },
            { label: "FY Start Month", value: String(client.complianceProfile.financialYearStart) },
          ]}
        />
      </SectionCard>

      <SectionCard title="Compliance Matters">
        {complianceMatters.length > 0 ? (
          <DataTable<Matter>
            data={complianceMatters}
            columns={
              [
                {
                  accessorKey: "name",
                  header: "Matter",
                  cell: ({ row }: { row: { original: Matter } }) => <p className="font-medium">{row.original.name}</p>,
                },
                {
                  accessorKey: "serviceType",
                  header: "Type",
                  cell: ({ row }: { row: { original: Matter } }) => (
                    <Badge variant="secondary">{serviceTypeLabel(row.original.serviceType)}</Badge>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: Matter } }) => <MatterStatusBadge status={row.original.status} />,
                },
                {
                  accessorKey: "dueDate",
                  header: "Due Date",
                  cell: ({ row }: { row: { original: Matter } }) => (
                    <span className="text-sm">{formatDate(row.original.dueDate)}</span>
                  ),
                },
                {
                  accessorKey: "progress",
                  header: "Progress",
                  cell: ({ row }: { row: { original: Matter } }) => (
                    <div className="w-32">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${row.original.progress}%` }} />
                      </div>
                    </div>
                  ),
                },
              ] as ColumnDef<DataTableFeatures, Matter>[]
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No compliance matters"
            rowActions={[{ label: "View", action: (row) => router.push(`/dashboard/matters/${row.id}`) }]}
          />
        ) : (
          <EmptyState
            icon={<ShieldCheck className="h-12 w-12 text-muted-foreground/50" />}
            title="No compliance matters"
            description="Compliance matters will appear here when services are configured."
          />
        )}
      </SectionCard>
    </div>
  );
}

function ClientTasksTab({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "todo", label: "Todo" },
        { value: "in_progress", label: "In Progress" },
        { value: "in_review", label: "In Review" },
        { value: "rework", label: "Rework" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "on_hold", label: "On Hold" },
        { value: "blocked", label: "Blocked" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
        { value: "urgent", label: "Urgent" },
      ],
    },
  ];

  const filteredTasks = tasks.filter((t: Task) => {
    if (
      search &&
      !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !t.taskNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (t as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
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
      {filteredTasks.length > 0 ? (
        <DataTable<Task>
          data={filteredTasks}
          columns={
            [
              {
                accessorKey: "title",
                header: "Task",
                cell: ({ row }: { row: { original: Task } }) => <p className="font-medium">{row.original.title}</p>,
              },
              {
                accessorKey: "taskNumber",
                header: "ID",
                cell: ({ row }: { row: { original: Task } }) => (
                  <span className="text-muted-foreground text-sm">{row.original.taskNumber}</span>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Task } }) => <TaskStatusBadge status={row.original.status} />,
              },
              {
                accessorKey: "priority",
                header: "Priority",
                cell: ({ row }: { row: { original: Task } }) => <PriorityBadge priority={row.original.priority} />,
              },
              {
                accessorKey: "dueDate",
                header: "Due",
                cell: ({ row }: { row: { original: Task } }) => (
                  <span
                    className={cn(
                      "text-sm",
                      new Date(row.original.dueDate) < new Date() &&
                        row.original.status !== "completed" &&
                        "text-destructive",
                    )}
                  >
                    {formatDate(row.original.dueDate)}
                  </span>
                ),
              },
              {
                accessorKey: "progress",
                header: "Progress",
                cell: ({ row }: { row: { original: Task } }) => (
                  <div className="w-24">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${row.original.progress}%` }} />
                    </div>
                  </div>
                ),
              },
            ] as ColumnDef<DataTableFeatures, Task>[]
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No tasks match your search or filters"
          rowActions={[{ label: "View Details", action: onTaskClick }]}
        />
      ) : (
        <EmptyTasks />
      )}
    </div>
  );
}

function ClientDocumentsTab({ documents, router }: { documents: Document[]; router: ReturnType<typeof useRouter> }) {
  if (documents.length === 0) return <EmptyDocuments />;

  return (
    <DataTable<Document>
      data={documents}
      columns={
        [
          {
            accessorKey: "originalFileName",
            header: "Document",
            cell: ({ row }: { row: { original: Document } }) => (
              <p className="font-medium">{row.original.originalFileName}</p>
            ),
          },
          {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }: { row: { original: Document } }) => (
              <Badge variant="secondary">{row.original.category.replace(/_/g, " ")}</Badge>
            ),
          },
          {
            accessorKey: "documentType",
            header: "Type",
            cell: ({ row }: { row: { original: Document } }) => (
              <span className="text-sm">{row.original.documentType.replace(/_/g, " ")}</span>
            ),
          },
          {
            accessorKey: "fileSize",
            header: "Size",
            cell: ({ row }: { row: { original: Document } }) => (
              <span className="text-sm">{formatFileSize(row.original.fileSize)}</span>
            ),
          },
          {
            accessorKey: "ocrStatus",
            header: "OCR",
            cell: ({ row }: { row: { original: Document } }) => (
              <Badge variant="outline">{row.original.ocrStatus.replace(/_/g, " ")}</Badge>
            ),
          },
          {
            accessorKey: "createdAt",
            header: "Uploaded",
            cell: ({ row }: { row: { original: Document } }) => (
              <span className="text-sm">{formatDate(row.original.createdAt)}</span>
            ),
          },
        ] as ColumnDef<DataTableFeatures, Document>[]
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No documents"
      rowActions={[{ label: "View", action: (row) => router.push(`/dashboard/documents/${row.id}`) }]}
    />
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ClientCommunicationsTab({
  communications,
  router,
}: {
  communications: Communication[];
  router: ReturnType<typeof useRouter>;
}) {
  if (communications.length === 0) return <EmptyCommunications />;

  return (
    <DataTable<Communication>
      data={communications}
      columns={
        [
          {
            accessorKey: "subject",
            header: "Subject",
            cell: ({ row }: { row: { original: Communication } }) => (
              <p className="font-medium">{row.original.subject ?? row.original.content.slice(0, 60)}</p>
            ),
          },
          {
            accessorKey: "channel",
            header: "Channel",
            cell: ({ row }: { row: { original: Communication } }) => (
              <Badge variant="secondary">{row.original.channel.toUpperCase()}</Badge>
            ),
          },
          {
            accessorKey: "direction",
            header: "Direction",
            cell: ({ row }: { row: { original: Communication } }) => (
              <Badge variant="outline">{row.original.direction}</Badge>
            ),
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: { original: Communication } }) => <StatusBadge status={row.original.status} />,
          },
          {
            accessorKey: "sentAt",
            header: "Sent",
            cell: ({ row }: { row: { original: Communication } }) => (
              <span className="text-sm">{row.original.sentAt ? formatDate(row.original.sentAt) : "—"}</span>
            ),
          },
        ] as ColumnDef<DataTableFeatures, Communication>[]
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No communications"
      rowActions={[{ label: "View", action: (row) => router.push(`/dashboard/communications/${row.id}`) }]}
    />
  );
}

function ClientConversationsTab({
  conversations,
  router,
}: {
  conversations: Conversation[];
  router: ReturnType<typeof useRouter>;
}) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-12 w-12 text-muted-foreground/50" />}
        title="No conversations"
        description="Conversations group related communications together."
      />
    );
  }

  return (
    <DataTable<Conversation>
      data={conversations}
      columns={
        [
          {
            accessorKey: "subject",
            header: "Subject",
            cell: ({ row }: { row: { original: Conversation } }) => (
              <p className="font-medium">{row.original.subject}</p>
            ),
          },
          {
            accessorKey: "channels",
            header: "Channels",
            cell: ({ row }: { row: { original: Conversation } }) => (
              <div className="flex gap-1">
                {row.original.channels.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            ),
          },
          {
            accessorKey: "lastMessageAt",
            header: "Last Message",
            cell: ({ row }: { row: { original: Conversation } }) => (
              <span className="text-sm">{formatDate(row.original.lastMessageAt)}</span>
            ),
          },
          {
            accessorKey: "unreadCount",
            header: "Unread",
            cell: ({ row }: { row: { original: Conversation } }) =>
              row.original.unreadCount > 0 ? (
                <Badge variant="destructive">{row.original.unreadCount}</Badge>
              ) : (
                <span className="text-muted-foreground">0</span>
              ),
          },
        ] as ColumnDef<DataTableFeatures, Conversation>[]
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No conversations"
      rowActions={[{ label: "Open", action: (row) => router.push(`/dashboard/conversations/${row.id}`) }]}
    />
  );
}

function ClientBillingTab({
  invoices,
  client,
  router,
}: {
  invoices: Invoice[];
  client: Client;
  router: ReturnType<typeof useRouter>;
}) {
  const unpaidInvoices = invoices.filter((i) => ["issued", "sent", "partially_paid", "overdue"].includes(i.status));
  const totalOutstanding = unpaidInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);

  return (
    <div className="space-y-6">
      <SectionCard title="Billing Summary" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Total Invoiced"
          value={formatCurrency(totalInvoiced)}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatTile label="Total Paid" value={formatCurrency(totalPaid)} icon={<CheckCircle className="h-5 w-5" />} />
        <StatTile
          label="Outstanding"
          value={formatCurrency(totalOutstanding)}
          hint={unpaidInvoices.length > 0 ? `${unpaidInvoices.length} unpaid` : undefined}
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <StatTile
          label="Payment Terms"
          value={`${client.financialProfile?.paymentTerms ?? 30} days`}
          icon={<Calendar className="h-5 w-5" />}
        />
      </SectionCard>

      <SectionCard title="Invoices">
        {invoices.length > 0 ? (
          <DataTable<Invoice>
            data={invoices}
            columns={
              [
                {
                  accessorKey: "invoiceNumber",
                  header: "Invoice",
                  cell: ({ row }: { row: { original: Invoice } }) => (
                    <p className="font-medium">{row.original.invoiceNumber}</p>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: Invoice } }) => <StatusBadge status={row.original.status} />,
                },
                {
                  accessorKey: "paymentStatus",
                  header: "Payment",
                  cell: ({ row }: { row: { original: Invoice } }) => (
                    <StatusBadge status={row.original.paymentStatus} />
                  ),
                },
                {
                  accessorKey: "issueDate",
                  header: "Issue Date",
                  cell: ({ row }: { row: { original: Invoice } }) => (
                    <span className="text-sm">{formatDate(row.original.issueDate)}</span>
                  ),
                },
                {
                  accessorKey: "dueDate",
                  header: "Due Date",
                  cell: ({ row }: { row: { original: Invoice } }) => (
                    <span className={cn("text-sm", row.original.paymentStatus === "overdue" && "text-destructive")}>
                      {formatDate(row.original.dueDate)}
                    </span>
                  ),
                },
                {
                  accessorKey: "totalAmount",
                  header: "Total",
                  cell: ({ row }: { row: { original: Invoice } }) => (
                    <span className="font-medium">{formatCurrency(row.original.totalAmount)}</span>
                  ),
                },
                {
                  accessorKey: "balanceAmount",
                  header: "Balance",
                  cell: ({ row }: { row: { original: Invoice } }) => (
                    <span className={cn("font-medium", row.original.balanceAmount > 0 && "text-destructive")}>
                      {formatCurrency(row.original.balanceAmount)}
                    </span>
                  ),
                },
              ] as ColumnDef<DataTableFeatures, Invoice>[]
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No invoices"
            rowActions={[{ label: "View", action: (row) => router.push(`/dashboard/invoices/${row.id}`) }]}
          />
        ) : (
          <EmptyState
            icon={<CreditCard className="h-12 w-12 text-muted-foreground/50" />}
            title="No invoices"
            description="Invoices will appear here when generated from matters."
          />
        )}
      </SectionCard>
    </div>
  );
}

function ClientProfileTab({
  client,
  responsibleUser,
  responsibleTeam,
}: {
  client: Client;
  responsibleUser: (typeof mockUsers)[0] | undefined;
  responsibleTeam: (typeof mockTeams)[0] | undefined;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Basic Information">
        <KeyValueList
          items={[
            { label: "Client Name", value: client.name },
            { label: "Display Name", value: client.displayName },
            { label: "Legal Name", value: client.legalName ?? "—" },
            { label: "Entity Type", value: clientTypeLabel(client.type) },
            { label: "Category", value: clientCategoryLabel(client.category) },
            { label: "Status", value: <ClientStatusBadge status={client.status} /> },
            { label: "Created", value: formatDate(client.createdAt) },
            { label: "Updated", value: formatDate(client.updatedAt) },
          ]}
        />
      </SectionCard>

      <SectionCard title="Identifiers">
        <KeyValueList
          items={[
            { label: "PAN", value: client.identifiers.pan ?? "—" },
            { label: "TAN", value: client.identifiers.tan ?? "—" },
            { label: "GSTIN", value: client.identifiers.gstin ?? "—" },
            { label: "CIN", value: client.identifiers.cin ?? "—" },
            { label: "DIN(s)", value: client.identifiers.din?.join(", ") ?? "—" },
            { label: "Aadhaar", value: client.identifiers.aadhaar ?? "—" },
            { label: "IEC", value: client.identifiers.iec ?? "—" },
          ]}
        />
      </SectionCard>

      <SectionCard title="Address">
        <KeyValueList
          items={[
            { label: "Line 1", value: client.address.line1 },
            { label: "Line 2", value: client.address.line2 ?? "—" },
            { label: "City", value: client.address.city },
            { label: "State", value: client.address.state },
            { label: "Postal Code", value: client.address.postalCode },
            { label: "Country", value: client.address.country },
          ]}
        />
      </SectionCard>

      <SectionCard title="Assignment">
        <KeyValueList
          items={[
            { label: "Responsible User", value: responsibleUser?.fullName ?? "—" },
            { label: "Responsible Team", value: responsibleTeam?.name ?? "—" },
          ]}
        />
      </SectionCard>

      <SectionCard title="Financial Profile">
        <KeyValueList
          items={[
            {
              label: "Annual Turnover",
              value: client.financialProfile?.annualTurnover
                ? formatCurrency(client.financialProfile.annualTurnover)
                : "—",
            },
            {
              label: "Taxable Income",
              value: client.financialProfile?.taxableIncome
                ? formatCurrency(client.financialProfile.taxableIncome)
                : "—",
            },
            {
              label: "GST Liability",
              value: client.financialProfile?.gstLiability ? formatCurrency(client.financialProfile.gstLiability) : "—",
            },
            {
              label: "TDS Liability",
              value: client.financialProfile?.tdsLiability ? formatCurrency(client.financialProfile.tdsLiability) : "—",
            },
            {
              label: "Outstanding Receivables",
              value: client.financialProfile?.outstandingReceivables
                ? formatCurrency(client.financialProfile.outstandingReceivables)
                : "—",
            },
            {
              label: "Outstanding Payables",
              value: client.financialProfile?.outstandingPayables
                ? formatCurrency(client.financialProfile.outstandingPayables)
                : "—",
            },
            {
              label: "Credit Limit",
              value: client.financialProfile?.creditLimit ? formatCurrency(client.financialProfile.creditLimit) : "—",
            },
            {
              label: "Payment Terms",
              value: `${client.financialProfile?.paymentTerms ?? 30} days`,
            },
            {
              label: "Preferred Payment",
              value: client.financialProfile?.preferredPaymentMethod?.replace(/_/g, " ") ?? "—",
            },
          ]}
        />
      </SectionCard>

      {client.notes && (
        <SectionCard title="Notes">
          <p className="text-muted-foreground text-sm">{client.notes}</p>
        </SectionCard>
      )}
    </div>
  );
}

function ClientContactsTab({ contacts, client }: { contacts: Contact[]; client: Client }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Contacts" description={`${contacts.length} contact(s) for ${client.displayName}`}>
        {contacts.length > 0 ? (
          <DataTable<Contact>
            data={contacts}
            columns={
              [
                {
                  accessorKey: "fullName",
                  header: "Name",
                  cell: ({ row }: { row: { original: Contact } }) => (
                    <div>
                      <p className="font-medium">
                        {row.original.firstName} {row.original.lastName}
                      </p>
                      {row.original.isPrimary && (
                        <Badge variant="secondary" className="mt-0.5 text-xs">
                          Primary
                        </Badge>
                      )}
                      {row.original.isAuthorizedSignatory && (
                        <Badge variant="outline" className="mt-0.5 text-xs">
                          Signatory
                        </Badge>
                      )}
                    </div>
                  ),
                },
                {
                  accessorKey: "designation",
                  header: "Designation",
                  cell: ({ row }: { row: { original: Contact } }) => (
                    <span className="text-sm">{row.original.designation ?? "—"}</span>
                  ),
                },
                {
                  accessorKey: "department",
                  header: "Department",
                  cell: ({ row }: { row: { original: Contact } }) => (
                    <span className="text-sm">{row.original.department ?? "—"}</span>
                  ),
                },
                {
                  accessorKey: "email",
                  header: "Email",
                  cell: ({ row }: { row: { original: Contact } }) => (
                    <a href={`mailto:${row.original.email}`} className="text-primary hover:underline">
                      {row.original.email}
                    </a>
                  ),
                },
                {
                  accessorKey: "phone",
                  header: "Phone",
                  cell: ({ row }: { row: { original: Contact } }) => (
                    <span className="text-sm">{row.original.phone ?? row.original.mobile ?? "—"}</span>
                  ),
                },
                {
                  accessorKey: "preferredChannel",
                  header: "Channel",
                  cell: ({ row }: { row: { original: Contact } }) => (
                    <Badge variant="outline">{row.original.preferredChannel}</Badge>
                  ),
                },
              ] as ColumnDef<DataTableFeatures, Contact>[]
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No contacts"
          />
        ) : (
          <EmptyState
            icon={<Users className="h-12 w-12 text-muted-foreground/50" />}
            title="No contacts"
            description="Add contacts to this client."
          />
        )}
      </SectionCard>
    </div>
  );
}

function ClientRegistrationsTab({ client }: { client: Client }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Business Registrations">
        <KeyValueList
          items={[
            { label: "PAN", value: client.identifiers.pan ?? "Not registered" },
            { label: "TAN", value: client.identifiers.tan ?? "Not registered" },
            { label: "GSTIN", value: client.identifiers.gstin ?? "Not registered" },
            { label: "CIN / LLPIN", value: client.identifiers.cin ?? "Not registered" },
            { label: "IEC", value: client.identifiers.iec ?? "Not registered" },
            { label: "DIN(s)", value: client.identifiers.din?.join(", ") ?? "—" },
          ]}
        />
      </SectionCard>

      <SectionCard title="GST Details">
        <KeyValueList
          items={[
            { label: "Filing Frequency", value: client.complianceProfile.gstFilingFrequency ?? "Not configured" },
            { label: "GSTIN", value: client.identifiers.gstin ?? "—" },
          ]}
        />
      </SectionCard>

      <SectionCard title="MCA Details">
        <KeyValueList
          items={[
            { label: "CIN", value: client.identifiers.cin ?? "—" },
            { label: "MCA Applicable", value: client.complianceProfile.mcaApplicable ? "Yes" : "No" },
            { label: "DIN Count", value: String(client.identifiers.din?.length ?? 0) },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function ClientLicensesTab({ _client }: { _client: Client }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Licenses & Registrations">
        <p className="text-muted-foreground text-sm">
          DSC, UDIN, and professional licenses are managed in the Registers module.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <button type="button" className="rounded-lg border p-4 text-left transition-colors hover:bg-muted/50">
            <Shield className="mb-2 h-5 w-5 text-muted-foreground" />
            <p className="font-medium">DSC Register</p>
            <p className="text-muted-foreground text-sm">Digital Signature Certificates</p>
          </button>
          <button type="button" className="rounded-lg border p-4 text-left transition-colors hover:bg-muted/50">
            <FileCheck className="mb-2 h-5 w-5 text-muted-foreground" />
            <p className="font-medium">UDIN Register</p>
            <p className="text-muted-foreground text-sm">Unique Document Identification Numbers</p>
          </button>
          <button type="button" className="rounded-lg border p-4 text-left transition-colors hover:bg-muted/50">
            <Key className="mb-2 h-5 w-5 text-muted-foreground" />
            <p className="font-medium">Licenses</p>
            <p className="text-muted-foreground text-sm">Professional & business licenses</p>
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

function ClientActivityTab({
  _client,
  matters,
  tasks,
  communications,
}: {
  _client: Client;
  matters: Matter[];
  tasks: Task[];
  communications: Communication[];
}) {
  const allActivities = [
    ...matters.map((m) => ({
      id: `matter-${m.id}`,
      type: "matter" as const,
      title: `Matter ${m.matterNumber}: ${m.name}`,
      description: `Stage: ${m.stage.replace(/_/g, " ")} • ${m.status.replace(/_/g, " ")}`,
      timestamp: m.updatedAt,
      entityUrl: `/dashboard/matters/${m.id}`,
    })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task" as const,
      title: `Task ${t.taskNumber}: ${t.title}`,
      description: `Status: ${t.status.replace(/_/g, " ")} • ${t.priority} priority`,
      timestamp: t.updatedAt,
      entityUrl: `/dashboard/tasks/${t.id}`,
    })),
    ...communications.map((c) => ({
      id: `comm-${c.id}`,
      type: "communication" as const,
      title: c.subject ?? c.content.slice(0, 60),
      description: `${c.channel.toUpperCase()} • ${c.direction}`,
      timestamp: c.sentAt || c.createdAt,
      entityUrl: `/dashboard/communications/${c.id}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={allActivities} grouped maxItems={50} />
    </SectionCard>
  );
}

function ClientOnboardingTab({ client }: { client: Client }) {
  const { stage, progress, completedStages, pendingItems } = client.onboardingStatus;

  const allStages: { id: OnboardingStage; label: string; description: string }[] = [
    {
      id: "profile_created",
      label: "Profile Created",
      description: "Basic client information and legal entity details",
    },
    {
      id: "contacts_added",
      label: "Contacts Added",
      description: "Primary contact, authorized signatories, and communication preferences",
    },
    {
      id: "identifiers_added",
      label: "Identifiers Recorded",
      description: "PAN, TAN, GSTIN, CIN, DIN and other regulatory identifiers",
    },
    {
      id: "services_configured",
      label: "Services Configured",
      description: "Select and configure active services with billing and compliance settings",
    },
    {
      id: "kyc_documents_collected",
      label: "KYC Documents Collected",
      description: "PAN, Aadhaar, incorporation certificate, MOA/AOA, partnership deed",
    },
    {
      id: "compliance_configured",
      label: "Compliance Configured",
      description: "Set up compliance calendar, due dates, and reminder schedules",
    },
    { id: "team_assigned", label: "Team Assigned", description: "Assign responsible CA, team, and escalation matrix" },
    {
      id: "initial_matters_created",
      label: "Initial Matters Created",
      description: "Set up first compliance matters and work items",
    },
    {
      id: "portal_invited",
      label: "Portal Invited",
      description: "Send portal invitation for document sharing and communication",
    },
    {
      id: "completed",
      label: "Onboarding Complete",
      description: "Client fully onboarded and ready for service delivery",
    },
  ];

  const getStageClass = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) return "bg-green-500 text-white";
    if (isCurrent) return "bg-blue-500 text-white";
    return "bg-muted text-muted-foreground";
  };

  const getTextClass = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) return "text-green-700 dark:text-green-300";
    if (isCurrent) return "text-blue-700 dark:text-blue-300";
    return "";
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Onboarding Progress">
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Current Stage: <span className="font-medium capitalize">{stage.replace(/_/g, " ")}</span>
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Onboarding Checklist">
        <div className="space-y-3">
          {allStages.map((s, index) => {
            const isCompleted = completedStages.includes(s.id);
            const isCurrent = stage === s.id;
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                  isCompleted && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10",
                  isCurrent && !isCompleted && "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10",
                  !isCompleted && !isCurrent && "bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-medium text-sm",
                    getStageClass(isCompleted, isCurrent),
                  )}
                >
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>
                <div className="flex-1">
                  <p className={cn("font-medium", getTextClass(isCompleted, isCurrent))}>{s.label}</p>
                  <p className="mt-0.5 text-muted-foreground text-sm">{s.description}</p>
                  {isCompleted && <span className="text-green-600 text-xs dark:text-green-400">Completed</span>}
                  {isCurrent && !isCompleted && (
                    <span className="text-blue-600 text-xs dark:text-blue-400">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {pendingItems.length > 0 && (
        <SectionCard title="Pending Items">
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/10"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.description && <p className="text-muted-foreground text-sm">{item.description}</p>}
                  {item.deepLink && (
                    <a href={item.deepLink} className="mt-1 inline-block text-primary text-sm hover:underline">
                      Take action →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
