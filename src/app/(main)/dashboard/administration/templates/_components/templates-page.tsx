"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  BarChart3,
  CheckCircle,
  ClipboardCheck,
  Download,
  FileCheck,
  FileText,
  Loader2,
  Mail,
  Plus,
} from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import type { FilterConfig } from "@/components/ca-nexus/filter-bar";
import { PageHeader, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";

interface TemplateCategoryCount {
  category: string;
  count: number;
}

interface TemplateStatusCount {
  value: string;
  label: string;
  color: string;
  count: number;
}

interface MockTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  version: string;
  variables: Array<{ key: string; label: string; type: string; required: boolean; options?: string[] }>;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

const templateTabs = [
  { id: "all", label: "All Templates", icon: FileText },
  { id: "engagement", label: "Engagement Letters", icon: FileCheck },
  { id: "document", label: "Document Templates", icon: FileText },
  { id: "email", label: "Email Templates", icon: Mail },
  { id: "report", label: "Report Templates", icon: BarChart3 },
  { id: "checklist", label: "Checklists", icon: ClipboardCheck },
];

const templateCategories = [
  "engagement_letter",
  "document",
  "email",
  "report",
  "checklist",
  "proposal",
  "invoice",
  "letter",
  "other",
];

const templateStatuses = [
  { value: "draft", label: "Draft", color: "secondary" as const },
  { value: "review", label: "Under Review", color: "secondary" as const },
  { value: "approved", label: "Approved", color: "default" as const },
  { value: "published", label: "Published", color: "default" as const },
  { value: "archived", label: "Archived", color: "secondary" as const },
];

const mockTemplates = [
  {
    id: "tpl-1",
    name: "Standard Audit Engagement Letter",
    category: "engagement_letter",
    description: "Standard engagement letter for statutory audit engagements",
    status: "published",
    version: "2.1",
    variables: [
      { key: "clientName", label: "Client Name", type: "text", required: true },
      { key: "firmName", label: "Firm Name", type: "text", required: true },
      { key: "period", label: "Audit Period", type: "text", required: true },
      { key: "fee", label: "Audit Fee", type: "number", required: true },
      { key: "partnerName", label: "Partner Name", type: "text", required: true },
    ],
    content: "Dear {{clientName}},\n\nWe are pleased to confirm our understanding...",
    createdBy: "user-partner-001",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
    usageCount: 45,
  },
  {
    id: "tpl-2",
    name: "GST Compliance Engagement Letter",
    category: "engagement_letter",
    description: "Engagement letter for monthly/quarterly GST return filing",
    status: "published",
    version: "1.3",
    variables: [
      { key: "clientName", label: "Client Name", type: "text", required: true },
      {
        key: "frequency",
        label: "Filing Frequency",
        type: "select",
        required: true,
        options: ["Monthly", "Quarterly", "Annual"],
      },
      { key: "states", label: "GST States", type: "multi_select", required: true },
      { key: "fee", label: "Monthly Fee", type: "number", required: true },
    ],
    content: "Dear {{clientName}},\n\nThis letter confirms our engagement...",
    createdBy: "user-senior-001",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-05-15T10:00:00Z",
    usageCount: 32,
  },
  {
    id: "tpl-3",
    name: "ITR Filing Checklist",
    category: "checklist",
    description: "Comprehensive checklist for individual and corporate ITR filing",
    status: "approved",
    version: "3.0",
    variables: [
      { key: "clientName", label: "Client Name", type: "text", required: true },
      { key: "assessmentYear", label: "Assessment Year", type: "text", required: true },
      {
        key: "entityType",
        label: "Entity Type",
        type: "select",
        required: true,
        options: ["Individual", "HUF", "Company", "LLP", "Partnership"],
      },
    ],
    content: "# ITR Filing Checklist\n\n## Documents Required\n1. PAN Card\n2. Aadhaar Card\n...",
    createdBy: "user-senior-001",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-06-15T10:00:00Z",
    usageCount: 128,
  },
  {
    id: "tpl-4",
    name: "Monthly GST Reconciliation Report",
    category: "report",
    description: "Standard report template for GSTR-2A/2B reconciliation",
    status: "published",
    version: "1.0",
    variables: [
      { key: "clientName", label: "Client Name", type: "text", required: true },
      { key: "period", label: "Period", type: "text", required: true },
      { key: "gstin", label: "GSTIN", type: "text", required: true },
    ],
    content:
      "# GST Reconciliation Report\n\n**Client:** {{clientName}}\n**Period:** {{period}}\n**GSTIN:** {{gstin}}\n\n## Summary\n...",
    createdBy: "user-manager-001",
    createdAt: "2024-04-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
    usageCount: 67,
  },
  {
    id: "tpl-5",
    name: "Document Request Email",
    category: "email",
    description: "Standard email template for requesting documents from clients",
    status: "published",
    version: "2.0",
    variables: [
      { key: "clientName", label: "Client Name", type: "text", required: true },
      { key: "documents", label: "Documents List", type: "text", required: true },
      { key: "dueDate", label: "Due Date", type: "date", required: true },
      { key: "portalLink", label: "Portal Link", type: "text", required: false },
    ],
    content:
      "Subject: Documents Required for {{period}} Compliance\n\nDear {{clientName}},\n\nPlease provide the following documents...",
    createdBy: "user-admin-001",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
    usageCount: 234,
  },
  {
    id: "tpl-6",
    name: "Tax Advisory Proposal",
    category: "proposal",
    description: "Proposal template for tax advisory and planning services",
    status: "review",
    version: "1.5",
    variables: [
      { key: "clientName", label: "Client Name", type: "text", required: true },
      { key: "scope", label: "Scope of Work", type: "text", required: true },
      { key: "timeline", label: "Timeline", type: "text", required: true },
      { key: "fee", label: "Professional Fee", type: "number", required: true },
      { key: "team", label: "Team Members", type: "multi_select", required: true },
    ],
    content:
      "# Tax Advisory Proposal\n\n**Prepared for:** {{clientName}}\n**Date:** {{currentDate}}\n\n## Scope of Work\n{{scope}}\n\n## Timeline\n{{timeline}}\n\n## Fee Structure\n**Total Fee:** ₹{{fee}}\n\n## Team\n{{team}}",
    createdBy: "user-partner-001",
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2024-07-01T10:00:00Z",
    usageCount: 12,
  },
  {
    id: "tpl-7",
    name: "Invoice Template - Standard",
    category: "invoice",
    description: "Standard invoice template with GST breakdown",
    status: "published",
    version: "1.0",
    variables: [
      { key: "invoiceNumber", label: "Invoice Number", type: "text", required: true },
      { key: "clientName", label: "Client Name", type: "text", required: true },
      { key: "date", label: "Invoice Date", type: "date", required: true },
      { key: "dueDate", label: "Due Date", type: "date", required: true },
      { key: "items", label: "Line Items", type: "text", required: true },
      { key: "gstRate", label: "GST Rate %", type: "number", required: true },
    ],
    content:
      "# INVOICE\n\n**Invoice #:** {{invoiceNumber}}\n**Date:** {{date}}\n**Due:** {{dueDate}}\n\n**Bill To:**\n{{clientName}}\n\n## Items\n{{items}}\n\n**Subtotal:** ₹{{subtotal}}\n**GST ({{gstRate}}%):** ₹{{gstAmount}}\n**Total:** ₹{{total}}",
    createdBy: "user-admin-001",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    usageCount: 567,
  },
  {
    id: "tpl-8",
    name: "TDS Filing Checklist",
    category: "checklist",
    description: "Checklist for quarterly TDS return filing (24Q/26Q/27Q)",
    status: "approved",
    version: "2.2",
    variables: [
      { key: "clientName", label: "Client Name", type: "text", required: true },
      { key: "quarter", label: "Quarter", type: "select", required: true, options: ["Q1", "Q2", "Q3", "Q4"] },
      { key: "formType", label: "Form Type", type: "select", required: true, options: ["24Q", "26Q", "27Q", "27EQ"] },
    ],
    content:
      "# TDS Filing Checklist\n\n## Pre-filing Checks\n1. Verify PAN of all deductees\n2. Verify challan details\n...",
    createdBy: "user-senior-001",
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
    usageCount: 89,
  },
];

export function TemplatesPage() {
  const _router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, _setSearch] = useState("");
  const [filters, _setFilters] = useState<Record<string, unknown>>({});

  const _filterConfigs: FilterConfig[] = [
    {
      key: "category",
      label: "Category",
      type: "select",
      options: templateCategories.map((c) => ({
        value: c,
        label: c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: templateStatuses.map((s) => ({ value: s.value, label: s.label })),
    },
  ];

  let filteredTemplates = mockTemplates;

  if (activeTab !== "all") {
    const categoryMap: Record<string, string> = {
      engagement: "engagement_letter",
      document: "document",
      email: "email",
      report: "report",
      checklist: "checklist",
    };
    filteredTemplates = mockTemplates.filter((t) => t.category === categoryMap[activeTab]);
  }

  filteredTemplates = filteredTemplates.filter((template) => {
    if (
      search &&
      !template.name.toLowerCase().includes(search.toLowerCase()) &&
      !template.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && template[key as keyof typeof template] !== value) return false;
    }
    return true;
  });

  const categoryCounts = templateCategories.map((cat) => ({
    category: cat,
    count: mockTemplates.filter((t) => t.category === cat).length,
  }));

  const statusCounts = templateStatuses.map((s) => ({
    ...s,
    count: mockTemplates.filter((t) => t.status === s.value).length,
  }));

  const totalUsage = mockTemplates.reduce((sum, t) => sum + t.usageCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Manage document templates, checklists, and reusable content"
        actions={
          <Button size="sm" onClick={() => alert("Create new template")}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {templateTabs.map((tab) => (
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

        <TabsContent value="all" className="space-y-6">
          <TemplatesOverviewTab
            templates={filteredTemplates}
            categoryCounts={categoryCounts}
            statusCounts={statusCounts}
            totalUsage={totalUsage}
          />
        </TabsContent>

        {templateTabs.slice(1).map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <TemplatesCategoryTab category={tab.id} templates={filteredTemplates} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function TemplatesOverviewTab({
  templates,
  categoryCounts,
  statusCounts,
  totalUsage,
}: {
  templates: MockTemplate[];
  categoryCounts: TemplateCategoryCount[];
  statusCounts: TemplateStatusCount[];
  totalUsage: number;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-5">
        <StatTile label="Total Templates" value={mockTemplates.length} icon={<FileText className="h-5 w-5" />} />
        <StatTile label="Total Usage" value={totalUsage.toLocaleString()} icon={<Download className="h-5 w-5" />} />
        <StatTile
          label="Categories"
          value={categoryCounts.filter((c) => c.count > 0).length}
          icon={<FileCheck className="h-5 w-5" />}
        />
        <StatTile
          label="Published"
          value={statusCounts.find((s) => s.value === "published")?.count || 0}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatTile
          label="In Review"
          value={statusCounts.find((s) => s.value === "review")?.count || 0}
          icon={<Loader2 className="h-5 w-5 text-yellow-600" />}
        />
      </SectionCard>

      <SectionCard title="Templates by Category">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categoryCounts.map((cat) => (
            <Card key={cat.category} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 w-fit rounded-lg bg-primary/10 p-3">
                    <FileText className="mx-auto h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium capitalize">{cat.category.replace(/_/g, " ")}</p>
                  <p className="font-bold text-2xl text-primary">{cat.count}</p>
                  <p className="text-muted-foreground text-xs">templates</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Recent Templates">
        <DataTable<MockTemplate>
          data={templates.slice(0, 10)}
          columns={
            [
              {
                accessorKey: "name",
                header: "Template Name",
                cell: ({ row }: { row: { original: MockTemplate } }) => (
                  <p className="font-medium text-sm">{row.original.name}</p>
                ),
              },
              {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }: { row: { original: MockTemplate } }) => (
                  <Badge variant="secondary">{row.original.category.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: MockTemplate } }) => {
                  const status = templateStatuses.find((s) => s.value === row.original.status);
                  return (
                    <Badge variant={(status?.color as "default" | "secondary" | "destructive") || "secondary"}>
                      {status?.label || row.original.status}
                    </Badge>
                  );
                },
              },
              {
                accessorKey: "version",
                header: "Version",
                cell: ({ row }: { row: { original: MockTemplate } }) => (
                  <span className="text-sm">v{row.original.version}</span>
                ),
              },
              {
                accessorKey: "usageCount",
                header: "Usage",
                cell: ({ row }: { row: { original: MockTemplate } }) => (
                  <span className="font-medium text-sm">{row.original.usageCount}</span>
                ),
              },
              {
                accessorKey: "updatedAt",
                header: "Updated",
                cell: ({ row }: { row: { original: MockTemplate } }) => (
                  <span className="text-sm">{formatDate(row.original.updatedAt.split("T")[0])}</span>
                ),
              },
            ] as const
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No templates found"
          rowActions={[
            { label: "View", action: (t: MockTemplate) => alert(`View template ${t.name}`) },
            { label: "Duplicate", action: (t: MockTemplate) => alert(`Duplicate ${t.name}`) },
            { label: "Export", action: (t: MockTemplate) => alert(`Export ${t.name}`) },
          ]}
        />
      </SectionCard>
    </div>
  );
}

function TemplatesCategoryTab({ category, templates: _templates }: { category: string; templates: MockTemplate[] }) {
  const categoryMap: Record<string, string> = {
    engagement: "engagement_letter",
    document: "document",
    email: "email",
    report: "report",
    checklist: "checklist",
  };

  const catTemplates = mockTemplates.filter((t) => t.category === categoryMap[category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-xl capitalize">{category.replace(/_/g, " ")} Templates</h2>
          <p className="text-muted-foreground text-sm">{catTemplates.length} template(s)</p>
        </div>
        <Button size="sm" onClick={() => alert(`Create new ${category} template`)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <DataTable<MockTemplate>
        data={catTemplates}
        columns={
          [
            {
              accessorKey: "name",
              header: "Template Name",
              cell: ({ row }: { row: { original: MockTemplate } }) => (
                <p className="font-medium text-sm">{row.original.name}</p>
              ),
            },
            {
              accessorKey: "description",
              header: "Description",
              cell: ({ row }: { row: { original: MockTemplate } }) => (
                <p className="line-clamp-1 text-muted-foreground text-sm">{row.original.description}</p>
              ),
            },
            {
              accessorKey: "status",
              header: "Status",
              cell: ({ row }: { row: { original: MockTemplate } }) => {
                const status = templateStatuses.find((s) => s.value === row.original.status);
                const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                  green: "default",
                  gray: "secondary",
                  red: "destructive",
                  yellow: "destructive",
                };
                return (
                  <Badge variant={variantMap[status?.color || ""] || "secondary"}>
                    {status?.label || row.original.status}
                  </Badge>
                );
              },
            },
            {
              accessorKey: "version",
              header: "Version",
              cell: ({ row }: { row: { original: MockTemplate } }) => (
                <span className="text-sm">v{row.original.version}</span>
              ),
            },
            {
              accessorKey: "variables",
              header: "Variables",
              cell: ({ row }: { row: { original: MockTemplate } }) => (
                <div className="flex flex-wrap gap-1">
                  {row.original.variables.slice(0, 3).map((v) => (
                    <Badge key={v.key} variant="outline" className="text-xs">
                      {v.key}
                    </Badge>
                  ))}
                  {row.original.variables.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{row.original.variables.length - 3} more
                    </Badge>
                  )}
                </div>
              ),
            },
            {
              accessorKey: "usageCount",
              header: "Usage",
              cell: ({ row }: { row: { original: MockTemplate } }) => (
                <span className="font-medium text-sm">{row.original.usageCount}</span>
              ),
            },
            {
              accessorKey: "updatedAt",
              header: "Updated",
              cell: ({ row }: { row: { original: MockTemplate } }) => (
                <span className="text-sm">{formatDate(row.original.updatedAt.split("T")[0])}</span>
              ),
            },
          ] as const
        }
        getRowId={(row) => row.id}
        pageSize={10}
        emptyMessage="No templates in this category"
        rowActions={[
          { label: "View", action: (t: MockTemplate) => alert(`View template ${t.name}`) },
          { label: "Edit", action: (t: MockTemplate) => alert(`Edit ${t.name}`) },
          { label: "Duplicate", action: (t: MockTemplate) => alert(`Duplicate ${t.name}`) },
          { label: "Export", action: (t: MockTemplate) => alert(`Export ${t.name}`) },
        ]}
      />
    </div>
  );
}
