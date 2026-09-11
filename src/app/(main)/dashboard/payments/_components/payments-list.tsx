"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { CreditCard } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, InvoiceLink } from "@/components/ca-nexus/object-link";
import { PaymentRecordStatusBadge } from "@/components/ca-nexus/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getInvoiceById, mockPayments } from "@/mock-data/time-billing";
import type { Payment, PaymentRecordStatus } from "@/types";

const paymentTabs = [
  { id: "all", label: "All", count: mockPayments.length },
  { id: "cleared", label: "Cleared", count: mockPayments.filter((p) => p.status === "cleared").length },
  { id: "pending", label: "Pending", count: mockPayments.filter((p) => p.status === "pending").length },
  { id: "bounced", label: "Bounced", count: mockPayments.filter((p) => p.status === "bounced").length },
];

const statuses: { value: PaymentRecordStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "cleared", label: "Cleared" },
  { value: "bounced", label: "Bounced" },
  { value: "refunded", label: "Refunded" },
  { value: "cancelled", label: "Cancelled" },
];

export function PaymentsList() {
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
      key: "paymentMethod",
      label: "Method",
      type: "select",
      options: [
        { value: "bank_transfer", label: "Bank Transfer" },
        { value: "upi", label: "UPI" },
        { value: "cheque", label: "Cheque" },
        { value: "cash", label: "Cash" },
        { value: "card", label: "Card" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "clientId",
      label: "Client",
      type: "select",
      options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
    },
  ];

  let filteredPayments = mockPayments;

  if (activeTab !== "all") {
    filteredPayments = mockPayments.filter((p) => p.status === (activeTab as any));
  }

  filteredPayments = filteredPayments.filter((pay: Payment) => {
    if (
      search &&
      !pay.paymentNumber.toLowerCase().includes(search.toLowerCase()) &&
      !pay.referenceNumber?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (pay as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handlePaymentClick = (payment: Payment) => router.push(`/dashboard/payments/${payment.id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Payments</h1>
          <p className="text-muted-foreground text-sm">Track and manage all payments received</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {paymentTabs.map((tab) => (
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
        searchPlaceholder="Search payments by number, reference..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredPayments.length > 0 ? (
        <DataTable<Payment>
          data={filteredPayments}
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
                accessorKey: "invoiceId",
                header: "Invoice",
                cell: ({ row }: { row: { original: Payment } }) => {
                  const invoice = getInvoiceById(row.original.invoiceId);
                  return invoice ? (
                    <InvoiceLink invoice={invoice} showStatus={false} />
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }: { row: { original: Payment } }) => {
                  const client = getClientById(row.original.clientId);
                  return <ClientLink client={client!} showStatus={true} />;
                },
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
                  <PaymentRecordStatusBadge status={row.original.status} />
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No payments match your search or filters"
          rowActions={[{ label: "View Details", action: handlePaymentClick }]}
        />
      ) : (
        <EmptyState
          icon={<CreditCard className="h-12 w-12 text-muted-foreground/50" />}
          title="No payments found"
          description={
            search || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "No payments recorded yet"
          }
        />
      )}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
