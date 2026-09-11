"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  AlertCircle,
  AlertTriangle,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  Clock,
  FileText,
  FolderOpen,
  Gavel,
  ListTodo,
  MessageSquare,
  Scale,
  Search,
  Shield,
} from "lucide-react";

import { type ActivityItem, ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyDocuments, EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { AuditRecordHeader } from "@/components/ca-nexus/record-header";
import {
  AuditQueryStatusBadge,
  AuditStatusBadge,
  PriorityBadge,
  WorkpaperStatusBadge,
} from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatINR } from "@/lib/format";
import {
  getAuditEngagementById,
  getAuditProgramsByEngagement,
  getAuditQueriesByEngagement,
  getReviewNotesByEngagement,
  getSignOffsByEngagement,
  getWorkpapersByEngagement,
} from "@/mock-data/audit";
import { getClientById } from "@/mock-data/clients";
import { getDocumentsByClient, mockDocuments } from "@/mock-data/documents";
import { getTasksByMatter } from "@/mock-data/matters";
import { getUserById } from "@/mock-data/users";
import type {
  AuditEngagement,
  AuditProcedure,
  AuditProgram,
  AuditQuery,
  KeyRisk,
  ReviewNote,
  SignOff,
  Workpaper,
} from "@/types";

const auditTabs = [
  { id: "overview", label: "Overview", icon: Briefcase },
  { id: "planning", label: "Planning", icon: ListTodo },
  { id: "risk", label: "Risk Assessment", icon: AlertTriangle },
  { id: "materiality", label: "Materiality", icon: Scale },
  { id: "programs", label: "Audit Programs", icon: FolderOpen },
  { id: "workpapers", label: "Workpapers", icon: FileText },
  { id: "evidence", label: "Evidence", icon: Shield },
  { id: "queries", label: "Queries", icon: MessageSquare },
  { id: "review-notes", label: "Review Notes", icon: Search },
  { id: "signoff", label: "Sign-off", icon: Gavel },
  { id: "history", label: "History", icon: Clock },
];

export function AuditDetail({ auditId }: { auditId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [_search, _setSearch] = useState("");
  const [_filters, _setFilters] = useState<Record<string, unknown>>({});

  const engagement = getAuditEngagementById(auditId);
  if (!engagement) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Audit engagement not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The audit engagement you're looking for doesn't exist.</p>
        <button type="button" onClick={() => router.push("/dashboard/audit")} className="text-primary hover:underline">
          Back to Audit Workspace
        </button>
      </div>
    );
  }

  const client = getClientById(engagement.clientId);
  const _matter = engagement.assignedTeam ? undefined : undefined;
  const partner = getUserById(engagement.assignedTeam.partnerId);
  const managers = engagement.assignedTeam.managerIds.map((id) => getUserById(id)).filter(Boolean);
  const seniors = engagement.assignedTeam.seniorIds.map((id) => getUserById(id)).filter(Boolean);
  const staff = engagement.assignedTeam.staffIds.map((id) => getUserById(id)).filter(Boolean);

  const workpapers = getWorkpapersByEngagement(auditId);
  const queries = getAuditQueriesByEngagement(auditId);
  const reviewNotes = getReviewNotesByEngagement(auditId);
  const signOffs = getSignOffsByEngagement(auditId);
  const programs = getAuditProgramsByEngagement(auditId);
  const documents = getDocumentsByClient(engagement.clientId);
  const tasks = engagement.assignedTeam ? getTasksByMatter(engagement.assignedTeam.partnerId) : [];

  const _completedPrograms = programs.filter((p) => p.status === "completed").length;
  const _totalPrograms = programs.length;
  const _openQueries = queries.filter((q) => q.status === "open" || q.status === "in_progress").length;
  const _reviewedWorkpapers = workpapers.filter((w) => w.status === "reviewed" || w.status === "finalized").length;
  const _totalWorkpapers = workpapers.length;

  const _handleTaskClick = (t: any) => router.push(`/dashboard/tasks/${t.id}`);
  const handleDocumentClick = (d: any) => router.push(`/dashboard/documents/${d.id}`);

  const allActivities: ActivityItem[] = [
    ...engagement.programs
      .filter((p) => p.completedAt)
      .map((p, index) => ({
        id: `prog-${index}`,
        type: "task" as const,
        title: `Program Completed: ${p.area}`,
        description: `${p.procedures.length} procedures`,
        user: getUserById(p.assignedTo),
        timestamp: p.completedAt || engagement.createdAt,
        entityUrl: "#",
        status: p.status,
      })),
    ...workpapers
      .filter((w) => w.preparedAt || w.reviewedAt)
      .map((w, index) => ({
        id: `wp-${index}`,
        type: "workpaper" as const,
        title: `Workpaper: ${w.reference} - ${w.title}`,
        description: `Status: ${w.status.replace(/_/g, " ")}`,
        user: getUserById(w.preparedBy),
        timestamp: w.reviewedAt || w.preparedAt || engagement.createdAt,
        entityUrl: "#",
        status: w.status,
      })),
    ...queries.map((q) => ({
      id: `query-${q.id}`,
      type: "query" as const,
      title: `Query: ${q.queryNumber} - ${q.area}`,
      description: `Status: ${q.status.replace(/_/g, " ")}`,
      user: getUserById(q.raisedBy),
      timestamp: q.respondedAt || q.createdAt,
      entityUrl: "#",
      status: q.status,
    })),
    ...signOffs.map((s) => ({
      id: `so-${s.id}`,
      type: "signoff" as const,
      title: `Sign-off: ${s.action} by ${getUserById(s.userId)?.fullName}`,
      description: s.comments || "",
      user: getUserById(s.userId),
      timestamp: s.timestamp,
      entityUrl: "#",
      status: s.action,
    })),
    ...documents.map((d) => ({
      id: `doc-${d.id}`,
      type: "document" as const,
      title: `Document: ${d.originalFileName}`,
      description: `${d.category} • ${d.documentType}`,
      timestamp: d.createdAt,
      entityUrl: `/dashboard/documents/${d.id}`,
    })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task" as const,
      title: `Task ${t.taskNumber}: ${t.title}`,
      description: `Status: ${t.status.replace(/_/g, " ")}`,
      timestamp: t.updatedAt,
      entityUrl: `/dashboard/tasks/${t.id}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <AuditRecordHeader
        engagement={engagement}
        client={client}
        actions={
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/audit")}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Workspace
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          {auditTabs.map((tab) => (
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
          <AuditOverviewTab
            engagement={engagement}
            client={client}
            partner={partner}
            managers={managers}
            seniors={seniors}
            staff={staff}
            workpapers={workpapers}
            queries={queries}
            programs={programs}
            signOffs={signOffs}
            documents={documents}
            tasks={tasks}
          />
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <AuditPlanningTab engagement={engagement} />
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <AuditRiskTab engagement={engagement} />
        </TabsContent>

        <TabsContent value="materiality" className="space-y-6">
          <AuditMaterialityTab engagement={engagement} />
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <AuditProgramsTab programs={programs} engagement={engagement} />
        </TabsContent>

        <TabsContent value="workpapers" className="space-y-4">
          <AuditWorkpapersTab workpapers={workpapers} engagement={engagement} />
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <AuditEvidenceTab
            documents={documents}
            workpapers={workpapers}
            engagement={engagement}
            onDocumentClick={handleDocumentClick}
          />
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <AuditQueriesTab queries={queries} engagement={engagement} />
        </TabsContent>

        <TabsContent value="review-notes" className="space-y-4">
          <AuditReviewNotesTab reviewNotes={reviewNotes} engagement={engagement} />
        </TabsContent>

        <TabsContent value="signoff" className="space-y-6">
          <AuditSignOffTab signOffs={signOffs} engagement={engagement} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AuditHistoryTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AuditOverviewTab({
  engagement,
  client,
  partner,
  managers,
  seniors,
  staff,
  workpapers,
  queries,
  programs,
  signOffs,
  documents,
  tasks,
}: {
  engagement: AuditEngagement;
  client: any;
  partner: any;
  managers: any[];
  seniors: any[];
  staff: any[];
  workpapers: Workpaper[];
  queries: AuditQuery[];
  programs: AuditProgram[];
  signOffs: SignOff[];
  documents: any[];
  tasks: any[];
}) {
  const completedPrograms = programs.filter((p) => p.status === "completed").length;
  const totalPrograms = programs.length;
  const openQueries = queries.filter((q) => q.status === "open" || q.status === "in_progress").length;
  const reviewedWorkpapers = workpapers.filter((w) => w.status === "reviewed" || w.status === "finalized").length;
  const totalWorkpapers = workpapers.length;

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-5">
        <StatTile
          label="Status"
          value={<AuditStatusBadge status={engagement.status} />}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatTile
          label="Programs"
          value={`${completedPrograms}/${totalPrograms}`}
          icon={<ListTodo className="h-5 w-5" />}
        />
        <StatTile
          label="Workpapers"
          value={`${reviewedWorkpapers}/${totalWorkpapers} reviewed`}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile
          label="Open Queries"
          value={openQueries}
          hint={openQueries > 0 ? "Needs attention" : undefined}
          icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
        />
        <StatTile label="Sign-offs" value={signOffs.length} icon={<Gavel className="h-5 w-5" />} />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Engagement Details">
          <KeyValueList
            items={[
              { label: "Engagement Number", value: engagement.engagementNumber },
              { label: "Type", value: engagement.type.charAt(0).toUpperCase() + engagement.type.slice(1) },
              { label: "Period", value: engagement.period.label },
              { label: "Financial Year", value: engagement.period.financialYear },
              {
                label: "Overall Risk",
                value: (
                  <PriorityBadge
                    priority={
                      engagement.riskAssessment.overallRisk === "critical"
                        ? "urgent"
                        : engagement.riskAssessment.overallRisk === "high"
                          ? "high"
                          : engagement.riskAssessment.overallRisk === "medium"
                            ? "medium"
                            : "low"
                    }
                  />
                ),
              },
              { label: "Materiality", value: formatINR(engagement.materiality.overallMateriality) },
              { label: "Performance Materiality", value: formatINR(engagement.materiality.performanceMateriality) },
              { label: "Trivial Threshold", value: formatINR(engagement.materiality.trivialThreshold) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Team Composition">
          <KeyValueList
            items={[
              { label: "Partner", value: partner?.fullName || "—" },
              {
                label: "Managers",
                value:
                  managers
                    .map((m) => m?.fullName)
                    .filter(Boolean)
                    .join(", ") || "—",
              },
              {
                label: "Seniors",
                value:
                  seniors
                    .map((s) => s?.fullName)
                    .filter(Boolean)
                    .join(", ") || "—",
              },
              {
                label: "Staff",
                value:
                  staff
                    .map((s) => s?.fullName)
                    .filter(Boolean)
                    .join(", ") || "—",
              },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Linked Entities">
        <div className="grid gap-4 md:grid-cols-3">
          {client && <ClientLink client={client} showStatus={true} />}
          {engagement.assignedTeam && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Team Assigned</span>
              <AuditStatusBadge status={engagement.status} />
            </div>
          )}
        </div>
      </SectionCard>

      {engagement.description && (
        <SectionCard title="Description">
          <p className="text-sm">{engagement.description}</p>
        </SectionCard>
      )}
    </div>
  );
}

function AuditPlanningTab({ engagement }: { engagement: AuditEngagement }) {
  const planning = engagement.planning;

  return (
    <div className="space-y-6">
      <SectionCard title="Planning Summary">
        <div className="space-y-4">
          {planning.completedAt ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/10">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Planning Completed</p>
                <p className="text-green-700 text-sm dark:text-green-300">
                  Completed by {planning.completedBy ? getUserById(planning.completedBy)?.fullName : "—"} on{" "}
                  {planning.completedAt ? formatDate(planning.completedAt) : "—"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Planning In Progress</p>
                <p className="text-amber-700 text-sm dark:text-amber-300">Planning phase not yet completed</p>
              </div>
            </div>
          )}

          <KeyValueList
            items={[
              { label: "Understanding of Entity", value: planning.understandingOfEntity || "—" },
              { label: "Risk Assessment Summary", value: planning.riskAssessmentSummary || "—" },
              { label: "Materiality Basis", value: planning.materialityBasis || "—" },
              { label: "Planning Notes", value: planning.planningNotes || "—" },
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard title="Risk Assessment">
        <AuditRiskTab engagement={engagement} />
      </SectionCard>

      <SectionCard title="Materiality Calculation">
        <AuditMaterialityTab engagement={engagement} />
      </SectionCard>
    </div>
  );
}

function AuditRiskTab({ engagement }: { engagement: AuditEngagement }) {
  const risk = engagement.riskAssessment;

  return (
    <div className="space-y-6">
      <SectionCard title="Risk Assessment Summary" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Inherent Risk"
          value={
            <PriorityBadge
              priority={
                risk.inherentRisk === "critical"
                  ? "urgent"
                  : risk.inherentRisk === "high"
                    ? "high"
                    : risk.inherentRisk === "medium"
                      ? "medium"
                      : "low"
              }
            />
          }
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatTile
          label="Control Risk"
          value={
            <PriorityBadge
              priority={
                risk.controlRisk === "critical"
                  ? "urgent"
                  : risk.controlRisk === "high"
                    ? "high"
                    : risk.controlRisk === "medium"
                      ? "medium"
                      : "low"
              }
            />
          }
          icon={<Shield className="h-5 w-5" />}
        />
        <StatTile
          label="Detection Risk"
          value={
            <PriorityBadge
              priority={
                risk.detectionRisk === "critical"
                  ? "urgent"
                  : risk.detectionRisk === "high"
                    ? "high"
                    : risk.detectionRisk === "medium"
                      ? "medium"
                      : "low"
              }
            />
          }
          icon={<Search className="h-5 w-5" />}
        />
        <StatTile
          label="Overall Risk"
          value={
            <PriorityBadge
              priority={
                risk.overallRisk === "critical"
                  ? "urgent"
                  : risk.overallRisk === "high"
                    ? "high"
                    : risk.overallRisk === "medium"
                      ? "medium"
                      : "low"
              }
            />
          }
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </SectionCard>

      <SectionCard title="Key Risks">
        {risk.keyRisks.length > 0 ? (
          <DataTable<KeyRisk>
            data={risk.keyRisks}
            columns={
              [
                {
                  accessorKey: "description",
                  header: "Risk Description",
                  cell: ({ row }: { row: { original: KeyRisk } }) => (
                    <p className="font-medium">{row.original.description}</p>
                  ),
                },
                {
                  accessorKey: "assertion",
                  header: "Assertion",
                  cell: ({ row }: { row: { original: KeyRisk } }) => (
                    <Badge variant="secondary">{row.original.assertion}</Badge>
                  ),
                },
                {
                  accessorKey: "riskLevel",
                  header: "Risk Level",
                  cell: ({ row }: { row: { original: KeyRisk } }) => (
                    <PriorityBadge
                      priority={
                        row.original.riskLevel === "critical"
                          ? "urgent"
                          : row.original.riskLevel === "high"
                            ? "high"
                            : row.original.riskLevel === "medium"
                              ? "medium"
                              : "low"
                      }
                    />
                  ),
                },
                {
                  accessorKey: "response",
                  header: "Audit Response",
                  cell: ({ row }: { row: { original: KeyRisk } }) => (
                    <span className="text-sm">{row.original.response}</span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No key risks identified"
          />
        ) : (
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12 text-muted-foreground/50" />}
            title="No key risks"
            description="Key risks will be added during risk assessment."
          />
        )}
      </SectionCard>
    </div>
  );
}

function AuditMaterialityTab({ engagement }: { engagement: AuditEngagement }) {
  const mat = engagement.materiality;

  return (
    <div className="space-y-6">
      <SectionCard title="Materiality Calculation" className="grid gap-4 md:grid-cols-3">
        <StatTile
          label="Overall Materiality"
          value={formatINR(mat.overallMateriality)}
          icon={<Scale className="h-5 w-5" />}
        />
        <StatTile
          label="Performance Materiality"
          value={formatINR(mat.performanceMateriality)}
          hint={`${Math.round((mat.performanceMateriality / mat.overallMateriality) * 100)}% of overall`}
          icon={<Scale className="h-5 w-5" />}
        />
        <StatTile
          label="Trivial Threshold"
          value={formatINR(mat.trivialThreshold)}
          hint={`${Math.round((mat.trivialThreshold / mat.overallMateriality) * 100)}% of overall`}
          icon={<Scale className="h-5 w-5" />}
        />
      </SectionCard>

      <SectionCard title="Materiality Details">
        <KeyValueList
          items={[
            { label: "Basis", value: mat.basis },
            { label: "Calculated By", value: getUserById(mat.calculatedBy)?.fullName || "—" },
            { label: "Calculated At", value: mat.calculatedAt ? formatDate(mat.calculatedAt) : "—" },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function AuditProgramsTab({ programs, engagement }: { programs: AuditProgram[]; engagement: AuditEngagement }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "not_started", label: "Not Started" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "reviewed", label: "Reviewed" },
      ],
    },
  ];

  const filteredPrograms = programs.filter((p: AuditProgram) => {
    if (
      search &&
      !p.area.toLowerCase().includes(search.toLowerCase()) &&
      !p.objective.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (p as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search programs by area, objective..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />
      {filteredPrograms.length > 0 ? (
        <div className="space-y-4">
          {filteredPrograms.map((program) => (
            <SectionCard key={program.id} title={`${program.area} - ${program.objective}`}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      program.status === "completed"
                        ? "default"
                        : program.status === "in_progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {program.status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    Assigned to: {getUserById(program.assignedTo)?.fullName || "—"}
                  </span>
                </div>
                {program.completedAt && (
                  <span className="text-muted-foreground text-sm">Completed: {formatDate(program.completedAt)}</span>
                )}
              </div>
              <DataTable<AuditProcedure>
                data={program.procedures}
                columns={
                  [
                    {
                      accessorKey: "reference",
                      header: "Ref",
                      cell: ({ row }: { row: { original: AuditProcedure } }) => (
                        <span className="font-medium font-mono text-sm">{row.original.reference}</span>
                      ),
                    },
                    {
                      accessorKey: "description",
                      header: "Procedure",
                      cell: ({ row }: { row: { original: AuditProcedure } }) => (
                        <span className="text-sm">{row.original.description}</span>
                      ),
                    },
                    {
                      accessorKey: "assertion",
                      header: "Assertion",
                      cell: ({ row }: { row: { original: AuditProcedure } }) => (
                        <Badge variant="secondary">{row.original.assertion}</Badge>
                      ),
                    },
                    {
                      accessorKey: "type",
                      header: "Type",
                      cell: ({ row }: { row: { original: AuditProcedure } }) => (
                        <span className="text-sm capitalize">{row.original.type.replace(/_/g, " ")}</span>
                      ),
                    },
                    {
                      accessorKey: "status",
                      header: "Status",
                      cell: ({ row }: { row: { original: AuditProcedure } }) => (
                        <Badge
                          variant={
                            row.original.status === "completed"
                              ? "default"
                              : row.original.status === "in_progress"
                                ? "secondary"
                                : row.original.status === "reviewed"
                                  ? "outline"
                                  : "outline"
                          }
                        >
                          {row.original.status.replace(/_/g, " ")}
                        </Badge>
                      ),
                    },
                    {
                      accessorKey: "preparedBy",
                      header: "Prepared By",
                      cell: ({ row }: { row: { original: AuditProcedure } }) => (
                        <span className="text-sm">{getUserById(row.original.preparedBy!)?.fullName || "—"}</span>
                      ),
                    },
                    {
                      accessorKey: "reviewedBy",
                      header: "Reviewed By",
                      cell: ({ row }: { row: { original: AuditProcedure } }) => (
                        <span className="text-sm">
                          {row.original.reviewedBy ? getUserById(row.original.reviewedBy)?.fullName || "—" : "—"}
                        </span>
                      ),
                    },
                    {
                      accessorKey: "conclusion",
                      header: "Conclusion",
                      cell: ({ row }: { row: { original: AuditProcedure } }) => (
                        <span className="text-muted-foreground text-sm">{row.original.conclusion || "—"}</span>
                      ),
                    },
                  ] as any
                }
                getRowId={(row) => row.id}
                pageSize={10}
                emptyMessage="No procedures in this program"
              />
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderOpen className="h-12 w-12 text-muted-foreground/50" />}
          title="No programs match"
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
}

function AuditWorkpapersTab({ workpapers, engagement }: { workpapers: Workpaper[]; engagement: AuditEngagement }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "draft", label: "Draft" },
        { value: "prepared", label: "Prepared" },
        { value: "under_review", label: "Under Review" },
        { value: "reviewed", label: "Reviewed" },
        { value: "finalized", label: "Finalized" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "area",
      label: "Area",
      type: "select",
      options: [...new Set(workpapers.map((w) => w.area))].map((a) => ({ value: a, label: a })),
    },
  ];

  const filteredWorkpapers = workpapers.filter((w: Workpaper) => {
    if (
      search &&
      !w.title.toLowerCase().includes(search.toLowerCase()) &&
      !w.reference.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (w as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search workpapers by reference, title..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />
      {filteredWorkpapers.length > 0 ? (
        <DataTable<Workpaper>
          data={filteredWorkpapers}
          columns={
            [
              {
                accessorKey: "reference",
                header: "Reference",
                cell: ({ row }: { row: { original: Workpaper } }) => (
                  <span className="font-medium font-mono text-sm">{row.original.reference}</span>
                ),
              },
              {
                accessorKey: "title",
                header: "Title",
                cell: ({ row }: { row: { original: Workpaper } }) => (
                  <p className="font-medium">{row.original.title}</p>
                ),
              },
              {
                accessorKey: "area",
                header: "Area",
                cell: ({ row }: { row: { original: Workpaper } }) => (
                  <Badge variant="secondary">{row.original.area}</Badge>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Workpaper } }) => (
                  <WorkpaperStatusBadge status={row.original.status} />
                ),
              },
              {
                accessorKey: "preparedBy",
                header: "Prepared By",
                cell: ({ row }: { row: { original: Workpaper } }) => (
                  <span className="text-sm">{getUserById(row.original.preparedBy)?.fullName || "—"}</span>
                ),
              },
              {
                accessorKey: "reviewedBy",
                header: "Reviewed By",
                cell: ({ row }: { row: { original: Workpaper } }) => (
                  <span className="text-sm">
                    {row.original.reviewedBy ? getUserById(row.original.reviewedBy)?.fullName || "—" : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "evidenceDocumentIds",
                header: "Evidence Docs",
                cell: ({ row }: { row: { original: Workpaper } }) => (
                  <span className="text-sm">{row.original.evidenceDocumentIds.length} document(s)</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No workpapers match your search or filters"
          rowActions={[{ label: "View", action: (w: Workpaper) => alert(`View workpaper ${w.reference}`) }]}
        />
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No workpapers match"
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
}

function AuditEvidenceTab({
  documents,
  workpapers,
  engagement,
  onDocumentClick,
}: {
  documents: any[];
  workpapers: Workpaper[];
  engagement: AuditEngagement;
  onDocumentClick: (doc: any) => void;
}) {
  const allEvidence = [
    ...documents.map((d) => ({ ...d, source: "document" as const })),
    ...workpapers.flatMap((w) =>
      w.evidenceDocumentIds
        .map((docId) => ({
          ...mockDocuments.find((d) => d.id === docId),
          source: "workpaper" as const,
          workpaperRef: w.reference,
        }))
        .filter(Boolean),
    ),
  ];

  if (allEvidence.length === 0) return <EmptyDocuments />;

  return (
    <DataTable<any>
      data={allEvidence}
      columns={
        [
          {
            accessorKey: "originalFileName",
            header: "Document",
            cell: ({ row }: { row: { original: any } }) => (
              <p className="font-medium">{row.original.originalFileName || row.original.title}</p>
            ),
          },
          {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }: { row: { original: any } }) => (
              <Badge variant="secondary">{row.original.category?.replace(/_/g, " ") || "—"}</Badge>
            ),
          },
          {
            accessorKey: "documentType",
            header: "Type",
            cell: ({ row }: { row: { original: any } }) => (
              <span className="text-sm">{row.original.documentType?.replace(/_/g, " ") || "—"}</span>
            ),
          },
          {
            accessorKey: "source",
            header: "Source",
            cell: ({ row }: { row: { original: any } }) => <Badge variant="outline">{row.original.source}</Badge>,
          },
          {
            accessorKey: "workpaperRef",
            header: "Workpaper Ref",
            cell: ({ row }: { row: { original: any } }) => (
              <span className="font-mono text-sm">{row.original.workpaperRef || "—"}</span>
            ),
          },
          {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }: { row: { original: any } }) => (
              <span className="text-sm">{formatDate(row.original.createdAt)}</span>
            ),
          },
        ] as any
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No evidence documents"
      rowActions={[{ label: "View", action: onDocumentClick }]}
    />
  );
}

function AuditQueriesTab({ queries, engagement }: { queries: AuditQuery[]; engagement: AuditEngagement }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "open", label: "Open" },
        { value: "in_progress", label: "In Progress" },
        { value: "responded", label: "Responded" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
        { value: "escalated", label: "Escalated" },
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

  const filteredQueries = queries.filter((q: AuditQuery) => {
    if (
      search &&
      !q.description.toLowerCase().includes(search.toLowerCase()) &&
      !q.queryNumber.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (q as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search queries by number, description..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />
      {filteredQueries.length > 0 ? (
        <DataTable<AuditQuery>
          data={filteredQueries}
          columns={
            [
              {
                accessorKey: "queryNumber",
                header: "Query #",
                cell: ({ row }: { row: { original: AuditQuery } }) => (
                  <span className="font-medium text-sm">{row.original.queryNumber}</span>
                ),
              },
              {
                accessorKey: "area",
                header: "Area",
                cell: ({ row }: { row: { original: AuditQuery } }) => (
                  <Badge variant="secondary">{row.original.area}</Badge>
                ),
              },
              {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }: { row: { original: AuditQuery } }) => (
                  <p className="line-clamp-2 text-sm">{row.original.description}</p>
                ),
              },
              {
                accessorKey: "priority",
                header: "Priority",
                cell: ({ row }: { row: { original: AuditQuery } }) => (
                  <PriorityBadge priority={row.original.priority} />
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: AuditQuery } }) => (
                  <AuditQueryStatusBadge status={row.original.status} />
                ),
              },
              {
                accessorKey: "raisedBy",
                header: "Raised By",
                cell: ({ row }: { row: { original: AuditQuery } }) => (
                  <span className="text-sm">{getUserById(row.original.raisedBy)?.fullName || "—"}</span>
                ),
              },
              {
                accessorKey: "assignedTo",
                header: "Assigned To",
                cell: ({ row }: { row: { original: AuditQuery } }) => (
                  <span className="text-sm">{getUserById(row.original.assignedTo)?.fullName || "—"}</span>
                ),
              },
              {
                accessorKey: "dueDate",
                header: "Due Date",
                cell: ({ row }: { row: { original: AuditQuery } }) => (
                  <span
                    className={cn(
                      "text-sm",
                      new Date(row.original.dueDate) < new Date() &&
                        row.original.status !== "resolved" &&
                        row.original.status !== "closed" &&
                        "text-destructive",
                    )}
                  >
                    {formatDate(row.original.dueDate)}
                  </span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No queries match your search or filters"
        />
      ) : (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12 text-muted-foreground/50" />}
          title="No queries match"
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
}

function AuditReviewNotesTab({ reviewNotes, engagement }: { reviewNotes: ReviewNote[]; engagement: AuditEngagement }) {
  if (reviewNotes.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12 text-muted-foreground/50" />}
        title="No review notes"
        description="Review notes will appear here as reviewers add them."
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviewNotes.map((note) => (
        <SectionCard key={note.id} title={`Review Note ${note.type.charAt(0).toUpperCase() + note.type.slice(1)}`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={note.isResolved ? "default" : "outline"}>{note.isResolved ? "Resolved" : "Open"}</Badge>
              <span className="text-muted-foreground text-sm">
                By {getUserById(note.reviewerId)?.fullName || "—"} on {formatDate(note.createdAt)}
              </span>
            </div>
            <p className="text-sm">{note.content}</p>
            {note.resolvedAt && (
              <p className="text-green-600 text-xs dark:text-green-400">Resolved on {formatDate(note.resolvedAt)}</p>
            )}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function AuditSignOffTab({ signOffs, engagement }: { signOffs: SignOff[]; engagement: AuditEngagement }) {
  if (signOffs.length === 0) {
    return (
      <EmptyState
        icon={<Gavel className="h-12 w-12 text-muted-foreground/50" />}
        title="No sign-offs yet"
        description="Sign-offs will appear here as the audit progresses through review stages."
      />
    );
  }

  return (
    <div className="space-y-4">
      {signOffs.map((signOff) => (
        <SectionCard
          key={signOff.id}
          title={`Sign-off: ${signOff.action.charAt(0).toUpperCase() + signOff.action.slice(1)}`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{getUserById(signOff.userId)?.fullName || "—"}</span>
              <Badge variant="secondary">{signOff.role}</Badge>
              <Badge variant="outline">{signOff.action}</Badge>
              <span className="ml-auto text-muted-foreground text-sm">{formatDate(signOff.timestamp)}</span>
            </div>
            {signOff.comments && <p className="text-sm">{signOff.comments}</p>}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function AuditHistoryTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={100} />
    </SectionCard>
  );
}
