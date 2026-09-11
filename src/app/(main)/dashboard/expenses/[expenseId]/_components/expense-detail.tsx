"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ChevronLeft, Clock, CreditCard, FileText, Receipt } from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { ClientLink, MatterLink, UserLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { ExpenseRecordHeader } from "@/components/ca-nexus/record-header";
import { ExpenseStatusBadge, ReimbursementStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatINR } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import { getExpenseById } from "@/mock-data/time-billing";
import { getUserById } from "@/mock-data/users";
import type { Expense } from "@/types";

const expenseTabs = [
  { id: "overview", label: "Overview", icon: FileText },
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
    | "signoff"
    | "expense";
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

export function ExpenseDetail({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const expense = getExpenseById(expenseId);
  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Receipt className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Expense not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The expense you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/expenses")}
          className="text-primary hover:underline"
        >
          Back to Expenses
        </button>
      </div>
    );
  }

  const client = expense.clientId ? getClientById(expense.clientId) : undefined;
  const matter = expense.matterId ? getMatterById(expense.matterId) : undefined;
  const employee = getUserById(expense.userId);
  const approvedBy = expense.approvedById ? getUserById(expense.approvedById) : undefined;

  const allActivities: ActivityItem[] = [
    {
      id: `expense-created`,
      type: "expense" as const,
      title: `Expense Created: ${expense.expenseNumber}`,
      description: `${expense.category} • ${formatINR(expense.amount)}`,
      user: employee,
      timestamp: expense.createdAt,
      entityUrl: "#",
      status: expense.status,
    },
    ...(expense.approvedAt
      ? [
          {
            id: `expense-approved`,
            type: "expense" as const,
            title: `Expense Approved`,
            description: `Approved by ${approvedBy?.fullName || "—"}`,
            user: approvedBy,
            timestamp: expense.approvedAt,
            entityUrl: "#",
            status: "approved",
          },
        ]
      : []),
    ...(expense.paidAt
      ? [
          {
            id: `expense-paid`,
            type: "payment" as const,
            title: `Expense Paid/Reimbursed`,
            description: `Reimbursement: ${expense.reimbursementStatus}`,
            timestamp: expense.paidAt,
            entityUrl: "#",
            status: expense.reimbursementStatus,
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <ExpenseRecordHeader
        expense={expense}
        client={client}
        matter={matter}
        actions={
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/expenses")}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Expenses
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {expenseTabs.map((tab) => (
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
          <ExpenseOverviewTab
            expense={expense}
            client={client}
            matter={matter}
            employee={employee}
            approvedBy={approvedBy}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ExpenseActivityTab activities={allActivities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExpenseOverviewTab({
  expense,
  client,
  matter,
  employee,
  approvedBy,
}: {
  expense: Expense;
  client: any;
  matter: any;
  employee: any;
  approvedBy: any;
}) {
  const _isOverdue =
    expense.reimbursementStatus === "pending" &&
    new Date(expense.expenseDate) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Status"
          value={<ExpenseStatusBadge status={expense.status} />}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile
          label="Reimbursement"
          value={<ReimbursementStatusBadge status={expense.reimbursementStatus} />}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatTile label="Amount" value={formatINR(expense.amount)} icon={<CreditCard className="h-5 w-5" />} />
        <StatTile
          label="Category"
          value={<Badge variant="secondary">{expense.category.replace(/_/g, " ")}</Badge>}
          icon={<Receipt className="h-5 w-5" />}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Expense Details">
          <KeyValueList
            items={[
              { label: "Expense Number", value: expense.expenseNumber },
              { label: "Category", value: expense.category.replace(/_/g, " ") },
              { label: "Description", value: expense.description },
              { label: "Expense Date", value: formatDate(expense.expenseDate) },
              { label: "Amount", value: formatINR(expense.amount) },
              { label: "Currency", value: expense.currency },
              {
                label: "Receipt",
                value: expense.receiptUrl ? (
                  <a
                    href={expense.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Receipt
                  </a>
                ) : (
                  "—"
                ),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Approval & Reimbursement">
          <KeyValueList
            items={[
              { label: "Employee", value: employee?.fullName || "—" },
              { label: "Submitted", value: formatDate(expense.createdAt) },
              { label: "Status", value: <ExpenseStatusBadge status={expense.status} /> },
              { label: "Reimbursement", value: <ReimbursementStatusBadge status={expense.reimbursementStatus} /> },
              { label: "Approved By", value: approvedBy?.fullName || "—" },
              { label: "Approved At", value: expense.approvedAt ? formatDate(expense.approvedAt) : "—" },
              { label: "Paid At", value: expense.paidAt ? formatDate(expense.paidAt) : "—" },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Linked Entities">
        <div className="grid gap-4 md:grid-cols-3">
          {client && <ClientLink client={client} showStatus={true} />}
          {matter && <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />}
          {employee && <UserLink user={employee} showRole={true} />}
        </div>
      </SectionCard>

      {expense.receiptUrl && (
        <SectionCard title="Receipt">
          <div className="text-center">
            <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
              <img src={expense.receiptUrl} alt="Receipt" className="max-h-64 max-w-full rounded-lg border shadow-sm" />
            </a>
            <p className="mt-2 text-muted-foreground text-sm">Click to view full size</p>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function ExpenseActivityTab({ activities }: { activities: ActivityItem[] }) {
  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={activities} grouped maxItems={50} />
    </SectionCard>
  );
}
