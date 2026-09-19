import type {
  ComplianceCycle,
  ComplianceStatus,
  DocumentRequest,
  DocumentType,
  MissingDocument,
  ReviewStage,
  ReviewStatus,
  ServiceType,
  UserRole,
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

const fy24Period = {
  label: "FY 2024-25",
  startDate: "2024-04-01",
  endDate: "2025-03-31",
  financialYear: "2024-25",
  assessmentYear: "2025-26",
};

const q1Period = {
  label: "Q1 2024-25 (Apr-Jun)",
  startDate: "2024-04-01",
  endDate: "2024-06-30",
  financialYear: "2024-25",
};

const aprPeriod = {
  label: "April 2024",
  startDate: "2024-04-01",
  endDate: "2024-04-30",
  financialYear: "2024-25",
};

const mayPeriod = {
  label: "May 2024",
  startDate: "2024-05-01",
  endDate: "2024-05-31",
  financialYear: "2024-25",
};

const createMissingDocs = (types: { type: string; mandatory: boolean; received?: boolean }[]): MissingDocument[] =>
  types.map((t, i) => ({
    documentType: t.type as DocumentType,
    description: `Required for filing`,
    isMandatory: t.mandatory,
    requestedAt: t.received ? "2024-05-01T10:00:00Z" : "2024-05-15T10:00:00Z",
    receivedAt: t.received ? "2024-06-10T10:00:00Z" : undefined,
    documentId: t.received ? `doc-${i}` : undefined,
  }));

const getReviewStageName = (index: number): string => {
  switch (index) {
    case 0:
      return "Senior Review";
    case 1:
      return "Manager Review";
    default:
      return "Partner Review";
  }
};

const getReviewStageStatus = (index: number, completed: number): ReviewStatus => {
  if (index < completed) return "completed";
  if (index === completed) return "in_progress";
  return "pending";
};

const createReviewStages = (count: number, completed: number): ReviewStage[] =>
  Array.from({ length: count }, (_, i) => ({
    stageNumber: i + 1,
    name: getReviewStageName(i),
    reviewerId: [IDS.USERS.SENIOR_1, IDS.USERS.MANAGER_1, IDS.USERS.PARTNER_1][i],
    reviewerRole: ["senior_associate", "manager", "partner"][i] as UserRole,
    status: getReviewStageStatus(i, completed),
    startedAt: i <= completed ? "2024-07-01T10:00:00Z" : undefined,
    completedAt: i < completed ? "2024-07-05T10:00:00Z" : undefined,
    action: i < completed ? "approve" : undefined,
    comments: i < completed ? "Reviewed and approved" : undefined,
  }));

export const mockComplianceCycles: ComplianceCycle[] = [
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.ABC_ITR_FY24,
    cycleNumber: "CC-ABC-ITR-24-001",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    serviceType: "itr",
    serviceName: "Income Tax Return Filing",
    period: fy24Period,
    status: "processing",
    priority: "high",
    assignedUserId: IDS.USERS.SENIOR_1,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-10-31",
    extendedDueDate: undefined,
    filingDate: undefined,
    acknowledgmentNumber: undefined,
    acknowledgmentDate: undefined,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: true },
      { type: "form_26as", mandatory: true, received: true },
      { type: "tax_returns", mandatory: true, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [
      {
        campaignId: IDS.CAMPAIGNS.ITR_REMINDER_MAY,
        name: "ITR Filing Reminder - May 2024",
        channel: "email",
        sentAt: "2024-05-15T10:00:00Z",
        status: "sent",
        responses: 2,
      },
    ],
    reviewStages: createReviewStages(3, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.ABC_GST_APR,
    cycleNumber: "CC-ABC-GST-24-001",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    serviceType: "gst_monthly",
    serviceName: "GST Monthly Return Filing",
    period: aprPeriod,
    status: "ready_for_review",
    priority: "high",
    assignedUserId: IDS.USERS.SENIOR_1,
    assignedTeamId: IDS.TEAMS.GST,
    dueDate: "2024-05-11",
    extendedDueDate: undefined,
    filingDate: undefined,
    acknowledgmentNumber: undefined,
    acknowledgmentDate: undefined,
    matterId: IDS.MATTERS.ABC_GST_Q1,
    missingDocuments: createMissingDocs([
      { type: "invoices", mandatory: true, received: true },
      { type: "bank_statements", mandatory: false, received: true },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 1),
    currentStage: 1,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.ABC_GST_MAY,
    cycleNumber: "CC-ABC-GST-24-002",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    serviceType: "gst_monthly",
    serviceName: "GST Monthly Return Filing",
    period: mayPeriod,
    status: "documents_pending",
    priority: "high",
    assignedUserId: IDS.USERS.SENIOR_1,
    assignedTeamId: IDS.TEAMS.GST,
    dueDate: "2024-06-11",
    extendedDueDate: undefined,
    filingDate: undefined,
    acknowledgmentNumber: undefined,
    acknowledgmentDate: undefined,
    matterId: IDS.MATTERS.ABC_GST_Q1,
    missingDocuments: createMissingDocs([
      { type: "invoices", mandatory: true, received: false },
      { type: "bank_statements", mandatory: false, received: false },
    ]),
    documentRequests: [
      {
        ...baseEntity,
        id: "dr-abc-gst-may",
        clientId: IDS.CLIENTS.ABC_PVT_LTD,
        matterId: IDS.MATTERS.ABC_GST_Q1,
        complianceCycleId: IDS.COMPLIANCE_CYCLES.ABC_GST_MAY,
        requestedById: IDS.USERS.SENIOR_1,
        items: [
          {
            documentType: "invoices",
            description: "B2B and B2C invoices for May 2024",
            isMandatory: true,
            isReceived: false,
          },
          {
            documentType: "bank_statements",
            description: "Bank statement for May 2024",
            isMandatory: false,
            isReceived: false,
          },
        ],
        sentAt: "2024-05-20T10:00:00Z",
        reminderCount: 1,
        lastReminderAt: "2024-06-01T10:00:00Z",
        status: "sent",
      },
    ],
    outreachCampaigns: [
      {
        campaignId: IDS.CAMPAIGNS.GST_REMINDER_APR,
        name: "GST Document Collection - May 2024",
        channel: "whatsapp",
        sentAt: "2024-05-25T10:00:00Z",
        status: "sent",
        responses: 1,
      },
    ],
    reviewStages: createReviewStages(2, 0),
    currentStage: 0,
    isOverdue: true,
    daysOverdue: 15,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.ABC_GST_JUN,
    cycleNumber: "CC-ABC-GST-24-003",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    serviceType: "gst_monthly",
    serviceName: "GST Monthly Return Filing",
    period: { label: "June 2024", startDate: "2024-06-01", endDate: "2024-06-30", financialYear: "2024-25" },
    status: "not_started",
    priority: "medium",
    assignedUserId: IDS.USERS.SENIOR_1,
    assignedTeamId: IDS.TEAMS.GST,
    dueDate: "2024-07-11",
    matterId: IDS.MATTERS.ABC_GST_Q1,
    missingDocuments: createMissingDocs([
      { type: "invoices", mandatory: true, received: false },
      { type: "bank_statements", mandatory: false, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.ABC_TDS_Q1,
    cycleNumber: "CC-ABC-TDS-24-001",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    serviceType: "tds_24q",
    serviceName: "TDS Return Filing (24Q)",
    period: q1Period,
    status: "documents_pending",
    priority: "medium",
    assignedUserId: IDS.USERS.ASSOCIATE_1,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-07-31",
    matterId: IDS.MATTERS.ABC_TDS_Q1,
    missingDocuments: createMissingDocs([
      { type: "challans", mandatory: true, received: false },
      { type: "form_16", mandatory: true, received: true },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.XYZ_ITR_FY24,
    cycleNumber: "CC-XYZ-ITR-24-001",
    clientId: IDS.CLIENTS.XYZ_LLP,
    serviceType: "itr",
    serviceName: "ITR Filing for LLP",
    period: fy24Period,
    status: "identification",
    priority: "medium",
    assignedUserId: IDS.USERS.SENIOR_1,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-10-31",
    matterId: IDS.MATTERS.XYZ_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: false },
      { type: "tax_returns", mandatory: true, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(3, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.XYZ_GST_APR,
    cycleNumber: "CC-XYZ-GST-24-001",
    clientId: IDS.CLIENTS.XYZ_LLP,
    serviceType: "gst_quarterly",
    serviceName: "GST Quarterly Return (QRMP)",
    period: aprPeriod,
    status: "completed",
    priority: "medium",
    assignedUserId: IDS.USERS.ASSOCIATE_1,
    assignedTeamId: IDS.TEAMS.GST,
    dueDate: "2024-05-13",
    filingDate: "2024-05-12",
    acknowledgmentNumber: "GST240512001",
    acknowledgmentDate: "2024-05-12",
    matterId: IDS.MATTERS.XYZ_GST_MONTHLY,
    missingDocuments: createMissingDocs([{ type: "invoices", mandatory: true, received: true }]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 2),
    currentStage: 2,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.XYZ_GST_MAY,
    cycleNumber: "CC-XYZ-GST-24-002",
    clientId: IDS.CLIENTS.XYZ_LLP,
    serviceType: "gst_quarterly",
    serviceName: "GST Quarterly Return (QRMP)",
    period: mayPeriod,
    status: "documents_pending",
    priority: "medium",
    assignedUserId: IDS.USERS.ASSOCIATE_1,
    assignedTeamId: IDS.TEAMS.GST,
    dueDate: "2024-06-13",
    matterId: IDS.MATTERS.XYZ_GST_MONTHLY,
    missingDocuments: createMissingDocs([{ type: "invoices", mandatory: true, received: false }]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 0),
    currentStage: 0,
    isOverdue: true,
    daysOverdue: 10,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.SHARMA_ITR_FY24,
    cycleNumber: "CC-SHA-ITR-24-001",
    clientId: IDS.CLIENTS.SHARMA_PROP,
    serviceType: "itr",
    serviceName: "ITR Filing for Proprietorship",
    period: fy24Period,
    status: "not_started",
    priority: "low",
    assignedUserId: IDS.USERS.ASSOCIATE_1,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-07-31",
    matterId: IDS.MATTERS.SHARMA_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: false },
      { type: "tax_returns", mandatory: true, received: false },
      { type: "form_26as", mandatory: true, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.GLOBAL_ITR_FY24,
    cycleNumber: "CC-GLB-ITR-24-001",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    serviceType: "itr",
    serviceName: "ITR Filing",
    period: fy24Period,
    status: "processing",
    priority: "critical",
    assignedUserId: IDS.USERS.SENIOR_2,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-10-31",
    matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: true },
      { type: "form_26as", mandatory: true, received: true },
      { type: "tax_returns", mandatory: true, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [
      {
        campaignId: IDS.CAMPAIGNS.ITR_REMINDER_MAY,
        name: "ITR Filing Reminder - May 2024",
        channel: "email",
        sentAt: "2024-05-15T10:00:00Z",
        status: "sent",
        responses: 1,
      },
    ],
    reviewStages: createReviewStages(3, 1),
    currentStage: 1,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.GLOBAL_GST_APR,
    cycleNumber: "CC-GLB-GST-24-001",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    serviceType: "gst_monthly",
    serviceName: "GST Monthly Filing",
    period: aprPeriod,
    status: "in_review",
    priority: "high",
    assignedUserId: IDS.USERS.SENIOR_2,
    assignedTeamId: IDS.TEAMS.GST,
    dueDate: "2024-05-11",
    matterId: IDS.MATTERS.GLOBAL_GST_Q1,
    missingDocuments: createMissingDocs([
      { type: "invoices", mandatory: true, received: true },
      { type: "bank_statements", mandatory: false, received: true },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 1),
    currentStage: 1,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.GLOBAL_TDS_Q1,
    cycleNumber: "CC-GLB-TDS-24-001",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    serviceType: "tds_26q",
    serviceName: "TDS Non-Salary (26Q)",
    period: q1Period,
    status: "ready_for_review",
    priority: "medium",
    assignedUserId: IDS.USERS.ASSOCIATE_2,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-07-31",
    matterId: IDS.MATTERS.GLOBAL_TDS_Q1,
    missingDocuments: createMissingDocs([{ type: "challans", mandatory: true, received: true }]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 1),
    currentStage: 1,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.TECH_ITR_FY24,
    cycleNumber: "CC-TECH-ITR-24-001",
    clientId: IDS.CLIENTS.TECH_STARTUP,
    serviceType: "itr",
    serviceName: "ITR Filing",
    period: fy24Period,
    status: "identification",
    priority: "medium",
    assignedUserId: IDS.USERS.SENIOR_2,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-10-31",
    matterId: IDS.MATTERS.TECH_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: false },
      { type: "tax_returns", mandatory: true, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(3, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.TECH_GST_APR,
    cycleNumber: "CC-TECH-GST-24-001",
    clientId: IDS.CLIENTS.TECH_STARTUP,
    serviceType: "gst_monthly",
    serviceName: "GST Monthly Filing",
    period: aprPeriod,
    status: "documents_pending",
    priority: "medium",
    assignedUserId: IDS.USERS.ASSOCIATE_2,
    assignedTeamId: IDS.TEAMS.GST,
    dueDate: "2024-05-11",
    matterId: IDS.MATTERS.TECH_GST_Q1,
    missingDocuments: createMissingDocs([{ type: "invoices", mandatory: true, received: false }]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 0),
    currentStage: 0,
    isOverdue: true,
    daysOverdue: 35,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.RETAIL_ITR_FY24,
    cycleNumber: "CC-RTL-ITR-24-001",
    clientId: IDS.CLIENTS.RETAIL_CHAIN,
    serviceType: "itr",
    serviceName: "ITR Filing",
    period: fy24Period,
    status: "processing",
    priority: "high",
    assignedUserId: IDS.USERS.SENIOR_1,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-10-31",
    matterId: IDS.MATTERS.RETAIL_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: true },
      { type: "form_26as", mandatory: true, received: true },
      { type: "tax_returns", mandatory: true, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(3, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.RETAIL_GST_APR,
    cycleNumber: "CC-RTL-GST-24-001",
    clientId: IDS.CLIENTS.RETAIL_CHAIN,
    serviceType: "gst_monthly",
    serviceName: "GST Monthly Filing (Multi-state)",
    period: aprPeriod,
    status: "overdue",
    priority: "urgent",
    assignedUserId: IDS.USERS.SENIOR_1,
    assignedTeamId: IDS.TEAMS.GST,
    dueDate: "2024-05-11",
    matterId: IDS.MATTERS.RETAIL_GST_Q1,
    missingDocuments: createMissingDocs([
      { type: "invoices", mandatory: true, received: false },
      { type: "bank_statements", mandatory: false, received: false },
    ]),
    documentRequests: [
      {
        ...baseEntity,
        id: "dr-rtl-gst-apr",
        clientId: IDS.CLIENTS.RETAIL_CHAIN,
        matterId: IDS.MATTERS.RETAIL_GST_Q1,
        complianceCycleId: IDS.COMPLIANCE_CYCLES.RETAIL_GST_APR,
        requestedById: IDS.USERS.SENIOR_1,
        items: [
          {
            documentType: "invoices",
            description: "Multi-state invoices for April 2024",
            isMandatory: true,
            isReceived: false,
          },
          {
            documentType: "bank_statements",
            description: "Consolidated bank statement",
            isMandatory: false,
            isReceived: false,
          },
        ],
        sentAt: "2024-04-20T10:00:00Z",
        reminderCount: 3,
        lastReminderAt: "2024-06-15T10:00:00Z",
        status: "reminder_sent",
      },
    ],
    outreachCampaigns: [
      {
        campaignId: IDS.CAMPAIGNS.GST_REMINDER_APR,
        name: "GST Document Collection - April 2024",
        channel: "email",
        sentAt: "2024-04-25T10:00:00Z",
        status: "sent",
        responses: 0,
      },
    ],
    reviewStages: createReviewStages(2, 0),
    currentStage: 0,
    isOverdue: true,
    daysOverdue: 55,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.MFG_ITR_FY24,
    cycleNumber: "CC-MFG-ITR-24-001",
    clientId: IDS.CLIENTS.MANUFACTURING_CO,
    serviceType: "itr",
    serviceName: "ITR Filing",
    period: fy24Period,
    status: "processing",
    priority: "high",
    assignedUserId: IDS.USERS.SENIOR_2,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-10-31",
    matterId: IDS.MATTERS.MFG_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: true },
      { type: "form_26as", mandatory: true, received: true },
      { type: "tax_returns", mandatory: true, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(3, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.MFG_GST_APR,
    cycleNumber: "CC-MFG-GST-24-001",
    clientId: IDS.CLIENTS.MANUFACTURING_CO,
    serviceType: "gst_monthly",
    serviceName: "GST Monthly Filing",
    period: aprPeriod,
    status: "ready_for_review",
    priority: "high",
    assignedUserId: IDS.USERS.ASSOCIATE_2,
    assignedTeamId: IDS.TEAMS.GST,
    dueDate: "2024-05-11",
    matterId: IDS.MATTERS.MFG_GST_Q1,
    missingDocuments: createMissingDocs([
      { type: "invoices", mandatory: true, received: true },
      { type: "bank_statements", mandatory: false, received: true },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(2, 1),
    currentStage: 1,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.HEALTH_ITR_FY24,
    cycleNumber: "CC-HLT-ITR-24-001",
    clientId: IDS.CLIENTS.HEALTHCARE_PVT,
    serviceType: "itr",
    serviceName: "ITR Filing",
    period: fy24Period,
    status: "identification",
    priority: "medium",
    assignedUserId: IDS.USERS.SENIOR_2,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-10-31",
    matterId: IDS.MATTERS.HEALTH_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: false },
      { type: "tax_returns", mandatory: true, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(3, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.FINTECH_ITR_FY24,
    cycleNumber: "CC-FIN-ITR-24-001",
    clientId: IDS.CLIENTS.FINTECH_LLP,
    serviceType: "itr",
    serviceName: "ITR Filing for LLP",
    period: fy24Period,
    status: "completed",
    priority: "medium",
    assignedUserId: IDS.USERS.SENIOR_2,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-10-31",
    filingDate: "2024-06-28",
    acknowledgmentNumber: "ITR240628001",
    acknowledgmentDate: "2024-06-28",
    matterId: IDS.MATTERS.FINTECH_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: true },
      { type: "tax_returns", mandatory: true, received: true },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(3, 3),
    currentStage: 3,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    ...baseEntity,
    id: IDS.COMPLIANCE_CYCLES.REAL_ITR_FY24,
    cycleNumber: "CC-REA-ITR-24-001",
    clientId: IDS.CLIENTS.REAL_ESTATE,
    serviceType: "itr",
    serviceName: "ITR Filing",
    period: fy24Period,
    status: "processing",
    priority: "high",
    assignedUserId: IDS.USERS.SENIOR_1,
    assignedTeamId: IDS.TEAMS.TAXATION,
    dueDate: "2024-10-31",
    matterId: IDS.MATTERS.REAL_ITR_FY24,
    missingDocuments: createMissingDocs([
      { type: "financial_statements", mandatory: true, received: true },
      { type: "form_26as", mandatory: true, received: true },
      { type: "tax_returns", mandatory: true, received: false },
    ]),
    documentRequests: [],
    outreachCampaigns: [],
    reviewStages: createReviewStages(3, 0),
    currentStage: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
];

export const getComplianceCyclesByClient = (clientId: string): ComplianceCycle[] =>
  mockComplianceCycles.filter((c) => c.clientId === clientId);

export const getComplianceCyclesByUser = (userId: string): ComplianceCycle[] =>
  mockComplianceCycles.filter((c) => c.assignedUserId === userId);

export const getComplianceCyclesByStatus = (status: ComplianceStatus): ComplianceCycle[] =>
  mockComplianceCycles.filter((c) => c.status === status);

export const getComplianceCyclesByServiceType = (serviceType: ServiceType): ComplianceCycle[] =>
  mockComplianceCycles.filter((c) => c.serviceType === serviceType);

export const getOverdueComplianceCycles = (): ComplianceCycle[] => mockComplianceCycles.filter((c) => c.isOverdue);

export const getComplianceCycleById = (id: string): ComplianceCycle | undefined =>
  mockComplianceCycles.find((c) => c.id === id);

export const getComplianceSummary = () => {
  const total = mockComplianceCycles.length;
  const overdue = mockComplianceCycles.filter((c) => c.isOverdue).length;
  const dueSoon = mockComplianceCycles.filter(
    (c) => !c.isOverdue && c.status !== "completed" && c.status !== "closed",
  ).length;
  const pendingDocs = mockComplianceCycles.filter((c) =>
    c.missingDocuments.some((d) => d.isMandatory && !d.receivedAt),
  ).length;
  const readyForReview = mockComplianceCycles.filter(
    (c) => c.status === "ready_for_review" || c.status === "in_review",
  ).length;
  const completed = mockComplianceCycles.filter((c) => c.status === "completed" || c.status === "filed").length;

  const byServiceType: Record<string, { total: number; pending: number; overdue: number; completed: number }> = {};
  for (const cycle of mockComplianceCycles) {
    if (!byServiceType[cycle.serviceType]) {
      byServiceType[cycle.serviceType] = { total: 0, pending: 0, overdue: 0, completed: 0 };
    }
    byServiceType[cycle.serviceType].total++;
    if (cycle.isOverdue) byServiceType[cycle.serviceType].overdue++;
    if (cycle.status === "completed" || cycle.status === "filed") byServiceType[cycle.serviceType].completed++;
    else if (cycle.status !== "not_started" && cycle.status !== "identification")
      byServiceType[cycle.serviceType].pending++;
  }

  return {
    total,
    overdue,
    dueSoon,
    pendingDocuments: pendingDocs,
    readyForReview,
    completed,
    byServiceType,
  };
};

export const getDocumentRequestsByComplianceCycle = (complianceCycleId: string): DocumentRequest[] => {
  const cycle = mockComplianceCycles.find((c) => c.id === complianceCycleId);
  return cycle?.documentRequests || [];
};

export const getDocumentRequestById = (
  requestId: string,
): (DocumentRequest & { complianceCycleId: string; complianceCycleName: string }) | undefined => {
  for (const cycle of mockComplianceCycles) {
    const request = cycle.documentRequests.find((r) => r.id === requestId);
    if (request) return { ...request, complianceCycleId: cycle.id, complianceCycleName: cycle.serviceName };
  }
  return undefined;
};

export const getAllDocumentRequests = (): (DocumentRequest & {
  complianceCycleId: string;
  complianceCycleName: string;
})[] => {
  const result: (DocumentRequest & { complianceCycleId: string; complianceCycleName: string })[] = [];
  for (const cycle of mockComplianceCycles) {
    for (const request of cycle.documentRequests) {
      result.push({ ...request, complianceCycleId: cycle.id, complianceCycleName: cycle.serviceName });
    }
  }
  return result;
};
