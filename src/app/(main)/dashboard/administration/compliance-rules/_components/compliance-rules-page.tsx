"use client";

import { useState } from "react";

import {
  CheckCircle,
  Clock,
  FileSearch,
  FileText,
  Gavel,
  Plus,
  ReceiptText,
  Scale,
  Settings,
  Shield,
} from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { PageHeader, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import type { DueDateRule } from "@/types";

interface ComplianceRule {
  id: string;
  name: string;
  serviceType: string;
  ruleType: string;
  description: string;
  status: "active" | "draft" | "inactive" | "testing";
  priority: number;
  conditions: Record<string, unknown>;
  dueDateRule?: DueDateRule;
  reminderDays?: number[];
  escalationDays?: number[];
  assignmentRule?: "round_robin" | "least_loaded" | "specialist";
  autoGenerateMatter?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
  requiredDocuments?: Array<{
    documentType: string;
    isMandatory: boolean;
    dueBeforeFiling: boolean;
  }>;
  schedule?: Array<{
    installment: number;
    percentage: number;
    dueDate: string;
    reminderDays: number[];
  }>;
  escalationLevels?: Array<{
    level: number;
    days: number;
    notify: string[];
    action: string;
  }>;
  algorithm?: string;
  fallbackAssignee?: string;
  field?: string;
  pattern?: string;
  errorMessage?: string;
}

const complianceRuleTabs = [
  { id: "all", label: "All Rules", icon: FileSearch },
  { id: "itr", label: "ITR Rules", icon: FileText },
  { id: "gst", label: "GST Rules", icon: ReceiptText },
  { id: "tds", label: "TDS Rules", icon: Scale },
  { id: "mca", label: "MCA/ROC Rules", icon: Gavel },
  { id: "custom", label: "Custom Rules", icon: Settings },
];

const ruleTypes = [
  "filing_deadline",
  "document_requirement",
  "reminder_schedule",
  "escalation_rule",
  "assignment_rule",
  "validation_rule",
];

const ruleStatuses = [
  { value: "active", label: "Active", color: "default" as const },
  { value: "draft", label: "Draft", color: "secondary" as const },
  { value: "inactive", label: "Inactive", color: "destructive" as const },
  { value: "testing", label: "Testing", color: "secondary" as const },
];

const mockComplianceRules: ComplianceRule[] = [
  {
    id: "rule-1",
    name: "ITR Filing Deadline - Standard",
    serviceType: "itr",
    ruleType: "filing_deadline",
    description: "Standard ITR filing deadline rule for all entity types",
    status: "active",
    priority: 1,
    conditions: { entityTypes: ["individual", "company", "llp", "partnership"], assessmentYear: "current" },
    dueDateRule: { type: "fixed_date", value: 31, unit: "days", referenceDate: "07-31" } as DueDateRule,
    reminderDays: [30, 15, 7, 3, 1],
    escalationDays: [15, 30, 60],
    assignmentRule: "specialist",
    autoGenerateMatter: true,
    createdBy: "user-partner-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
    lastTriggered: "2024-07-01T10:00:00Z",
    triggerCount: 156,
  },
  {
    id: "rule-2",
    name: "GST Monthly Return - Regular",
    serviceType: "gst_monthly",
    ruleType: "filing_deadline",
    description: "Monthly GSTR-1 and GSTR-3B filing deadline for regular taxpayers",
    status: "active",
    priority: 1,
    conditions: { gstRegistrationType: "regular", turnover: "above_1.5cr" },
    dueDateRule: { type: "fixed_date", value: 11, unit: "days", referenceDate: "month_end" } as DueDateRule,
    reminderDays: [7, 3, 1],
    escalationDays: [7, 15, 30],
    assignmentRule: "least_loaded",
    autoGenerateMatter: true,
    createdBy: "user-senior-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-05-01T10:00:00Z",
    lastTriggered: "2024-07-11T10:00:00Z",
    triggerCount: 1240,
  },
  {
    id: "rule-3",
    name: "GST Quarterly Return - QRMP",
    serviceType: "gst_quarterly",
    ruleType: "filing_deadline",
    description: "Quarterly GSTR-1 and GSTR-3B filing for QRMP scheme taxpayers",
    status: "active",
    priority: 1,
    conditions: { gstRegistrationType: "qrmp", turnover: "below_1.5cr" },
    dueDateRule: { type: "fixed_date", value: 13, unit: "days", referenceDate: "quarter_end" } as DueDateRule,
    reminderDays: [10, 5, 2, 1],
    escalationDays: [10, 20, 45],
    assignmentRule: "least_loaded",
    autoGenerateMatter: true,
    createdBy: "user-senior-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-05-01T10:00:00Z",
    lastTriggered: "2024-07-13T10:00:00Z",
    triggerCount: 380,
  },
  {
    id: "rule-4",
    name: "TDS 24Q Quarterly Filing",
    serviceType: "tds_24q",
    ruleType: "filing_deadline",
    description: "Quarterly TDS return filing for salary payments (Form 24Q)",
    status: "active",
    priority: 1,
    conditions: { deducteeType: "employee", formType: "24Q" },
    dueDateRule: { type: "fixed_date", value: 31, unit: "days", referenceDate: "quarter_end" } as DueDateRule,
    reminderDays: [15, 7, 3, 1],
    escalationDays: [15, 30, 60],
    assignmentRule: "specialist",
    autoGenerateMatter: true,
    createdBy: "user-senior-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-05-01T10:00:00Z",
    lastTriggered: "2024-07-31T10:00:00Z",
    triggerCount: 420,
  },
  {
    id: "rule-5",
    name: "MCA AOC-4 Annual Filing",
    serviceType: "mca_aoc4",
    ruleType: "filing_deadline",
    description: "Annual financial statement filing with ROC (Form AOC-4)",
    status: "active",
    priority: 1,
    conditions: { entityType: "company", isActive: true },
    dueDateRule: { type: "fixed_date", value: 30, unit: "days", referenceDate: "agm_date" } as DueDateRule,
    reminderDays: [60, 30, 15, 7, 1],
    escalationDays: [30, 60, 90],
    assignmentRule: "specialist",
    autoGenerateMatter: true,
    createdBy: "user-partner-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
    lastTriggered: "2024-06-30T10:00:00Z",
    triggerCount: 89,
  },
  {
    id: "rule-6",
    name: "MCA MGT-7 Annual Return",
    serviceType: "mca_mgt7",
    ruleType: "filing_deadline",
    description: "Annual return filing with ROC (Form MGT-7)",
    status: "active",
    priority: 1,
    conditions: { entityType: "company", isActive: true },
    dueDateRule: { type: "fixed_date", value: 60, unit: "days", referenceDate: "agm_date" } as DueDateRule,
    reminderDays: [60, 30, 15, 7, 1],
    escalationDays: [30, 60, 90],
    assignmentRule: "specialist",
    autoGenerateMatter: true,
    createdBy: "user-partner-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
    lastTriggered: "2024-08-29T10:00:00Z",
    triggerCount: 85,
  },
  {
    id: "rule-7",
    name: "ITR Document Requirements - Business Income",
    serviceType: "itr",
    ruleType: "document_requirement",
    description: "Mandatory documents for ITR filing with business income",
    status: "active",
    priority: 2,
    conditions: { incomeType: "business", entityTypes: ["individual", "proprietorship", "partnership"] },
    requiredDocuments: [
      { documentType: "financial_statements", isMandatory: true, dueBeforeFiling: true },
      { documentType: "bank_statements", isMandatory: true, dueBeforeFiling: true },
      { documentType: "form_26as", isMandatory: true, dueBeforeFiling: true },
      { documentType: "form_16", isMandatory: false, dueBeforeFiling: true },
    ],
    reminderDays: [30, 15, 7],
    createdBy: "user-senior-001",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-05-01T10:00:00Z",
    triggerCount: 320,
  },
  {
    id: "rule-8",
    name: "GST Reconciliation Document Requirements",
    serviceType: "gst_monthly",
    ruleType: "document_requirement",
    description: "Required documents for monthly GST reconciliation",
    status: "active",
    priority: 2,
    conditions: { gstRegistrationType: "regular" },
    requiredDocuments: [
      { documentType: "invoices", isMandatory: true, dueBeforeFiling: true },
      { documentType: "gstr_2a", isMandatory: true, dueBeforeFiling: true },
      { documentType: "gstr_2b", isMandatory: true, dueBeforeFiling: true },
      { documentType: "purchase_register", isMandatory: true, dueBeforeFiling: true },
    ],
    reminderDays: [7, 3, 1],
    createdBy: "user-senior-001",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-05-01T10:00:00Z",
    triggerCount: 1100,
  },
  {
    id: "rule-9",
    name: "Custom Reminder - Advance Tax",
    serviceType: "itr",
    ruleType: "reminder_schedule",
    description: "Advance tax installment reminders for corporate clients",
    status: "active",
    priority: 3,
    conditions: { entityType: "company", advanceTaxApplicable: true },
    schedule: [
      { installment: 1, percentage: 15, dueDate: "06-15", reminderDays: [15, 7, 3] },
      { installment: 2, percentage: 45, dueDate: "09-15", reminderDays: [15, 7, 3] },
      { installment: 3, percentage: 75, dueDate: "12-15", reminderDays: [15, 7, 3] },
      { installment: 4, percentage: 100, dueDate: "03-15", reminderDays: [15, 7, 3] },
    ],
    createdBy: "user-partner-001",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
    triggerCount: 67,
  },
  {
    id: "rule-10",
    name: "Escalation Rule - Overdue Compliance",
    serviceType: "itr",
    ruleType: "escalation_rule",
    description: "Automatic escalation for overdue compliance cycles",
    status: "active",
    priority: 1,
    conditions: { overdueDays: 7 },
    escalationLevels: [
      { level: 1, days: 7, notify: ["assigned_user", "team_lead"], action: "email_reminder" },
      { level: 2, days: 15, notify: ["team_lead", "manager"], action: "email_escalation" },
      { level: 3, days: 30, notify: ["manager", "partner"], action: "meeting_required" },
    ],
    createdBy: "user-manager-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
    triggerCount: 234,
  },
  {
    id: "rule-11",
    name: "Auto-assignment - Least Loaded",
    serviceType: "gst_monthly",
    ruleType: "assignment_rule",
    description: "Automatically assign GST matters to least loaded team member",
    status: "active",
    priority: 2,
    conditions: { teamId: "team-gst-001", autoAssign: true },
    algorithm: "least_loaded",
    fallbackAssignee: "user-senior-001",
    createdBy: "user-manager-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
    triggerCount: 890,
  },
  {
    id: "rule-12",
    name: "Validation - GSTIN Format",
    serviceType: "gst_monthly",
    ruleType: "validation_rule",
    description: "Validate GSTIN format and state code before filing",
    status: "active",
    priority: 1,
    conditions: { field: "gstin", pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$" },
    errorMessage: "Invalid GSTIN format. Must be 15 characters with valid state code.",
    createdBy: "user-admin-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    triggerCount: 5600,
  },
];

export function ComplianceRulesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [filters, _setFilters] = useState<Record<string, unknown>>({});

  const _filterConfigs: FilterConfig[] = [
    {
      key: "serviceType",
      label: "Service Type",
      type: "select",
      options: [
        { value: "itr", label: "ITR" },
        { value: "gst_monthly", label: "GST Monthly" },
        { value: "gst_quarterly", label: "GST Quarterly" },
        { value: "tds_24q", label: "TDS 24Q" },
        { value: "tds_26q", label: "TDS 26Q" },
        { value: "tds_27q", label: "TDS 27Q" },
        { value: "tds_27eq", label: "TDS 27EQ" },
        { value: "mca_aoc4", label: "MCA AOC-4" },
        { value: "mca_mgt7", label: "MCA MGT-7" },
        { value: "mca_adt1", label: "MCA ADT-1" },
        { value: "mca_dpt3", label: "MCA DPT-3" },
      ],
    },
    {
      key: "ruleType",
      label: "Rule Type",
      type: "select",
      options: ruleTypes.map((r) => ({
        value: r,
        label: r.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ruleStatuses.map((s) => ({ value: s.value, label: s.label })),
    },
  ];

  let filteredRules = mockComplianceRules;

  if (activeTab !== "all") {
    const serviceMap: Record<string, string[]> = {
      itr: ["itr"],
      gst: ["gst_monthly", "gst_quarterly", "gst_annual"],
      tds: ["tds_24q", "tds_26q", "tds_27q", "tds_27eq"],
      mca: ["mca_aoc4", "mca_mgt7", "mca_adt1", "mca_dpt3"],
    };
    const services = serviceMap[activeTab] || [];
    filteredRules = mockComplianceRules.filter((r) => services.includes(r.serviceType));
  }

  filteredRules = filteredRules.filter((rule) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value && rule[key as keyof ComplianceRule] !== value) return false;
    }
    return true;
  });

  const activeRules = mockComplianceRules.filter((r) => r.status === "active").length;
  const totalTriggers = mockComplianceRules.reduce((sum, r) => sum + r.triggerCount, 0);
  const avgTriggers = Math.round(totalTriggers / mockComplianceRules.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Rules"
        description="Configure filing deadlines, document requirements, reminders, and automation rules"
        actions={
          <Button size="sm" onClick={() => alert("Create new compliance rule")}>
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Button>
        }
      />

      <SectionCard title="Rule Statistics" className="grid gap-4 md:grid-cols-4">
        <StatTile label="Total Rules" value={mockComplianceRules.length} icon={<FileSearch className="h-5 w-5" />} />
        <StatTile label="Active Rules" value={activeRules} icon={<CheckCircle className="h-5 w-5 text-green-600" />} />
        <StatTile label="Total Triggers" value={totalTriggers.toLocaleString()} icon={<Clock className="h-5 w-5" />} />
        <StatTile
          label="Avg Triggers/Rule"
          value={avgTriggers.toLocaleString()}
          icon={<Shield className="h-5 w-5" />}
        />
      </SectionCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {complianceRuleTabs.map((tab) => (
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

        {complianceRuleTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <ComplianceRulesCategoryTab
              category={tab.id}
              rules={filteredRules}
              serviceMap={
                {
                  itr: ["itr"],
                  gst: ["gst_monthly", "gst_quarterly", "gst_annual"],
                  tds: ["tds_24q", "tds_26q", "tds_27q", "tds_27eq"],
                  mca: ["mca_aoc4", "mca_mgt7", "mca_adt1", "mca_dpt3"],
                }[tab.id] || []
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ComplianceRulesCategoryTabProps {
  category: string;
  rules: ComplianceRule[];
  serviceMap: string[];
}

function ComplianceRulesCategoryTab(props: ComplianceRulesCategoryTabProps) {
  const category = props.category;
  const _rules = props.rules;
  const serviceMap = props.serviceMap;
  const filterConfigs: FilterConfig[] = [
    {
      key: "ruleType",
      label: "Rule Type",
      type: "select",
      options: ruleTypes.map((r) => ({
        value: r,
        label: r.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ruleStatuses.map((s) => ({ value: s.value, label: s.label })),
    },
  ];

  const catRules =
    serviceMap.length > 0 ? mockComplianceRules.filter((r) => serviceMap.includes(r.serviceType)) : mockComplianceRules;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-xl capitalize">{category} Rules</h2>
          <p className="text-muted-foreground text-sm">{catRules.length} rule(s)</p>
        </div>
        <Button size="sm" onClick={() => alert(`Create new ${category} rule`)}>
          <Plus className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{}}
        searchPlaceholder="Search rules..."
        onSearch={() => {
          /* noop */
        }}
        onChange={() => {
          /* noop */
        }}
        compact
      />

      {catRules.length > 0 ? (
        <DataTable<ComplianceRule>
          data={catRules}
          columns={
            [
              {
                accessorKey: "name",
                header: "Rule Name",
                cell: ({ row }: { row: { original: ComplianceRule } }) => (
                  <p className="font-medium text-sm">{row.original.name}</p>
                ),
              },
              {
                accessorKey: "serviceType",
                header: "Service",
                cell: ({ row }: { row: { original: ComplianceRule } }) => (
                  <Badge variant="secondary">{row.original.serviceType.toUpperCase()}</Badge>
                ),
              },
              {
                accessorKey: "ruleType",
                header: "Type",
                cell: ({ row }: { row: { original: ComplianceRule } }) => (
                  <Badge variant="outline">{row.original.ruleType.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: ComplianceRule } }) => {
                  const status = ruleStatuses.find((s) => s.value === row.original.status);
                  return (
                    <Badge variant={(status?.color as "default" | "secondary" | "destructive") || "secondary"}>
                      {status?.label || row.original.status}
                    </Badge>
                  );
                },
              },
              {
                accessorKey: "priority",
                header: "Priority",
                cell: ({ row }: { row: { original: ComplianceRule } }) => (
                  <span className="font-medium text-sm">{row.original.priority}</span>
                ),
              },
              {
                accessorKey: "triggerCount",
                header: "Triggers",
                cell: ({ row }: { row: { original: ComplianceRule } }) => (
                  <span className="font-medium text-sm">{row.original.triggerCount}</span>
                ),
              },
              {
                accessorKey: "lastTriggered",
                header: "Last Run",
                cell: ({ row }: { row: { original: ComplianceRule } }) => (
                  <span className="text-sm">
                    {row.original.lastTriggered ? formatDate(row.original.lastTriggered.split("T")[0]) : "Never"}
                  </span>
                ),
              },
              {
                accessorKey: "autoGenerateMatter",
                header: "Auto Matter",
                cell: ({ row }: { row: { original: ComplianceRule } }) =>
                  row.original.autoGenerateMatter ? (
                    <Badge variant="default">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  ),
              },
            ] as const
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No rules in this category"
          rowActions={[
            { label: "View", action: (r: ComplianceRule) => alert(`View rule ${r.name}`) },
            { label: "Edit", action: (r: ComplianceRule) => alert(`Edit ${r.name}`) },
            { label: "Test", action: (r: ComplianceRule) => alert(`Test rule ${r.name}`) },
            { label: "Clone", action: (r: ComplianceRule) => alert(`Clone ${r.name}`) },
          ]}
        />
      ) : (
        <EmptyState
          icon={<FileSearch className="h-12 w-12 text-muted-foreground/50" />}
          title="No rules found"
          description="No compliance rules configured for this category"
        />
      )}
    </div>
  );
}
