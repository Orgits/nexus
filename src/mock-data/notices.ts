import type { AuthorityType, Notice, NoticeCategory, NoticeStatus, Priority } from "@/types";

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

export const mockNotices: Notice[] = [
  {
    ...baseEntity,
    id: IDS.NOTICES.ABC_IT_NOTICE,
    noticeNumber: "NOT-ABC-IT-24-001",
    referenceNumber: "ITBA/COM/F/17/2024-25/1234567",
    authority: "Income Tax Department",
    authorityType: "income_tax",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    subject: "Notice u/s 143(2) - Scrutiny Assessment for AY 2024-25",
    description:
      "Notice for scrutiny assessment under section 143(2) for Assessment Year 2024-25. Requires submission of books of accounts, supporting documents, and explanations for certain transactions.",
    receivedDate: "2024-06-15",
    responseDueDate: "2024-07-15",
    assignedUserId: IDS.USERS.SENIOR_1,
    priority: "high",
    status: "evidence_collection",
    category: "scrutiny",
    documents: [
      {
        ...baseEntity,
        id: "notdoc-abc-1" as any,
        noticeId: IDS.NOTICES.ABC_IT_NOTICE,
        documentId: IDS.DOCUMENTS.ABC_FINANCIALS,
        type: "notice_copy",
        description: "Notice copy received from ITD",
      },
      {
        ...baseEntity,
        id: "notdoc-abc-2" as any,
        noticeId: IDS.NOTICES.ABC_IT_NOTICE,
        documentId: IDS.DOCUMENTS.ABC_26AS,
        type: "evidence",
        description: "Form 26AS for verification",
      },
    ],
    tasks: [IDS.TASKS.ABC_ITR_COLLECT_DOCS, IDS.TASKS.ABC_ITR_COMPUTE],
    responseDraft: "Draft response being prepared. Need to compile transaction-wise explanations.",
    escalationLevel: 0,
    isUrgent: true,
  },
  {
    ...baseEntity,
    id: IDS.NOTICES.XYZ_GST_NOTICE,
    noticeNumber: "NOT-XYZ-GST-24-001",
    referenceNumber: "GST/ADM/2024-25/001",
    authority: "GST Department - Maharashtra",
    authorityType: "gst",
    clientId: IDS.CLIENTS.XYZ_LLP,
    matterId: IDS.MATTERS.XYZ_GST_MONTHLY,
    subject: "Notice u/s 61 - Discrepancy in GSTR-3B vs GSTR-1 for Jan 2024",
    description:
      "Discrepancy notice for difference between GSTR-3B and GSTR-1 for January 2024. Liability mismatch of Rs. 45,000 identified.",
    receivedDate: "2024-05-20",
    responseDueDate: "2024-06-20",
    assignedUserId: IDS.USERS.ASSOCIATE_1,
    priority: "medium",
    status: "response_drafting",
    category: "rectification",
    documents: [
      {
        ...baseEntity,
        id: "notdoc-xyz-1" as any,
        noticeId: IDS.NOTICES.XYZ_GST_NOTICE,
        documentId: IDS.DOCUMENTS.XYZ_GST_REG,
        type: "notice_copy",
        description: "GST discrepancy notice",
      },
    ],
    tasks: [],
    responseDraft: "Reconciliation shows timing difference in credit note reporting. Rectification being filed.",
    escalationLevel: 0,
    isUrgent: false,
  },
  {
    ...baseEntity,
    id: "notice-global-tds-001" as any,
    noticeNumber: "NOT-GLB-TDS-24-001",
    referenceNumber: "TDS/2024-25/DEM/001",
    authority: "Income Tax Department - TDS",
    authorityType: "tds",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    matterId: IDS.MATTERS.GLOBAL_TDS_Q1,
    subject: "Demand Notice u/s 201 - Short Deduction of TDS on Contractor Payments",
    description:
      "Demand notice for short deduction of TDS on payments to contractors for Q4 FY 2023-24. Demand amount: Rs. 2,35,000 including interest.",
    receivedDate: "2024-06-01",
    responseDueDate: "2024-07-01",
    assignedUserId: IDS.USERS.ASSOCIATE_2,
    priority: "high",
    status: "internal_review",
    category: "demand",
    documents: [],
    tasks: [],
    responseDraft: "",
    escalationLevel: 1,
    isUrgent: true,
  },
  {
    ...baseEntity,
    id: "notice-rtl-mca-001" as any,
    noticeNumber: "NOT-RTL-MCA-24-001",
    referenceNumber: "ROC/MUM/2024/001",
    authority: "Registrar of Companies - Mumbai",
    authorityType: "mca_roc",
    clientId: IDS.CLIENTS.RETAIL_CHAIN,
    subject: "Notice for Non-filing of AOC-4 XBRL for FY 2023-24",
    description:
      "Notice for non-filing of financial statements in XBRL format (AOC-4) for FY 2023-24. Penalty of Rs. 100 per day of delay.",
    receivedDate: "2024-05-10",
    responseDueDate: "2024-06-10",
    assignedUserId: IDS.USERS.SENIOR_1,
    priority: "high",
    status: "submitted",
    category: "other",
    documents: [],
    tasks: [],
    responseDraft: "AOC-4 XBRL filed on 08-Jun-2024 with SRN F12345678. Penalty waiver application submitted.",
    submissionReference: "SRN F12345678",
    responseSubmittedAt: "2024-06-08T14:30:00Z",
    escalationLevel: 0,
    isUrgent: false,
  },
];

export const getNoticesByClient = (clientId: string): Notice[] => mockNotices.filter((n) => n.clientId === clientId);

export const getNoticesByAssignedUser = (userId: string): Notice[] =>
  mockNotices.filter((n) => n.assignedUserId === userId);

export const getNoticesByStatus = (status: NoticeStatus): Notice[] => mockNotices.filter((n) => n.status === status);

export const getUrgentNotices = (): Notice[] => mockNotices.filter((n) => n.isUrgent);

export const getOverdueNotices = (): Notice[] => {
  const today = new Date();
  return mockNotices.filter(
    (n) => new Date(n.responseDueDate) < today && n.status !== "closed" && n.status !== "submitted",
  );
};

export const getNoticeById = (id: string): Notice | undefined => mockNotices.find((n) => n.id === id);

export const getNoticesByCategory = (category: NoticeCategory): Notice[] =>
  mockNotices.filter((n) => n.category === category);

export const getNoticesByAuthorityType = (authorityType: AuthorityType): Notice[] =>
  mockNotices.filter((n) => n.authorityType === authorityType);

export const getNoticesByMatter = (matterId: string): Notice[] => mockNotices.filter((n) => n.matterId === matterId);

export const getNoticesByDocument = (documentId: string): Notice[] =>
  mockNotices.filter((n) => n.documents.some((d) => d.documentId === documentId));

export const getNoticesByTask = (taskId: string): Notice[] => mockNotices.filter((n) => n.tasks.includes(taskId));

export const getNoticesByPriority = (priority: Priority): Notice[] =>
  mockNotices.filter((n) => n.priority === priority);
