"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Building2, ChevronLeft, Clock, CreditCard, FileText, Shield } from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { ClientLink, InvoiceLink, MatterLink, ObjectLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { PaymentRecordStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatINR } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import { getInvoiceById, getPaymentById, getPaymentsByClient, getPaymentsByInvoice } from "@/mock-data/time-billing";
import { getUserById } from "@/mock-data/users";
import type { Invoice, Payment, PaymentAllocation } from "@/types";

const paymentTabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "allocations", label: "Allocations", icon: Shield },
  { id: "history", label: "History", icon: Clock },
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

export function PaymentDetail({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [_search, _setSearch] = useState("");
  const [_filters, _setFilters] = useState<Record<string, unknown>>({});

  const payment = getPaymentById(paymentId);
  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <CreditCard className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Payment not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The payment you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/payments")}
          className="text-primary hover:underline"
        >
          Back to Payments
        </button>
      </div>
    );
  }

  const client = getClientById(payment.clientId);
  const invoice = payment.invoiceId ? getInvoiceById(payment.invoiceId) : undefined;
  const matter = invoice?.matterId ? getMatterById(invoice.matterId) : undefined;
  const receivedBy = getUserById(payment.receivedById);

  const _clientPayments = getPaymentsByClient(payment.clientId);
  const invoicePayments = payment.invoiceId ? getPaymentsByInvoice(payment.invoiceId) : [];

  const allActivities: ActivityItem[] = [
    {
      id: `payment-created`,
      type: "payment" as const,
      title: `Payment Created: ${payment.paymentNumber}`,
      description: `${payment.paymentMethod} • ${formatINR(payment.amount)}`,
      user: receivedBy,
      timestamp: payment.createdAt,
      entityUrl: "#",
      status: payment.status,
    },
    ...invoicePayments
      .filter((p) => p.id !== payment.id)
      .map((p) => ({
        id: `payment-${p.id}`,
        type: "payment" as const,
        title: `Payment ${p.paymentNumber}`,
        description: `${p.paymentMethod} • ${formatINR(p.amount)}`,
        user: getUserById(p.receivedById),
        timestamp: p.createdAt,
        entityUrl: "#",
        status: p.status,
      })),
    ...(payment.status === "cleared"
      ? [
          {
            id: `payment-cleared`,
            type: "payment" as const,
            title: `Payment Cleared`,
            description: `Cleared via ${payment.paymentMethod}`,
            user: receivedBy,
            timestamp: payment.updatedAt,
            entityUrl: "#",
            status: "cleared",
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <SectionCard
        title={`Payment ${payment.paymentNumber}`}
        description={`${payment.paymentMethod.replace(/_/g, " ")} • ${formatINR(payment.amount)}`}
        actions={
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/payments")}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Payments
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <StatTile
            label="Status"
            value={<PaymentRecordStatusBadge status={payment.status} />}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatTile
            label="Method"
            value={<Badge variant="secondary">{payment.paymentMethod.replace(/_/g, " ")}</Badge>}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatTile label="Amount" value={formatINR(payment.amount)} icon={<CreditCard className="h-5 w-5" />} />
          <StatTile label="Date" value={formatDate(payment.paymentDate)} icon={<Clock className="h-5 w-5" />} />
        </div>
      </SectionCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {paymentTabs.map((tab) => (
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
          <PaymentOverviewTab
            payment={payment}
            client={client}
            invoice={invoice}
            matter={matter}
            receivedBy={receivedBy}
          />
        </TabsContent>

        <TabsContent value="allocations" className="space-y-6">
          <PaymentAllocationsTab payment={payment} invoice={invoice} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <PaymentHistoryTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentOverviewTab({
  payment,
  client,
  invoice,
  matter,
  receivedBy,
}: {
  payment: Payment;
  client: any;
  invoice: any;
  matter: any;
  receivedBy: any;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Payment Details">
          <KeyValueList
            items={[
              { label: "Payment Number", value: payment.paymentNumber },
              { label: "Payment Date", value: formatDate(payment.paymentDate) },
              { label: "Method", value: payment.paymentMethod.replace(/_/g, " ") },
              { label: "Amount", value: formatINR(payment.amount) },
              { label: "Currency", value: payment.currency },
              { label: "Reference Number", value: payment.referenceNumber || "—" },
              { label: "Bank Reference", value: payment.bankReference || "—" },
              { label: "Status", value: <PaymentRecordStatusBadge status={payment.status} /> },
              { label: "Received By", value: receivedBy?.fullName || "—" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Allocation Summary">
          <KeyValueList
            items={[
              { label: "Linked Invoice", value: invoice ? <InvoiceLink invoice={invoice} showStatus={false} /> : "—" },
              {
                label: "Allocated Amount",
                value: formatINR(payment.allocatedInvoices.reduce((sum, a) => sum + a.amount, 0)),
              },
              { label: "Invoice Total", value: invoice ? formatINR(invoice.totalAmount) : "—" },
              { label: "Invoice Paid", value: invoice ? formatINR(invoice.paidAmount) : "—" },
              { label: "Invoice Balance", value: invoice ? formatINR(invoice.balanceAmount) : "—" },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Linked Entities">
        <div className="grid gap-4 md:grid-cols-4">
          {client && <ClientLink client={client} showStatus={true} />}
          {matter && <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />}
          {invoice && <InvoiceLink invoice={invoice} showStatus={true} showClient={false} />}
          {receivedBy && (
            <ObjectLink
              href={`/dashboard/users/${receivedBy.id}`}
              label={receivedBy.fullName}
              icon={<Building2 className="h-4 w-4" />}
            />
          )}
        </div>
      </SectionCard>

      {payment.notes && (
        <SectionCard title="Notes">
          <p className="text-sm">{payment.notes}</p>
        </SectionCard>
      )}
    </div>
  );
}

function PaymentAllocationsTab({ payment, invoice }: { payment: Payment; invoice: Invoice | undefined }) {
  if (!invoice || payment.allocatedInvoices.length === 0) {
    return (
      <EmptyState
        icon={<Shield className="h-12 w-12 text-muted-foreground/50" />}
        title="No allocations"
        description="This payment has no invoice allocations recorded."
      />
    );
  }

  return (
    <div className="space-y-6">
      <DataTable<PaymentAllocation>
        data={payment.allocatedInvoices}
        columns={
          [
            {
              accessorKey: "invoiceId",
              header: "Invoice",
              cell: ({ row }: { row: { original: { invoiceId: string; amount: number } } }) => {
                const inv = getInvoiceById(row.original.invoiceId);
                return inv ? (
                  <InvoiceLink invoice={inv} showStatus={false} />
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                );
              },
            },
            {
              accessorKey: "amount",
              header: "Allocated Amount",
              cell: ({ row }: { row: { original: { invoiceId: string; amount: number } } }) => (
                <span className="font-medium text-green-600">{formatINR(row.original.amount)}</span>
              ),
            },
          ] as any
        }
        getRowId={(row) => row.invoiceId}
        pageSize={10}
        emptyMessage="No allocations"
      />

      <SectionCard title="Invoice Summary" className="grid gap-4 md:grid-cols-2 md:grid-cols-4">
        <StatTile
          label="Invoice Total"
          value={formatINR(invoice.totalAmount)}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatTile label="Total Paid" value={formatINR(invoice.paidAmount)} icon={<CreditCard className="h-5 w-5" />} />
        <StatTile label="This Payment" value={formatINR(payment.amount)} icon={<CreditCard className="h-5 w-5" />} />
        <StatTile
          label="Remaining Balance"
          value={formatINR(invoice.balanceAmount)}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </SectionCard>
    </div>
  );
}

function PaymentHistoryTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}
