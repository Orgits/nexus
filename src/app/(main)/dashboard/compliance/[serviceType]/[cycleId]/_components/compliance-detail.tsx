"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CheckSquare,
  Clock,
  FileText,
  Search,
  Shield,
  Upload,
  Users,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyCommunications, EmptyDocuments, EmptyState, EmptyTasks } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { ComplianceRecordHeader } from "@/components/ca-nexus/record-header";
import {
  ComplianceStatusBadge,
  DocumentRequestStatusBadge,
  PriorityBadge,
  TaskStatusBadge,
} from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { daysOverdue, formatDate } from "@/lib/format";
import { serviceTypeLabel } from "@/lib/labels";
import { getClientById } from "@/mock-data/clients";
import { getCommunicationsByComplianceCycle } from "@/mock-data/communications";
import { getComplianceCycleById, getDocumentRequestsByComplianceCycle } from "@/mock-data/compliance";
import { getDocumentsByComplianceCycle } from "@/mock-data/documents";
import { getMatterById, getTasksByComplianceCycle } from "@/mock-data/matters";
import { getTeamById, getUserById } from "@/mock-data/users";
import type {
  Communication,
  ComplianceCycle,
  Document,
  DocumentRequest,
  MissingDocument,
  ReviewStage,
  Task,
} from "@/types";

const complianceTabs = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "workflow", label: "Workflow", icon: ArrowRight },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "document-requests", label: "Doc Requests", icon: Upload },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "communications", label: "Communications", icon: Users },
  { id: "reviews", label: "Reviews", icon: Search },
  { id: "activity", label: "Activity", icon: Clock },
];

const workflowStages: readonly {
  id: string;
  label: string;
  description: string;
  order: number;
}[] = [
  {
    id: "identification",
    label: "Identification",
    description: "Identify compliance requirements and applicability",
    order: 1,
  },
  {
    id: "outreach_sent",
    label: "Outreach Sent",
    description: "Send reminders and document requests to client",
    order: 2,
  },
  {
    id: "documents_pending",
    label: "Documents Pending",
    description: "Awaiting mandatory documents from client",
    order: 3,
  },
  { id: "documents_received", label: "Documents Received", description: "All mandatory documents collected", order: 4 },
  { id: "processing", label: "Processing", description: "Prepare returns/computations/filings", order: 5 },
  { id: "ready_for_review", label: "Ready for Review", description: "Work completed, awaiting review", order: 6 },
  { id: "in_review", label: "In Review", description: "Senior/Manager/Partner review in progress", order: 7 },
  {
    id: "rework_required",
    label: "Rework Required",
    description: "Review identified issues needing correction",
    order: 8,
  },
  { id: "approved", label: "Approved", description: "Review completed and approved", order: 9 },
  { id: "filed", label: "Filed", description: "Filed with authority, acknowledgment received", order: 10 },
  { id: "completed", label: "Completed", description: "Filing acknowledged, cycle closed", order: 11 },
  { id: "closed", label: "Closed", description: "All actions complete, records archived", order: 12 },
] as const;

export function ComplianceDetail({ serviceType, cycleId }: { serviceType: string; cycleId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [_search, _setSearch] = useState("");
  const [_filters, _setFilters] = useState<Record<string, unknown>>({});

  const cycle = getComplianceCycleById(cycleId);
  if (!cycle) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Shield className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Compliance cycle not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The compliance cycle you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/compliance")}
          className="text-primary hover:underline"
        >
          Back to Compliance
        </button>
      </div>
    );
  }

  const client = getClientById(cycle.clientId);
  const matter = cycle.matterId ? getMatterById(cycle.matterId) : undefined;
  const documents = getDocumentsByComplianceCycle(cycleId);
  const communications = getCommunicationsByComplianceCycle(cycleId);
  const tasks = getTasksByComplianceCycle(cycleId);
  const documentRequests = getDocumentRequestsByComplianceCycle(cycleId);
  const assignedUser = getUserById(cycle.assignedUserId);
  const assignedTeam = cycle.assignedTeamId ? getTeamById(cycle.assignedTeamId) : undefined;

  const mandatoryDocs = cycle.missingDocuments.filter((d) => d.isMandatory);
  const _receivedMandatory = mandatoryDocs.filter((d) => d.receivedAt).length;
  const _totalMandatory = mandatoryDocs.length;
  const _pendingTasks = tasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && daysOverdue(t.dueDate) > 0);
  const _completedReviews = cycle.reviewStages.filter((r) => r.status === "completed").length;
  const _totalReviews = cycle.reviewStages.length;
  const currentStageIndex = workflowStages.findIndex((s) => s.id === cycle.status);
  const _isOverdue = cycle.isOverdue;

  const handleTaskClick = (task: Task) => router.push(`/dashboard/tasks/${task.id}`);
  const handleDocumentClick = (doc: Document) => router.push(`/dashboard/documents/${doc.id}`);
  const handleCommunicationClick = (comm: Communication) => router.push(`/dashboard/communications/${comm.id}`);

  return (
    <div className="space-y-6">
      <ComplianceRecordHeader
        cycle={cycle}
        client={client}
        matter={matter}
        actions={
          <>
            {currentStageIndex < workflowStages.length - 1 &&
              cycle.status !== "completed" &&
              cycle.status !== "closed" && (
                <Button size="sm" onClick={() => alert(`Advance to ${workflowStages[currentStageIndex + 1].label}`)}>
                  Advance Stage
                </Button>
              )}
            <Button size="sm" variant="outline" onClick={() => alert("Generate outreach campaign")}>
              Send Outreach
            </Button>
            <Button size="sm" variant="outline" onClick={() => alert("Request documents")}>
              Request Docs
            </Button>
          </>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
          {complianceTabs.map((tab) => (
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
          <ComplianceOverviewTab
            cycle={cycle}
            client={client}
            matter={matter}
            documents={documents}
            tasks={tasks}
            communications={communications}
            documentRequests={documentRequests}
            assignedUser={assignedUser}
            assignedTeam={assignedTeam}
            overdueTasks={overdueTasks}
          />
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <ComplianceWorkflowTab cycle={cycle} workflowStages={workflowStages} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ComplianceDocumentsTab documents={documents} cycle={cycle} onDocumentClick={handleDocumentClick} />
        </TabsContent>

        <TabsContent value="document-requests" className="space-y-4">
          <ComplianceDocumentRequestsTab documentRequests={documentRequests} cycle={cycle} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <ComplianceTasksTab tasks={tasks} onTaskClick={handleTaskClick} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <ComplianceCommunicationsTab
            communications={communications}
            onCommunicationClick={handleCommunicationClick}
          />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <ComplianceReviewsTab cycle={cycle} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ComplianceActivityTab
            cycle={cycle}
            tasks={tasks}
            documents={documents}
            communications={communications}
            documentRequests={documentRequests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComplianceOverviewTab({
  cycle,
  client,
  matter,
  documents,
  tasks,
  communications,
  documentRequests,
  assignedUser,
  assignedTeam,
  overdueTasks,
}: {
  cycle: ComplianceCycle;
  client: any;
  matter: any;
  documents: Document[];
  tasks: Task[];
  communications: Communication[];
  documentRequests: DocumentRequest[];
  assignedUser: any;
  assignedTeam: any;
  overdueTasks: Task[];
}) {
  const mandatoryDocs = cycle.missingDocuments.filter((d) => d.isMandatory);
  const receivedMandatory = mandatoryDocs.filter((d) => d.receivedAt).length;
  const totalMandatory = mandatoryDocs.length;
  const pendingTasks = tasks.filter((t) => ["todo", "in_progress", "in_review"].includes(t.status));
  const completedReviews = cycle.reviewStages.filter((r) => r.status === "completed").length;
  const totalReviews = cycle.reviewStages.length;

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Status"
          value={<ComplianceStatusBadge status={cycle.status} />}
          icon={<Shield className="h-5 w-5" />}
        />
        <StatTile
          label="Mandatory Docs"
          value={`${receivedMandatory}/${totalMandatory}`}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile
          label="Pending Tasks"
          value={pendingTasks.length}
          hint={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : undefined}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatTile label="Reviews" value={`${completedReviews}/${totalReviews}`} icon={<Search className="h-5 w-5" />} />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Cycle Details">
          <KeyValueList
            items={[
              { label: "Cycle Number", value: cycle.cycleNumber },
              { label: "Service", value: cycle.serviceName },
              { label: "Type", value: serviceTypeLabel(cycle.serviceType) },
              { label: "Period", value: cycle.period.label },
              { label: "Financial Year", value: cycle.period.financialYear },
              { label: "Assessment Year", value: cycle.period.assessmentYear || "—" },
              { label: "Priority", value: <PriorityBadge priority={cycle.priority} /> },
              { label: "Due Date", value: formatDate(cycle.dueDate) },
              { label: "Extended Due Date", value: cycle.extendedDueDate ? formatDate(cycle.extendedDueDate) : "—" },
              { label: "Filing Date", value: cycle.filingDate ? formatDate(cycle.filingDate) : "—" },
              { label: "Acknowledgment No.", value: cycle.acknowledgmentNumber || "—" },
              { label: "Days Overdue", value: cycle.isOverdue ? `${cycle.daysOverdue} days` : "Not overdue" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Assignment & Progress">
          <KeyValueList
            items={[
              { label: "Assigned To", value: assignedUser?.fullName || "—" },
              { label: "Team", value: assignedTeam?.name || "—" },
              { label: "Current Stage", value: cycle.currentStage + 1 },
              { label: "Total Stages", value: cycle.reviewStages.length },
              { label: "Completed Reviews", value: completedReviews },
              { label: "Outreach Campaigns", value: cycle.outreachCampaigns.length },
              { label: "Document Requests", value: documentRequests.length },
              { label: "Tasks", value: tasks.length },
              { label: "Documents", value: documents.length },
              { label: "Communications", value: communications.length },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Client & Matter">
        <div className="grid gap-4 md:grid-cols-2">
          {client && <ClientLink client={client} showStatus={true} />}
          {matter && <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />}
        </div>
      </SectionCard>

      <SectionCard title="Missing Mandatory Documents">
        {mandatoryDocs.length > 0 ? (
          <DataTable<MissingDocument>
            data={mandatoryDocs}
            columns={
              [
                {
                  accessorKey: "documentType",
                  header: "Document",
                  cell: ({ row }: { row: { original: MissingDocument } }) => (
                    <span className="text-sm">{row.original.documentType.replace(/_/g, " ")}</span>
                  ),
                },
                {
                  accessorKey: "description",
                  header: "Description",
                  cell: ({ row }: { row: { original: MissingDocument } }) => (
                    <span className="text-muted-foreground text-sm">{row.original.description || "—"}</span>
                  ),
                },
                {
                  accessorKey: "receivedAt",
                  header: "Status",
                  cell: ({ row }: { row: { original: MissingDocument } }) =>
                    row.original.receivedAt ? (
                      <Badge variant="default" className="text-xs">
                        Received
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Pending
                      </Badge>
                    ),
                },
                {
                  accessorKey: "requestedAt",
                  header: "Requested",
                  cell: ({ row }: { row: { original: MissingDocument } }) => (
                    <span className="text-sm">
                      {row.original.requestedAt ? formatDate(row.original.requestedAt) : "—"}
                    </span>
                  ),
                },
                {
                  accessorKey: "receivedAt",
                  header: "Received",
                  cell: ({ row }: { row: { original: MissingDocument } }) => (
                    <span className="text-sm">
                      {row.original.receivedAt ? formatDate(row.original.receivedAt) : "—"}
                    </span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.documentType}
            pageSize={10}
            emptyMessage="No mandatory documents"
          />
        ) : (
          <EmptyState
            icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
            title="No mandatory documents"
            description="All mandatory documents have been received or none are configured."
          />
        )}
      </SectionCard>

      {cycle.outreachCampaigns.length > 0 && (
        <SectionCard title="Outreach Campaigns">
          <DataTable<(typeof cycle.outreachCampaigns)[0]>
            data={cycle.outreachCampaigns}
            columns={
              [
                {
                  accessorKey: "name",
                  header: "Campaign",
                  cell: ({ row }: { row: { original: (typeof cycle.outreachCampaigns)[0] } }) => (
                    <p className="font-medium">{row.original.name}</p>
                  ),
                },
                {
                  accessorKey: "channel",
                  header: "Channel",
                  cell: ({ row }: { row: { original: (typeof cycle.outreachCampaigns)[0] } }) => (
                    <Badge variant="secondary">{row.original.channel.toUpperCase()}</Badge>
                  ),
                },
                {
                  accessorKey: "sentAt",
                  header: "Sent",
                  cell: ({ row }: { row: { original: (typeof cycle.outreachCampaigns)[0] } }) => (
                    <span className="text-sm">{formatDate(row.original.sentAt)}</span>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: (typeof cycle.outreachCampaigns)[0] } }) => (
                    <Badge variant="outline">{row.original.status}</Badge>
                  ),
                },
                {
                  accessorKey: "responses",
                  header: "Responses",
                  cell: ({ row }: { row: { original: (typeof cycle.outreachCampaigns)[0] } }) => (
                    <span className="font-medium text-sm">{row.original.responses}</span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => row.campaignId}
            pageSize={5}
            emptyMessage="No outreach campaigns"
          />
        </SectionCard>
      )}
    </div>
  );
}

type WorkflowStage = {
  id: string;
  label: string;
  description: string;
  order: number;
};

function ComplianceWorkflowTab({
  cycle,
  workflowStages,
}: {
  cycle: ComplianceCycle;
  workflowStages: readonly WorkflowStage[];
}) {
  const currentStageIndex = workflowStages.findIndex((s) => s.id === cycle.status);

  return (
    <div className="space-y-6">
      <SectionCard title="Workflow Visualization">
        <div className="space-y-4">
          {workflowStages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const _isFuture = index > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-colors",
                  isCompleted
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                    : isCurrent
                      ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10"
                      : "bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-medium text-sm",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : stage.order}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium capitalize",
                        isCompleted
                          ? "text-green-700 dark:text-green-300"
                          : isCurrent
                            ? "text-blue-700 dark:text-blue-300"
                            : "",
                      )}
                    >
                      {stage.label.replace(/_/g, " ")}
                    </span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="outline" className="text-green-600 text-xs dark:text-green-400">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-muted-foreground text-sm">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Stage Actions">
        <div className="flex flex-wrap gap-2">
          {currentStageIndex < workflowStages.length - 1 &&
            cycle.status !== "completed" &&
            cycle.status !== "closed" && (
              <Button onClick={() => alert(`Advance to ${workflowStages[currentStageIndex + 1].label}`)}>
                <ArrowRight className="mr-1.5 h-4 w-4" />
                Advance to {workflowStages[currentStageIndex + 1].label}
              </Button>
            )}
          {currentStageIndex > 0 && (
            <Button variant="outline" onClick={() => alert(`Rework to ${workflowStages[currentStageIndex - 1].label}`)}>
              Rework to {workflowStages[currentStageIndex - 1].label}
            </Button>
          )}
          <Button variant="ghost" onClick={() => alert("View full history")}>
            View History
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Stage Configuration">
        <p className="mb-4 text-muted-foreground text-sm">Review stages configured for this compliance type:</p>
        <DataTable<ReviewStage>
          data={cycle.reviewStages}
          columns={
            [
              {
                accessorKey: "stageNumber",
                header: "Stage",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="font-medium">Stage {row.original.stageNumber}</span>
                ),
              },
              {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="text-sm">{row.original.name}</span>
                ),
              },
              {
                accessorKey: "reviewerRole",
                header: "Reviewer Role",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <Badge variant="outline">{row.original.reviewerRole.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <Badge
                    variant={
                      row.original.status === "completed"
                        ? "default"
                        : row.original.status === "in_progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {row.original.status.replace(/_/g, " ")}
                  </Badge>
                ),
              },
              {
                accessorKey: "startedAt",
                header: "Started",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="text-sm">{row.original.startedAt ? formatDate(row.original.startedAt) : "—"}</span>
                ),
              },
              {
                accessorKey: "completedAt",
                header: "Completed",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="text-sm">
                    {row.original.completedAt ? formatDate(row.original.completedAt) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "action",
                header: "Action",
                cell: ({ row }: { row: { original: ReviewStage } }) => (
                  <span className="text-sm">{row.original.action ?? "—"}</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => String(row.stageNumber)}
          pageSize={5}
          emptyMessage="No review stages configured"
        />
      </SectionCard>
    </div>
  );
}

function ComplianceDocumentsTab({
  documents,
  cycle,
  onDocumentClick,
}: {
  documents: Document[];
  cycle: ComplianceCycle;
  onDocumentClick: (doc: Document) => void;
}) {
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
        ] as any
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No documents"
      rowActions={[{ label: "View", action: onDocumentClick }]}
    />
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ComplianceDocumentRequestsTab({
  documentRequests,
  cycle,
}: {
  documentRequests: DocumentRequest[];
  cycle: ComplianceCycle;
}) {
  if (documentRequests.length === 0) {
    return (
      <EmptyState
        icon={<Upload className="h-12 w-12 text-muted-foreground/50" />}
        title="No document requests"
        description="Document requests will appear here when sent to clients for missing documents."
        action={
          <Button size="sm" onClick={() => alert("Create document request")}>
            <Upload className="mr-2 h-4 w-4" />
            Request Documents
          </Button>
        }
      />
    );
  }

  return (
    <DataTable<DocumentRequest>
      data={documentRequests}
      columns={
        [
          {
            accessorKey: "id",
            header: "Request ID",
            cell: ({ row }: { row: { original: DocumentRequest } }) => (
              <span className="font-medium text-sm">{row.original.id}</span>
            ),
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: { original: DocumentRequest } }) => (
              <DocumentRequestStatusBadge status={row.original.status} />
            ),
          },
          {
            accessorKey: "sentAt",
            header: "Sent",
            cell: ({ row }: { row: { original: DocumentRequest } }) => (
              <span className="text-sm">{row.original.sentAt ? formatDate(row.original.sentAt) : "Not sent"}</span>
            ),
          },
          {
            accessorKey: "reminderCount",
            header: "Reminders",
            cell: ({ row }: { row: { original: DocumentRequest } }) => (
              <span className="text-sm">{row.original.reminderCount}</span>
            ),
          },
          {
            accessorKey: "lastReminderAt",
            header: "Last Reminder",
            cell: ({ row }: { row: { original: DocumentRequest } }) => (
              <span className="text-sm">
                {row.original.lastReminderAt ? formatDate(row.original.lastReminderAt) : "—"}
              </span>
            ),
          },
          {
            accessorKey: "items",
            header: "Items",
            cell: ({ row }: { row: { original: DocumentRequest } }) => (
              <div className="space-y-1">
                {row.original.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={cn("text-xs", item.isReceived ? "text-green-600" : "text-red-600")}>
                      {item.isReceived ? "✓" : "✗"}
                    </span>
                    <span>{item.documentType.replace(/_/g, " ")}</span>
                    {item.isMandatory && (
                      <Badge variant="destructive" className="text-[10px]">
                        Required
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ),
          },
        ] as any
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No document requests"
    />
  );
}

function ComplianceTasksTab({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
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
                      daysOverdue(row.original.dueDate) > 0 &&
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
            ] as any
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

function ComplianceCommunicationsTab({
  communications,
  onCommunicationClick,
}: {
  communications: Communication[];
  onCommunicationClick: (comm: Communication) => void;
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
              <p className="font-medium">{row.original.subject || row.original.content.slice(0, 60)}</p>
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
            cell: ({ row }: { row: { original: Communication } }) => (
              <Badge variant="outline">{row.original.status}</Badge>
            ),
          },
          {
            accessorKey: "sentAt",
            header: "Sent",
            cell: ({ row }: { row: { original: Communication } }) => (
              <span className="text-sm">{row.original.sentAt ? formatDate(row.original.sentAt) : "—"}</span>
            ),
          },
        ] as any
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No communications"
      rowActions={[{ label: "View", action: onCommunicationClick }]}
    />
  );
}

function ComplianceReviewsTab({ cycle }: { cycle: ComplianceCycle }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Review Summary" className="grid gap-4 md:grid-cols-4">
        <StatTile label="Total Stages" value={cycle.reviewStages.length} icon={<Search className="h-5 w-5" />} />
        <StatTile
          label="Completed"
          value={cycle.reviewStages.filter((r) => r.status === "completed").length}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatTile
          label="In Progress"
          value={cycle.reviewStages.filter((r) => r.status === "in_progress").length}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
        />
        <StatTile
          label="Pending"
          value={cycle.reviewStages.filter((r) => r.status === "pending").length}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
      </SectionCard>

      <SectionCard title="Review Stages">
        {cycle.reviewStages.length > 0 ? (
          <DataTable<ReviewStage>
            data={cycle.reviewStages}
            columns={
              [
                {
                  accessorKey: "stageNumber",
                  header: "Stage",
                  cell: ({ row }: { row: { original: ReviewStage } }) => (
                    <span className="font-medium">Stage {row.original.stageNumber}</span>
                  ),
                },
                {
                  accessorKey: "name",
                  header: "Name",
                  cell: ({ row }: { row: { original: ReviewStage } }) => (
                    <span className="text-sm">{row.original.name}</span>
                  ),
                },
                {
                  accessorKey: "reviewerRole",
                  header: "Reviewer Role",
                  cell: ({ row }: { row: { original: ReviewStage } }) => (
                    <Badge variant="outline">{row.original.reviewerRole.replace(/_/g, " ")}</Badge>
                  ),
                },
                {
                  accessorKey: "reviewerId",
                  header: "Reviewer",
                  cell: ({ row }: { row: { original: ReviewStage } }) => {
                    const reviewer = getUserById(row.original.reviewerId);
                    return <span className="text-sm">{reviewer?.fullName || row.original.reviewerId}</span>;
                  },
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: ReviewStage } }) => {
                    const status = row.original.status;
                    return (
                      <Badge
                        variant={
                          status === "completed" ? "default" : status === "in_progress" ? "secondary" : "outline"
                        }
                      >
                        {status.replace(/_/g, " ")}
                      </Badge>
                    );
                  },
                },
                {
                  accessorKey: "startedAt",
                  header: "Started",
                  cell: ({ row }: { row: { original: ReviewStage } }) => (
                    <span className="text-sm">{row.original.startedAt ? formatDate(row.original.startedAt) : "—"}</span>
                  ),
                },
                {
                  accessorKey: "completedAt",
                  header: "Completed",
                  cell: ({ row }: { row: { original: ReviewStage } }) => (
                    <span className="text-sm">
                      {row.original.completedAt ? formatDate(row.original.completedAt) : "—"}
                    </span>
                  ),
                },
                {
                  accessorKey: "comments",
                  header: "Comments",
                  cell: ({ row }: { row: { original: ReviewStage } }) => (
                    <span className="text-muted-foreground text-sm">{row.original.comments || "—"}</span>
                  ),
                },
              ] as any
            }
            getRowId={(row) => String(row.stageNumber)}
            pageSize={10}
            emptyMessage="No review stages"
          />
        ) : (
          <EmptyState
            icon={<Search className="h-12 w-12 text-muted-foreground/50" />}
            title="No review stages"
            description="Review stages are configured at the compliance rule level."
          />
        )}
      </SectionCard>
    </div>
  );
}

interface ActivityItem {
  id: string;
  type:
    | "task"
    | "document"
    | "communication"
    | "review"
    | "matter"
    | "invoice"
    | "payment"
    | "note"
    | "system"
    | "document_request";
  title: string;
  description?: string;
  user?: any;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  entityUrl?: string;
  metadata?: Record<string, unknown>;
  status?: string;
}

function ComplianceActivityTab({
  cycle,
  tasks,
  documents,
  communications,
  documentRequests,
}: {
  cycle: ComplianceCycle;
  tasks: Task[];
  documents: Document[];
  communications: Communication[];
  documentRequests: DocumentRequest[];
}) {
  const allActivities: ActivityItem[] = [
    ...cycle.reviewStages
      .filter((r) => r.startedAt || r.completedAt)
      .map((r, index) => ({
        id: `review-${index}`,
        type: "review" as const,
        title: `Review Stage ${r.stageNumber}: ${r.name}`,
        description: r.comments || `Status: ${r.status.replace(/_/g, " ")}`,
        timestamp: r.completedAt || r.startedAt || cycle.createdAt,
        entityUrl: "#",
      })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task" as const,
      title: `Task ${t.taskNumber}: ${t.title}`,
      description: `Status: ${t.status.replace(/_/g, " ")}`,
      timestamp: t.updatedAt,
      entityUrl: `/dashboard/tasks/${t.id}`,
    })),
    ...documents.map((d) => ({
      id: `doc-${d.id}`,
      type: "document" as const,
      title: `Document: ${d.originalFileName}`,
      description: `${d.category} • ${d.documentType}`,
      timestamp: d.createdAt,
      entityUrl: `/dashboard/documents/${d.id}`,
    })),
    ...communications.map((c) => ({
      id: `comm-${c.id}`,
      type: "communication" as const,
      title: c.subject || c.content.slice(0, 60),
      description: `${c.channel.toUpperCase()} • ${c.direction}`,
      timestamp: c.sentAt || c.createdAt,
      entityUrl: `/dashboard/communications/${c.id}`,
    })),
    ...documentRequests.map((dr) => ({
      id: `dr-${dr.id}`,
      type: "document_request" as const,
      title: `Document Request: ${dr.id}`,
      description: `${dr.items.length} item(s) • Status: ${dr.status.replace(/_/g, " ")}`,
      timestamp: dr.sentAt || dr.createdAt,
      entityUrl: "#",
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={allActivities} grouped maxItems={50} />
    </SectionCard>
  );
}
