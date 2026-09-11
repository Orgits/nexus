export const IDS = {
  FIRM: "firm-001" as const,
  TENANT: "tenant-001" as const,

  USERS: {
    ADMIN: "user-admin-001" as const,
    PARTNER_1: "user-partner-001" as const,
    PARTNER_2: "user-partner-002" as const,
    MANAGER_1: "user-manager-001" as const,
    MANAGER_2: "user-manager-002" as const,
    SENIOR_1: "user-senior-001" as const,
    SENIOR_2: "user-senior-002" as const,
    ASSOCIATE_1: "user-associate-001" as const,
    ASSOCIATE_2: "user-associate-002" as const,
    SUPPORT_1: "user-support-001" as const,
  },

  TEAMS: {
    TAXATION: "team-taxation-001" as const,
    GST: "team-gst-001" as const,
    AUDIT: "team-audit-001" as const,
    ADVISORY: "team-advisory-001" as const,
    SECRETARIAL: "team-secretarial-001" as const,
    PAYROLL: "team-payroll-001" as const,
  },

  DEPARTMENTS: {
    TAX: "dept-tax-001" as const,
    AUDIT: "dept-audit-001" as const,
    ADVISORY: "dept-advisory-001" as const,
    OPERATIONS: "dept-ops-001" as const,
  },

  CLIENTS: {
    ABC_PVT_LTD: "client-abc-001" as const,
    XYZ_LLP: "client-xyz-001" as const,
    SHARMA_PROP: "client-sharma-001" as const,
    GLOBAL_CORP: "client-global-001" as const,
    TECH_STARTUP: "client-tech-001" as const,
    RETAIL_CHAIN: "client-retail-001" as const,
    MANUFACTURING_CO: "client-mfg-001" as const,
    HEALTHCARE_PVT: "client-health-001" as const,
    FINTECH_LLP: "client-fintech-001" as const,
    REAL_ESTATE: "client-realestate-001" as const,
  },

  CONTACTS: {
    ABC_RAJESH: "contact-abc-001" as const,
    ABC_PRIYA: "contact-abc-002" as const,
    XYZ_AMIT: "contact-xyz-001" as const,
    SHARMA_RAVI: "contact-sharma-001" as const,
    GLOBAL_SARAH: "contact-global-001" as const,
    TECH_ARJUN: "contact-tech-001" as const,
    RETAIL_MEERA: "contact-retail-001" as const,
    MFG_VIKRAM: "contact-mfg-001" as const,
    HEALTH_DR: "contact-health-001" as const,
    FINTECH_NEHA: "contact-fintech-001" as const,
    REAL_RAHUL: "contact-real-001" as const,
  },

  MATTERS: {
    ABC_ITR_FY24: "matter-abc-itr-001" as const,
    ABC_GST_Q1: "matter-abc-gst-001" as const,
    ABC_TDS_Q1: "matter-abc-tds-001" as const,
    ABC_AUDIT_FY24: "matter-abc-audit-001" as const,
    XYZ_ITR_FY24: "matter-xyz-itr-001" as const,
    XYZ_GST_MONTHLY: "matter-xyz-gst-001" as const,
    SHARMA_ITR_FY24: "matter-sharma-itr-001" as const,
    GLOBAL_ITR_FY24: "matter-global-itr-001" as const,
    GLOBAL_GST_Q1: "matter-global-gst-001" as const,
    GLOBAL_TDS_Q1: "matter-global-tds-001" as const,
    TECH_ITR_FY24: "matter-tech-itr-001" as const,
    TECH_GST_Q1: "matter-tech-gst-001" as const,
    RETAIL_ITR_FY24: "matter-retail-itr-001" as const,
    RETAIL_GST_Q1: "matter-retail-gst-001" as const,
    MFG_ITR_FY24: "matter-mfg-itr-001" as const,
    MFG_GST_Q1: "matter-mfg-gst-001" as const,
    HEALTH_ITR_FY24: "matter-health-itr-001" as const,
    FINTECH_ITR_FY24: "matter-fintech-itr-001" as const,
    REAL_ITR_FY24: "matter-real-itr-001" as const,
  },

  COMPLIANCE_CYCLES: {
    ABC_ITR_FY24: "cycle-abc-itr-001" as const,
    ABC_GST_APR: "cycle-abc-gst-001" as const,
    ABC_GST_MAY: "cycle-abc-gst-002" as const,
    ABC_GST_JUN: "cycle-abc-gst-003" as const,
    ABC_TDS_Q1: "cycle-abc-tds-001" as const,
    XYZ_ITR_FY24: "cycle-xyz-itr-001" as const,
    XYZ_GST_APR: "cycle-xyz-gst-001" as const,
    XYZ_GST_MAY: "cycle-xyz-gst-002" as const,
    SHARMA_ITR_FY24: "cycle-sharma-itr-001" as const,
    GLOBAL_ITR_FY24: "cycle-global-itr-001" as const,
    GLOBAL_GST_APR: "cycle-global-gst-001" as const,
    GLOBAL_TDS_Q1: "cycle-global-tds-001" as const,
    TECH_ITR_FY24: "cycle-tech-itr-001" as const,
    TECH_GST_APR: "cycle-tech-gst-001" as const,
    RETAIL_ITR_FY24: "cycle-retail-itr-001" as const,
    RETAIL_GST_APR: "cycle-retail-gst-001" as const,
    MFG_ITR_FY24: "cycle-mfg-itr-001" as const,
    MFG_GST_APR: "cycle-mfg-gst-001" as const,
    HEALTH_ITR_FY24: "cycle-health-itr-001" as const,
    FINTECH_ITR_FY24: "cycle-fintech-itr-001" as const,
    REAL_ITR_FY24: "cycle-real-itr-001" as const,
  },

  TASKS: {
    ABC_ITR_COLLECT_DOCS: "task-abc-itr-001" as const,
    ABC_ITR_COMPUTE: "task-abc-itr-002" as const,
    ABC_ITR_REVIEW: "task-abc-itr-003" as const,
    ABC_GST_RECON: "task-abc-gst-001" as const,
    ABC_GST_FILE: "task-abc-gst-002" as const,
    ABC_TDS_CHALLAN: "task-abc-tds-001" as const,
    ABC_AUDIT_PLANNING: "task-abc-audit-001" as const,
    XYZ_ITR_COLLECT: "task-xyz-itr-001" as const,
    XYZ_GST_RECON: "task-xyz-gst-001" as const,
    SHARMA_ITR_DOCS: "task-sharma-itr-001" as const,
    GLOBAL_ITR_COMPUTE: "task-global-itr-001" as const,
    GLOBAL_GST_RECON: "task-global-gst-001" as const,
  },

  DOCUMENTS: {
    ABC_PAN: "doc-abc-pan-001" as const,
    ABC_AADHAAR: "doc-abc-aadhaar-001" as const,
    ABC_GST_REG: "doc-abc-gst-001" as const,
    ABC_FINANCIALS: "doc-abc-fin-001" as const,
    ABC_FORM16: "doc-abc-form16-001" as const,
    ABC_26AS: "doc-abc-26as-001" as const,
    XYZ_PAN: "doc-xyz-pan-001" as const,
    XYZ_GST_REG: "doc-xyz-gst-001" as const,
    SHARMA_PAN: "doc-sharma-pan-001" as const,
    GLOBAL_INCORP: "doc-global-incorp-001" as const,
  },

  COMMUNICATIONS: {
    ABC_EMAIL_1: "comm-abc-email-001" as const,
    ABC_WHATSAPP_1: "comm-abc-wa-001" as const,
    XYZ_EMAIL_1: "comm-xyz-email-001" as const,
    GLOBAL_EMAIL_1: "comm-global-email-001" as const,
  },

  CONVERSATIONS: {
    ABC_CONV_1: "conv-abc-001" as const,
    XYZ_CONV_1: "conv-xyz-001" as const,
    GLOBAL_CONV_1: "conv-global-001" as const,
  },

  CAMPAIGNS: {
    ITR_REMINDER_MAY: "campaign-itr-may-001" as const,
    GST_REMINDER_APR: "campaign-gst-apr-001" as const,
  },

  NOTICES: {
    ABC_IT_NOTICE: "notice-abc-it-001" as const,
    XYZ_GST_NOTICE: "notice-xyz-gst-001" as const,
  },

  CALENDAR_EVENTS: {
    ABC_ITR_DEADLINE: "cal-abc-itr-001" as const,
    ABC_GST_DEADLINE: "cal-abc-gst-001" as const,
    XYZ_ITR_DEADLINE: "cal-xyz-itr-001" as const,
  },

  REVIEWS: {
    ABC_ITR_REVIEW: "review-abc-itr-001" as const,
    ABC_GST_REVIEW: "review-abc-gst-001" as const,
    XYZ_ITR_REVIEW: "review-xyz-itr-001" as const,
    GLOBAL_TDS_REVIEW: "review-global-tds-001" as const,
    RETAIL_GST_REVIEW: "review-retail-gst-001" as const,
  },

  AUDIT_ENGAGEMENTS: {
    ABC_AUDIT_FY24: "audit-abc-audit-001" as const,
    XYZ_AUDIT_FY24: "audit-xyz-audit-001" as const,
    GLOBAL_AUDIT_FY24: "audit-global-audit-001" as const,
    MFG_AUDIT_FY24: "audit-mfg-audit-001" as const,
    HEALTHCARE_AUDIT_FY24: "audit-health-audit-001" as const,
  },

  TIME_ENTRIES: {
    ABC_ITR_1: "time-abc-itr-001" as const,
    ABC_GST_1: "time-abc-gst-001" as const,
    XYZ_ITR_1: "time-xyz-itr-001" as const,
  },

  INVOICES: {
    ABC_ITR_INV: "inv-abc-itr-001" as const,
    ABC_GST_INV: "inv-abc-gst-001" as const,
    XYZ_ITR_INV: "inv-xyz-itr-001" as const,
  },

  PAYMENTS: {
    ABC_ITR_PAY: "pay-abc-itr-001" as const,
    XYZ_ITR_PAY: "pay-xyz-itr-001" as const,
  },

  EXPENSES: {
    ABC_TRAVEL: "exp-abc-travel-001" as const,
  },

  DSC_REGISTERS: {
    ABC_DSC_1: "dsc-abc-001" as const,
    PARTNER_1_DSC: "dsc-partner1-001" as const,
  },

  UDIN_REGISTERS: {
    ABC_UDIN_1: "udin-abc-001" as const,
  },

  LICENSES: {
    ABC_SHOP: "license-abc-shop-001" as const,
    ABC_PROF_TAX: "license-abc-pt-001" as const,
  },

  ENGAGEMENT_DOCS: {
    ABC_ENGAGEMENT: "engage-abc-001" as const,
    XYZ_ENGAGEMENT: "engage-xyz-001" as const,
  },
} as const;

export type EntityId = (typeof IDS)[keyof typeof IDS];
