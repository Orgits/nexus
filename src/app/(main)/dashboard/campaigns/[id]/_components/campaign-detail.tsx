"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  BarChart2,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Filter,
  Mail,
  MessageSquare,
  MousePointer,
  Plus,
  Reply,
  Send,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { ClientLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { CampaignStatusBadge, CommunicationStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getCampaignById, getCommunicationsByCampaign } from "@/mock-data/communications";
import { getUserById } from "@/mock-data/users";
import type { Campaign, Communication, CommunicationChannel } from "@/types";

const campaignTabs = [
  { id: "overview", label: "Overview", icon: Send },
  { id: "builder", label: "Builder", icon: Settings },
  { id: "audience", label: "Audience", icon: Users },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "communications", label: "Communications", icon: MessageSquare },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "activity", label: "Activity", icon: Clock },
];

export function CampaignDetail({ id }: { id: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const campaign = getCampaignById(id);
  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Send className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Campaign not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The campaign you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/campaigns")}
          className="text-primary hover:underline"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  const createdBy = getUserById(campaign.createdById);
  const approvedBy = campaign.approvedById ? getUserById(campaign.approvedById) : undefined;
  const communications = getCommunicationsByCampaign(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate font-semibold text-xl">{campaign.name}</h1>
          <p className="truncate text-muted-foreground text-sm">Campaign ID: {campaign.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CampaignStatusBadge status={campaign.status} />
          <Badge variant="secondary" className="capitalize">
            {campaign.objective.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
          {campaignTabs.map((tab) => (
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
          <CampaignOverviewTab
            campaign={campaign}
            createdBy={createdBy}
            approvedBy={approvedBy}
            communications={communications}
          />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <CampaignBuilderTab campaign={campaign} />
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <CampaignAudienceTab campaign={campaign} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <CampaignTemplatesTab campaign={campaign} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <CampaignCommunicationsTab campaign={campaign} communications={communications} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CampaignAnalyticsTab campaign={campaign} communications={communications} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <CampaignActivityTab campaign={campaign} communications={communications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CampaignOverviewTab({
  campaign,
  createdBy,
  approvedBy,
  communications,
}: {
  campaign: Campaign;
  createdBy: any;
  approvedBy: any;
  communications: Communication[];
}) {
  const deliveryRate = campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : 0;
  const openRate =
    campaign.deliveredCount > 0 ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1) : 0;
  const clickRate =
    campaign.deliveredCount > 0 ? ((campaign.clickedCount / campaign.deliveredCount) * 100).toFixed(1) : 0;
  const replyRate =
    campaign.deliveredCount > 0 ? ((campaign.repliedCount / campaign.deliveredCount) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <StatTile
          label="Status"
          value={<CampaignStatusBadge status={campaign.status} />}
          icon={<Send className="h-5 w-5" />}
        />
        <StatTile label="Sent" value={campaign.sentCount.toLocaleString()} icon={<Send className="h-5 w-5" />} />
        <StatTile
          label="Delivered"
          value={campaign.deliveredCount.toLocaleString()}
          hint={`${deliveryRate}%`}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatTile
          label="Opened"
          value={campaign.openedCount.toLocaleString()}
          hint={`${openRate}%`}
          icon={<Mail className="h-5 w-5 text-blue-600" />}
        />
        <StatTile
          label="Clicked"
          value={campaign.clickedCount.toLocaleString()}
          hint={`${clickRate}%`}
          icon={<MousePointer className="h-5 w-5 text-purple-600" />}
        />
        <StatTile
          label="Replied"
          value={campaign.repliedCount.toLocaleString()}
          hint={`${replyRate}%`}
          icon={<Reply className="h-5 w-5 text-amber-600" />}
        />
        <StatTile label="Compliance" value={`${campaign.complianceProgress}%`} icon={<Shield className="h-5 w-5" />} />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Campaign Details">
          <KeyValueList
            items={[
              { label: "Campaign ID", value: campaign.id },
              {
                label: "Objective",
                value: (
                  <Badge variant="secondary" className="gap-1 capitalize">
                    {campaign.objective.replace(/_/g, " ")}
                  </Badge>
                ),
              },
              {
                label: "Channels",
                value: (
                  <div className="flex flex-wrap gap-1">
                    {campaign.channels.map((channel, i) => (
                      <Badge key={i} variant="outline" className="gap-1 text-xs">
                        {channel === "email" && <Mail className="h-3 w-3" />}
                        {channel === "whatsapp" && <MessageSquare className="h-3 w-3" />}
                        {channel === "sms" && <Smartphone className="h-3 w-3" />}
                        {channel.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                ),
              },
              {
                label: "Schedule Type",
                value: (
                  <Badge variant="outline" className="capitalize">
                    {campaign.schedule.type}
                  </Badge>
                ),
              },
              {
                label: "Scheduled At",
                value: campaign.schedule.scheduledAt ? formatDateTime(campaign.schedule.scheduledAt) : "Immediate",
              },
              { label: "Timezone", value: campaign.schedule.timezone },
              {
                label: "Send Window",
                value: `${campaign.schedule.sendWindowStart || "09:00"} - ${campaign.schedule.sendWindowEnd || "18:00"}`,
              },
              { label: "Recurrence", value: campaign.schedule.recurrenceRule || "One-time" },
              { label: "Created At", value: formatDateTime(campaign.createdAt) },
              { label: "Created By", value: createdBy?.fullName || campaign.createdById },
              { label: "Approved By", value: approvedBy?.fullName || campaign.approvedById || "—" },
              { label: "Approved At", value: campaign.approvedAt ? formatDateTime(campaign.approvedAt) : "—" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Performance Summary">
          <KeyValueList
            items={[
              { label: "Total Sent", value: campaign.sentCount.toLocaleString() },
              { label: "Total Delivered", value: campaign.deliveredCount.toLocaleString() },
              { label: "Failed", value: campaign.failedCount.toLocaleString() },
              { label: "Opened", value: campaign.openedCount.toLocaleString() },
              { label: "Clicked", value: campaign.clickedCount.toLocaleString() },
              { label: "Replied", value: campaign.repliedCount.toLocaleString() },
              { label: "Documents Received", value: campaign.documentsReceived.toLocaleString() },
              { label: "Tasks Created", value: campaign.tasksCreated.toLocaleString() },
              { label: "Compliance Progress", value: `${campaign.complianceProgress}%` },
              { label: "Delivery Rate", value: `${deliveryRate}%` },
              { label: "Open Rate", value: `${openRate}%` },
              { label: "Click Rate", value: `${clickRate}%` },
              { label: "Reply Rate", value: `${replyRate}%` },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Follow-up Metrics" className="grid gap-4 md:grid-cols-3">
        <StatTile
          label="Documents Received"
          value={campaign.documentsReceived}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
        />
        <StatTile
          label="Tasks Created"
          value={campaign.tasksCreated}
          icon={<Plus className="h-5 w-5 text-purple-600" />}
        />
        <StatTile
          label="Compliance Progress"
          value={`${campaign.complianceProgress}%`}
          icon={<Shield className="h-5 w-5" />}
        />
      </SectionCard>
    </div>
  );
}

function CampaignBuilderTab({ campaign }: { campaign: Campaign }) {
  const basicSettings = (
    <div className="space-y-4">
      <h4 className="font-medium">Basic Settings</h4>
      <div className="space-y-3 rounded-lg bg-muted/30 p-4">
        <div>
          <label htmlFor="campaign-name" className="mb-1 block font-medium text-sm">
            Campaign Name
          </label>
          <input
            id="campaign-name"
            type="text"
            defaultValue={campaign.name}
            className="w-full rounded-md border bg-background px-3 py-2"
            readOnly
          />
        </div>
        <div>
          <label htmlFor="campaign-description" className="mb-1 block font-medium text-sm">
            Description
          </label>
          <textarea
            id="campaign-description"
            defaultValue={campaign.description || ""}
            className="w-full rounded-md border bg-background px-3 py-2"
            rows={3}
            readOnly
          />
        </div>
        <div>
          <label htmlFor="campaign-objective" className="mb-1 block font-medium text-sm">
            Objective
          </label>
          <select
            id="campaign-objective"
            defaultValue={campaign.objective}
            className="w-full rounded-md border bg-background px-3 py-2"
            disabled
          >
            <option value="compliance_reminder">Compliance Reminder</option>
            <option value="document_collection">Document Collection</option>
            <option value="filing_confirmation">Filing Confirmation</option>
            <option value="payment_reminder">Payment Reminder</option>
            <option value="announcement">Announcement</option>
            <option value="newsletter">Newsletter</option>
            <option value="survey">Survey</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
    </div>
  );

  const channels = (
    <div className="space-y-4">
      <h4 className="font-medium">Channels</h4>
      <div className="space-y-3 rounded-lg bg-muted/30 p-4">
        {(["email", "whatsapp", "sms"] as CommunicationChannel[]).map((channel: CommunicationChannel) => {
          const checkboxId = `channel-${channel}`;
          return (
            <label key={channel} htmlFor={checkboxId} className="flex cursor-pointer items-center gap-3">
              <input id={checkboxId} type="checkbox" defaultChecked={campaign.channels.includes(channel)} disabled />
              <span className="flex items-center gap-2">
                {channel === "email" && <Mail className="h-4 w-4 text-blue-600" />}
                {channel === "whatsapp" && <MessageSquare className="h-4 w-4 text-green-600" />}
                {channel === "sms" && <Smartphone className="h-4 w-4 text-purple-600" />}
                <span className="capitalize">{channel}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const schedule = (
    <div className="space-y-4">
      <h4 className="font-medium">Schedule</h4>
      <div className="space-y-3 rounded-lg bg-muted/30 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="schedule-type" className="mb-1 block font-medium text-sm">
              Schedule Type
            </label>
            <select
              id="schedule-type"
              defaultValue={campaign.schedule.type}
              className="w-full rounded-md border bg-background px-3 py-2"
              disabled
            >
              <option value="immediate">Immediate</option>
              <option value="scheduled">Scheduled</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>
          <div>
            <label htmlFor="schedule-scheduled-at" className="mb-1 block font-medium text-sm">
              Scheduled At
            </label>
            <input
              id="schedule-scheduled-at"
              type="datetime-local"
              defaultValue={campaign.schedule.scheduledAt?.slice(0, 16) || ""}
              className="w-full rounded-md border bg-background px-3 py-2"
              disabled
            />
          </div>
          <div>
            <label htmlFor="campaign-timezone" className="mb-1 block font-medium text-sm">
              Timezone
            </label>
            <input
              id="campaign-timezone"
              type="text"
              defaultValue={campaign.schedule.timezone}
              className="w-full rounded-md border bg-background px-3 py-2"
              disabled
            />
          </div>
          <div>
            <label htmlFor="campaign-recurrence" className="mb-1 block font-medium text-sm">
              Recurrence Rule
            </label>
            <input
              id="campaign-recurrence"
              type="text"
              defaultValue={campaign.schedule.recurrenceRule || ""}
              placeholder="e.g., FREQ=MONTHLY;BYMONTHDAY=1"
              className="w-full rounded-md border bg-background px-3 py-2"
              disabled
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="campaign-send-window-start" className="mb-1 block font-medium text-sm">
              Send Window Start
            </label>
            <input
              id="campaign-send-window-start"
              type="time"
              defaultValue={campaign.schedule.sendWindowStart || "09:00"}
              className="w-full rounded-md border bg-background px-3 py-2"
              disabled
            />
          </div>
          <div>
            <label htmlFor="campaign-send-window-end" className="mb-1 block font-medium text-sm">
              Send Window End
            </label>
            <input
              id="campaign-send-window-end"
              type="time"
              defaultValue={campaign.schedule.sendWindowEnd || "18:00"}
              className="w-full rounded-md border bg-background px-3 py-2"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );

  const audienceFilters = (
    <div className="space-y-4">
      <h4 className="font-medium">Audience Filters</h4>
      <div className="space-y-3 rounded-lg bg-muted/30 p-4">
        {campaign.audience.filters.map((filter, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-medium">{filter.field}</span>
            <Badge variant="outline">{filter.operator}</Badge>
            <span>{String(filter.value)}</span>
          </div>
        ))}
        <div className="text-muted-foreground text-sm">
          Estimated audience: {campaign.audience.estimatedCount} clients
          {campaign.audience.includedClientIds.length > 0 && `, ${campaign.audience.includedClientIds.length} included`}
          {campaign.audience.excludedClientIds.length > 0 && `, ${campaign.audience.excludedClientIds.length} excluded`}
        </div>
      </div>
    </div>
  );

  return (
    <SectionCard title="Campaign Builder" description="Configure campaign settings, audience, and templates">
      <div className="grid gap-6 md:grid-cols-2">
        {basicSettings}
        {channels}
        {schedule}
        {audienceFilters}
      </div>
    </SectionCard>
  );
}

interface AudienceFilter {
  field: string;
  operator: string;
  value: unknown;
  id: string;
}

function CampaignAudienceTab({ campaign }: { campaign: Campaign }) {
  const filtersWithId = campaign.audience.filters.map((f, i) => ({ ...f, id: `filter-${i}` }));

  return (
    <div className="space-y-6">
      <SectionCard title="Audience Definition" className="grid gap-4 md:grid-cols-2">
        <StatTile
          label="Estimated Count"
          value={campaign.audience.estimatedCount}
          icon={<Users className="h-5 w-5" />}
        />
        <StatTile
          label="Included Clients"
          value={campaign.audience.includedClientIds.length}
          icon={<Plus className="h-5 w-5 text-green-600" />}
        />
        <StatTile
          label="Excluded Clients"
          value={campaign.audience.excludedClientIds.length}
          icon={<X className="h-5 w-5 text-red-600" />}
        />
        <StatTile
          label="Filters Applied"
          value={campaign.audience.filters.length}
          icon={<Filter className="h-5 w-5" />}
        />
      </SectionCard>

      <SectionCard title="Audience Filters">
        {filtersWithId.length > 0 ? (
          <DataTable<AudienceFilter>
            data={filtersWithId}
            columns={
              [
                {
                  accessorKey: "field",
                  header: "Field",
                  cell: ({ row }: { row: { original: AudienceFilter } }) => (
                    <span className="font-medium text-sm">{row.original.field}</span>
                  ),
                },
                {
                  accessorKey: "operator",
                  header: "Operator",
                  cell: ({ row }: { row: { original: AudienceFilter } }) => (
                    <Badge variant="outline">{row.original.operator}</Badge>
                  ),
                },
                {
                  accessorKey: "value",
                  header: "Value",
                  cell: ({ row }: { row: { original: AudienceFilter } }) => (
                    <span className="text-sm">{String(row.original.value)}</span>
                  ),
                },
              ] satisfies Parameters<typeof DataTable<AudienceFilter>>[0]["columns"]
            }
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No filters"
          />
        ) : (
          <EmptyState
            icon={<Filter className="h-12 w-12 text-muted-foreground/50" />}
            title="No filters"
            description="Audience filters are defined in the campaign builder."
          />
        )}
      </SectionCard>

      <SectionCard title="Included Clients">
        {campaign.audience.includedClientIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {campaign.audience.includedClientIds.map((clientId) => {
              const client = getClientById(clientId);
              return client ? <ClientLink key={clientId} client={client} showStatus={true} /> : null;
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="h-12 w-12 text-muted-foreground/50" />}
            title="No included clients"
            description="All matching clients are included by default."
          />
        )}
      </SectionCard>

      <SectionCard title="Excluded Clients">
        {campaign.audience.excludedClientIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {campaign.audience.excludedClientIds.map((clientId) => {
              const client = getClientById(clientId);
              return client ? <ClientLink key={clientId} client={client} showStatus={true} /> : null;
            })}
          </div>
        ) : (
          <EmptyState
            icon={<X className="h-12 w-12 text-muted-foreground/50" />}
            title="No excluded clients"
            description="No clients are explicitly excluded."
          />
        )}
      </SectionCard>
    </div>
  );
}

function CampaignTemplatesTab({ campaign }: { campaign: Campaign }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Templates" description={`Templates for ${campaign.channels.join(", ")} channels`}>
        {campaign.templates.length > 0 ? (
          <div className="space-y-4">
            {campaign.templates.map((template, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      {template.channel === "email" && <Mail className="h-3 w-3" />}
                      {template.channel === "whatsapp" && <MessageSquare className="h-3 w-3" />}
                      {template.channel === "sms" && <Smartphone className="h-3 w-3" />}
                      {template.channel.toUpperCase()}
                    </Badge>
                    <div>
                      <h4 className="font-medium">Template {i + 1}</h4>
                      <p className="text-muted-foreground text-sm">{template.templateId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => alert("Edit template")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => alert("Duplicate template")}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => alert("Delete template")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {template.subject && (
                  <div className="mb-3 rounded bg-muted/30 p-3">
                    <span className="font-medium text-muted-foreground text-sm">Subject</span>
                    <p className="text-sm">{template.subject}</p>
                  </div>
                )}
                <div className="rounded bg-muted/30 p-3">
                  <span className="font-medium text-muted-foreground text-sm">Content</span>
                  <p className="whitespace-pre-wrap text-sm">{template.content}</p>
                </div>
                {template.variables.length > 0 && (
                  <div className="mt-3">
                    <span className="mb-2 block font-medium text-muted-foreground text-sm">Variables</span>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((v) => (
                        <Badge key={v.key} variant="outline" className="gap-1">
                          {v.key} {v.required && <span className="text-red-500">*</span>}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
            title="No templates"
            description="Templates will appear here when added in the builder."
          />
        )}
      </SectionCard>
    </div>
  );
}

function CampaignCommunicationsTab({
  campaign,
  communications,
}: {
  campaign: Campaign;
  communications: Communication[];
}) {
  if (communications.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-12 w-12 text-muted-foreground/50" />}
        title="No communications"
        description="Communications sent as part of this campaign will appear here."
      />
    );
  }

  return (
    <SectionCard title={`Communications (${communications.length})`}>
      <DataTable<Communication>
        data={communications}
        columns={
          [
            {
              accessorKey: "communicationNumber",
              header: "ID",
              cell: ({ row }: { row: { original: Communication } }) => (
                <span className="font-medium text-sm">{row.original.communicationNumber}</span>
              ),
            },
            {
              accessorKey: "subject",
              header: "Subject",
              cell: ({ row }: { row: { original: Communication } }) => (
                <p className="font-medium text-sm">{row.original.subject || row.original.content.slice(0, 60)}</p>
              ),
            },
            {
              accessorKey: "channel",
              header: "Channel",
              cell: ({ row }: { row: { original: Communication } }) => (
                <Badge variant="secondary" className="gap-1">
                  {row.original.channel === "email" && <Mail className="h-3 w-3" />}
                  {row.original.channel === "whatsapp" && <MessageSquare className="h-3 w-3" />}
                  {row.original.channel === "sms" && <Smartphone className="h-3 w-3" />}
                  {row.original.channel.toUpperCase()}
                </Badge>
              ),
            },
            {
              accessorKey: "direction",
              header: "Direction",
              cell: ({ row }: { row: { original: Communication } }) => (
                <Badge variant="outline" className="capitalize">
                  {row.original.direction}
                </Badge>
              ),
            },
            {
              accessorKey: "status",
              header: "Status",
              cell: ({ row }: { row: { original: Communication } }) => (
                <CommunicationStatusBadge status={row.original.status} />
              ),
            },
            {
              accessorKey: "sentAt",
              header: "Sent",
              cell: ({ row }: { row: { original: Communication } }) => (
                <span className="text-sm">{row.original.sentAt ? formatDateTime(row.original.sentAt) : "—"}</span>
              ),
            },
            {
              accessorKey: "deliveredAt",
              header: "Delivered",
              cell: ({ row }: { row: { original: Communication } }) => (
                <span className="text-sm">
                  {row.original.deliveredAt ? formatDateTime(row.original.deliveredAt) : "—"}
                </span>
              ),
            },
            {
              accessorKey: "readAt",
              header: "Read",
              cell: ({ row }: { row: { original: Communication } }) => (
                <span className="text-sm">{row.original.readAt ? formatDateTime(row.original.readAt) : "—"}</span>
              ),
            },
          ] satisfies Parameters<typeof DataTable<Communication>>[0]["columns"]
        }
        getRowId={(row) => row.id}
        pageSize={15}
        emptyMessage="No communications"
      />
    </SectionCard>
  );
}

function CampaignAnalyticsTab({ campaign, communications }: { campaign: Campaign; communications: Communication[] }) {
  const channelStats = campaign.channels.map((channel) => {
    const channelComms = communications.filter((c) => c.channel === channel);
    return {
      channel,
      sent: channelComms.length,
      delivered: channelComms.filter((c) => c.status === "delivered" || c.status === "read" || c.status === "replied")
        .length,
      opened: channelComms.filter((c) => c.status === "read" || c.status === "replied").length,
      replied: channelComms.filter((c) => c.status === "replied").length,
    };
  });

  return (
    <div className="space-y-6">
      <SectionCard title="Channel Performance">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-muted-foreground text-sm">
                <th className="pb-2 font-medium">Channel</th>
                <th className="pb-2 text-right font-medium">Sent</th>
                <th className="pb-2 text-right font-medium">Delivered</th>
                <th className="pb-2 text-right font-medium">Opened</th>
                <th className="pb-2 text-right font-medium">Replied</th>
                <th className="pb-2 text-right font-medium">Delivery %</th>
                <th className="pb-2 text-right font-medium">Open %</th>
                <th className="pb-2 text-right font-medium">Reply %</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {channelStats.map((stat) => (
                <tr key={stat.channel}>
                  <td className="py-3">
                    <Badge variant="secondary" className="gap-1">
                      {stat.channel === "email" && <Mail className="h-3 w-3" />}
                      {stat.channel === "whatsapp" && <MessageSquare className="h-3 w-3" />}
                      {stat.channel === "sms" && <Smartphone className="h-3 w-3" />}
                      {stat.channel.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 text-right font-medium">{stat.sent}</td>
                  <td className="py-3 text-right font-medium text-green-600">{stat.delivered}</td>
                  <td className="py-3 text-right font-medium text-blue-600">{stat.opened}</td>
                  <td className="py-3 text-right font-medium text-amber-600">{stat.replied}</td>
                  <td className="py-3 text-right font-medium">
                    {stat.sent > 0 ? ((stat.delivered / stat.sent) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-3 text-right font-medium">
                    {stat.delivered > 0 ? ((stat.opened / stat.delivered) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-3 text-right font-medium">
                    {stat.delivered > 0 ? ((stat.replied / stat.delivered) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Engagement Funnel" className="grid gap-4 md:grid-cols-4">
        <StatTile label="Sent" value={campaign.sentCount.toLocaleString()} icon={<Send className="h-5 w-5" />} />
        <StatTile
          label="Delivered"
          value={campaign.deliveredCount.toLocaleString()}
          hint={`${((campaign.deliveredCount / (campaign.sentCount || 1)) * 100).toFixed(1)}%`}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatTile
          label="Opened"
          value={campaign.openedCount.toLocaleString()}
          hint={`${((campaign.openedCount / (campaign.deliveredCount || 1)) * 100).toFixed(1)}%`}
          icon={<Mail className="h-5 w-5 text-blue-600" />}
        />
        <StatTile
          label="Replied"
          value={campaign.repliedCount.toLocaleString()}
          hint={`${((campaign.repliedCount / (campaign.deliveredCount || 1)) * 100).toFixed(1)}%`}
          icon={<Reply className="h-5 w-5 text-amber-600" />}
        />
      </SectionCard>

      <SectionCard title="Business Outcomes" className="grid gap-4 md:grid-cols-3">
        <StatTile
          label="Documents Received"
          value={campaign.documentsReceived}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
        />
        <StatTile
          label="Tasks Created"
          value={campaign.tasksCreated}
          icon={<Plus className="h-5 w-5 text-purple-600" />}
        />
        <StatTile
          label="Compliance Progress"
          value={`${campaign.complianceProgress}%`}
          icon={<Shield className="h-5 w-5" />}
        />
      </SectionCard>
    </div>
  );
}

function CampaignActivityTab({ campaign, communications }: { campaign: Campaign; communications: Communication[] }) {
  const approvedBy = campaign.approvedById ? getUserById(campaign.approvedById) : undefined;
  const allActivities = [
    {
      id: `campaign-created`,
      type: "communication" as const,
      title: `Campaign created: ${campaign.name}`,
      description: `Objective: ${campaign.objective.replace(/_/g, " ")}`,
      timestamp: campaign.createdAt,
      entityUrl: "#",
    },
    campaign.approvedAt && {
      id: `campaign-approved`,
      type: "communication" as const,
      title: `Campaign approved`,
      description: `Approved by ${approvedBy?.fullName || campaign.approvedById}`,
      timestamp: campaign.approvedAt!,
      entityUrl: "#",
    },
    campaign.schedule.scheduledAt && {
      id: `campaign-scheduled`,
      type: "communication" as const,
      title: `Campaign scheduled`,
      description: `Scheduled for ${formatDateTime(campaign.schedule.scheduledAt!)}`,
      timestamp: campaign.schedule.scheduledAt!,
      entityUrl: "#",
    },
    ...communications.map((c) => ({
      id: `comm-${c.id}`,
      type: "communication" as const,
      title: c.subject || c.content.slice(0, 60),
      description: `${c.channel.toUpperCase()} • ${c.direction} • ${c.status}`,
      timestamp: c.sentAt || c.createdAt,
      entityUrl: `/dashboard/communications/${c.id}`,
    })),
  ]
    .filter(
      (
        a,
      ): a is {
        id: string;
        type: "communication";
        title: string;
        description: string;
        timestamp: string;
        entityUrl: string;
      } => Boolean(a),
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={allActivities} grouped maxItems={50} />
    </SectionCard>
  );
}
