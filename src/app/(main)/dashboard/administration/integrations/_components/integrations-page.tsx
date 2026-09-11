"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Cloud,
  CreditCard,
  Database,
  Eye,
  Loader2,
  Mail,
  Plug,
  PlugZap,
  Plus,
  Settings,
  Terminal,
  Unlink2,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from "lucide-react";

import { EmptyState } from "@/components/ca-nexus/empty-state";
import type { FilterConfig } from "@/components/ca-nexus/filter-bar";
import { PageHeader, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "connected" | "disconnected" | "error" | "pending" | "testing" | string;
  authType: string;
  baseUrl: string;
  apiVersion: string;
  lastSync?: string | null;
  syncFrequency: string;
  enabledFeatures: string[];
  rateLimit: string;
  documentationUrl: string;
  supportContact: string;
  createdAt: string;
  updatedAt: string;
  configuredBy: string;
}

const integrationStatusToBadgeVariant = (status: Integration["status"]): "default" | "destructive" | "secondary" => {
  switch (status) {
    case "connected":
      return "default";
    case "error":
      return "destructive";
    default:
      return "secondary";
  }
};

const integrationTabs = [
  { id: "all", label: "All Integrations", icon: Plug },
  { id: "government", label: "Government Portals", icon: Building2 },
  { id: "payment", label: "Payment Gateways", icon: CreditCard },
  { id: "communication", label: "Communication", icon: Mail },
  { id: "cloud", label: "Cloud & Storage", icon: Cloud },
  { id: "custom", label: "Custom APIs", icon: Terminal },
];

const integrationCategories = [
  "government",
  "payment",
  "communication",
  "cloud_storage",
  "accounting",
  "hr_payroll",
  "document_management",
  "custom_api",
];

const integrationStatuses = [
  { value: "connected", label: "Connected", icon: <Wifi className="h-3 w-3" />, color: "green" },
  { value: "disconnected", label: "Disconnected", icon: <WifiOff className="h-3 w-3" />, color: "gray" },
  { value: "error", label: "Error", icon: <AlertTriangle className="h-3 w-3" />, color: "red" },
  { value: "pending", label: "Pending Setup", icon: <Loader2 className="h-3 w-3 animate-spin" />, color: "yellow" },
  { value: "testing", label: "Testing", icon: <Zap className="h-3 w-3" />, color: "blue" },
];

const mockIntegrations = [
  {
    id: "int-1",
    name: "Income Tax e-Filing Portal",
    category: "government",
    description: "Direct integration with Income Tax Department e-filing portal for ITR submission and status tracking",
    status: "connected",
    authType: "oauth2",
    baseUrl: "https://www.incometax.gov.in/iec/foportal",
    apiVersion: "v2.1",
    lastSync: "2024-07-15T10:30:00Z",
    syncFrequency: "realtime",
    enabledFeatures: ["itr_filing", "status_tracking", "notice_download", "refund_status", "pan_verification"],
    rateLimit: "100 req/min",
    documentationUrl: "https://www.incometax.gov.in/iec/foportal/help/api-documentation",
    supportContact: "support@incometax.gov.in",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-06-15T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-2",
    name: "GSTN Portal (GST Returns)",
    category: "government",
    description: "GST Network integration for GSTR-1, GSTR-3B, GSTR-9 filing and reconciliation",
    status: "connected",
    authType: "api_key",
    baseUrl: "https://api.gst.gov.in",
    apiVersion: "v1.3",
    lastSync: "2024-07-15T10:00:00Z",
    syncFrequency: "scheduled",
    enabledFeatures: [
      "gstr1_filing",
      "gstr3b_filing",
      "gstr9_filing",
      "reconciliation",
      "eway_bill",
      "gstin_verification",
    ],
    rateLimit: "60 req/min",
    documentationUrl: "https://www.gst.gov.in/help/api-documentation",
    supportContact: "helpdesk@gst.gov.in",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-3",
    name: "TDS CPC Portal (Traces)",
    category: "government",
    description: "TDS Centralized Processing Cell integration for TDS return filing and challan verification",
    status: "connected",
    authType: "api_key",
    baseUrl: "https://www.tdscpc.gov.in",
    apiVersion: "v1.0",
    lastSync: "2024-07-14T15:00:00Z",
    syncFrequency: "scheduled",
    enabledFeatures: ["tds_filing", "challan_verification", "form16_download", "tds_certificate"],
    rateLimit: "30 req/min",
    documentationUrl: "https://www.tdscpc.gov.in/help/api",
    supportContact: "tdshelp@tdscpc.gov.in",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-05-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-4",
    name: "MCA21 Portal (ROC Filings)",
    category: "government",
    description: "Ministry of Corporate Affairs integration for AOC-4, MGT-7, ADT-1, DPT-3 filings",
    status: "connected",
    authType: "oauth2",
    baseUrl: "https://www.mca.gov.in/mcafoportal",
    apiVersion: "v2.0",
    lastSync: "2024-07-10T10:00:00Z",
    syncFrequency: "scheduled",
    enabledFeatures: ["aoc4_filing", "mgt7_filing", "adt1_filing", "dpt3_filing", "cin_verification", "director_kyc"],
    rateLimit: "20 req/min",
    documentationUrl: "https://www.mca.gov.in/mcafoportal/help/api",
    supportContact: "mcahelp@mca.gov.in",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-5",
    name: "Razorpay Payment Gateway",
    category: "payment",
    description: "Payment gateway for invoice payments, fee collection, and automated reconciliation",
    status: "connected",
    authType: "api_key",
    baseUrl: "https://api.razorpay.com/v1",
    apiVersion: "v1",
    lastSync: "2024-07-15T10:00:00Z",
    syncFrequency: "realtime",
    enabledFeatures: [
      "payment_collection",
      "refund_processing",
      "webhook_notifications",
      "settlement_reports",
      "upi_payments",
    ],
    rateLimit: "1000 req/min",
    documentationUrl: "https://razorpay.com/docs/api",
    supportContact: "support@razorpay.com",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-6",
    name: "WhatsApp Business API",
    category: "communication",
    description: "WhatsApp Business integration for client notifications, document requests, and campaign messaging",
    status: "connected",
    authType: "oauth2",
    baseUrl: "https://graph.facebook.com/v18.0",
    apiVersion: "v18.0",
    lastSync: "2024-07-15T10:00:00Z",
    syncFrequency: "realtime",
    enabledFeatures: [
      "template_messages",
      "session_messages",
      "media_sharing",
      "interactive_buttons",
      "webhook_events",
    ],
    rateLimit: "1000 req/min",
    documentationUrl: "https://developers.facebook.com/docs/whatsapp",
    supportContact: "whatsapp-support@fb.com",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-06-15T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-7",
    name: "SendGrid Email Service",
    category: "communication",
    description: "Transactional and marketing email delivery service",
    status: "connected",
    authType: "api_key",
    baseUrl: "https://api.sendgrid.com/v3",
    apiVersion: "v3",
    lastSync: "2024-07-15T10:00:00Z",
    syncFrequency: "realtime",
    enabledFeatures: ["transactional_emails", "marketing_campaigns", "email_templates", "analytics", "webhook_events"],
    rateLimit: "600 req/min",
    documentationUrl: "https://docs.sendgrid.com/api-reference",
    supportContact: "support@sendgrid.com",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-05-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-8",
    name: "Google Drive / Workspace",
    category: "cloud_storage",
    description: "Google Drive integration for document storage, sharing, and collaboration",
    status: "connected",
    authType: "oauth2",
    baseUrl: "https://www.googleapis.com/drive/v3",
    apiVersion: "v3",
    lastSync: "2024-07-15T10:00:00Z",
    syncFrequency: "realtime",
    enabledFeatures: ["file_upload", "file_download", "folder_management", "permission_control", "shared_drives"],
    rateLimit: "1000 req/min",
    documentationUrl: "https://developers.google.com/drive/api",
    supportContact: "workspace-support@google.com",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-9",
    name: "Tally ERP Integration",
    category: "accounting",
    description: "Tally ERP 9/Prime integration for automated ledger posting and financial data sync",
    status: "pending",
    authType: "custom",
    baseUrl: "http://localhost:9000",
    apiVersion: "local",
    lastSync: null,
    syncFrequency: "manual",
    enabledFeatures: ["ledger_posting", "voucher_creation", "report_generation", "gst_reconciliation"],
    rateLimit: "N/A (Local)",
    documentationUrl: "https://tallysolutions.com/integration/",
    supportContact: "support@tallysolutions.com",
    createdAt: "2024-04-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-10",
    name: "QuickBooks Online",
    category: "accounting",
    description: "QuickBooks Online integration for invoice sync, expense tracking, and financial reporting",
    status: "disconnected",
    authType: "oauth2",
    baseUrl: "https://quickbooks.api.intuit.com/v3",
    apiVersion: "v3",
    lastSync: "2024-03-15T10:00:00Z",
    syncFrequency: "scheduled",
    enabledFeatures: ["invoice_sync", "expense_tracking", "customer_sync", "report_generation"],
    rateLimit: "500 req/min",
    documentationUrl: "https://developer.intuit.com/app/developer/qbo/docs/api",
    supportContact: "developer-support@intuit.com",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-11",
    name: "Zoho People HRMS",
    category: "hr_payroll",
    description: "HRMS integration for employee data, leave management, and payroll processing",
    status: "testing",
    authType: "oauth2",
    baseUrl: "https://www.zohoapis.com/people/v1",
    apiVersion: "v1",
    lastSync: "2024-07-14T10:00:00Z",
    syncFrequency: "scheduled",
    enabledFeatures: ["employee_sync", "leave_management", "attendance_sync", "payroll_data"],
    rateLimit: "100 req/min",
    documentationUrl: "https://www.zoho.com/people/api/",
    supportContact: "support@zohopeople.com",
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2024-07-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
  {
    id: "int-12",
    name: "Custom REST API - Client Portal",
    category: "custom_api",
    description: "Custom API for client portal data synchronization",
    status: "connected",
    authType: "bearer_token",
    baseUrl: "https://api.canexus.com/v1",
    apiVersion: "v1",
    lastSync: "2024-07-15T10:00:00Z",
    syncFrequency: "realtime",
    enabledFeatures: ["client_data_sync", "matter_updates", "document_sharing", "notification_push"],
    rateLimit: "1000 req/min",
    documentationUrl: "internal",
    supportContact: "dev-team@canexus.com",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-07-01T10:00:00Z",
    configuredBy: "user-admin-001",
  },
];

export function IntegrationsPage() {
  const _router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, _setSearch] = useState("");
  const [filters, _setFilters] = useState<Record<string, unknown>>({});

  const _filterConfigs: FilterConfig[] = [
    {
      key: "category",
      label: "Category",
      type: "select",
      options: integrationCategories.map((c) => ({
        value: c,
        label: c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: integrationStatuses.map((s) => ({ value: s.value, label: s.label })),
    },
    {
      key: "authType",
      label: "Auth Type",
      type: "select",
      options: ["oauth2", "api_key", "bearer_token", "basic_auth", "custom"].map((a) => ({
        value: a,
        label: a.toUpperCase(),
      })),
    },
  ];

  let filteredIntegrations = mockIntegrations;

  if (activeTab !== "all") {
    const categoryMap: Record<string, string[]> = {
      government: ["government"],
      payment: ["payment"],
      communication: ["communication"],
      cloud: ["cloud_storage"],
      custom: ["custom_api", "accounting", "hr_payroll", "document_management"],
    };
    const categories = categoryMap[activeTab] || [];
    filteredIntegrations = mockIntegrations.filter((i) => categories.includes(i.category));
  }

  filteredIntegrations = filteredIntegrations.filter((integration) => {
    if (
      search &&
      !integration.name.toLowerCase().includes(search.toLowerCase()) &&
      !integration.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && integration[key as keyof typeof integration] !== value) return false;
    }
    return true;
  });

  const connectedCount = mockIntegrations.filter((i) => i.status === "connected").length;
  const errorCount = mockIntegrations.filter((i) => i.status === "error").length;
  const pendingCount = mockIntegrations.filter((i) => i.status === "pending" || i.status === "testing").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Manage third-party integrations, API connections, and data synchronization"
        actions={
          <Button size="sm" onClick={() => alert("Add new integration")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        }
      />

      <SectionCard title="Integration Status" className="grid gap-4 md:grid-cols-5">
        <StatTile label="Total" value={mockIntegrations.length} icon={<Plug className="h-5 w-5" />} />
        <StatTile label="Connected" value={connectedCount} icon={<CheckCircle className="h-5 w-5 text-green-600" />} />
        <StatTile label="Errors" value={errorCount} icon={<XCircle className="h-5 w-5 text-red-600" />} />
        <StatTile label="Pending" value={pendingCount} icon={<Loader2 className="h-5 w-5 text-yellow-600" />} />
        <StatTile label="Categories" value={integrationCategories.length} icon={<Database className="h-5 w-5" />} />
      </SectionCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {integrationTabs.map((tab) => (
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

        {integrationTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <IntegrationsCategoryTab category={tab.id} integrations={filteredIntegrations} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function IntegrationsCategoryTab({
  category,
  integrations: _integrations,
}: {
  category: string;
  integrations: Integration[];
}) {
  const categoryMap: Record<string, string[]> = {
    government: ["government"],
    payment: ["payment"],
    communication: ["communication"],
    cloud: ["cloud_storage"],
    custom: ["custom_api", "accounting", "hr_payroll", "document_management"],
  };

  const catIntegrations = mockIntegrations.filter((i) => (categoryMap[category] || []).includes(i.category));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-xl capitalize">{category.replace(/_/g, " ")} Integrations</h2>
          <p className="text-muted-foreground text-sm">{catIntegrations.length} integration(s)</p>
        </div>
        <Button size="sm" onClick={() => alert(`Add ${category} integration`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {catIntegrations.map((integration) => (
          <Card key={integration.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      integration.status === "connected" && "bg-green-100 text-green-600",
                      integration.status === "disconnected" && "bg-gray-100 text-gray-600",
                      integration.status === "error" && "bg-red-100 text-red-600",
                      integration.status === "pending" && "bg-yellow-100 text-yellow-600",
                      integration.status === "testing" && "bg-blue-100 text-blue-600",
                      "dark:bg-opacity-30",
                    )}
                  >
                    {integrationStatuses.find((s) => s.value === integration.status)?.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="text-xs">{integration.category.replace(/_/g, " ")}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {integrationStatuses.map((s) => s.value === integration.status && s.icon)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="line-clamp-2 text-muted-foreground text-sm">{integration.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Auth:</span>
                  <span className="ml-1 font-medium">{integration.authType.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rate Limit:</span>
                  <span className="ml-1 font-medium">{integration.rateLimit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="ml-1 font-medium">
                    {integration.lastSync ? formatDate(integration.lastSync.split("T")[0]) : "Never"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sync:</span>
                  <span className="ml-1 font-medium capitalize">{integration.syncFrequency.replace(/_/g, " ")}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {integration.enabledFeatures.slice(0, 4).map((f: string) => (
                  <Badge key={f} variant="outline" className="text-xs">
                    {f.replace(/_/g, " ")}
                  </Badge>
                ))}
                {integration.enabledFeatures.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{integration.enabledFeatures.length - 4} more
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => alert(`View ${integration.name}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => alert(`Configure ${integration.name}`)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  {integration.status !== "connected" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => alert(`Test connection for ${integration.name}`)}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  )}
                  {integration.status === "connected" && (
                    <Button variant="ghost" size="icon" onClick={() => alert(`Disconnect ${integration.name}`)}>
                      <Unlink2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <Badge variant={integrationStatusToBadgeVariant(integration.status)}>
                  {integrationStatuses.find((s) => s.value === integration.status)?.label || integration.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {catIntegrations.length === 0 && (
        <EmptyState
          icon={<PlugZap className="h-12 w-12 text-muted-foreground/50" />}
          title="No integrations found"
          description="No integrations configured for this category"
        />
      )}
    </div>
  );
}
