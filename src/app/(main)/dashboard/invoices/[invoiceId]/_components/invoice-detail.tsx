"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { AlertTriangle, ChevronLeft, Clock, CreditCard, FileText, Shield } from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { InvoiceRecordHeader } from "@/components/ca-nexus/record-header";
import { InvoiceStatusBadge, PaymentStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatINR } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import { getInvoiceById, getPaymentsByInvoice, getTimeEntriesByMatter } from "@/mock-data/time-billing";
import { getUserById } from "@/mock-data/users";
import type { Invoice, InvoiceLineItem, Payment, TimeEntry } from "@/types";

const invoiceTabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "line-items", label: "Line Items", icon: Shield },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "time-entries", label: "Time Entries", icon: Clock },
  { id: "activity", label: "Activity", icon: Clock },
];

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
    | "document_request"
    | "workpaper"
    | "query"
    | "signoff";
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

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [_search, _setSearch] = useState("");
  const [_filters, _setFilters] = useState<Record<string, unknown>>({});

  const invoice = getInvoiceById(invoiceId);
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Invoice not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The invoice you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/invoices")}
          className="text-primary hover:underline"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const client = getClientById(invoice.clientId);
  const matter = invoice.matterId ? getMatterById(invoice.matterId) : undefined;
  const payments = getPaymentsByInvoice(invoiceId);
  const timeEntries = invoice.matterId ? getTimeEntriesByMatter(invoice.matterId) : [];
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== "paid";

  const handlePaymentClick = (p: Payment) => alert(`View payment ${p.paymentNumber}`);
  const handleTimeEntryClick = (t: TimeEntry) => alert(`View time entry ${t.id}`);

  const allActivities: ActivityItem[] = [
    ...payments.map((p) => ({
      id: `payment-${p.id}`,
      type: "payment" as const,
      title: `Payment ${p.paymentNumber}`,
      description: `${p.paymentMethod} • ${formatINR(p.amount)}`,
      user: getUserById(p.receivedById),
      timestamp: p.createdAt,
      entityUrl: "#",
      status: p.status,
    })),
    ...timeEntries.map((t) => ({
      id: `time-${t.id}`,
      type: "invoice" as const,
      title: `Time Entry: ${t.description}`,
      description: `${Math.floor(t.durationMinutes / 60)}h ${t.durationMinutes % 60}m • ${t.isBillable ? "Billable" : "Non-billable"}`,
      user: getUserById(t.userId),
      timestamp: t.createdAt,
      entityUrl: "#",
      status: t.status,
    })),
    {
      id: `invoice-created`,
      type: "invoice" as const,
      title: `Invoice Created: ${invoice.invoiceNumber}`,
      description: `Total: ${formatINR(invoice.totalAmount)}`,
      timestamp: invoice.createdAt,
      entityUrl: "#",
    },
    {
      id: `invoice-sent`,
      type: "invoice" as const,
      title: `Invoice Sent`,
      description: `Sent to ${client?.displayName || client?.name}`,
      timestamp: invoice.sentAt || invoice.createdAt,
      entityUrl: "#",
    },
    ...(invoice.paidAt
      ? [
          {
            id: `invoice-paid`,
            type: "payment" as const,
            title: `Invoice Paid`,
            description: `Payment received: ${formatINR(invoice.paidAmount)}`,
            timestamp: invoice.paidAt,
            entityUrl: "#",
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <InvoiceRecordHeader
        invoice={invoice}
        client={client}
        matter={matter}
        actions={
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/invoices")}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Invoices
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {invoiceTabs.map((tab) => (
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
          <InvoiceOverviewTab
            invoice={invoice}
            client={client}
            matter={matter}
            payments={payments}
            totalPayments={totalPayments}
            isOverdue={isOverdue}
          />
        </TabsContent>

        <TabsContent value="line-items" className="space-y-6">
          <InvoiceLineItemsTab invoice={invoice} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <InvoicePaymentsTab payments={payments} invoice={invoice} onPaymentClick={handlePaymentClick} />
        </TabsContent>

        <TabsContent value="time-entries" className="space-y-4">
          <InvoiceTimeEntriesTab timeEntries={timeEntries} invoice={invoice} onTimeEntryClick={handleTimeEntryClick} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <InvoiceActivityTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InvoiceOverviewTab({
  invoice,
  client,
  matter,
  payments,
  totalPayments,
  isOverdue,
}: {
  invoice: Invoice;
  client: any;
  matter: any;
  payments: Payment[];
  totalPayments: number;
  isOverdue: boolean;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Status"
          value={<InvoiceStatusBadge status={invoice.status} />}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile
          label="Payment"
          value={<PaymentStatusBadge status={invoice.paymentStatus} />}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatTile label="Total" value={formatINR(invoice.totalAmount)} icon={<CreditCard className="h-5 w-5" />} />
        <StatTile
          label="Balance"
          value={formatINR(invoice.balanceAmount)}
          hint={isOverdue ? "Overdue" : undefined}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Invoice Details">
          <KeyValueList
            items={[
              { label: "Invoice Number", value: invoice.invoiceNumber },
              { label: "Issue Date", value: formatDate(invoice.issueDate) },
              { label: "Due Date", value: formatDate(invoice.dueDate) },
              { label: "Currency", value: invoice.currency },
              { label: "Subtotal", value: formatINR(invoice.subtotal) },
              { label: "Tax Amount", value: formatINR(invoice.taxAmount) },
              { label: "Discount", value: formatINR(invoice.discountAmount) },
              { label: "Sent Date", value: invoice.sentAt ? formatDate(invoice.sentAt) : "—" },
              { label: "Paid Date", value: invoice.paidAt ? formatDate(invoice.paidAt) : "—" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Payment Summary">
          <KeyValueList
            items={[
              { label: "Total Payments", value: formatINR(totalPayments) },
              { label: "Payment Count", value: String(payments.length) },
              { label: "Paid Amount", value: formatINR(invoice.paidAmount) },
              { label: "Balance Due", value: formatINR(invoice.balanceAmount) },
              {
                label: "Days Overdue",
                value: isOverdue
                  ? Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                  : 0,
              },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Linked Entities">
        <div className="grid gap-4 md:grid-cols-3">
          {client && <ClientLink client={client} showStatus={true} />}
          {matter && <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />}
        </div>
      </SectionCard>

      {invoice.notes && (
        <SectionCard title="Notes">
          <p className="text-sm">{invoice.notes}</p>
        </SectionCard>
      )}

      {invoice.termsAndConditions && (
        <SectionCard title="Terms & Conditions">
          <p className="text-muted-foreground text-sm">{invoice.termsAndConditions}</p>
        </SectionCard>
      )}
    </div>
  );
}

function InvoiceLineItemsTab({ invoice }: { invoice: Invoice }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Line Items">
        <DataTable<InvoiceLineItem>
          data={invoice.lineItems}
          columns={
            [
              {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }: { row: { original: InvoiceLineItem } }) => (
                  <p className="font-medium">{row.original.description}</p>
                ),
              },
              {
                accessorKey: "quantity",
                header: "Qty",
                cell: ({ row }: { row: { original: InvoiceLineItem } }) => (
                  <span className="text-center text-sm">{row.original.quantity}</span>
                ),
              },
              {
                accessorKey: "unitPrice",
                header: "Unit Price",
                cell: ({ row }: { row: { original: InvoiceLineItem } }) => (
                  <span className="text-right text-sm">{formatINR(row.original.unitPrice)}</span>
                ),
              },
              {
                accessorKey: "taxRate",
                header: "Tax %",
                cell: ({ row }: { row: { original: InvoiceLineItem } }) => (
                  <span className="text-center text-sm">{row.original.taxRate}%</span>
                ),
              },
              {
                accessorKey: "taxAmount",
                header: "Tax",
                cell: ({ row }: { row: { original: InvoiceLineItem } }) => (
                  <span className="text-right text-sm">{formatINR(row.original.taxAmount)}</span>
                ),
              },
              {
                accessorKey: "discount",
                header: "Discount",
                cell: ({ row }: { row: { original: InvoiceLineItem } }) => (
                  <span className="text-right text-sm">{formatINR(row.original.discount)}</span>
                ),
              },
              {
                accessorKey: "total",
                header: "Total",
                cell: ({ row }: { row: { original: InvoiceLineItem } }) => (
                  <span className="text-right font-medium">{formatINR(row.original.total)}</span>
                ),
              },
              {
                accessorKey: "serviceType",
                header: "Service",
                cell: ({ row }: { row: { original: InvoiceLineItem } }) => (
                  <Badge variant="secondary">{row.original.serviceType?.toUpperCase() || "—"}</Badge>
                ),
              },
              {
                accessorKey: "period",
                header: "Period",
                cell: ({ row }: { row: { original: InvoiceLineItem } }) => (
                  <span className="text-sm">{row.original.period?.label || "—"}</span>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No line items"
        />
      </SectionCard>

      <SectionCard title="Totals" className="grid gap-4 md:grid-cols-2 md:grid-cols-4">
        <StatTile label="Subtotal" value={formatINR(invoice.subtotal)} icon={<CreditCard className="h-5 w-5" />} />
        <StatTile label="Tax" value={formatINR(invoice.taxAmount)} icon={<CreditCard className="h-5 w-5" />} />
        <StatTile
          label="Discount"
          value={formatINR(invoice.discountAmount)}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatTile label="Total" value={formatINR(invoice.totalAmount)} icon={<CreditCard className="h-5 w-5" />} />
      </SectionCard>
    </div>
  );
}

function InvoicePaymentsTab({
  payments,
  invoice,
  onPaymentClick,
}: {
  payments: Payment[];
  invoice: Invoice;
  onPaymentClick: (p: Payment) => void;
}) {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard className="h-12 w-12 text-muted-foreground/50" />}
        title="No payments recorded"
        description="Payments will appear here once received."
        action={
          <Button size="sm" onClick={() => alert("Record payment")}>
            <CreditCard className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        }
      />
    );
  }

  return (
    <DataTable<Payment>
      data={payments}
      columns={
        [
          {
            accessorKey: "paymentNumber",
            header: "Payment #",
            cell: ({ row }: { row: { original: Payment } }) => (
              <span className="font-medium text-sm">{row.original.paymentNumber}</span>
            ),
          },
          {
            accessorKey: "paymentDate",
            header: "Date",
            cell: ({ row }: { row: { original: Payment } }) => (
              <span className="text-sm">{formatDate(row.original.paymentDate)}</span>
            ),
          },
          {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }: { row: { original: Payment } }) => (
              <span className="font-medium text-green-600">{formatINR(row.original.amount)}</span>
            ),
          },
          {
            accessorKey: "paymentMethod",
            header: "Method",
            cell: ({ row }: { row: { original: Payment } }) => (
              <Badge variant="secondary">{row.original.paymentMethod.replace(/_/g, " ")}</Badge>
            ),
          },
          {
            accessorKey: "referenceNumber",
            header: "Reference",
            cell: ({ row }: { row: { original: Payment } }) => (
              <span className="font-mono text-sm">{row.original.referenceNumber || "—"}</span>
            ),
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: { original: Payment } }) => (
              <Badge
                variant={
                  row.original.status === "cleared"
                    ? "default"
                    : row.original.status === "pending"
                      ? "secondary"
                      : "destructive"
                }
              >
                {row.original.status}
              </Badge>
            ),
          },
          {
            accessorKey: "receivedById",
            header: "Received By",
            cell: ({ row }: { row: { original: Payment } }) => (
              <span className="text-sm">{getUserById(row.original.receivedById)?.fullName || "—"}</span>
            ),
          },
        ] as any
      }
      getRowId={(row) => row.id}
      pageSize={10}
      emptyMessage="No payments"
      rowActions={[{ label: "View", action: onPaymentClick }]}
    />
  );
}

function InvoiceTimeEntriesTab({
  timeEntries,
  invoice,
  onTimeEntryClick,
}: {
  timeEntries: TimeEntry[];
  invoice: Invoice;
  onTimeEntryClick: (t: TimeEntry) => void;
}) {
  const billableEntries = timeEntries.filter((t) => t.isBillable);
  const totalBillableMinutes = billableEntries.reduce((sum, t) => sum + t.durationMinutes, 0);
  const totalBillableAmount = billableEntries.reduce((sum, t) => sum + (t.billedAmount || 0), 0);

  if (timeEntries.length === 0) {
    return (
      <EmptyState
        icon={<Clock className="h-12 w-12 text-muted-foreground/50" />}
        title="No time entries linked"
        description="Time entries for this invoice's matter will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Billable Summary" className="grid gap-4 md:grid-cols-3">
        <StatTile label="Billable Entries" value={billableEntries.length} icon={<Clock className="h-5 w-5" />} />
        <StatTile
          label="Billable Hours"
          value={`${Math.floor(totalBillableMinutes / 60)}h ${totalBillableMinutes % 60}m`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatTile
          label="Billable Amount"
          value={formatINR(totalBillableAmount)}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </SectionCard>

      <DataTable<TimeEntry>
        data={timeEntries}
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
              accessorKey: "userId",
              header: "User",
              cell: ({ row }: { row: { original: TimeEntry } }) => (
                <span className="text-sm">{getUserById(row.original.userId)?.fullName || "—"}</span>
              ),
            },
            {
              accessorKey: "taskId",
              header: "Task",
              cell: ({ row }: { row: { original: TimeEntry } }) => (
                <span className="text-sm">{row.original.taskId || "—"}</span>
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
                <span className="text-sm">
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
                <span className="text-sm">{formatINR(row.original.billingRate)}/hr</span>
              ),
            },
            {
              accessorKey: "billedAmount",
              header: "Amount",
              cell: ({ row }: { row: { original: TimeEntry } }) => (
                <span className="text-green-600 text-sm">{formatINR(row.original.billedAmount || 0)}</span>
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
        emptyMessage="No time entries"
        rowActions={[{ label: "View", action: onTimeEntryClick }]}
      />
    </div>
  );
}

function InvoiceActivityTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}
