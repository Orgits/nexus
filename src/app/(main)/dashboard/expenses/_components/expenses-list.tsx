"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Receipt } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { ExpenseStatusBadge } from "@/components/ca-nexus/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import { getExpensesByStatus, mockExpenses } from "@/mock-data/time-billing";
import { mockUsers } from "@/mock-data/users";
import type { Expense, ExpenseCategory, ExpenseStatus } from "@/types";

const expenseTabs = [
  { id: "all", label: "All", count: mockExpenses.length },
  { id: "draft", label: "Draft", count: mockExpenses.filter((e) => e.status === "draft").length },
  { id: "submitted", label: "Submitted", count: mockExpenses.filter((e) => e.status === "submitted").length },
  { id: "approved", label: "Approved", count: mockExpenses.filter((e) => e.status === "approved").length },
  { id: "rejected", label: "Rejected", count: mockExpenses.filter((e) => e.status === "rejected").length },
  { id: "reimbursed", label: "Reimbursed", count: mockExpenses.filter((e) => e.status === "reimbursed").length },
  { id: "paid", label: "Paid", count: mockExpenses.filter((e) => e.status === "paid").length },
];

const statuses: { value: ExpenseStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "reimbursed", label: "Reimbursed" },
  { value: "paid", label: "Paid" },
];

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: "travel", label: "Travel" },
  { value: "accommodation", label: "Accommodation" },
  { value: "meals", label: "Meals" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "software", label: "Software" },
  { value: "professional_fees", label: "Professional Fees" },
  { value: "court_fees", label: "Court Fees" },
  { value: "government_fees", label: "Government Fees" },
  { value: "postage_courier", label: "Postage/Courier" },
  { value: "printing", label: "Printing" },
  { value: "telephone_internet", label: "Telephone/Internet" },
  { value: "training", label: "Training" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

export function ExpensesList() {
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
      key: "category",
      label: "Category",
      type: "select",
      options: categories.map((c) => ({ value: c.value, label: c.label })),
    },
    {
      key: "userId",
      label: "Employee",
      type: "select",
      options: mockUsers.map((u) => ({ value: u.id, label: u.fullName })),
    },
    {
      key: "clientId",
      label: "Client",
      type: "select",
      options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
    },
  ];

  let filteredExpenses = mockExpenses;

  if (activeTab !== "all") {
    filteredExpenses = getExpensesByStatus(activeTab as any);
  }

  filteredExpenses = filteredExpenses.filter((exp: Expense) => {
    if (
      search &&
      !exp.expenseNumber.toLowerCase().includes(search.toLowerCase()) &&
      !exp.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value && (exp as unknown as Record<string, unknown>)[key] !== value) return false;
    }
    return true;
  });

  const handleExpenseClick = (expense: Expense) => router.push(`/dashboard/expenses/${expense.id}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Expenses</h1>
          <p className="text-muted-foreground text-sm">Track and manage all expenses</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {expenseTabs.map((tab) => (
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
        searchPlaceholder="Search expenses by number, description..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filteredExpenses.length > 0 ? (
        <DataTable<Expense>
          data={filteredExpenses}
          columns={
            [
              {
                accessorKey: "expenseNumber",
                header: "Expense #",
                cell: ({ row }: { row: { original: Expense } }) => (
                  <span className="font-medium text-sm">{row.original.expenseNumber}</span>
                ),
              },
              {
                accessorKey: "userId",
                header: "Employee",
                cell: ({ row }: { row: { original: Expense } }) => {
                  const user = mockUsers.find((u) => u.id === row.original.userId);
                  return user ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{user.fullName}</span>
                      <span className="text-muted-foreground text-xs">{user.role.replace(/_/g, " ")}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  );
                },
              },
              {
                accessorKey: "clientId",
                header: "Client",
                cell: ({ row }: { row: { original: Expense } }) => {
                  if (!row.original.clientId) return <span className="text-muted-foreground text-sm">—</span>;
                  const client = getClientById(row.original.clientId);
                  return <ClientLink client={client!} showStatus={true} />;
                },
              },
              {
                accessorKey: "matterId",
                header: "Matter",
                cell: ({ row }: { row: { original: Expense } }) => {
                  if (!row.original.matterId) return <span className="text-muted-foreground text-sm">—</span>;
                  const matter = getMatterById(row.original.matterId);
                  return <MatterLink matter={matter!} showStatus={true} />;
                },
              },
              {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }: { row: { original: Expense } }) => (
                  <Badge variant="secondary">{row.original.category.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "expenseDate",
                header: "Date",
                cell: ({ row }: { row: { original: Expense } }) => (
                  <span className="text-sm">{formatDate(row.original.expenseDate)}</span>
                ),
              },
              {
                accessorKey: "amount",
                header: "Amount",
                cell: ({ row }: { row: { original: Expense } }) => (
                  <span className="font-medium text-sm">{formatINR(row.original.amount)}</span>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: Expense } }) => <ExpenseStatusBadge status={row.original.status} />,
              },
              {
                accessorKey: "reimbursementStatus",
                header: "Reimbursement",
                cell: ({ row }: { row: { original: Expense } }) => (
                  <Badge
                    variant={
                      row.original.reimbursementStatus === "paid"
                        ? "default"
                        : row.original.reimbursementStatus === "approved"
                          ? "secondary"
                          : row.original.reimbursementStatus === "processing"
                            ? "outline"
                            : "destructive"
                    }
                  >
                    {row.original.reimbursementStatus.replace(/_/g, " ")}
                  </Badge>
                ),
              },
            ] as any
          }
          getRowId={(row) => row.id}
          pageSize={10}
          emptyMessage="No expenses match your search or filters"
          rowActions={[{ label: "View Details", action: handleExpenseClick }]}
        />
      ) : (
        <EmptyState
          icon={<Receipt className="h-12 w-12 text-muted-foreground/50" />}
          title="No expenses found"
          description={
            search || Object.keys(filters).length > 0
              ? "Try adjusting your search or filters"
              : "No expenses recorded yet"
          }
        />
      )}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
