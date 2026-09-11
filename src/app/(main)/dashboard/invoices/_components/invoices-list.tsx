"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { AlertTriangle, FileText } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { InvoiceStatusBadge, PaymentStatusBadge } from "@/components/ca-nexus/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import {
  getInvoicesByPaymentStatus,
  getInvoicesByStatus,
  getOverdueInvoices,
  mockInvoices,
} from "@/mock-data/time-billing";
import type { Invoice, InvoiceStatus, PaymentStatus } from "@/types";

const invoiceTabs = [
  { id: "all", label: "All", count: mockInvoices.length },
  { id: "draft", label: "Draft", count: mockInvoices.filter((i) => i.status === "draft").length },
  { id: "sent", label: "Sent", count: mockInvoices.filter((i) => i.status === "sent").length },
  { id: "paid", label: "Paid", count: mockInvoices.filter((i) => i.paymentStatus === "paid").length },
  { id: "overdue", label: "Overdue", count: getOverdueInvoices().length },
  {
    id: "partially_paid",
    label: "Partial",
    count: mockInvoices.filter((i) => i.paymentStatus === "partially_paid").length,
  },
];

const statuses: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "sent", label: "Sent" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
  { value: "void", label: "Void" },
];

const paymentStatuses: { value: PaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "refunded", label: "Refunded" },
  { value: "written_off", label: "Written Off" },
];

export function InvoicesList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: statuses.map((s) => ({ value: s.value, label: s.label })),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      type: "select",
      options: paymentStatuses.map((p) => ({ value: p.value, label: p.label })),
    },
    {
      key: "clientId",
      label: "Client",
      type: "select",
      options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
    },
  ];

  let filteredInvoices = mockInvoices;

  if (activeTab !== "all") {
    if (activeTab === "overdue") {
      filteredInvoices = getOverdueInvoices();
    } else if (activeTab === "partially_paid") {
      filteredInvoices = getInvoicesByPaymentStatus("partially_paid");
    } else {
      filteredInvoices = getInvoicesByStatus(activeTab as InvoiceStatus);
    }
  }

  filteredInvoices = filteredInvoices.filter((inv: Invoice) => {
    if (
      search &&
      !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) &&
      !inv.clientId.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (inv as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleInvoiceClick = (invoice: Invoice) => router.push(`/dashboard/invoices/${invoice.id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Invoices</h1>
          <p className="text-muted-foreground text-sm">Manage and track all invoices</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoiceTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap"
            >
              {tab.label} <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs">{tab.count}</span>
            </Button>
          ))}
        </div>
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search invoices by number, client..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredInvoices.length > 0 ? (
        <DataTable<Invoice>
          data={filteredInvoices}
          columns={
            [
              {
                accessorKey: "invoiceNumber",
                header: "Invoice #",
                cell: ({ row }: { row: { original: Invoice } }) => (
                  <span className="font-medium text-sm">{row.original.invoiceNumber}</span>
                ),
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }: { row: { original: Invoice } }) => {
                  const client = getClientById(row.original.clientId);
                  return <ClientLink client={client!} showStatus={true} />;
                },
              },
              {
                accessorKey: "matterId",
                header: "Matter",
                cell: ({ row }: { row: { original: Invoice } }) => {
                  if (!row.original.matterId) return <span className="text-muted-foreground text-sm">—</span>;
                  const matter = getMatterById(row.original.matterId);
                  return <MatterLink matter={matter!} showStatus={true} />;
                },
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
                cell: ({ row }: { row: { original: Invoice } }) => {
                  const overdue = new Date(row.original.dueDate) < new Date() && row.original.paymentStatus !== "paid";
                  return (
                    <span className={cn("text-sm", overdue && "font-medium text-destructive")}>
                      {formatDate(row.original.dueDate)}
                      {overdue && <AlertTriangle className="ml-1 inline h-3.5 w-3.5" />}
                    </span>
                  );
                },
              },
              {
                accessorKey: "totalAmount",
                header: "Total",
                cell: ({ row }: { row: { original: Invoice } }) => (
                  <span className="font-medium text-sm">{formatINR(row.original.totalAmount)}</span>
                ),
              },
              {
                accessorKey: "paidAmount",
                header: "Paid",
                cell: ({ row }: { row: { original: Invoice } }) => (
                  <span className="text-green-600 text-sm">{formatINR(row.original.paidAmount)}</span>
                ),
              },
              {
                accessorKey: "balanceAmount",
                header: "Balance",
                cell: ({ row }: { row: { original: Invoice } }) => (
                  <span className={cn("font-medium text-sm", row.original.balanceAmount > 0 && "text-destructive")}>
                    {formatINR(row.original.balanceAmount)}
                  </span>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Invoice } }) => <InvoiceStatusBadge status={row.original.status} />,
              },
              {
                accessorKey: "paymentStatus",
                header: "Payment",
                cell: ({ row }: { row: { original: Invoice } }) => (
                  <PaymentStatusBadge status={row.original.paymentStatus} />
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No invoices match your search or filters"
          rowActions={[{ label: "View Details", action: handleInvoiceClick }]}
        />
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No invoices found"
          description={
            search || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "No invoices created yet"
          }
        />
      )}
    </div>
  );
}

import { cn } from "cn";
