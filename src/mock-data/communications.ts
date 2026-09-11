import type { Campaign, CampaignStatus, Communication, CommunicationParticipant, Conversation } from "@/types";

import { IDS } from "./ids";
// biome-ignore lint/suspicious/noImportCycles: Mock data cross-references are intentional
import { mockMatters, mockTasks } from "./matters";

const now = new Date().toISOString();
const tenantId = IDS.TENANT;

const baseEntity = {
  tenantId,
  createdAt: now,
  updatedAt: now,
  createdBy: IDS.USERS.ADMIN,
  updatedBy: IDS.USERS.ADMIN,
};

const createParticipant = (
  type: CommunicationParticipant["type"],
  id: string,
  name: string,
  email?: string,
  phone?: string,
): CommunicationParticipant => ({
  type,
  id: id as any,
  name,
  email,
  phone,
});

export const mockCommunications: Communication[] = [
  {
    ...baseEntity,
    id: IDS.COMMUNICATIONS.ABC_EMAIL_1,
    communicationNumber: "COMM-ABC-001",
    channel: "email",
    direction: "inbound",
    subject: "Documents for ITR Filing FY 2024-25",
    content:
      "Dear Team,\n\nPlease find attached the audited financial statements, Form 26AS, and Form 16 for FY 2023-24 for ITR filing.\n\nRegards,\nRajesh Kumar\nCFO, ABC Pvt Ltd",
    from: createParticipant("client_contact", IDS.CONTACTS.ABC_RAJESH, "Rajesh Kumar", "rajesh.kumar@abc.com"),
    to: [createParticipant("user", IDS.USERS.SENIOR_1, "Anjali Gupta", "senior1@canexus.com")],
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    conversationId: IDS.CONVERSATIONS.ABC_CONV_1,
    attachments: [
      {
        id: "att-abc-1" as any,
        fileName: "ABC_Audited_Financials_FY24.pdf",
        fileSize: 2048000,
        mimeType: "application/pdf",
        fileUrl: "/mock-documents/abc-financials.pdf",
        documentId: IDS.DOCUMENTS.ABC_FINANCIALS,
      },
      {
        id: "att-abc-2" as any,
        fileName: "ABC_Form26AS_FY24.pdf",
        fileSize: 287600,
        mimeType: "application/pdf",
        fileUrl: "/mock-documents/abc-26as.pdf",
        documentId: IDS.DOCUMENTS.ABC_26AS,
      },
      {
        id: "att-abc-3" as any,
        fileName: "ABC_Form16_FY24.pdf",
        fileSize: 345600,
        mimeType: "application/pdf",
        fileUrl: "/mock-documents/abc-form16.pdf",
        documentId: IDS.DOCUMENTS.ABC_FORM16,
      },
    ],
    status: "read",
    sentAt: "2024-05-28T10:30:00Z",
    deliveredAt: "2024-05-28T10:30:00Z",
    readAt: "2024-05-28T11:00:00Z",
    isInternal: false,
    linkedTaskId: IDS.TASKS.ABC_ITR_COLLECT_DOCS,
  },
  {
    ...baseEntity,
    id: IDS.COMMUNICATIONS.ABC_WHATSAPP_1,
    communicationNumber: "COMM-ABC-002",
    channel: "whatsapp",
    direction: "inbound",
    content:
      "Hi Anjali, we have uploaded the May invoices to the portal. Please check and let us know if anything else is needed for GST return.",
    from: createParticipant(
      "client_contact",
      IDS.CONTACTS.ABC_PRIYA,
      "Priya Sharma",
      "priya.sharma@abc.com",
      "+91-9811122244",
    ),
    to: [createParticipant("user", IDS.USERS.SENIOR_1, "Anjali Gupta", "senior1@canexus.com")],
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_GST_Q1,
    conversationId: IDS.CONVERSATIONS.ABC_CONV_1,
    attachments: [],
    status: "read",
    sentAt: "2024-06-10T14:22:00Z",
    deliveredAt: "2024-06-10T14:22:00Z",
    readAt: "2024-06-10T14:25:00Z",
    isInternal: false,
  },
  {
    ...baseEntity,
    id: IDS.COMMUNICATIONS.XYZ_EMAIL_1,
    communicationNumber: "COMM-XYZ-001",
    channel: "email",
    direction: "outbound",
    subject: "GST Return Filed - April 2024 (QRMP)",
    content:
      "Dear Amit,\n\nWe have successfully filed your GSTR-1 (quarterly) and GSTR-3B (monthly) for April 2024 under the QRMP scheme.\n\nAcknowledgment Reference: GST240512001\nFiling Date: 12 May 2024\n\nPlease find the acknowledgment attached.\n\nRegards,\nTeam CA Nexus",
    from: createParticipant("user", IDS.USERS.ASSOCIATE_1, "Kavya Nair", "associate1@canexus.com"),
    to: [createParticipant("client_contact", IDS.CONTACTS.XYZ_AMIT, "Amit Desai", "amit.desai@xyz.com")],
    clientId: IDS.CLIENTS.XYZ_LLP,
    matterId: IDS.MATTERS.XYZ_GST_MONTHLY,
    conversationId: IDS.CONVERSATIONS.XYZ_CONV_1,
    attachments: [
      {
        id: "att-xyz-1" as any,
        fileName: "GST_Acknowledgment_Apr2024.pdf",
        fileSize: 124000,
        mimeType: "application/pdf",
        fileUrl: "/mock-documents/gst-ack-apr.pdf",
      },
    ],
    status: "sent",
    sentAt: "2024-05-12T16:45:00Z",
    deliveredAt: "2024-05-12T16:45:00Z",
    isInternal: false,
  },
  {
    ...baseEntity,
    id: IDS.COMMUNICATIONS.GLOBAL_EMAIL_1,
    communicationNumber: "COMM-GLB-001",
    channel: "email",
    direction: "inbound",
    subject: "Transfer Pricing Documentation - FY 2024-25",
    content:
      "Dear Rohit,\n\nPlease find attached the transfer pricing documentation including benchmarking study, functional analysis, and economic analysis for FY 2024-25.\n\nWe have also prepared the Form 3CEB draft for your review.\n\nRegards,\nSarah Johnson\nFinance Controller, Global Corp India",
    from: createParticipant(
      "client_contact",
      IDS.CONTACTS.GLOBAL_SARAH,
      "Sarah Johnson",
      "sarah.johnson@globalcorp.com",
    ),
    to: [createParticipant("user", IDS.USERS.SENIOR_2, "Rohit Agarwal", "senior2@canexus.com")],
    cc: [createParticipant("user", IDS.USERS.PARTNER_2, "Amit Patel", "partner2@canexus.com")],
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
    conversationId: IDS.CONVERSATIONS.GLOBAL_CONV_1,
    attachments: [
      {
        id: "att-glb-1" as any,
        fileName: "TP_Documentation_FY24_GlobalCorp.pdf",
        fileSize: 5242880,
        mimeType: "application/pdf",
        fileUrl: "/mock-documents/tp-doc-global.pdf",
      },
      {
        id: "att-glb-2" as any,
        fileName: "Form_3CEB_Draft_FY24.pdf",
        fileSize: 345600,
        mimeType: "application/pdf",
        fileUrl: "/mock-documents/form3ceb-draft.pdf",
      },
    ],
    status: "read",
    sentAt: "2024-06-20T09:15:00Z",
    deliveredAt: "2024-06-20T09:15:00Z",
    readAt: "2024-06-20T10:00:00Z",
    isInternal: false,
    linkedTaskId: IDS.TASKS.GLOBAL_ITR_COMPUTE,
  },
  {
    ...baseEntity,
    id: "comm-internal-001" as any,
    communicationNumber: "COMM-INT-001",
    channel: "email",
    direction: "outbound",
    subject: "Internal: ABC ITR Computation Review Required",
    content:
      "Hi Priya,\n\nThe ITR computation for ABC Pvt Ltd is ready for your review. Please review the capital gains computation and MAT applicability before we proceed to filing.\n\nMatter: MTR-ABC-ITR-24-001\nDue Date: 31 Oct 2024\n\nThanks,\nAnjali",
    from: createParticipant("user", IDS.USERS.SENIOR_1, "Anjali Gupta", "senior1@canexus.com"),
    to: [createParticipant("user", IDS.USERS.PARTNER_1, "Priya Sharma", "partner1@canexus.com")],
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    attachments: [],
    status: "sent",
    sentAt: "2024-07-10T11:00:00Z",
    deliveredAt: "2024-07-10T11:00:00Z",
    isInternal: true,
    internalNotes: "Priority review needed for capital gains computation",
  },
];

export const mockConversations: Conversation[] = [
  {
    ...baseEntity,
    id: IDS.CONVERSATIONS.ABC_CONV_1,
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    subject: "ABC Pvt Ltd - ITR & GST Matters",
    channels: ["email", "whatsapp"],
    participants: [
      { userId: IDS.USERS.SENIOR_1, role: "owner", joinedAt: "2024-04-01T10:00:00Z" },
      { contactId: IDS.CONTACTS.ABC_RAJESH, role: "participant", joinedAt: "2024-04-01T10:00:00Z" },
      { contactId: IDS.CONTACTS.ABC_PRIYA, role: "participant", joinedAt: "2024-04-01T10:00:00Z" },
      { userId: IDS.USERS.PARTNER_1, role: "observer", joinedAt: "2024-04-01T10:00:00Z" },
    ],
    lastMessageAt: "2024-06-10T14:22:00Z",
    lastMessagePreview: "Hi Anjali, we have uploaded the May invoices to the portal...",
    unreadCount: 0,
    isArchived: false,
    tags: ["itr", "gst", "active"],
  },
  {
    ...baseEntity,
    id: IDS.CONVERSATIONS.XYZ_CONV_1,
    clientId: IDS.CLIENTS.XYZ_LLP,
    matterId: IDS.MATTERS.XYZ_GST_MONTHLY,
    subject: "XYZ LLP - GST QRMP Filing",
    channels: ["email"],
    participants: [
      { userId: IDS.USERS.ASSOCIATE_1, role: "owner", joinedAt: "2024-04-01T10:00:00Z" },
      { contactId: IDS.CONTACTS.XYZ_AMIT, role: "participant", joinedAt: "2024-04-01T10:00:00Z" },
      { userId: IDS.USERS.PARTNER_1, role: "observer", joinedAt: "2024-04-01T10:00:00Z" },
    ],
    lastMessageAt: "2024-05-12T16:45:00Z",
    lastMessagePreview: "We have successfully filed your GSTR-1 and GSTR-3B for April 2024...",
    unreadCount: 0,
    isArchived: false,
    tags: ["gst", "qrmp", "completed"],
  },
  {
    ...baseEntity,
    id: IDS.CONVERSATIONS.GLOBAL_CONV_1,
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
    subject: "Global Corp India - ITR & Transfer Pricing",
    channels: ["email"],
    participants: [
      { userId: IDS.USERS.SENIOR_2, role: "owner", joinedAt: "2024-04-01T10:00:00Z" },
      { contactId: IDS.CONTACTS.GLOBAL_SARAH, role: "participant", joinedAt: "2024-04-01T10:00:00Z" },
      { userId: IDS.USERS.PARTNER_2, role: "observer", joinedAt: "2024-04-01T10:00:00Z" },
    ],
    lastMessageAt: "2024-06-20T09:15:00Z",
    lastMessagePreview: "Please find attached the transfer pricing documentation...",
    unreadCount: 0,
    isArchived: false,
    tags: ["itr", "transfer-pricing", "critical"],
  },
];

export const mockCampaigns: Campaign[] = [
  {
    ...baseEntity,
    id: IDS.CAMPAIGNS.ITR_REMINDER_MAY,
    name: "ITR Filing Reminder - May 2024",
    description: "Reminder to clients for ITR document submission and filing for FY 2024-25",
    objective: "compliance_reminder",
    channels: ["email", "whatsapp"],
    audience: {
      filters: [
        { field: "services.serviceType", operator: "equals", value: "itr" },
        { field: "complianceProfile.applicableComplianceTypes", operator: "contains", value: "itr" },
      ],
      excludedClientIds: [IDS.CLIENTS.FINTECH_LLP],
      includedClientIds: [],
      estimatedCount: 8,
    },
    templates: [
      {
        channel: "email",
        templateId: "tpl-itr-email-001" as any,
        subject: "Reminder: ITR Filing for {{financialYear}} - Action Required",
        content:
          "Dear {{clientName}},\n\nThis is a reminder that your Income Tax Return for {{financialYear}} (Assessment Year {{assessmentYear}}) is due on {{dueDate}}.\n\nPlease provide the following documents:\n1. Audited Financial Statements\n2. Form 26AS\n3. Form 16/16A\n4. Bank Statements\n5. Investment Proofs\n\nKindly upload the documents to the client portal or reply to this email.\n\nRegards,\n{{firmName}}\n{{assignedCA}}",
        variables: [
          { key: "clientName", label: "Client Name", type: "text", required: true },
          { key: "financialYear", label: "Financial Year", type: "text", required: true },
          { key: "assessmentYear", label: "Assessment Year", type: "text", required: true },
          { key: "dueDate", label: "Due Date", type: "date", required: true },
          { key: "firmName", label: "Firm Name", type: "text", required: true },
          { key: "assignedCA", label: "Assigned CA", type: "text", required: true },
        ],
      },
      {
        channel: "whatsapp",
        templateId: "tpl-itr-wa-001" as any,
        content:
          "Hi {{clientName}}, reminder: Your ITR for {{financialYear}} is due on {{dueDate}}. Please upload documents to portal. {{firmName}}",
        variables: [
          { key: "clientName", label: "Client Name", type: "text", required: true },
          { key: "financialYear", label: "Financial Year", type: "text", required: true },
          { key: "dueDate", label: "Due Date", type: "date", required: true },
          { key: "firmName", label: "Firm Name", type: "text", required: true },
        ],
      },
    ],
    schedule: {
      type: "scheduled",
      scheduledAt: "2024-05-15T10:00:00Z",
      timezone: "Asia/Kolkata",
      sendWindowStart: "09:00",
      sendWindowEnd: "18:00",
    },
    status: "sent",
    sentCount: 16,
    deliveredCount: 15,
    failedCount: 1,
    openedCount: 12,
    clickedCount: 8,
    repliedCount: 5,
    documentsReceived: 12,
    tasksCreated: 8,
    complianceProgress: 35,
    createdById: IDS.USERS.MANAGER_1,
    approvedById: IDS.USERS.PARTNER_1,
    approvedAt: "2024-05-10T10:00:00Z",
  },
  {
    ...baseEntity,
    id: IDS.CAMPAIGNS.GST_REMINDER_APR,
    name: "GST Document Collection - April 2024",
    description: "Monthly GST document collection reminder for April 2024 returns",
    objective: "document_collection",
    channels: ["email", "whatsapp", "sms"],
    audience: {
      filters: [
        { field: "services.serviceType", operator: "in", value: ["gst_monthly", "gst_quarterly"] },
        { field: "complianceProfile.gstFilingFrequency", operator: "in", value: ["monthly", "quarterly"] },
      ],
      excludedClientIds: [],
      includedClientIds: [],
      estimatedCount: 9,
    },
    templates: [
      {
        channel: "email",
        templateId: "tpl-gst-email-001" as any,
        subject: "GST Returns for {{taxPeriod}} - Document Submission Required",
        content:
          "Dear {{clientName}},\n\nYour GST returns for {{taxPeriod}} are due on {{dueDate}}.\n\nPlease upload the following to the portal:\n1. Sales Invoices (B2B & B2C)\n2. Purchase Invoices\n3. Bank Statements\n4. Credit/Debit Notes\n\nReply to this email or use the portal for document submission.\n\nRegards,\n{{firmName}}\n{{assignedCA}}",
        variables: [
          { key: "clientName", label: "Client Name", type: "text", required: true },
          { key: "taxPeriod", label: "Tax Period", type: "text", required: true },
          { key: "dueDate", label: "Due Date", type: "date", required: true },
          { key: "firmName", label: "Firm Name", type: "text", required: true },
          { key: "assignedCA", label: "Assigned CA", type: "text", required: true },
        ],
      },
      {
        channel: "whatsapp",
        templateId: "tpl-gst-wa-001" as any,
        content:
          "Hi {{clientName}}, GST for {{taxPeriod}} due {{dueDate}}. Please upload invoices & bank statements. {{firmName}}",
        variables: [
          { key: "clientName", label: "Client Name", type: "text", required: true },
          { key: "taxPeriod", label: "Tax Period", type: "text", required: true },
          { key: "dueDate", label: "Due Date", type: "date", required: true },
          { key: "firmName", label: "Firm Name", type: "text", required: true },
        ],
      },
      {
        channel: "sms",
        templateId: "tpl-gst-sms-001" as any,
        content: "{{firmName}}: GST {{taxPeriod}} due {{dueDate}}. Upload docs at portal. {{assignedCA}}",
        variables: [
          { key: "clientName", label: "Client Name", type: "text", required: true },
          { key: "taxPeriod", label: "Tax Period", type: "text", required: true },
          { key: "dueDate", label: "Due Date", type: "date", required: true },
          { key: "firmName", label: "Firm Name", type: "text", required: true },
          { key: "assignedCA", label: "Assigned CA", type: "text", required: true },
        ],
      },
    ],
    schedule: {
      type: "scheduled",
      scheduledAt: "2024-04-25T10:00:00Z",
      timezone: "Asia/Kolkata",
      sendWindowStart: "09:00",
      sendWindowEnd: "18:00",
    },
    status: "sent",
    sentCount: 24,
    deliveredCount: 22,
    failedCount: 2,
    openedCount: 18,
    clickedCount: 10,
    repliedCount: 3,
    documentsReceived: 15,
    tasksCreated: 9,
    complianceProgress: 45,
    createdById: IDS.USERS.MANAGER_1,
    approvedById: IDS.USERS.PARTNER_1,
    approvedAt: "2024-04-20T10:00:00Z",
  },
];

export const getCommunicationsByClient = (clientId: string): Communication[] =>
  mockCommunications.filter((c) => c.clientId === clientId);

export const getCommunicationsByMatter = (matterId: string): Communication[] =>
  mockCommunications.filter((c) => c.matterId === matterId);

export const getCommunicationsByTask = (taskId: string): Communication[] =>
  mockCommunications.filter((c) => c.linkedTaskId === taskId);

export const getCommunicationsByConversation = (conversationId: string): Communication[] =>
  mockCommunications.filter((c) => c.conversationId === conversationId);

export const getConversationsByClient = (clientId: string): Conversation[] =>
  mockConversations.filter((c) => c.clientId === clientId);

export const getConversationsByUser = (userId: string): Conversation[] =>
  mockConversations.filter((c) => c.participants.some((p) => p.userId === userId));

export const getCampaignsByStatus = (status: CampaignStatus): Campaign[] =>
  mockCampaigns.filter((c) => c.status === status);

export const getCampaignById = (id: string): Campaign | undefined => mockCampaigns.find((c) => c.id === id);

export const getCommunicationsByComplianceCycle = (complianceCycleId: string): Communication[] =>
  mockCommunications.filter(
    (c) => c.matterId && mockMatters.some((m) => m.id === c.matterId && m.complianceCycleId === complianceCycleId),
  );

export const getCommunicationById = (id: string): Communication | undefined =>
  mockCommunications.find((c) => c.id === id);

export const getConversationById = (id: string): Conversation | undefined => mockConversations.find((c) => c.id === id);

export const getTasksByConversation = (conversationId: string): import("@/types").Task[] => {
  const linkedTaskIds = mockCommunications
    .filter((c) => c.conversationId === conversationId && c.linkedTaskId)
    .map((c) => c.linkedTaskId!);
  return mockTasks.filter((t) => linkedTaskIds.includes(t.id));
};

export const getCommunicationsByCampaign = (campaignId: string): Communication[] =>
  mockCommunications.filter((c) => c.campaignId === campaignId);

export const getCommunicationsByDocument = (documentId: string): Communication[] =>
  mockCommunications.filter((c) => c.attachments.some((a) => a.documentId === documentId));
