import type {
  Expense,
  ExpenseStatus,
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentStatus,
  TimeEntry,
  TimeEntryStatus,
} from "@/types";

import { IDS } from "./ids";

const now = new Date().toISOString();
const tenantId = IDS.TENANT;

const baseEntity = {
  tenantId,
  createdAt: now,
  updatedAt: now,
  createdBy: IDS.USERS.ADMIN,
  updatedBy: IDS.USERS.ADMIN,
};

export const mockTimeEntries: TimeEntry[] = [
  {
    ...baseEntity,
    id: IDS.TIME_ENTRIES.ABC_ITR_1,
    userId: IDS.USERS.SENIOR_1,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    taskId: IDS.TASKS.ABC_ITR_COMPUTE,
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    description: "ITR computation - business income, capital gains, deductions",
    startTime: "2024-07-01T09:00:00Z",
    endTime: "2024-07-01T13:00:00Z",
    durationMinutes: 240,
    isBillable: true,
    billingRate: 2500,
    billedAmount: 10000,
    status: "approved",
    isRunning: false,
  },
  {
    ...baseEntity,
    id: IDS.TIME_ENTRIES.ABC_GST_1,
    userId: IDS.USERS.SENIOR_1,
    matterId: IDS.MATTERS.ABC_GST_Q1,
    taskId: IDS.TASKS.ABC_GST_RECON,
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    description: "GSTR-2A/2B reconciliation for Q1",
    startTime: "2024-06-25T10:00:00Z",
    endTime: "2024-06-25T14:30:00Z",
    durationMinutes: 270,
    isBillable: true,
    billingRate: 2500,
    billedAmount: 11250,
    status: "approved",
    isRunning: false,
  },
  {
    ...baseEntity,
    id: IDS.TIME_ENTRIES.XYZ_ITR_1,
    userId: IDS.USERS.SENIOR_1,
    matterId: IDS.MATTERS.XYZ_ITR_FY24,
    taskId: IDS.TASKS.XYZ_ITR_COLLECT,
    clientId: IDS.CLIENTS.XYZ_LLP,
    description: "Document collection and initial review for LLP ITR",
    startTime: "2024-06-10T11:00:00Z",
    endTime: "2024-06-10T13:00:00Z",
    durationMinutes: 120,
    isBillable: true,
    billingRate: 2500,
    billedAmount: 5000,
    status: "submitted",
    isRunning: false,
  },
  {
    ...baseEntity,
    id: "time-global-itr-1" as any,
    userId: IDS.USERS.SENIOR_2,
    matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
    taskId: IDS.TASKS.GLOBAL_ITR_COMPUTE,
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    description: "Transfer pricing documentation review and ALP computation",
    startTime: "2024-07-05T09:00:00Z",
    endTime: "2024-07-05T14:00:00Z",
    durationMinutes: 300,
    isBillable: true,
    billingRate: 3000,
    billedAmount: 15000,
    status: "approved",
    isRunning: false,
  },
  {
    ...baseEntity,
    id: "time-global-gst-1" as any,
    userId: IDS.USERS.SENIOR_2,
    matterId: IDS.MATTERS.GLOBAL_GST_Q1,
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    description: "GST reconciliation and return preparation for April",
    startTime: "2024-07-02T10:00:00Z",
    endTime: "2024-07-02T13:00:00Z",
    durationMinutes: 180,
    isBillable: true,
    billingRate: 3000,
    billedAmount: 9000,
    status: "submitted",
    isRunning: false,
  },
];

export const mockInvoices: Invoice[] = [
  {
    ...baseEntity,
    id: IDS.INVOICES.ABC_ITR_INV,
    invoiceNumber: "INV-ABC-24-001",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    issueDate: "2024-07-01",
    dueDate: "2024-08-01",
    status: "sent",
    paymentStatus: "unpaid",
    currency: "INR",
    subtotal: 50000,
    taxAmount: 9000,
    discountAmount: 0,
    totalAmount: 59000,
    paidAmount: 0,
    balanceAmount: 59000,
    lineItems: [
      {
        id: "li-abc-itr-1" as any,
        description: "ITR Filing Service - FY 2024-25 (AY 2025-26)",
        quantity: 1,
        unitPrice: 50000,
        taxRate: 18,
        taxAmount: 9000,
        discount: 0,
        total: 59000,
        matterId: IDS.MATTERS.ABC_ITR_FY24,
        serviceType: "itr",
        timeEntryIds: [],
      },
    ],
    notes: "Payment due within 30 days",
    termsAndConditions: "Standard terms apply. Late payment interest @ 18% p.a.",
    sentAt: "2024-07-01T10:00:00Z",
  },
  {
    ...baseEntity,
    id: IDS.INVOICES.ABC_GST_INV,
    invoiceNumber: "INV-ABC-24-002",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_GST_Q1,
    issueDate: "2024-07-01",
    dueDate: "2024-07-31",
    status: "sent",
    paymentStatus: "partially_paid",
    currency: "INR",
    subtotal: 45000,
    taxAmount: 8100,
    discountAmount: 0,
    totalAmount: 53100,
    paidAmount: 25000,
    balanceAmount: 28100,
    lineItems: [
      {
        id: "li-abc-gst-1" as any,
        description: "GST Monthly Return Filing - Q1 FY 2024-25 (Apr-Jun)",
        quantity: 3,
        unitPrice: 15000,
        taxRate: 18,
        taxAmount: 8100,
        discount: 0,
        total: 53100,
        matterId: IDS.MATTERS.ABC_GST_Q1,
        serviceType: "gst_monthly",
        timeEntryIds: [],
      },
    ],
    notes: "Partial payment received",
    sentAt: "2024-07-01T10:00:00Z",
  },
  {
    ...baseEntity,
    id: IDS.INVOICES.XYZ_ITR_INV,
    invoiceNumber: "INV-XYZ-24-001",
    clientId: IDS.CLIENTS.XYZ_LLP,
    matterId: IDS.MATTERS.XYZ_ITR_FY24,
    issueDate: "2024-06-15",
    dueDate: "2024-07-15",
    status: "paid",
    paymentStatus: "paid",
    currency: "INR",
    subtotal: 35000,
    taxAmount: 6300,
    discountAmount: 0,
    totalAmount: 41300,
    paidAmount: 41300,
    balanceAmount: 0,
    lineItems: [
      {
        id: "li-xyz-itr-1" as any,
        description: "ITR-5 Filing - FY 2024-25",
        quantity: 1,
        unitPrice: 35000,
        taxRate: 18,
        taxAmount: 6300,
        discount: 0,
        total: 41300,
        matterId: IDS.MATTERS.XYZ_ITR_FY24,
        serviceType: "itr",
        timeEntryIds: [],
      },
    ],
    sentAt: "2024-06-15T10:00:00Z",
    paidAt: "2024-07-10T10:00:00Z",
  },
  {
    ...baseEntity,
    id: "inv-global-itr-001" as any,
    invoiceNumber: "INV-GLB-24-001",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
    issueDate: "2024-07-01",
    dueDate: "2024-08-01",
    status: "sent",
    paymentStatus: "unpaid",
    currency: "INR",
    subtotal: 75000,
    taxAmount: 13500,
    discountAmount: 0,
    totalAmount: 88500,
    paidAmount: 0,
    balanceAmount: 88500,
    lineItems: [
      {
        id: "li-glb-itr-1" as any,
        description: "ITR Filing with Transfer Pricing Documentation",
        quantity: 1,
        unitPrice: 75000,
        taxRate: 18,
        taxAmount: 13500,
        discount: 0,
        total: 88500,
        matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
        serviceType: "itr",
        timeEntryIds: [],
      },
    ],
    sentAt: "2024-07-01T10:00:00Z",
  },
  {
    ...baseEntity,
    id: "inv-rtl-gst-001" as any,
    invoiceNumber: "INV-RTL-24-001",
    clientId: IDS.CLIENTS.RETAIL_CHAIN,
    matterId: IDS.MATTERS.RETAIL_GST_Q1,
    issueDate: "2024-06-01",
    dueDate: "2024-07-01",
    status: "overdue",
    paymentStatus: "overdue",
    currency: "INR",
    subtotal: 90000,
    taxAmount: 16200,
    discountAmount: 0,
    totalAmount: 106200,
    paidAmount: 0,
    balanceAmount: 106200,
    lineItems: [
      {
        id: "li-rtl-gst-1" as any,
        description: "GST Multi-state Monthly Filing - Q1 FY 2024-25",
        quantity: 3,
        unitPrice: 30000,
        taxRate: 18,
        taxAmount: 16200,
        discount: 0,
        total: 106200,
        matterId: IDS.MATTERS.RETAIL_GST_Q1,
        serviceType: "gst_monthly",
        timeEntryIds: [],
      },
    ],
    notes: "OVERDUE - Follow up required",
    sentAt: "2024-06-01T10:00:00Z",
  },
];

export const mockPayments: Payment[] = [
  {
    ...baseEntity,
    id: IDS.PAYMENTS.ABC_ITR_PAY,
    paymentNumber: "PAY-ABC-24-001",
    invoiceId: IDS.INVOICES.ABC_GST_INV,
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    amount: 25000,
    currency: "INR",
    paymentDate: "2024-07-15",
    paymentMethod: "bank_transfer",
    referenceNumber: "NEFT123456789",
    bankReference: "AXIS240715001",
    notes: "Partial payment for GST Q1 invoice",
    status: "cleared",
    allocatedInvoices: [{ invoiceId: IDS.INVOICES.ABC_GST_INV, amount: 25000 }],
    receivedById: IDS.USERS.SUPPORT_1,
  },
  {
    ...baseEntity,
    id: IDS.PAYMENTS.XYZ_ITR_PAY,
    paymentNumber: "PAY-XYZ-24-001",
    invoiceId: IDS.INVOICES.XYZ_ITR_INV,
    clientId: IDS.CLIENTS.XYZ_LLP,
    amount: 41300,
    currency: "INR",
    paymentDate: "2024-07-10",
    paymentMethod: "upi",
    referenceNumber: "UPI240710001234",
    notes: "Full payment for ITR invoice",
    status: "cleared",
    allocatedInvoices: [{ invoiceId: IDS.INVOICES.XYZ_ITR_INV, amount: 41300 }],
    receivedById: IDS.USERS.SUPPORT_1,
  },
];

export const mockExpenses: Expense[] = [
  {
    ...baseEntity,
    id: IDS.EXPENSES.ABC_TRAVEL,
    expenseNumber: "EXP-ABC-24-001",
    userId: IDS.USERS.SENIOR_1,
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_AUDIT_FY24,
    category: "travel",
    description: "Travel to client site for audit planning meeting",
    amount: 3500,
    currency: "INR",
    expenseDate: "2024-07-05",
    receiptUrl: "/mock-receipts/travel-abc-001.pdf",
    status: "approved",
    isReimbursable: true,
    reimbursementStatus: "approved",
    approvedById: IDS.USERS.MANAGER_2,
    approvedAt: "2024-07-06T10:00:00Z",
  },
  {
    ...baseEntity,
    id: "exp-global-meals-001" as any,
    expenseNumber: "EXP-GLB-24-001",
    userId: IDS.USERS.SENIOR_2,
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
    category: "meals",
    description: "Client meeting lunch - TP documentation discussion",
    amount: 2200,
    currency: "INR",
    expenseDate: "2024-06-20",
    receiptUrl: "/mock-receipts/meals-global-001.pdf",
    status: "approved",
    isReimbursable: true,
    reimbursementStatus: "paid",
    approvedById: IDS.USERS.PARTNER_2,
    approvedAt: "2024-06-21T10:00:00Z",
    paidAt: "2024-06-25T10:00:00Z",
  },
];

export const getTimeEntriesByUser = (userId: string): TimeEntry[] => mockTimeEntries.filter((t) => t.userId === userId);

export const getTimeEntriesByMatter = (matterId: string): TimeEntry[] =>
  mockTimeEntries.filter((t) => t.matterId === matterId);

export const getTimeEntriesByTask = (taskId: string): TimeEntry[] => mockTimeEntries.filter((t) => t.taskId === taskId);

export const getTimeEntriesByStatus = (status: TimeEntryStatus): TimeEntry[] =>
  mockTimeEntries.filter((t) => t.status === status);

export const getInvoicesByClient = (clientId: string): Invoice[] => mockInvoices.filter((i) => i.clientId === clientId);

export const getInvoicesByStatus = (status: InvoiceStatus): Invoice[] =>
  mockInvoices.filter((i) => i.status === status);

export const getInvoicesByPaymentStatus = (paymentStatus: PaymentStatus): Invoice[] =>
  mockInvoices.filter((i) => i.paymentStatus === paymentStatus);

export const getOverdueInvoices = (): Invoice[] => {
  const today = new Date();
  return mockInvoices.filter((i) => new Date(i.dueDate) < today && i.paymentStatus !== "paid");
};

export const getInvoiceById = (id: string): Invoice | undefined => mockInvoices.find((i) => i.id === id);

export const getPaymentsByClient = (clientId: string): Payment[] => mockPayments.filter((p) => p.clientId === clientId);

export const getPaymentsByInvoice = (invoiceId: string): Payment[] =>
  mockPayments.filter((p) => p.invoiceId === invoiceId);

export const getPaymentById = (id: string): Payment | undefined => mockPayments.find((p) => p.id === id);

export const getExpensesByUser = (userId: string): Expense[] => mockExpenses.filter((e) => e.userId === userId);

export const getExpensesByClient = (clientId: string): Expense[] => mockExpenses.filter((e) => e.clientId === clientId);

export const getExpensesByStatus = (status: ExpenseStatus): Expense[] =>
  mockExpenses.filter((e) => e.status === status);

export const getExpenseById = (id: string): Expense | undefined => mockExpenses.find((e) => e.id === id);

export const getOutstandingByClient = (clientId: string) => {
  const clientInvoices = getInvoicesByClient(clientId);
  const totalOutstanding = clientInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);
  const overdueAmount = clientInvoices
    .filter((i) => new Date(i.dueDate) < new Date() && i.paymentStatus !== "paid")
    .reduce((sum, i) => sum + i.balanceAmount, 0);
  return { invoices: clientInvoices, totalOutstanding, overdueAmount };
};
