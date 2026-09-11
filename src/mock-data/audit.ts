import type {
  AuditEngagement,
  AuditProgram,
  AuditQuery,
  AuditStatus,
  KeyRisk,
  ReviewNote,
  RiskLevel,
  SignOff,
  UUID,
  Workpaper,
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

const createAuditTeam = (partnerId: UUID, managerIds: UUID[], seniorIds: UUID[], staffIds: UUID[]) => ({
  partnerId,
  managerIds,
  seniorIds,
  staffIds,
});

const createKeyRisks = (refs: UUID[]): KeyRisk[] => [
  {
    id: "risk-1" as UUID,
    description: "Revenue recognition timing differences in multi-year contracts",
    assertion: "Occurrence",
    riskLevel: "high" as RiskLevel,
    response: "Substantive testing of contract terms and revenue cutoff procedures",
    workpaperRefs: [refs[0] || ("wp-1" as UUID)],
  },
  {
    id: "risk-2" as UUID,
    description: "Inventory valuation and obsolescence provisioning",
    assertion: "Valuation",
    riskLevel: "high" as RiskLevel,
    response: "Analytical procedures and physical observation of inventory count",
    workpaperRefs: [refs[1] || ("wp-2" as UUID)],
  },
  {
    id: "risk-3" as UUID,
    description: "Related party transactions not fully disclosed",
    assertion: "Completeness",
    riskLevel: "medium" as RiskLevel,
    response: "Review of board minutes and confirmation with management",
    workpaperRefs: [refs[2] || ("wp-3" as UUID)],
  },
  {
    id: "risk-4" as UUID,
    description: "Management override of controls in journal entries",
    assertion: "Accuracy",
    riskLevel: "medium" as RiskLevel,
    response: "Journal entry testing and review of non-standard entries",
    workpaperRefs: [refs[3] || ("wp-4" as UUID)],
  },
];

const createAuditPrograms = (_engagementId: UUID): AuditProgram[] => [
  {
    id: "prog-1" as UUID,
    area: "Revenue",
    objective: "Verify completeness and accuracy of revenue recognition",
    procedures: [
      {
        id: "proc-1" as UUID,
        reference: "REV-01",
        description: "Test revenue cutoff for year-end transactions",
        assertion: "Cutoff",
        type: "substantive",
        status: "completed",
        preparedBy: IDS.USERS.SENIOR_1,
        preparedAt: "2024-06-15T10:00:00Z",
        reviewedBy: IDS.USERS.MANAGER_1,
        reviewedAt: "2024-06-16T10:00:00Z",
        conclusion: "No material misstatements identified",
        evidenceRefs: ["wp-rev-001" as UUID],
      },
      {
        id: "proc-2" as UUID,
        reference: "REV-02",
        description: "Vouch sales invoices to shipping documents",
        assertion: "Occurrence",
        type: "substantive",
        status: "completed",
        preparedBy: IDS.USERS.ASSOCIATE_1,
        preparedAt: "2024-06-18T10:00:00Z",
        reviewedBy: IDS.USERS.SENIOR_1,
        reviewedAt: "2024-06-19T10:00:00Z",
        conclusion: "Sample tested without exception",
        evidenceRefs: ["wp-rev-002" as UUID],
      },
    ],
    assignedTo: IDS.USERS.SENIOR_1,
    status: "completed",
    completedAt: "2024-06-20T10:00:00Z",
  },
  {
    id: "prog-2" as UUID,
    area: "Inventory",
    objective: "Verify existence and valuation of inventory",
    procedures: [
      {
        id: "proc-3" as UUID,
        reference: "INV-01",
        description: "Attend physical inventory count",
        assertion: "Existence",
        type: "substantive",
        status: "completed",
        preparedBy: IDS.USERS.SENIOR_1,
        preparedAt: "2024-06-25T10:00:00Z",
        reviewedBy: IDS.USERS.MANAGER_1,
        reviewedAt: "2024-06-26T10:00:00Z",
        conclusion: "Count observed, no significant variances",
        evidenceRefs: ["wp-inv-001" as UUID],
      },
      {
        id: "proc-4" as UUID,
        reference: "INV-02",
        description: "Test inventory valuation and obsolescence provision",
        assertion: "Valuation",
        type: "analytical",
        status: "in_progress",
        preparedBy: IDS.USERS.ASSOCIATE_1,
        preparedAt: "2024-06-28T10:00:00Z",
        evidenceRefs: ["wp-inv-003" as UUID],
      },
    ],
    assignedTo: IDS.USERS.SENIOR_1,
    status: "in_progress",
  },
  {
    id: "prog-3" as UUID,
    area: "Cash & Bank",
    objective: "Verify cash balances and bank reconciliations",
    procedures: [
      {
        id: "proc-5" as UUID,
        reference: "CASH-01",
        description: "Obtain bank confirmations and test reconciliations",
        assertion: "Existence",
        type: "substantive",
        status: "not_started",
        evidenceRefs: [],
      },
    ],
    assignedTo: IDS.USERS.ASSOCIATE_2,
    status: "not_started",
  },
];

const createWorkpapers = (_engagementId: UUID): Workpaper[] => [
  {
    ...baseEntity,
    id: "wp-rev-001" as UUID,
    reference: "WP-REV-001",
    title: "Revenue Cutoff Testing - FY 2024-25",
    objective: "Verify revenue recognized in correct period",
    area: "Revenue",
    procedureId: "proc-1" as UUID,
    preparedBy: IDS.USERS.SENIOR_1,
    reviewedBy: IDS.USERS.MANAGER_1,
    status: "reviewed",
    evidenceDocumentIds: [IDS.DOCUMENTS.ABC_FINANCIALS],
    conclusion: "Revenue cutoff appropriate, no adjustments required",
    reviewNotes: "Sample of 25 transactions tested, all correctly recorded",
    preparedAt: "2024-06-15T10:00:00Z",
    reviewedAt: "2024-06-16T10:00:00Z",
    signOffs: [
      {
        userId: IDS.USERS.SENIOR_1,
        role: "preparer",
        action: "prepared",
        timestamp: "2024-06-15T10:00:00Z",
      },
      {
        userId: IDS.USERS.MANAGER_1,
        role: "reviewer",
        action: "reviewed",
        timestamp: "2024-06-16T10:00:00Z",
        comments: "Workpaper well documented, conclusions supported",
      },
    ],
  },
  {
    ...baseEntity,
    id: "wp-rev-002" as UUID,
    reference: "WP-REV-002",
    title: "Sales Invoice Vouching - FY 2024-25",
    objective: "Verify occurrence of recorded revenue",
    area: "Revenue",
    procedureId: "proc-2" as UUID,
    preparedBy: IDS.USERS.ASSOCIATE_1,
    reviewedBy: IDS.USERS.SENIOR_1,
    status: "reviewed",
    evidenceDocumentIds: [IDS.DOCUMENTS.ABC_FINANCIALS],
    conclusion: "All sampled invoices supported by shipping documents",
    preparedAt: "2024-06-18T10:00:00Z",
    reviewedAt: "2024-06-19T10:00:00Z",
    signOffs: [
      {
        userId: IDS.USERS.ASSOCIATE_1,
        role: "preparer",
        action: "prepared",
        timestamp: "2024-06-18T10:00:00Z",
      },
      {
        userId: IDS.USERS.SENIOR_1,
        role: "reviewer",
        action: "reviewed",
        timestamp: "2024-06-19T10:00:00Z",
      },
    ],
  },
  {
    ...baseEntity,
    id: "wp-inv-001" as UUID,
    reference: "WP-INV-001",
    title: "Physical Inventory Count Observation",
    objective: "Verify existence of inventory",
    area: "Inventory",
    procedureId: "proc-3" as UUID,
    preparedBy: IDS.USERS.SENIOR_1,
    reviewedBy: IDS.USERS.MANAGER_1,
    status: "reviewed",
    evidenceDocumentIds: [],
    conclusion: "Inventory count observed, no material variances noted",
    reviewNotes: "Count conducted on 2024-06-25. 50 items test counted.",
    preparedAt: "2024-06-25T10:00:00Z",
    reviewedAt: "2024-06-26T10:00:00Z",
    signOffs: [
      {
        userId: IDS.USERS.SENIOR_1,
        role: "preparer",
        action: "prepared",
        timestamp: "2024-06-25T10:00:00Z",
      },
      {
        userId: IDS.USERS.MANAGER_1,
        role: "reviewer",
        action: "reviewed",
        timestamp: "2024-06-26T10:00:00Z",
      },
    ],
  },
  {
    ...baseEntity,
    id: "wp-inv-003" as UUID,
    reference: "WP-INV-003",
    title: "Inventory Valuation & Obsolescence Analysis",
    objective: "Assess adequacy of inventory provision",
    area: "Inventory",
    procedureId: "proc-4" as UUID,
    preparedBy: IDS.USERS.ASSOCIATE_1,
    status: "prepared",
    evidenceDocumentIds: [],
    preparedAt: "2024-06-28T10:00:00Z",
    signOffs: [
      {
        userId: IDS.USERS.ASSOCIATE_1,
        role: "preparer",
        action: "prepared",
        timestamp: "2024-06-28T10:00:00Z",
      },
    ],
  },
];

const createAuditQueries = (_engagementId: UUID): AuditQuery[] => [
  {
    ...baseEntity,
    id: "query-1" as UUID,
    queryNumber: "AQ-ABC-001",
    workpaperId: "wp-inv-003" as UUID,
    area: "Inventory",
    raisedBy: IDS.USERS.MANAGER_1,
    assignedTo: IDS.USERS.ASSOCIATE_1,
    description:
      "Obsolescence provision methodology needs documentation. Current provision of 5% appears low given aging profile.",
    priority: "high",
    status: "in_progress",
    dueDate: "2024-07-15",
  },
  {
    ...baseEntity,
    id: "query-2" as UUID,
    queryNumber: "AQ-ABC-002",
    area: "Revenue",
    raisedBy: IDS.USERS.PARTNER_1,
    assignedTo: IDS.USERS.SENIOR_1,
    description: "Confirm revenue recognition policy for long-term contracts aligns with Ind AS 115.",
    priority: "medium",
    status: "open",
    dueDate: "2024-07-20",
  },
];

const createReviewNotes = (_engagementId: UUID): ReviewNote[] => [
  {
    ...baseEntity,
    id: "rn-1" as UUID,
    workpaperId: "wp-inv-003" as UUID,
    reviewerId: IDS.USERS.MANAGER_1,
    content:
      "Obsolescence provision methodology needs to be documented. Suggest reviewing aging report and applying graduated provision rates.",
    type: "recommendation",
    isResolved: false,
  },
  {
    ...baseEntity,
    id: "rn-2" as UUID,
    queryId: "query-1" as UUID,
    reviewerId: IDS.USERS.MANAGER_1,
    content: "Please provide supporting analysis for the 5% provision rate. Consider industry benchmarks.",
    type: "question",
    isResolved: false,
  },
];

const createSignOffs = (engagementId: UUID): SignOff[] => [
  {
    ...baseEntity,
    id: "so-1" as UUID,
    engagementId,
    userId: IDS.USERS.SENIOR_1,
    role: "reviewer",
    action: "review",
    timestamp: "2024-06-20T10:00:00Z",
    comments: "Fieldwork for Revenue and Inventory areas completed. Cash work pending.",
  },
  {
    ...baseEntity,
    id: "so-2" as UUID,
    engagementId,
    userId: IDS.USERS.MANAGER_1,
    role: "manager",
    action: "review",
    timestamp: "2024-06-26T10:00:00Z",
    comments: "Reviewed workpapers for Revenue and Inventory. One query raised on inventory provisioning.",
  },
];

export const mockAuditEngagements: AuditEngagement[] = [
  {
    ...baseEntity,
    id: IDS.AUDIT_ENGAGEMENTS.ABC_AUDIT_FY24,
    engagementNumber: "AUD-ABC-24-001",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    name: "ABC Pvt Ltd - Statutory Audit FY 2024-25",
    description: "Statutory audit under Companies Act 2013 for financial year ending 31 March 2025",
    type: "statutory",
    status: "fieldwork",
    period: {
      label: "FY 2024-25",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      financialYear: "2024-25",
    },
    assignedTeam: createAuditTeam(
      IDS.USERS.PARTNER_1,
      [IDS.USERS.MANAGER_1],
      [IDS.USERS.SENIOR_1],
      [IDS.USERS.ASSOCIATE_1, IDS.USERS.ASSOCIATE_2],
    ),
    planning: {
      understandingOfEntity:
        "ABC Pvt Ltd is a manufacturing company engaged in auto components. Revenue primarily from domestic OEMs. Key accounting policies: Revenue recognition per Ind AS 115, Inventory at lower of cost/NRV.",
      riskAssessmentSummary:
        "High inherent risk in revenue recognition (cutoff) and inventory valuation. Control risk moderate. Overall audit risk assessed as high.",
      materialityBasis: "0.5% of revenue",
      planningNotes: "Focus on revenue cutoff at year-end, inventory count attendance, and related party transactions.",
      completedAt: "2024-05-15T10:00:00Z",
      completedBy: IDS.USERS.PARTNER_1,
    },
    riskAssessment: {
      inherentRisk: "high",
      controlRisk: "medium",
      detectionRisk: "medium",
      overallRisk: "high",
      keyRisks: createKeyRisks(["wp-rev-001", "wp-inv-001", "wp-inv-003"]),
      assessedAt: "2024-05-20T10:00:00Z",
      assessedBy: IDS.USERS.PARTNER_1,
    },
    materiality: {
      overallMateriality: 500000,
      performanceMateriality: 350000,
      trivialThreshold: 25000,
      basis: "0.5% of projected revenue (Rs. 100 Cr)",
      calculatedAt: "2024-05-15T10:00:00Z",
      calculatedBy: IDS.USERS.PARTNER_1,
    },
    programs: createAuditPrograms(IDS.AUDIT_ENGAGEMENTS.ABC_AUDIT_FY24),
    workpapers: createWorkpapers(IDS.AUDIT_ENGAGEMENTS.ABC_AUDIT_FY24),
    queries: createAuditQueries(IDS.AUDIT_ENGAGEMENTS.ABC_AUDIT_FY24),
    reviewNotes: createReviewNotes(IDS.AUDIT_ENGAGEMENTS.ABC_AUDIT_FY24),
    signOff: createSignOffs(IDS.AUDIT_ENGAGEMENTS.ABC_AUDIT_FY24),
  },
  {
    ...baseEntity,
    id: IDS.AUDIT_ENGAGEMENTS.XYZ_AUDIT_FY24,
    engagementNumber: "AUD-XYZ-24-001",
    clientId: IDS.CLIENTS.XYZ_LLP,
    name: "XYZ LLP - Statutory Audit FY 2024-25",
    description: "Statutory audit of LLP for financial year ending 31 March 2025",
    type: "statutory",
    status: "planning",
    period: {
      label: "FY 2024-25",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      financialYear: "2024-25",
    },
    assignedTeam: createAuditTeam(
      IDS.USERS.PARTNER_1,
      [IDS.USERS.MANAGER_1],
      [IDS.USERS.SENIOR_2],
      [IDS.USERS.ASSOCIATE_1],
    ),
    planning: {
      understandingOfEntity:
        "XYZ LLP is a services LLP providing IT consulting. Revenue from time-and-material and fixed-price contracts.",
      riskAssessmentSummary:
        "Moderate inherent risk. Revenue recognition for fixed-price contracts requires attention. Low inventory risk.",
      materialityBasis: "0.75% of revenue",
      planningNotes: "Focus on WIP valuation and revenue recognition for fixed-price contracts.",
      completedAt: "2024-05-10T10:00:00Z",
      completedBy: IDS.USERS.PARTNER_1,
    },
    riskAssessment: {
      inherentRisk: "medium",
      controlRisk: "low",
      detectionRisk: "medium",
      overallRisk: "medium",
      keyRisks: [
        {
          id: "risk-xyz-1" as UUID,
          description: "Work-in-progress valuation for fixed-price contracts",
          assertion: "Valuation",
          riskLevel: "high",
          response: "Review percentage-of-completion calculations and cost-to-complete estimates",
          workpaperRefs: [],
        },
        {
          id: "risk-xyz-2" as UUID,
          description: "Partner capital account allocations",
          assertion: "Accuracy",
          riskLevel: "medium",
          response: "Verify profit sharing ratio calculations and drawings",
          workpaperRefs: [],
        },
      ],
      assessedAt: "2024-05-15T10:00:00Z",
      assessedBy: IDS.USERS.PARTNER_1,
    },
    materiality: {
      overallMateriality: 300000,
      performanceMateriality: 210000,
      trivialThreshold: 15000,
      basis: "0.75% of projected revenue (Rs. 40 Cr)",
      calculatedAt: "2024-05-15T10:00:00Z",
      calculatedBy: IDS.USERS.PARTNER_1,
    },
    programs: createAuditPrograms(IDS.AUDIT_ENGAGEMENTS.XYZ_AUDIT_FY24),
    workpapers: [],
    queries: [],
    reviewNotes: [],
    signOff: [],
  },
  {
    ...baseEntity,
    id: IDS.AUDIT_ENGAGEMENTS.GLOBAL_AUDIT_FY24,
    engagementNumber: "AUD-GLB-24-001",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    name: "Global Corp India - Statutory Audit FY 2024-25",
    description: "Statutory audit of Indian subsidiary of multinational group",
    type: "statutory",
    status: "review",
    period: {
      label: "FY 2024-25",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      financialYear: "2024-25",
    },
    assignedTeam: createAuditTeam(
      IDS.USERS.PARTNER_2,
      [IDS.USERS.MANAGER_2],
      [IDS.USERS.SENIOR_2],
      [IDS.USERS.ASSOCIATE_2],
    ),
    planning: {
      understandingOfEntity:
        "Indian subsidiary of US multinational. Manufacturing and trading operations. Significant related party transactions with group companies. Transfer pricing documentation required.",
      riskAssessmentSummary:
        "High inherent risk due to transfer pricing, related party transactions, and group reporting requirements. Control environment strong due to group policies.",
      materialityBasis: "0.5% of revenue (component materiality)",
      planningNotes:
        "Coordinate with group auditors. Focus on TP documentation, intercompany balances, and group reporting package.",
      completedAt: "2024-04-15T10:00:00Z",
      completedBy: IDS.USERS.PARTNER_2,
    },
    riskAssessment: {
      inherentRisk: "high",
      controlRisk: "low",
      detectionRisk: "medium",
      overallRisk: "high",
      keyRisks: [
        {
          id: "risk-glb-1" as UUID,
          description: "Transfer pricing compliance and documentation",
          assertion: "Accuracy",
          riskLevel: "critical",
          response: "Review TP study, Form 3CEB, and benchmarking analysis",
          workpaperRefs: [],
        },
        {
          id: "risk-glb-2" as UUID,
          description: "Intercompany balance confirmations and eliminations",
          assertion: "Existence",
          riskLevel: "high",
          response: "Obtain group confirmations and test reconciliation",
          workpaperRefs: [],
        },
        {
          id: "risk-glb-3" as UUID,
          description: "Group reporting package completeness",
          assertion: "Completeness",
          riskLevel: "medium",
          response: "Reconcile local GAAP to group GAAP adjustments",
          workpaperRefs: [],
        },
      ],
      assessedAt: "2024-04-20T10:00:00Z",
      assessedBy: IDS.USERS.PARTNER_2,
    },
    materiality: {
      overallMateriality: 1000000,
      performanceMateriality: 700000,
      trivialThreshold: 50000,
      basis: "0.5% of component revenue (Rs. 200 Cr)",
      calculatedAt: "2024-04-15T10:00:00Z",
      calculatedBy: IDS.USERS.PARTNER_2,
    },
    programs: createAuditPrograms(IDS.AUDIT_ENGAGEMENTS.GLOBAL_AUDIT_FY24),
    workpapers: createWorkpapers(IDS.AUDIT_ENGAGEMENTS.GLOBAL_AUDIT_FY24),
    queries: [
      {
        ...baseEntity,
        id: "query-glb-1" as UUID,
        queryNumber: "AQ-GLB-001",
        area: "Transfer Pricing",
        raisedBy: IDS.USERS.PARTNER_2,
        assignedTo: IDS.USERS.SENIOR_2,
        description: "Form 3CEB certification pending. TP study for FY 2024-25 needs finalization.",
        priority: "critical",
        status: "in_progress",
        dueDate: "2024-07-31",
      },
    ],
    reviewNotes: [],
    signOff: [
      {
        ...baseEntity,
        id: "so-glb-1" as UUID,
        engagementId: IDS.AUDIT_ENGAGEMENTS.GLOBAL_AUDIT_FY24,
        userId: IDS.USERS.SENIOR_2,
        role: "reviewer",
        action: "review",
        timestamp: "2024-07-01T10:00:00Z",
        comments: "Fieldwork substantially complete. TP documentation and group reporting package pending.",
      },
    ],
  },
  {
    ...baseEntity,
    id: IDS.AUDIT_ENGAGEMENTS.MFG_AUDIT_FY24,
    engagementNumber: "AUD-MFG-24-001",
    clientId: IDS.CLIENTS.MANUFACTURING_CO,
    name: "Precision Mfg Co - Statutory Audit FY 2024-25",
    description: "Statutory audit of manufacturing company",
    type: "statutory",
    status: "completed",
    period: {
      label: "FY 2024-25",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      financialYear: "2024-25",
    },
    assignedTeam: createAuditTeam(
      IDS.USERS.PARTNER_1,
      [IDS.USERS.MANAGER_2],
      [IDS.USERS.SENIOR_1],
      [IDS.USERS.ASSOCIATE_1],
    ),
    planning: {
      understandingOfEntity:
        "Precision manufacturing company with export orientation. Subject to cost audit requirements.",
      riskAssessmentSummary: "Moderate risk. Inventory and cost accounting are key focus areas.",
      materialityBasis: "0.6% of revenue",
      planningNotes: "Coordinate with cost auditor. Focus on export incentives and cost records.",
      completedAt: "2024-05-01T10:00:00Z",
      completedBy: IDS.USERS.PARTNER_1,
    },
    riskAssessment: {
      inherentRisk: "medium",
      controlRisk: "medium",
      detectionRisk: "medium",
      overallRisk: "medium",
      keyRisks: createKeyRisks([]),
      assessedAt: "2024-05-05T10:00:00Z",
      assessedBy: IDS.USERS.PARTNER_1,
    },
    materiality: {
      overallMateriality: 400000,
      performanceMateriality: 280000,
      trivialThreshold: 20000,
      basis: "0.6% of projected revenue",
      calculatedAt: "2024-05-01T10:00:00Z",
      calculatedBy: IDS.USERS.PARTNER_1,
    },
    programs: createAuditPrograms(IDS.AUDIT_ENGAGEMENTS.MFG_AUDIT_FY24),
    workpapers: createWorkpapers(IDS.AUDIT_ENGAGEMENTS.MFG_AUDIT_FY24),
    queries: [],
    reviewNotes: [],
    signOff: [
      {
        ...baseEntity,
        id: "so-mfg-1" as UUID,
        engagementId: IDS.AUDIT_ENGAGEMENTS.MFG_AUDIT_FY24,
        userId: IDS.USERS.PARTNER_1,
        role: "partner",
        action: "approve",
        timestamp: "2024-08-15T10:00:00Z",
        comments: "Audit completed. Unqualified opinion issued.",
      },
      {
        ...baseEntity,
        id: "so-mfg-2" as UUID,
        engagementId: IDS.AUDIT_ENGAGEMENTS.MFG_AUDIT_FY24,
        userId: IDS.USERS.MANAGER_2,
        role: "manager",
        action: "review",
        timestamp: "2024-08-10T10:00:00Z",
        comments: "All queries resolved. Financial statements approved.",
      },
    ],
  },
  {
    ...baseEntity,
    id: IDS.AUDIT_ENGAGEMENTS.HEALTHCARE_AUDIT_FY24,
    engagementNumber: "AUD-HLT-24-001",
    clientId: IDS.CLIENTS.HEALTHCARE_PVT,
    name: "MediCare Hospitals - Statutory Audit FY 2024-25",
    description: "Statutory audit of healthcare company",
    type: "statutory",
    status: "reporting",
    period: {
      label: "FY 2024-25",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      financialYear: "2024-25",
    },
    assignedTeam: createAuditTeam(
      IDS.USERS.PARTNER_2,
      [IDS.USERS.MANAGER_1],
      [IDS.USERS.SENIOR_1],
      [IDS.USERS.ASSOCIATE_2],
    ),
    planning: {
      understandingOfEntity:
        "Hospital chain with multiple locations. Revenue from patient services, pharmacy, and diagnostics. Regulatory compliance critical.",
      riskAssessmentSummary:
        "High risk in revenue recognition (patient billing), regulatory compliance, and fixed asset capitalization.",
      materialityBasis: "0.5% of revenue",
      planningNotes: "Focus on clinical establishment compliance, revenue leakage, and capex classification.",
      completedAt: "2024-04-20T10:00:00Z",
      completedBy: IDS.USERS.PARTNER_2,
    },
    riskAssessment: {
      inherentRisk: "high",
      controlRisk: "medium",
      detectionRisk: "medium",
      overallRisk: "high",
      keyRisks: [
        {
          id: "risk-hlt-1" as UUID,
          description: "Patient revenue recognition and unbilled revenue",
          assertion: "Completeness",
          riskLevel: "high",
          response: "Test billing system integration and cutoff procedures",
          workpaperRefs: [],
        },
        {
          id: "risk-hlt-2" as UUID,
          description: "Capitalization of medical equipment vs repairs",
          assertion: "Classification",
          riskLevel: "medium",
          response: "Review capex policy and test sample of additions",
          workpaperRefs: [],
        },
      ],
      assessedAt: "2024-04-25T10:00:00Z",
      assessedBy: IDS.USERS.PARTNER_2,
    },
    materiality: {
      overallMateriality: 600000,
      performanceMateriality: 420000,
      trivialThreshold: 30000,
      basis: "0.5% of projected revenue",
      calculatedAt: "2024-04-20T10:00:00Z",
      calculatedBy: IDS.USERS.PARTNER_2,
    },
    programs: createAuditPrograms(IDS.AUDIT_ENGAGEMENTS.HEALTHCARE_AUDIT_FY24),
    workpapers: [],
    queries: [],
    reviewNotes: [],
    signOff: [],
  },
];

export const getAuditEngagementById = (id: string): AuditEngagement | undefined =>
  mockAuditEngagements.find((a) => a.id === id);

export const getAuditEngagementsByClient = (clientId: string): AuditEngagement[] =>
  mockAuditEngagements.filter((a) => a.clientId === clientId);

export const getAuditEngagementsByStatus = (status: AuditStatus): AuditEngagement[] =>
  mockAuditEngagements.filter((a) => a.status === status);

export const getAuditEngagementsByPartner = (partnerId: string): AuditEngagement[] =>
  mockAuditEngagements.filter((a) => a.assignedTeam.partnerId === partnerId);

export const getAuditEngagementsByManager = (managerId: string): AuditEngagement[] =>
  mockAuditEngagements.filter((a) => a.assignedTeam.managerIds.includes(managerId));

export const getWorkpapersByEngagement = (engagementId: string): Workpaper[] => {
  const engagement = getAuditEngagementById(engagementId);
  return engagement?.workpapers ?? [];
};

export const getAuditQueriesByEngagement = (engagementId: string): AuditQuery[] => {
  const engagement = getAuditEngagementById(engagementId);
  return engagement?.queries ?? [];
};

export const getReviewNotesByEngagement = (engagementId: string): ReviewNote[] => {
  const engagement = getAuditEngagementById(engagementId);
  return engagement?.reviewNotes ?? [];
};

export const getSignOffsByEngagement = (engagementId: string): SignOff[] => {
  const engagement = getAuditEngagementById(engagementId);
  return engagement?.signOff ?? [];
};

export const getAuditProgramsByEngagement = (engagementId: string): AuditProgram[] => {
  const engagement = getAuditEngagementById(engagementId);
  return engagement?.programs ?? [];
};
