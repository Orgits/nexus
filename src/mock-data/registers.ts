import type {
  DSCRegister,
  DSCStatus,
  EngagementDocument,
  EngagementDocumentStatus,
  LicenseRegister,
  LicenseStatus,
  PhysicalFile,
  PhysicalFileLocation,
  PhysicalFileStatus,
  UDINRegister,
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

export const mockDSCRegisters: DSCRegister[] = [
  {
    ...baseEntity,
    id: IDS.DSC_REGISTERS.ABC_DSC_1,
    holderName: "ABC Private Limited",
    holderType: "company",
    holderId: IDS.CLIENTS.ABC_PVT_LTD,
    certificateType: "class3",
    certifyingAuthority: "eMudhra",
    serialNumber: "1234567890ABCDEF",
    issuedDate: "2023-02-01",
    expiryDate: "2025-02-01",
    status: "valid",
    custodianId: IDS.USERS.SUPPORT_1,
    physicalLocation: "Safe - Cabinet A, Slot 1",
    tokenType: "usb_token",
    renewalReminderSent: false,
  },
  {
    ...baseEntity,
    id: IDS.DSC_REGISTERS.PARTNER_1_DSC,
    holderName: "Priya Sharma",
    holderType: "partner",
    holderId: IDS.USERS.PARTNER_1,
    certificateType: "class3",
    certifyingAuthority: "Vsign",
    serialNumber: "ABCDEF1234567890",
    issuedDate: "2023-05-15",
    expiryDate: "2025-05-15",
    status: "valid",
    custodianId: IDS.USERS.PARTNER_1,
    physicalLocation: "With holder",
    tokenType: "usb_token",
    renewalReminderSent: false,
  },
  {
    ...baseEntity,
    id: "dsc-xyz-001",
    holderName: "XYZ LLP",
    holderType: "llp",
    holderId: IDS.CLIENTS.XYZ_LLP,
    certificateType: "class3",
    certifyingAuthority: "eMudhra",
    serialNumber: "XYZDSC123456789",
    issuedDate: "2022-11-01",
    expiryDate: "2024-11-01",
    status: "expiring_soon",
    custodianId: IDS.USERS.SUPPORT_1,
    physicalLocation: "Safe - Cabinet A, Slot 2",
    tokenType: "usb_token",
    renewalReminderSent: true,
  },
  {
    ...baseEntity,
    id: "dsc-global-001",
    holderName: "Global Corporation India Pvt Ltd",
    holderType: "company",
    holderId: IDS.CLIENTS.GLOBAL_CORP,
    certificateType: "class3",
    certifyingAuthority: "Capricorn",
    serialNumber: "GLBDSC987654321",
    issuedDate: "2023-08-01",
    expiryDate: "2025-08-01",
    status: "valid",
    custodianId: IDS.USERS.SUPPORT_1,
    physicalLocation: "Safe - Cabinet B, Slot 1",
    tokenType: "hsm",
    renewalReminderSent: false,
  },
  {
    ...baseEntity,
    id: "dsc-partner2-001",
    holderName: "Amit Patel",
    holderType: "partner",
    holderId: IDS.USERS.PARTNER_2,
    certificateType: "class3",
    certifyingAuthority: "eMudhra",
    serialNumber: "PATELDSC55555555",
    issuedDate: "2023-01-20",
    expiryDate: "2025-01-20",
    status: "valid",
    custodianId: IDS.USERS.PARTNER_2,
    physicalLocation: "With holder",
    tokenType: "usb_token",
    renewalReminderSent: false,
  },
];

export const mockUDINRegisters: UDINRegister[] = [
  {
    ...baseEntity,
    id: IDS.UDIN_REGISTERS.ABC_UDIN_1,
    udin: "24123456AAAAAA1234",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    documentId: IDS.DOCUMENTS.ABC_FINANCIALS,
    certificateType: "Tax Audit Report u/s 44AB",
    financialYear: "2023-24",
    generatedDate: "2024-06-15",
    generatedBy: IDS.USERS.PARTNER_1,
    status: "generated",
  },
  {
    ...baseEntity,
    id: "udin-xyz-001" as any,
    udin: "24567890BBBBBB5678",
    clientId: IDS.CLIENTS.XYZ_LLP,
    matterId: IDS.MATTERS.XYZ_ITR_FY24,
    certificateType: "ITR-5 Filing",
    financialYear: "2023-24",
    generatedDate: "2024-06-28",
    generatedBy: IDS.USERS.PARTNER_1,
    status: "used",
    usedFor: "ITR-5 Filing for AY 2024-25",
    usedAt: "2024-06-28T14:30:00Z",
  },
  {
    ...baseEntity,
    id: "udin-global-001" as any,
    udin: "24987654CCCCCC9876",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
    certificateType: "Transfer Pricing Certificate (Form 3CEB)",
    financialYear: "2023-24",
    generatedDate: "2024-07-10",
    generatedBy: IDS.USERS.PARTNER_2,
    status: "generated",
  },
  {
    ...baseEntity,
    id: "udin-mfg-001" as any,
    udin: "24111111DDDDDD1111",
    clientId: IDS.CLIENTS.MANUFACTURING_CO,
    matterId: IDS.MATTERS.MFG_ITR_FY24,
    certificateType: "Statutory Audit Report",
    financialYear: "2023-24",
    generatedDate: "2024-09-20",
    generatedBy: IDS.USERS.PARTNER_2,
    status: "generated",
  },
];

export const mockLicenseRegisters: LicenseRegister[] = [
  {
    ...baseEntity,
    id: IDS.LICENSES.ABC_SHOP,
    name: "Shop & Establishment Registration",
    type: "shop_establishment",
    issuingAuthority: "Labour Department - Haryana",
    registrationNumber: "HR/SHOP/2020/001234",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    issueDate: "2020-02-15",
    expiryDate: "2025-02-14",
    renewalDate: "2025-01-15",
    status: "active",
    responsibleUserId: IDS.USERS.SENIOR_1,
    documents: [IDS.DOCUMENTS.ABC_GST_REG],
    renewalReminderSent: false,
    autoRenewal: true,
    cost: 5000,
    currency: "INR",
  },
  {
    ...baseEntity,
    id: IDS.LICENSES.ABC_PROF_TAX,
    name: "Professional Tax Registration",
    type: "professional_tax",
    issuingAuthority: "Professional Tax Department - Haryana",
    registrationNumber: "PT/HR/2020/001234",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    issueDate: "2020-02-20",
    expiryDate: "2025-03-31",
    renewalDate: "2025-03-01",
    status: "active",
    responsibleUserId: IDS.USERS.SENIOR_1,
    documents: [],
    renewalReminderSent: false,
    autoRenewal: true,
    cost: 2500,
    currency: "INR",
  },
  {
    ...baseEntity,
    id: "license-xyz-shop-001" as any,
    name: "Shop & Establishment Registration",
    type: "shop_establishment",
    issuingAuthority: "Labour Department - Maharashtra",
    registrationNumber: "MH/SHOP/2019/005678",
    clientId: IDS.CLIENTS.XYZ_LLP,
    issueDate: "2019-06-01",
    expiryDate: "2024-05-31",
    renewalDate: "2024-04-30",
    status: "renewal_in_progress",
    responsibleUserId: IDS.USERS.ASSOCIATE_1,
    documents: [],
    renewalReminderSent: true,
    autoRenewal: false,
    cost: 3000,
    currency: "INR",
  },
  {
    ...baseEntity,
    id: "license-global-iec-001" as any,
    name: "Import Export Code (IEC)",
    type: "import_export",
    issuingAuthority: "DGFT",
    registrationNumber: "0798765432",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    issueDate: "2018-07-15",
    expiryDate: "2028-07-14",
    status: "active",
    responsibleUserId: IDS.USERS.SENIOR_2,
    documents: [IDS.DOCUMENTS.GLOBAL_INCORP],
    renewalReminderSent: false,
    autoRenewal: true,
    cost: 500,
    currency: "INR",
  },
  {
    ...baseEntity,
    id: "license-rtl-fssai-001" as any,
    name: "FSSAI License - Central",
    type: "fssai",
    issuingAuthority: "FSSAI",
    registrationNumber: "12324567890123",
    clientId: IDS.CLIENTS.RETAIL_CHAIN,
    issueDate: "2021-01-10",
    expiryDate: "2026-01-09",
    renewalDate: "2025-12-10",
    status: "active",
    responsibleUserId: IDS.USERS.SENIOR_1,
    documents: [],
    renewalReminderSent: false,
    autoRenewal: true,
    cost: 7500,
    currency: "INR",
  },
];

export const mockEngagementDocuments: EngagementDocument[] = [
  {
    ...baseEntity,
    id: IDS.ENGAGEMENT_DOCS.ABC_ENGAGEMENT,
    templateId: "tpl-engagement-audit" as any,
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_AUDIT_FY24,
    name: "Audit Engagement Letter - FY 2024-25",
    status: "signed",
    signers: [
      {
        id: "sgn-abc-1" as any,
        name: "Priya Sharma",
        email: "partner1@canexus.com",
        role: "partner",
        order: 1,
        status: "signed",
        signedAt: "2024-04-10T11:00:00Z",
        ipAddress: "192.168.1.100",
      },
      {
        id: "sgn-abc-2" as any,
        name: "Rajesh Kumar",
        email: "rajesh.kumar@abc.com",
        role: "client",
        order: 2,
        status: "signed",
        signedAt: "2024-04-12T14:30:00Z",
        ipAddress: "203.192.168.50",
      },
    ],
    sentAt: "2024-04-10T10:00:00Z",
    completedAt: "2024-04-12T14:30:00Z",
    signedDocumentId: "doc-signed-abc-engagement",
    reminderCount: 0,
  },
  {
    ...baseEntity,
    id: IDS.ENGAGEMENT_DOCS.XYZ_ENGAGEMENT,
    templateId: "tpl-engagement-gst" as any,
    clientId: IDS.CLIENTS.XYZ_LLP,
    matterId: IDS.MATTERS.XYZ_GST_MONTHLY,
    name: "GST Compliance Engagement Letter",
    status: "partially_signed",
    signers: [
      {
        id: "sgn-xyz-1" as any,
        name: "Anjali Gupta",
        email: "senior1@canexus.com",
        role: "partner",
        order: 1,
        status: "signed",
        signedAt: "2024-04-05T10:00:00Z",
        ipAddress: "192.168.1.101",
      },
      {
        id: "sgn-xyz-2" as any,
        name: "Amit Desai",
        email: "amit.desai@xyz.com",
        role: "client",
        order: 2,
        status: "pending",
      },
    ],
    sentAt: "2024-04-05T10:00:00Z",
    reminderCount: 2,
    lastReminderAt: "2024-06-15T10:00:00Z",
  },
  {
    ...baseEntity,
    id: "engage-global-001" as any,
    templateId: "tpl-engagement-advisory" as any,
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
    name: "Tax Advisory & Transfer Pricing Engagement",
    status: "pending_signature",
    signers: [
      {
        id: "sgn-glb-1" as any,
        name: "Amit Patel",
        email: "partner2@canexus.com",
        role: "partner",
        order: 1,
        status: "signed",
        signedAt: "2024-05-01T10:00:00Z",
      },
      {
        id: "sgn-glb-2" as any,
        name: "Sarah Johnson",
        email: "sarah.johnson@globalcorp.com",
        role: "client",
        order: 2,
        status: "pending",
      },
    ],
    sentAt: "2024-05-01T10:00:00Z",
    reminderCount: 1,
    lastReminderAt: "2024-06-01T10:00:00Z",
  },
  {
    ...baseEntity,
    id: "engage-tech-001" as any,
    templateId: "tpl-engagement-startup" as any,
    clientId: IDS.CLIENTS.TECH_STARTUP,
    matterId: IDS.MATTERS.TECH_ITR_FY24,
    name: "Startup Tax Advisory Engagement",
    status: "draft",
    signers: [
      {
        id: "sgn-tech-1" as any,
        name: "Neha Singh",
        email: "manager1@canexus.com",
        role: "partner",
        order: 1,
        status: "pending",
      },
      {
        id: "sgn-tech-2" as any,
        name: "Arjun Kapoor",
        email: "arjun.kapoor@technova.com",
        role: "client",
        order: 2,
        status: "pending",
      },
    ],
    reminderCount: 0,
  },
];

export const getDSCByClient = (clientId: string): DSCRegister[] =>
  mockDSCRegisters.filter((d) => d.holderId === clientId);

export const getDSCByStatus = (status: DSCStatus): DSCRegister[] => mockDSCRegisters.filter((d) => d.status === status);

export const getExpiringDSCs = (days = 30): DSCRegister[] => {
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return mockDSCRegisters.filter((d) => new Date(d.expiryDate) <= future && d.status !== "expired");
};

export const getUDINByClient = (clientId: string): UDINRegister[] =>
  mockUDINRegisters.filter((u) => u.clientId === clientId);

export const getUDINByStatus = (status: UDINRegister["status"]): UDINRegister[] =>
  mockUDINRegisters.filter((u) => u.status === status);

export const getLicensesByClient = (clientId: string): LicenseRegister[] =>
  mockLicenseRegisters.filter((l) => l.clientId === clientId);

export const getLicensesByStatus = (status: LicenseStatus): LicenseRegister[] =>
  mockLicenseRegisters.filter((l) => l.status === status);

export const getExpiringLicenses = (days = 60): LicenseRegister[] => {
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return mockLicenseRegisters.filter(
    (l) => new Date(l.expiryDate) <= future && l.status !== "expired" && l.status !== "cancelled",
  );
};

export const getEngagementDocsByClient = (clientId: string): EngagementDocument[] =>
  mockEngagementDocuments.filter((e) => e.clientId === clientId);

export const getEngagementDocsByStatus = (status: EngagementDocumentStatus): EngagementDocument[] =>
  mockEngagementDocuments.filter((e) => e.status === status);

export const getPendingSignatureEngagements = (): EngagementDocument[] =>
  mockEngagementDocuments.filter((e) => e.status === "pending_signature" || e.status === "partially_signed");

const createLocation = (
  building?: string,
  room?: string,
  cabinet?: string,
  shelf?: string,
  box?: string,
  slot?: string,
  description?: string,
): PhysicalFileLocation => ({
  building,
  room,
  cabinet,
  shelf,
  box,
  slot,
  description,
});

export const mockPhysicalFiles: PhysicalFile[] = [
  {
    ...baseEntity,
    id: "pf-abc-001" as any,
    fileNumber: "PF-ABC-001",
    title: "ABC Pvt Ltd - Incorporation Documents",
    description: "Original Certificate of Incorporation, MOA, AOA, and Form INC-32",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_ITR_FY24,
    storageLocation: createLocation(
      "Main Office",
      "Records Room",
      "Cabinet A",
      "Shelf 1",
      "Box 1",
      "A1",
      "Incorporation documents for ABC Pvt Ltd",
    ),
    currentLocation: createLocation(
      "Main Office",
      "Records Room",
      "Cabinet A",
      "Shelf 1",
      "Box 1",
      "A1",
      "Incorporation documents for ABC Pvt Ltd",
    ),
    status: "stored",
    custodianId: IDS.USERS.SUPPORT_1,
    tags: ["incorporation", "kyc", "permanent"],
    isConfidential: true,
    retentionPolicy: { retentionYears: 15, disposalAction: "archive", legalBasis: "Companies Act" },
    relatedDocumentIds: [IDS.DOCUMENTS.ABC_PAN, IDS.DOCUMENTS.ABC_GST_REG],
    movementHistory: [
      {
        id: "mov-001" as any,
        fromLocation: undefined,
        toLocation: createLocation("Main Office", "Records Room", "Cabinet A", "Shelf 1", "Box 1", "A1"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2023-01-15T10:00:00Z",
        reason: "Initial filing",
      },
    ],
  },
  {
    ...baseEntity,
    id: "pf-abc-002" as any,
    fileNumber: "PF-ABC-002",
    title: "ABC Pvt Ltd - Statutory Audit Files FY 2023-24",
    description: "Audit working papers, trial balance, and signed audit report",
    clientId: IDS.CLIENTS.ABC_PVT_LTD,
    matterId: IDS.MATTERS.ABC_AUDIT_FY24,
    storageLocation: createLocation("Main Office", "Audit Room", "Cabinet B", "Shelf 2", "Box 5", "B2"),
    currentLocation: createLocation("Main Office", "Audit Room", "Cabinet B", "Shelf 2", "Box 5", "B2"),
    status: "stored",
    custodianId: IDS.USERS.MANAGER_2,
    tags: ["audit", "fy24", "working-papers"],
    isConfidential: true,
    retentionPolicy: { retentionYears: 10, disposalAction: "archive", legalBasis: "Companies Act" },
    relatedDocumentIds: [],
    movementHistory: [
      {
        id: "mov-002" as any,
        fromLocation: undefined,
        toLocation: createLocation("Main Office", "Audit Room", "Cabinet B", "Shelf 2", "Box 5", "B2"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2024-04-01T10:00:00Z",
        reason: "Audit file created",
      },
    ],
  },
  {
    ...baseEntity,
    id: "pf-xyz-001" as any,
    fileNumber: "PF-XYZ-001",
    title: "XYZ LLP - Partnership Deed & Registration",
    description: "Original LLP Agreement, Form FiLLiP, and Partner consent letters",
    clientId: IDS.CLIENTS.XYZ_LLP,
    matterId: IDS.MATTERS.XYZ_ITR_FY24,
    storageLocation: createLocation("Main Office", "Records Room", "Cabinet A", "Shelf 2", "Box 3", "A3"),
    currentLocation: createLocation(
      "Partner Office",
      "Desk",
      undefined,
      undefined,
      undefined,
      undefined,
      "With Partner for review",
    ),
    status: "checked_out",
    custodianId: IDS.USERS.SUPPORT_1,
    checkedOutById: IDS.USERS.PARTNER_1,
    checkedOutAt: "2024-06-20T14:00:00Z",
    dueBackAt: "2024-07-20T14:00:00Z",
    tags: ["llp", "partnership", "registration"],
    isConfidential: true,
    retentionPolicy: { retentionYears: 15, disposalAction: "archive", legalBasis: "LLP Act" },
    relatedDocumentIds: [IDS.DOCUMENTS.XYZ_PAN, IDS.DOCUMENTS.XYZ_GST_REG],
    movementHistory: [
      {
        id: "mov-003" as any,
        fromLocation: undefined,
        toLocation: createLocation("Main Office", "Records Room", "Cabinet A", "Shelf 2", "Box 3", "A3"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2023-02-01T10:00:00Z",
        reason: "Initial filing",
      },
      {
        id: "mov-004" as any,
        fromLocation: createLocation("Main Office", "Records Room", "Cabinet A", "Shelf 2", "Box 3", "A3"),
        toLocation: createLocation("Partner Office", "Desk"),
        movedById: IDS.USERS.PARTNER_1,
        movedAt: "2024-06-20T14:00:00Z",
        reason: "Partner review of LLP agreement",
        checkedOutById: IDS.USERS.PARTNER_1,
        dueBackAt: "2024-07-20T14:00:00Z",
      },
    ],
  },
  {
    ...baseEntity,
    id: "pf-global-001" as any,
    fileNumber: "PF-GLB-001",
    title: "Global Corp India - Transfer Pricing Documentation FY 2023-24",
    description: "Master file, local file, and Form 3CEB for international transactions",
    clientId: IDS.CLIENTS.GLOBAL_CORP,
    matterId: IDS.MATTERS.GLOBAL_ITR_FY24,
    storageLocation: createLocation("Main Office", "TP Room", "Cabinet C", "Shelf 1", "Box 10", "C1"),
    currentLocation: createLocation("Main Office", "TP Room", "Cabinet C", "Shelf 1", "Box 10", "C1"),
    status: "stored",
    custodianId: IDS.USERS.SENIOR_2,
    tags: ["transfer-pricing", "form3ceb", "international"],
    isConfidential: true,
    retentionPolicy: { retentionYears: 10, disposalAction: "archive", legalBasis: "Income Tax Act" },
    relatedDocumentIds: [IDS.DOCUMENTS.GLOBAL_INCORP],
    movementHistory: [
      {
        id: "mov-005" as any,
        fromLocation: undefined,
        toLocation: createLocation("Main Office", "TP Room", "Cabinet C", "Shelf 1", "Box 10", "C1"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2024-05-01T10:00:00Z",
        reason: "TP documentation filed",
      },
    ],
  },
  {
    ...baseEntity,
    id: "pf-rtl-001" as any,
    fileNumber: "PF-RTL-001",
    title: "RetailMax Chain - Multi-state GST Registration Files",
    description: "GST registration certificates for 12 states, authorization letters",
    clientId: IDS.CLIENTS.RETAIL_CHAIN,
    matterId: IDS.MATTERS.RETAIL_GST_Q1,
    storageLocation: createLocation("Main Office", "GST Room", "Cabinet D", "Shelf 1", undefined, undefined),
    currentLocation: createLocation("Main Office", "GST Room", "Cabinet D", "Shelf 1", undefined, undefined),
    status: "stored",
    custodianId: IDS.USERS.SENIOR_1,
    tags: ["gst", "multi-state", "registration"],
    isConfidential: false,
    retentionPolicy: { retentionYears: 8, disposalAction: "archive" },
    relatedDocumentIds: [],
    movementHistory: [
      {
        id: "mov-006" as any,
        fromLocation: undefined,
        toLocation: createLocation("Main Office", "GST Room", "Cabinet D", "Shelf 1"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2023-06-01T10:00:00Z",
        reason: "GST registration files archived",
      },
    ],
  },
  {
    ...baseEntity,
    id: "pf-mfg-001" as any,
    fileNumber: "PF-MFG-001",
    title: "Precision Mfg Co - Factory License & Environmental Clearances",
    description: "Factory license, pollution control board consent, fire safety certificate",
    clientId: IDS.CLIENTS.MANUFACTURING_CO,
    matterId: IDS.MATTERS.MFG_ITR_FY24,
    storageLocation: createLocation("Branch Office - Pune", "Compliance Room", "Cabinet E", "Shelf 1", "Box 2", "E1"),
    currentLocation: createLocation("Branch Office - Pune", "Compliance Room", "Cabinet E", "Shelf 1", "Box 2", "E1"),
    status: "stored",
    custodianId: IDS.USERS.ASSOCIATE_2,
    tags: ["factory", "environmental", "licenses"],
    isConfidential: false,
    retentionPolicy: { retentionYears: 10, disposalAction: "archive", legalBasis: "Factories Act" },
    relatedDocumentIds: [],
    movementHistory: [
      {
        id: "mov-007" as any,
        fromLocation: undefined,
        toLocation: createLocation("Branch Office - Pune", "Compliance Room", "Cabinet E", "Shelf 1", "Box 2", "E1"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2022-11-15T10:00:00Z",
        reason: "Factory license documents filed",
      },
    ],
  },
  {
    ...baseEntity,
    id: "pf-health-001" as any,
    fileNumber: "PF-HLT-001",
    title: "MediCare Hospitals - Clinical Establishment Registration",
    description: "Clinical establishment registration, biomedical waste authorization, pharmacy license",
    clientId: IDS.CLIENTS.HEALTHCARE_PVT,
    matterId: IDS.MATTERS.HEALTH_ITR_FY24,
    storageLocation: createLocation("Main Office", "Healthcare Compliance", "Cabinet F", "Shelf 1", "Box 1", "F1"),
    currentLocation: createLocation("Main Office", "Healthcare Compliance", "Cabinet F", "Shelf 1", "Box 1", "F1"),
    status: "stored",
    custodianId: IDS.USERS.SUPPORT_1,
    tags: ["healthcare", "clinical-establishment", "biomedical"],
    isConfidential: true,
    retentionPolicy: { retentionYears: 10, disposalAction: "archive", legalBasis: "Clinical Establishments Act" },
    relatedDocumentIds: [],
    movementHistory: [
      {
        id: "mov-008" as any,
        fromLocation: undefined,
        toLocation: createLocation("Main Office", "Healthcare Compliance", "Cabinet F", "Shelf 1", "Box 1", "F1"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2023-03-01T10:00:00Z",
        reason: "Healthcare registrations filed",
      },
    ],
  },
  {
    ...baseEntity,
    id: "pf-fintech-001" as any,
    fileNumber: "PF-FIN-001",
    title: "FinServe Advisory - Professional Indemnity Insurance",
    description: "PI insurance policy, renewal certificates, and claim correspondence",
    clientId: IDS.CLIENTS.FINTECH_LLP,
    matterId: IDS.MATTERS.FINTECH_ITR_FY24,
    storageLocation: createLocation("Main Office", "Insurance", "Cabinet G", "Shelf 1", "Box 1", "G1"),
    currentLocation: createLocation("Main Office", "Insurance", "Cabinet G", "Shelf 1", "Box 1", "G1"),
    status: "stored",
    custodianId: IDS.USERS.MANAGER_1,
    tags: ["insurance", "professional-indemnity", "renewal"],
    isConfidential: false,
    retentionPolicy: { retentionYears: 7, disposalAction: "destroy" },
    relatedDocumentIds: [],
    movementHistory: [
      {
        id: "mov-009" as any,
        fromLocation: undefined,
        toLocation: createLocation("Main Office", "Insurance", "Cabinet G", "Shelf 1", "Box 1", "G1"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2024-01-15T10:00:00Z",
        reason: "PI insurance renewed",
      },
    ],
  },
  {
    ...baseEntity,
    id: "pf-real-001" as any,
    fileNumber: "PF-REA-001",
    title: "UrbanSpace Developers - RERA Registration & Project Files",
    description: "RERA registration certificates for 3 projects, approved plans, completion certificates",
    clientId: IDS.CLIENTS.REAL_ESTATE,
    matterId: IDS.MATTERS.REAL_ITR_FY24,
    storageLocation: createLocation("Main Office", "RERA Room", "Cabinet H", "Shelf 1", undefined, undefined),
    currentLocation: createLocation(
      "Site Office - Project A",
      "Project Manager Desk",
      undefined,
      undefined,
      undefined,
      undefined,
      "With Project Manager for RERA audit",
    ),
    status: "checked_out",
    custodianId: IDS.USERS.SUPPORT_1,
    checkedOutById: IDS.USERS.SENIOR_1,
    checkedOutAt: "2024-06-25T09:00:00Z",
    dueBackAt: "2024-07-25T09:00:00Z",
    tags: ["rera", "real-estate", "projects"],
    isConfidential: false,
    retentionPolicy: { retentionYears: 15, disposalAction: "archive", legalBasis: "RERA Act" },
    relatedDocumentIds: [],
    movementHistory: [
      {
        id: "mov-010" as any,
        fromLocation: undefined,
        toLocation: createLocation("Main Office", "RERA Room", "Cabinet H", "Shelf 1"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2023-08-01T10:00:00Z",
        reason: "RERA registrations filed",
      },
      {
        id: "mov-011" as any,
        fromLocation: createLocation("Main Office", "RERA Room", "Cabinet H", "Shelf 1"),
        toLocation: createLocation("Site Office - Project A", "Project Manager Desk"),
        movedById: IDS.USERS.SENIOR_1,
        movedAt: "2024-06-25T09:00:00Z",
        reason: "RERA audit preparation",
        checkedOutById: IDS.USERS.SENIOR_1,
        dueBackAt: "2024-07-25T09:00:00Z",
      },
    ],
  },
  {
    ...baseEntity,
    id: "pf-sharma-001" as any,
    fileNumber: "PF-SHA-001",
    title: "Sharma & Associates - Proprietorship Registration & Tax Files",
    description: "Shop establishment registration, professional tax enrollment, IEC code",
    clientId: IDS.CLIENTS.SHARMA_PROP,
    matterId: IDS.MATTERS.SHARMA_ITR_FY24,
    storageLocation: createLocation("Branch Office - Delhi", "Small Business", "Cabinet I", "Shelf 1", "Box 1", "I1"),
    currentLocation: createLocation("Branch Office - Delhi", "Small Business", "Cabinet I", "Shelf 1", "Box 1", "I1"),
    status: "stored",
    custodianId: IDS.USERS.ASSOCIATE_1,
    tags: ["proprietorship", "shop-act", "professional-tax"],
    isConfidential: false,
    retentionPolicy: { retentionYears: 8, disposalAction: "archive" },
    relatedDocumentIds: [IDS.DOCUMENTS.SHARMA_PAN],
    movementHistory: [
      {
        id: "mov-012" as any,
        fromLocation: undefined,
        toLocation: createLocation("Branch Office - Delhi", "Small Business", "Cabinet I", "Shelf 1", "Box 1", "I1"),
        movedById: IDS.USERS.ADMIN,
        movedAt: "2023-04-01T10:00:00Z",
        reason: "Proprietorship documents filed",
      },
    ],
  },
];

export const getPhysicalFilesByClient = (clientId: string): PhysicalFile[] =>
  mockPhysicalFiles.filter((f) => f.clientId === clientId);

export const getPhysicalFilesByMatter = (matterId: string): PhysicalFile[] =>
  mockPhysicalFiles.filter((f) => f.matterId === matterId);

export const getPhysicalFilesByStatus = (status: PhysicalFileStatus): PhysicalFile[] =>
  mockPhysicalFiles.filter((f) => f.status === status);

export const getCheckedOutPhysicalFiles = (): PhysicalFile[] =>
  mockPhysicalFiles.filter((f) => f.status === "checked_out");

export const getOverduePhysicalFiles = (): PhysicalFile[] =>
  mockPhysicalFiles.filter((f) => f.status === "checked_out" && f.dueBackAt && new Date(f.dueBackAt) < new Date());

export const getPhysicalFileById = (id: string): PhysicalFile | undefined => mockPhysicalFiles.find((f) => f.id === id);

export const getDSCById = (id: string): DSCRegister | undefined => mockDSCRegisters.find((d) => d.id === id);

export const getUDINById = (id: string): UDINRegister | undefined => mockUDINRegisters.find((u) => u.id === id);

export const getLicenseById = (id: string): LicenseRegister | undefined =>
  mockLicenseRegisters.find((l) => l.id === id);

export const getEngagementDocById = (id: string): EngagementDocument | undefined =>
  mockEngagementDocuments.find((e) => e.id === id);

export const getPhysicalFilesByCustodian = (custodianId: string): PhysicalFile[] =>
  mockPhysicalFiles.filter((f) => f.custodianId === custodianId);
