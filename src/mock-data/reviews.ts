import type { Review, ReviewAction, ReviewStage, ReviewStatus, ReviewType, UUID } from "@/types";

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

const createReviewStages = (
  _reviewType: ReviewType,
  reviewerIds: UUID[],
  reviewerRoles: ReviewStage["reviewerRole"][],
  statuses: ReviewStatus[],
  actions?: (ReviewAction | undefined)[],
): ReviewStage[] => {
  return reviewerIds.map((reviewerId, index) => ({
    stageNumber: index + 1,
    name: `${reviewerRoles[index]} Review`,
    reviewerId,
    reviewerRole: reviewerRoles[index],
    status: statuses[index] || "pending",
    startedAt: statuses[index] !== "pending" ? now : undefined,
    completedAt: statuses[index] === "completed" ? now : undefined,
    comments: actions?.[index] ? `Action: ${actions[index]}` : undefined,
    action: actions?.[index],
  }));
};

export const mockReviews: Review[] = [
  {
    ...baseEntity,
    id: IDS.REVIEWS.ABC_ITR_REVIEW,
    reviewNumber: "REV-ABC-ITR-24-001",
    title: "ABC Pvt Ltd - ITR-6 Filing Review (AY 2024-25)",
    description: "Multi-stage review of ITR-6 computation and filing for ABC Private Limited",
    reviewType: "tax_return",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    complianceCycleId: IDS.COMPLIANCE_CYCLES.ABC_ITR_FY24,
    assignedReviewerId: IDS.USERS.SENIOR_1,
    assignedById: IDS.USERS.PARTNER_1,
    priority: "high",
    status: "in_progress",
    stages: createReviewStages(
      "tax_return",
      [IDS.USERS.SENIOR_1, IDS.USERS.MANAGER_1, IDS.USERS.PARTNER_1],
      ["senior_associate", "manager", "partner"],
      ["completed", "in_progress", "pending"],
      ["approve", "comment", undefined],
    ),
    currentStage: 2,
    dueDate: "2024-07-20",
    startedAt: "2024-07-10T10:00:00Z",
    tags: ["itr", "filing", "ay-2024-25"],
  },
  {
    ...baseEntity,
    id: IDS.REVIEWS.ABC_GST_REVIEW,
    reviewNumber: "REV-ABC-GST-24-001",
    title: "ABC Pvt Ltd - GSTR-1 & GSTR-3B Review (Q1 FY 2024-25)",
    description: "Review of GST returns reconciliation and filing for Q1",
    reviewType: "compliance_filing",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_GST_Q1,
    complianceCycleId: IDS.COMPLIANCE_CYCLES.ABC_GST_APR,
    assignedReviewerId: IDS.USERS.SENIOR_1,
    assignedById: IDS.USERS.MANAGER_1,
    priority: "medium",
    status: "pending",
    stages: createReviewStages(
      "compliance_filing",
      [IDS.USERS.SENIOR_1, IDS.USERS.MANAGER_1],
      ["senior_associate", "manager"],
      ["pending", "pending"],
    ),
    currentStage: 1,
    dueDate: "2024-07-15",
    tags: ["gst", "q1", "reconciliation"],
  },
  {
    ...baseEntity,
    id: IDS.REVIEWS.XYZ_ITR_REVIEW,
    reviewNumber: "REV-XYZ-ITR-24-001",
    title: "XYZ LLP - ITR-5 Filing Review (AY 2024-25)",
    description: "Partner review of ITR-5 for XYZ LLP before filing",
    reviewType: "tax_return",
    clientId: IDS.CLIENTS.XYZ_LLP,
    matterId: IDS.MATTERS.XYZ_ITR_FY24,
    complianceCycleId: IDS.COMPLIANCE_CYCLES.XYZ_ITR_FY24,
    assignedReviewerId: IDS.USERS.PARTNER_1,
    assignedById: IDS.USERS.MANAGER_1,
    priority: "high",
    status: "in_progress",
    stages: createReviewStages(
      "tax_return",
      [IDS.USERS.SENIOR_2, IDS.USERS.PARTNER_1],
      ["senior_associate", "partner"],
      ["completed", "in_progress"],
      ["approve", undefined],
    ),
    currentStage: 2,
    dueDate: "2024-07-25",
    startedAt: "2024-07-12T09:00:00Z",
    tags: ["itr", "filing", "llp", "ay-2024-25"],
  },
  {
    ...baseEntity,
    id: IDS.REVIEWS.GLOBAL_TDS_REVIEW,
    reviewNumber: "REV-GLB-TDS-24-001",
    title: "Global Corp - TDS 26Q Review (Q1 FY 2024-25)",
    description: "Review of TDS return 26Q for contractor payments",
    reviewType: "compliance_filing",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    matterId: IDS.MATTERS.GLOBAL_TDS_Q1,
    complianceCycleId: IDS.COMPLIANCE_CYCLES.GLOBAL_TDS_Q1,
    assignedReviewerId: IDS.USERS.ASSOCIATE_2,
    assignedById: IDS.USERS.SENIOR_2,
    priority: "medium",
    status: "completed",
    stages: createReviewStages(
      "compliance_filing",
      [IDS.USERS.ASSOCIATE_2, IDS.USERS.SENIOR_2, IDS.USERS.PARTNER_2],
      ["associate", "senior_associate", "partner"],
      ["completed", "completed", "completed"],
      ["approve", "approve", "approve"],
    ),
    currentStage: 3,
    dueDate: "2024-07-05",
    startedAt: "2024-06-28T14:00:00Z",
    completedAt: "2024-07-03T11:00:00Z",
    overallComments: "All TDS entries verified. No discrepancies found. Approved for filing.",
    tags: ["tds", "26q", "q1", "contractors"],
  },
  {
    ...baseEntity,
    id: IDS.REVIEWS.RETAIL_GST_REVIEW,
    reviewNumber: "REV-RTL-GST-24-001",
    title: "RetailMax - GST April 2024 Overdue Review",
    description: "Urgent review of overdue GST return for April 2024",
    reviewType: "compliance_filing",
    clientId: IDS.CLIENTS.RETAIL_CHAIN,
    matterId: IDS.MATTERS.RETAIL_GST_Q1,
    complianceCycleId: IDS.COMPLIANCE_CYCLES.RETAIL_GST_APR,
    assignedReviewerId: IDS.USERS.SENIOR_1,
    assignedById: IDS.USERS.PARTNER_1,
    priority: "urgent",
    status: "in_progress",
    stages: createReviewStages(
      "compliance_filing",
      [IDS.USERS.SENIOR_1, IDS.USERS.MANAGER_1, IDS.USERS.PARTNER_1],
      ["senior_associate", "manager", "partner"],
      ["in_progress", "pending", "pending"],
      [undefined, undefined, undefined],
    ),
    currentStage: 1,
    dueDate: "2024-07-10",
    startedAt: "2024-07-08T16:00:00Z",
    overallComments: "Missing invoices from 3 states. Following up with client.",
    tags: ["gst", "overdue", "urgent", "april-2024"],
  },
];

export const getReviewsByClient = (clientId: string): Review[] => mockReviews.filter((r) => r.clientId === clientId);

export const getReviewsByAssignedReviewer = (userId: string): Review[] =>
  mockReviews.filter((r) => r.assignedReviewerId === userId);

export const getReviewsByAssignedBy = (userId: string): Review[] =>
  mockReviews.filter((r) => r.assignedById === userId);

export const getReviewsByStatus = (status: ReviewStatus): Review[] => mockReviews.filter((r) => r.status === status);

export const getReviewsByType = (reviewType: ReviewType): Review[] =>
  mockReviews.filter((r) => r.reviewType === reviewType);

export const getReviewsByMatter = (matterId: string): Review[] => mockReviews.filter((r) => r.matterId === matterId);

export const getReviewsByComplianceCycle = (cycleId: string): Review[] =>
  mockReviews.filter((r) => r.complianceCycleId === cycleId);

export const getPendingReviews = (): Review[] =>
  mockReviews.filter((r) => r.status === "pending" || r.status === "in_progress");

export const getOverdueReviews = (): Review[] => {
  const today = new Date();
  return mockReviews.filter((r) => new Date(r.dueDate) < today && r.status !== "completed");
};

export const getReviewById = (id: string): Review | undefined => mockReviews.find((r) => r.id === id);

export const getReviewStages = (reviewId: string): ReviewStage[] => {
  const review = getReviewById(reviewId);
  return review?.stages ?? [];
};

export const getCurrentStage = (reviewId: string): ReviewStage | undefined => {
  const review = getReviewById(reviewId);
  if (!review) return undefined;
  return review.stages.find((s) => s.stageNumber === review.currentStage);
};

export const getCompletedStagesCount = (reviewId: string): number => {
  const review = getReviewById(reviewId);
  if (!review) return 0;
  return review.stages.filter((s) => s.status === "completed").length;
};

export const getReviewsByDocument = (documentId: string): Review[] =>
  mockReviews.filter((r) => r.documentId === documentId);

export const getReviewsByTask = (taskId: string): Review[] => mockReviews.filter((r) => r.taskId === taskId);

export const getReviewsByAssignedUser = (userId: string): Review[] =>
  mockReviews.filter((r) => r.assignedReviewerId === userId);
