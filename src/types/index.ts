export type UUID = string;
export type ISODateString = string;
export type ISODateTimeString = string;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface FilterParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  [key: string]: unknown;
}

export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "overdue"
  | "draft"
  | "sent"
  | "paid"
  | "partially_paid"
  | "void"
  | "approved"
  | "rejected"
  | "rework"
  | "filed"
  | "archived";

export type Priority = "low" | "medium" | "high" | "critical" | "urgent";

export type EntityType =
  | "client"
  | "matter"
  | "task"
  | "document"
  | "communication"
  | "compliance_cycle"
  | "notice"
  | "review"
  | "invoice"
  | "payment"
  | "time_entry"
  | "user";

export interface BaseEntity {
  id: UUID;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
  createdBy: UUID;
  updatedBy: UUID;
  tenantId: UUID;
}

export interface Firm extends BaseEntity {
  name: string;
  registrationNumber: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  settings: FirmSettings;
}

export interface FirmSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  fiscalYearStart: number;
  defaultLanguage: string;
  complianceSettings: ComplianceSettings;
  notificationSettings: NotificationSettings;
  branding: BrandingSettings;
}

export interface ComplianceSettings {
  defaultReminderDays: number[];
  escalationDays: number[];
  autoGenerateMatter: boolean;
  defaultAssignmentRule: "round_robin" | "least_loaded" | "specialist";
}

export interface NotificationSettings {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  digestFrequency: "immediate" | "hourly" | "daily" | "weekly";
}

export interface BrandingSettings {
  primaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  companyName: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
  teams: Team[];
  department?: Department;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: ISODateTimeString;
  mfaEnabled: boolean;
  timezone: string;
  language: string;
}

export type UserRole =
  | "admin"
  | "partner"
  | "manager"
  | "senior_associate"
  | "associate"
  | "intern"
  | "support_staff"
  | "client_portal";

export interface Team extends BaseEntity {
  name: string;
  description?: string;
  leadId: UUID;
  memberIds: UUID[];
  departmentId?: UUID;
  specialization?: ServiceType[];
}

export interface Department extends BaseEntity {
  name: string;
  description?: string;
  headId?: UUID;
  teamIds: UUID[];
}

export interface Permission {
  module: string;
  action: "view" | "create" | "edit" | "delete" | "approve" | "financial" | "admin";
  scope: "own" | "team" | "department" | "firm" | "all";
}

export interface Client extends BaseEntity {
  name: string;
  legalName?: string;
  displayName: string;
  type: ClientType;
  category: ClientCategory;
  status: ClientStatus;
  primaryContactId: UUID;
  contacts: Contact[];
  identifiers: ClientIdentifiers;
  address: Address;
  billingAddress?: Address;
  responsibleUserId: UUID;
  responsibleTeamId?: UUID;
  services: ClientService[];
  complianceProfile: ComplianceProfile;
  onboardingStatus: OnboardingStatus;
  financialProfile?: FinancialProfile;
  tags: string[];
  notes?: string;
  portalAccessEnabled: boolean;
  portalInvitationSentAt?: ISODateTimeString;
}

export type ClientType =
  | "individual"
  | "proprietorship"
  | "partnership"
  | "llp"
  | "private_limited"
  | "public_limited"
  | "one_person_company"
  | "section_8_company"
  | "trust"
  | "society"
  | "huf"
  | "foreign_company"
  | "government"
  | "other";

export type ClientCategory = "taxation" | "audit" | "advisory" | "compliance" | "outsourcing" | "multi_service";

export type ClientStatus = "active" | "inactive" | "onboarding" | "archived" | "prospect";

export interface Contact extends BaseEntity {
  clientId: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  designation?: string;
  department?: string;
  isPrimary: boolean;
  isAuthorizedSignatory: boolean;
  receivesCommunications: boolean;
  preferredChannel: CommunicationChannel;
}

export type CommunicationChannel = "email" | "whatsapp" | "sms" | "call" | "post";

export interface ClientIdentifiers {
  pan?: string;
  tan?: string;
  gstin?: string;
  cin?: string;
  din?: string[];
  aadhaar?: string;
  passport?: string;
  iec?: string;
  udin?: string;
  dscDetails?: DSCDetails[];
}

export interface DSCDetails {
  serialNumber: string;
  certType: "class2" | "class3" | "dfc";
  issuedTo: string;
  issuedBy: string;
  validFrom: ISODateString;
  validTo: ISODateString;
  status: "valid" | "expired" | "revoked";
}

export interface ClientService extends BaseEntity {
  clientId: UUID;
  serviceType: ServiceType;
  serviceName: string;
  description?: string;
  frequency: ServiceFrequency;
  startDate: ISODateString;
  endDate?: ISODateString;
  assignedUserId: UUID;
  assignedTeamId?: UUID;
  billingMethod: BillingMethod;
  rate?: number;
  currency: string;
  isActive: boolean;
  complianceConfig?: ServiceComplianceConfig;
}

export type ServiceType =
  | "itr"
  | "gst_monthly"
  | "gst_quarterly"
  | "gst_annual"
  | "tds_24q"
  | "tds_26q"
  | "tds_27q"
  | "tds_27eq"
  | "mca_aoc4"
  | "mca_mgt7"
  | "mca_adt1"
  | "mca_dpt3"
  | "mca_other"
  | "audit_statutory"
  | "audit_tax"
  | "audit_internal"
  | "audit_special"
  | "advisory_tax"
  | "advisory_gst"
  | "advisory_corporate"
  | "advisory_fe"
  | "payroll"
  | "bookkeeping"
  | "virtual_cfo"
  | "secretarial"
  | "registration"
  | "licensing"
  | "other";

export type ServiceFrequency =
  | "monthly"
  | "quarterly"
  | "half_yearly"
  | "annual"
  | "event_based"
  | "one_time"
  | "continuous";

export type BillingMethod = "fixed_fee" | "hourly" | "retainer" | "percentage" | "milestone";

export interface ServiceComplianceConfig {
  applicableForms: string[];
  dueDateRule: DueDateRule;
  documentRequirements: DocumentRequirement[];
  checklistTemplateId?: UUID;
  reminderTemplateId?: UUID;
}

export interface DueDateRule {
  type: "fixed_date" | "relative_to_period_end" | "relative_to_financial_year_end" | "government_notified";
  value: number;
  unit: "days" | "months";
  referenceDate?: ISODateString;
}

export interface DocumentRequirement {
  documentType: DocumentType;
  isMandatory: boolean;
  description?: string;
  dueBeforeFiling: boolean;
}

export type DocumentType =
  | "pan_card"
  | "aadhaar_card"
  | "passport"
  | "incorporation_certificate"
  | "moa_aoa"
  | "partnership_deed"
  | "llp_agreement"
  | "gst_registration"
  | "tax_returns"
  | "financial_statements"
  | "bank_statements"
  | "invoices"
  | "challans"
  | "form_16"
  | "form_26as"
  | "tds_certificates"
  | "board_resolution"
  | "share_certificate"
  | "register_of_members"
  | "dsc_token"
  | "authorization_letter"
  | "engagement_letter"
  | "kyc_documents"
  | "other";

export interface ComplianceProfile {
  applicableComplianceTypes: ServiceType[];
  financialYearStart: number;
  gstFilingFrequency?: "monthly" | "quarterly" | "annual";
  tdsApplicable: boolean;
  mcaApplicable: boolean;
  auditApplicable: boolean;
  specialNotes?: string;
}

export interface OnboardingStatus {
  stage: OnboardingStage;
  progress: number;
  completedStages: OnboardingStage[];
  pendingItems: OnboardingItem[];
}

export type OnboardingStage =
  | "profile_created"
  | "contacts_added"
  | "identifiers_added"
  | "services_configured"
  | "kyc_documents_collected"
  | "compliance_configured"
  | "team_assigned"
  | "initial_matters_created"
  | "portal_invited"
  | "completed";

export interface OnboardingItem {
  id: string;
  stage: OnboardingStage;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: ISODateTimeString;
  completedBy?: UUID;
  deepLink?: string;
}

export interface FinancialProfile {
  annualTurnover?: number;
  taxableIncome?: number;
  gstLiability?: number;
  tdsLiability?: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  creditLimit?: number;
  paymentTerms: number;
  preferredPaymentMethod: PaymentMethod;
}

export type PaymentMethod = "bank_transfer" | "upi" | "cheque" | "cash" | "card" | "other";

export interface Matter extends BaseEntity {
  matterNumber: string;
  name: string;
  description?: string;
  clientId: UUID;
  serviceType: ServiceType;
  serviceName: string;
  period: Period;
  status: MatterStatus;
  priority: Priority;
  assignedUserId: UUID;
  assignedTeamId?: UUID;
  supervisingPartnerId?: UUID;
  dueDate: ISODateString;
  estimatedHours?: number;
  actualHours: number;
  progress: number;
  stage: MatterStage;
  stageHistory: MatterStageHistory[];
  checklistTemplateId?: UUID;
  billingMethod: BillingMethod;
  budgetAmount?: number;
  billedAmount: number;
  tags: string[];
  isBillable: boolean;
  complianceCycleId?: UUID;
}

export interface Period {
  label: string;
  startDate: ISODateString;
  endDate: ISODateString;
  financialYear: string;
  assessmentYear?: string;
}

export type MatterStatus =
  | "created"
  | "information_pending"
  | "documents_pending"
  | "in_progress"
  | "ready_for_review"
  | "rework"
  | "approved"
  | "filed"
  | "completed"
  | "billing_followup"
  | "closed"
  | "on_hold"
  | "cancelled"
  | "overdue"
  | "planning";

export type MatterStage =
  | "created"
  | "information_pending"
  | "documents_pending"
  | "in_progress"
  | "ready_for_review"
  | "rework"
  | "approved"
  | "filed"
  | "completed"
  | "billing_followup"
  | "closed";

export interface MatterStageHistory {
  stage: MatterStage;
  changedAt: ISODateTimeString;
  changedBy: UUID;
  notes?: string;
}

export interface Task extends BaseEntity {
  taskNumber: string;
  title: string;
  description?: string;
  matterId?: UUID;
  clientId?: UUID;
  assignedUserId: UUID;
  assignedTeamId?: UUID;
  createdById: UUID;
  priority: Priority;
  status: TaskStatus;
  dueDate: ISODateString;
  startDate?: ISODateString;
  completedAt?: ISODateTimeString;
  estimatedHours?: number;
  actualHours: number;
  progress: number;
  dependencies: TaskDependency[];
  subtasks: Subtask[];
  checklistItems: ChecklistItem[];
  sourceCommunicationId?: UUID;
  tags: string[];
  isBillable: boolean;
}

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "rework"
  | "completed"
  | "cancelled"
  | "on_hold"
  | "blocked";

export interface TaskDependency {
  taskId: UUID;
  type: "blocks" | "blocked_by" | "relates_to";
}

export interface Subtask extends BaseEntity {
  taskId: UUID;
  title: string;
  description?: string;
  assignedUserId?: UUID;
  status: TaskStatus;
  dueDate?: ISODateString;
  completedAt?: ISODateTimeString;
  order: number;
}

export interface ChecklistItem extends BaseEntity {
  taskId?: UUID;
  matterId?: UUID;
  templateItemId?: UUID;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: ISODateTimeString;
  completedBy?: UUID;
  evidenceDocumentId?: UUID;
  order: number;
  isMandatory: boolean;
}

export interface Review extends BaseEntity {
  reviewNumber: string;
  title: string;
  description?: string;
  reviewType: ReviewType;
  clientId: UUID;
  matterId?: UUID;
  taskId?: UUID;
  complianceCycleId?: UUID;
  documentId?: UUID;
  assignedReviewerId: UUID;
  assignedById: UUID;
  priority: Priority;
  status: ReviewStatus;
  stages: ReviewStage[];
  currentStage: number;
  dueDate: ISODateString;
  startedAt?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  overallComments?: string;
  tags: string[];
}

export type ReviewType =
  | "compliance_filing"
  | "financial_statement"
  | "tax_return"
  | "audit_workpaper"
  | "document_verification"
  | "notice_response"
  | "engagement_letter"
  | "other";

export interface ComplianceCycle extends BaseEntity {
  cycleNumber: string;
  clientId: UUID;
  serviceType: ServiceType;
  serviceName: string;
  period: Period;
  status: ComplianceStatus;
  priority: Priority;
  assignedUserId: UUID;
  assignedTeamId?: UUID;
  dueDate: ISODateString;
  extendedDueDate?: ISODateString;
  filingDate?: ISODateString;
  acknowledgmentNumber?: string;
  acknowledgmentDate?: ISODateString;
  matterId?: UUID;
  missingDocuments: MissingDocument[];
  documentRequests: DocumentRequest[];
  outreachCampaigns: CampaignSummary[];
  reviewStages: ReviewStage[];
  currentStage: number;
  isOverdue: boolean;
  daysOverdue: number;
}

export type ComplianceStatus =
  | "not_started"
  | "identification"
  | "outreach_sent"
  | "documents_pending"
  | "documents_received"
  | "processing"
  | "ready_for_review"
  | "in_review"
  | "rework_required"
  | "approved"
  | "filed"
  | "completed"
  | "closed"
  | "not_applicable"
  | "overdue";

export interface MissingDocument {
  documentType: DocumentType;
  description?: string;
  isMandatory: boolean;
  requestedAt?: ISODateTimeString;
  receivedAt?: ISODateTimeString;
  documentId?: UUID;
}

export interface DocumentRequest extends BaseEntity {
  clientId: UUID;
  matterId?: UUID;
  complianceCycleId?: UUID;
  requestedById: UUID;
  items: DocumentRequestItem[];
  sentAt?: ISODateTimeString;
  reminderCount: number;
  lastReminderAt?: ISODateTimeString;
  status: DocumentRequestStatus;
  receivedAt?: ISODateTimeString;
}

export type DocumentRequestStatus =
  | "draft"
  | "not_sent"
  | "sent"
  | "reminder_sent"
  | "partially_received"
  | "received"
  | "closed"
  | "cancelled";

export interface DocumentRequestItem {
  documentType: DocumentType;
  description?: string;
  isMandatory: boolean;
  isReceived: boolean;
  receivedDocumentId?: UUID;
  receivedAt?: ISODateTimeString;
}

export interface CampaignSummary {
  campaignId: UUID;
  name: string;
  channel: CommunicationChannel;
  sentAt: ISODateTimeString;
  status: CampaignStatus;
  responses: number;
}

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "completed"
  | "paused"
  | "cancelled"
  | "failed";

export interface ReviewStage {
  id?: UUID;
  stageNumber: number;
  name: string;
  reviewerId: UUID;
  reviewerRole: UserRole;
  reviewerName?: string;
  status: ReviewStatus;
  startedAt?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  comments?: string;
  action?: ReviewAction;
  dueDate?: ISODateString;
}

export type ReviewStatus = "pending" | "in_progress" | "completed" | "skipped" | "rework";

export type ReviewAction = "approve" | "reject" | "rework" | "comment";

export interface Document extends BaseEntity {
  documentNumber: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  clientId: UUID;
  matterId?: UUID;
  taskId?: UUID;
  complianceCycleId?: UUID;
  sourceCommunicationId?: UUID;
  uploadedById: UUID;
  category: DocumentCategory;
  documentType: DocumentType;
  tags: string[];
  version: number;
  previousVersionId?: UUID;
  isLatestVersion: boolean;
  ocrStatus: OCRStatus;
  ocrText?: string;
  classification?: DocumentClassification;
  metadata: Record<string, unknown>;
  isConfidential: boolean;
  retentionPolicy?: RetentionPolicy;
  virusScanStatus: VirusScanStatus;
  virusScannedAt?: ISODateTimeString;
}

export type DocumentCategory =
  | "kyc"
  | "registration"
  | "tax_return"
  | "financial_statement"
  | "invoice"
  | "challan"
  | "certificate"
  | "correspondence"
  | "contract"
  | "board_resolution"
  | "register"
  | "workpaper"
  | "evidence"
  | "engagement_letter"
  | "authorization"
  | "other";

export type OCRStatus = "pending" | "processing" | "completed" | "failed" | "not_applicable";

export interface DocumentClassification {
  documentType: DocumentType;
  confidence: number;
  extractedFields: Record<string, unknown>;
  classifiedAt: ISODateTimeString;
  classifiedBy: "ai" | "manual";
}

export interface RetentionPolicy {
  retentionYears: number;
  disposalAction: "destroy" | "archive" | "review";
  legalBasis?: string;
}

export type VirusScanStatus = "pending" | "clean" | "infected" | "quarantined" | "failed";

export interface Communication extends BaseEntity {
  communicationNumber: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject?: string;
  content: string;
  from: CommunicationParticipant;
  to: CommunicationParticipant[];
  cc?: CommunicationParticipant[];
  bcc?: CommunicationParticipant[];
  clientId?: UUID;
  matterId?: UUID;
  conversationId?: UUID;
  attachments: CommunicationAttachment[];
  status: CommunicationStatus;
  sentAt?: ISODateTimeString;
  deliveredAt?: ISODateTimeString;
  readAt?: ISODateTimeString;
  repliedAt?: ISODateTimeString;
  isInternal: boolean;
  internalNotes?: string;
  linkedTaskId?: UUID;
  campaignId?: UUID;
  templateId?: UUID;
  variables?: Record<string, string>;
  providerMessageId?: string;
  providerStatus?: string;
  errorMessage?: string;
  priority?: Priority;
}

export type CommunicationDirection = "inbound" | "outbound";

export interface CommunicationParticipant {
  type: "client_contact" | "user" | "external";
  id: UUID;
  name: string;
  email?: string;
  phone?: string;
}

export interface CommunicationAttachment {
  id: UUID;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  documentId?: UUID;
}

export type CommunicationStatus =
  | "draft"
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "bounced"
  | "read"
  | "replied"
  | "archived";

export interface Conversation extends BaseEntity {
  clientId: UUID;
  matterId?: UUID;
  subject: string;
  channels: CommunicationChannel[];
  participants: ConversationParticipant[];
  lastMessageAt: ISODateTimeString;
  lastMessagePreview: string;
  unreadCount: number;
  isArchived: boolean;
  tags: string[];
}

export interface ConversationParticipant {
  userId?: UUID;
  contactId?: UUID;
  role: "owner" | "participant" | "observer";
  joinedAt: ISODateTimeString;
}

export interface Campaign extends BaseEntity {
  name: string;
  description?: string;
  objective: CampaignObjective;
  channels: CommunicationChannel[];
  audience: CampaignAudience;
  templates: CampaignTemplate[];
  schedule: CampaignSchedule;
  status: CampaignStatus;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount: number;
  documentsReceived: number;
  tasksCreated: number;
  complianceProgress: number;
  createdById: UUID;
  approvedById?: UUID;
  approvedAt?: ISODateTimeString;
}

export type CampaignObjective =
  | "compliance_reminder"
  | "document_collection"
  | "filing_confirmation"
  | "payment_reminder"
  | "announcement"
  | "newsletter"
  | "survey"
  | "custom";

export interface CampaignAudience {
  filters: AudienceFilter[];
  excludedClientIds: UUID[];
  includedClientIds: UUID[];
  estimatedCount: number;
}

export interface AudienceFilter {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "in" | "not_in" | "greater_than" | "less_than" | "between";
  value: unknown;
}

export interface CampaignTemplate {
  channel: CommunicationChannel;
  templateId: UUID;
  subject?: string;
  content: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "boolean";
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export interface CampaignSchedule {
  type: "immediate" | "scheduled" | "recurring";
  scheduledAt?: ISODateTimeString;
  timezone: string;
  recurrenceRule?: string;
  sendWindowStart?: string;
  sendWindowEnd?: string;
}

export interface Notice extends BaseEntity {
  noticeNumber: string;
  referenceNumber: string;
  authority: string;
  authorityType: AuthorityType;
  clientId: UUID;
  matterId?: UUID;
  subject: string;
  description?: string;
  receivedDate: ISODateString;
  responseDueDate: ISODateString;
  assignedUserId: UUID;
  priority: Priority;
  status: NoticeStatus;
  category: NoticeCategory;
  documents: NoticeDocument[];
  tasks: UUID[];
  responseDraft?: string;
  responseSubmittedAt?: ISODateTimeString;
  submissionReference?: string;
  hearingDate?: ISODateString;
  hearingLocation?: string;
  escalationLevel: number;
  isUrgent: boolean;
}

export type AuthorityType =
  | "income_tax"
  | "gst"
  | "tds"
  | "mca_roc"
  | "customs"
  | "rbi"
  | "sebi"
  | "high_court"
  | "supreme_court"
  | "tribunal"
  | "other";

export type NoticeStatus =
  | "received"
  | "acknowledged"
  | "under_review"
  | "evidence_collection"
  | "response_drafting"
  | "internal_review"
  | "approved_for_submission"
  | "submitted"
  | "hearing_scheduled"
  | "hearing_completed"
  | "order_received"
  | "closed"
  | "escalated";

export type NoticeCategory =
  | "scrutiny"
  | "assessment"
  | "demand"
  | "refund"
  | "penalty"
  | "prosecution"
  | "survey"
  | "search"
  | "summons"
  | "show_cause"
  | "rectification"
  | "appeal"
  | "other";

export interface NoticeDocument extends BaseEntity {
  noticeId: UUID;
  documentId: UUID;
  type: "notice_copy" | "evidence" | "response_draft" | "submission_proof" | "order" | "other";
  description?: string;
}

export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startAt: ISODateTimeString;
  endAt: ISODateTimeString;
  allDay: boolean;
  clientId?: UUID;
  matterId?: UUID;
  taskId?: UUID;
  noticeId?: UUID;
  complianceCycleId?: UUID;
  assignedUserIds: UUID[];
  location?: string;
  meetingUrl?: string;
  reminders: EventReminder[];
  recurrenceRule?: string;
  color?: string;
  isPrivate: boolean;
}

export type CalendarEventType =
  | "compliance_deadline"
  | "task_deadline"
  | "notice_deadline"
  | "client_meeting"
  | "internal_meeting"
  | "hearing"
  | "follow_up"
  | "review_meeting"
  | "training"
  | "leave"
  | "holiday"
  | "other";

export interface EventReminder {
  type: "email" | "popup" | "sms" | "whatsapp";
  minutesBefore: number;
}

export interface TimeEntry extends BaseEntity {
  userId: UUID;
  matterId?: UUID;
  taskId?: UUID;
  clientId?: UUID;
  description: string;
  startTime: ISODateTimeString;
  endTime: ISODateTimeString;
  durationMinutes: number;
  isBillable: boolean;
  billingRate?: number;
  billedAmount?: number;
  invoiceId?: UUID;
  status: TimeEntryStatus;
  timerId?: string;
  isRunning: boolean;
}

export type TimeEntryStatus = "draft" | "submitted" | "approved" | "rejected" | "billed" | "invoiced";

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  clientId: UUID;
  matterId?: UUID;
  issueDate: ISODateString;
  dueDate: ISODateString;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  lineItems: InvoiceLineItem[];
  notes?: string;
  termsAndConditions?: string;
  sentAt?: ISODateTimeString;
  paidAt?: ISODateTimeString;
}

export type InvoiceStatus = "draft" | "issued" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled" | "void";

export type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "overdue" | "refunded" | "written_off";

export interface InvoiceLineItem {
  id: UUID;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  matterId?: UUID;
  taskId?: UUID;
  timeEntryIds: UUID[];
  serviceType?: ServiceType;
  period?: Period;
}

export interface Payment extends BaseEntity {
  paymentNumber: string;
  invoiceId: UUID;
  clientId: UUID;
  amount: number;
  currency: string;
  paymentDate: ISODateString;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  bankReference?: string;
  notes?: string;
  status: PaymentRecordStatus;
  allocatedInvoices: PaymentAllocation[];
  receivedById: UUID;
}

export type PaymentRecordStatus = "pending" | "cleared" | "bounced" | "refunded" | "cancelled";

export interface PaymentAllocation {
  invoiceId: UUID;
  amount: number;
}

export interface Expense extends BaseEntity {
  expenseNumber: string;
  userId: UUID;
  clientId?: UUID;
  matterId?: UUID;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  expenseDate: ISODateString;
  receiptUrl?: string;
  status: ExpenseStatus;
  isReimbursable: boolean;
  reimbursementStatus: ReimbursementStatus;
  approvedById?: UUID;
  approvedAt?: ISODateTimeString;
  paidAt?: ISODateTimeString;
}

export type ExpenseCategory =
  | "travel"
  | "accommodation"
  | "meals"
  | "office_supplies"
  | "software"
  | "professional_fees"
  | "court_fees"
  | "government_fees"
  | "postage_courier"
  | "printing"
  | "telephone_internet"
  | "training"
  | "entertainment"
  | "other";

export type ExpenseStatus = "draft" | "submitted" | "approved" | "rejected" | "reimbursed" | "paid";

export type ReimbursementStatus = "pending" | "approved" | "processing" | "paid" | "rejected";

export interface AuditEngagement extends BaseEntity {
  engagementNumber: string;
  clientId: UUID;
  name: string;
  description?: string;
  type: AuditType;
  status: AuditStatus;
  period: Period;
  assignedTeam: AuditTeam;
  planning: AuditPlanning;
  riskAssessment: RiskAssessment;
  materiality: Materiality;
  programs: AuditProgram[];
  workpapers: Workpaper[];
  queries: AuditQuery[];
  reviewNotes: ReviewNote[];
  signOff: SignOff[];
}

export type AuditType = "statutory" | "tax" | "internal" | "special" | "concurrent" | "stock" | "cost" | "secretarial";

export type AuditStatus = "planning" | "fieldwork" | "review" | "reporting" | "completed" | "archived";

export interface AuditTeam {
  partnerId: UUID;
  managerIds: UUID[];
  seniorIds: UUID[];
  staffIds: UUID[];
}

export interface AuditPlanning {
  understandingOfEntity: string;
  riskAssessmentSummary: string;
  materialityBasis: string;
  planningNotes: string;
  completedAt?: ISODateTimeString;
  completedBy?: UUID;
}

export interface RiskAssessment {
  inherentRisk: RiskLevel;
  controlRisk: RiskLevel;
  detectionRisk: RiskLevel;
  overallRisk: RiskLevel;
  keyRisks: KeyRisk[];
  assessedAt: ISODateTimeString;
  assessedBy: UUID;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface KeyRisk {
  id: UUID;
  description: string;
  assertion: string;
  riskLevel: RiskLevel;
  response: string;
  workpaperRefs: UUID[];
}

export interface Materiality {
  overallMateriality: number;
  performanceMateriality: number;
  trivialThreshold: number;
  basis: string;
  calculatedAt: ISODateTimeString;
  calculatedBy: UUID;
}

export interface AuditProgram {
  id: UUID;
  area: string;
  objective: string;
  procedures: AuditProcedure[];
  assignedTo: UUID;
  status: "not_started" | "in_progress" | "completed" | "reviewed";
  completedAt?: ISODateTimeString;
}

export interface AuditProcedure {
  id: UUID;
  reference: string;
  description: string;
  assertion: string;
  type: "substantive" | "analytical" | "test_of_controls" | "walkthrough";
  status: "not_started" | "in_progress" | "completed" | "reviewed";
  preparedBy?: UUID;
  preparedAt?: ISODateTimeString;
  reviewedBy?: UUID;
  reviewedAt?: ISODateTimeString;
  conclusion?: string;
  evidenceRefs: UUID[];
}

export interface Workpaper extends BaseEntity {
  reference: string;
  title: string;
  objective: string;
  area: string;
  procedureId?: UUID;
  preparedBy: UUID;
  reviewedBy?: UUID;
  status: WorkpaperStatus;
  evidenceDocumentIds: UUID[];
  conclusion?: string;
  reviewNotes?: string;
  preparedAt?: ISODateTimeString;
  reviewedAt?: ISODateTimeString;
  signOffs: WorkpaperSignOff[];
}

export type WorkpaperStatus = "draft" | "prepared" | "under_review" | "reviewed" | "finalized" | "archived";

export interface WorkpaperSignOff {
  userId: UUID;
  role: "preparer" | "reviewer" | "partner";
  action: "prepared" | "reviewed" | "approved";
  timestamp: ISODateTimeString;
  comments?: string;
}

export interface AuditQuery extends BaseEntity {
  queryNumber: string;
  workpaperId?: UUID;
  area: string;
  raisedBy: UUID;
  assignedTo: UUID;
  description: string;
  priority: Priority;
  status: AuditQueryStatus;
  response?: string;
  respondedBy?: UUID;
  respondedAt?: ISODateTimeString;
  dueDate: ISODateString;
  resolvedAt?: ISODateTimeString;
}

export type AuditQueryStatus = "open" | "in_progress" | "responded" | "resolved" | "closed" | "escalated";

export interface ReviewNote extends BaseEntity {
  workpaperId?: UUID;
  queryId?: UUID;
  reviewerId: UUID;
  content: string;
  type: "observation" | "finding" | "recommendation" | "question" | "approval";
  isResolved: boolean;
  resolvedAt?: ISODateTimeString;
}

export interface SignOff extends BaseEntity {
  engagementId: UUID;
  userId: UUID;
  role: "partner" | "manager" | "reviewer";
  action: "review" | "approve" | "finalize";
  timestamp: ISODateTimeString;
  comments?: string;
}

export interface DSCRegister extends BaseEntity {
  holderName: string;
  holderType: "individual" | "company" | "llp" | "partner" | "director" | "authorized_signatory";
  holderId?: UUID;
  certificateType: "class2" | "class3" | "dfc";
  certifyingAuthority: string;
  serialNumber: string;
  issuedDate: ISODateString;
  expiryDate: ISODateString;
  status: DSCStatus;
  custodianId: UUID;
  physicalLocation?: string;
  pin?: string;
  tokenType: "usb_token" | "software" | "hsm";
  renewalReminderSent: boolean;
  renewedFromId?: UUID;
}

export type DSCStatus = "valid" | "expiring_soon" | "expired" | "revoked" | "suspended" | "lost";

export interface UDINRegister extends BaseEntity {
  udin: string;
  clientId: UUID;
  matterId?: UUID;
  documentId?: UUID;
  certificateType: string;
  financialYear: string;
  generatedDate: ISODateString;
  generatedBy: UUID;
  status: "generated" | "used" | "cancelled" | "expired";
  usedFor?: string;
  usedAt?: ISODateTimeString;
}

export interface LicenseRegister extends BaseEntity {
  name: string;
  type: LicenseType;
  issuingAuthority: string;
  registrationNumber: string;
  clientId?: UUID;
  matterId?: UUID;
  issueDate: ISODateString;
  expiryDate: ISODateString;
  renewalDate?: ISODateString;
  status: LicenseStatus;
  responsibleUserId: UUID;
  documents: UUID[];
  renewalReminderSent: boolean;
  autoRenewal: boolean;
  cost?: number;
  currency: string;
}

export type LicenseType =
  | "shop_establishment"
  | "professional_tax"
  | "gst"
  | "import_export"
  | "fssai"
  | "drug_license"
  | "environmental"
  | "factory_license"
  | "boiler_license"
  | "fire_safety"
  | "pollution_control"
  | "other";

export type LicenseStatus = "active" | "expiring_soon" | "expired" | "renewal_in_progress" | "cancelled" | "suspended";

export interface EngagementDocument extends BaseEntity {
  templateId: UUID;
  clientId: UUID;
  matterId?: UUID;
  name: string;
  status: EngagementDocumentStatus;
  signers: EngagementSigner[];
  sentAt?: ISODateTimeString;
  completedAt?: ISODateTimeString;
  expiredAt?: ISODateTimeString;
  signedDocumentId?: UUID;
  reminderCount: number;
  lastReminderAt?: ISODateTimeString;
}

export type EngagementDocumentStatus =
  | "draft"
  | "pending_signature"
  | "partially_signed"
  | "signed"
  | "expired"
  | "cancelled"
  | "declined";

export interface EngagementSigner {
  id: UUID;
  name: string;
  email: string;
  phone?: string;
  role: "client" | "partner" | "witness" | "authorized_signatory";
  order: number;
  status: "pending" | "signed" | "declined" | "expired";
  signedAt?: ISODateTimeString;
  ipAddress?: string;
}

export interface AttendanceRecord extends BaseEntity {
  userId: UUID;
  date: ISODateString;
  checkInAt?: ISODateTimeString;
  checkOutAt?: ISODateTimeString;
  breakMinutes: number;
  status: AttendanceStatus;
  workMode: WorkMode;
  location?: string;
  notes?: string;
  approvedById?: UUID;
  approvedAt?: ISODateTimeString;
}

export type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "on_leave" | "holiday" | "work_from_home";

export type WorkMode = "office" | "remote" | "hybrid" | "client_site";

export interface LeaveRequest extends BaseEntity {
  userId: UUID;
  leaveType: LeaveType;
  startDate: ISODateString;
  endDate: ISODateString;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: ISODateTimeString;
  approvedById?: UUID;
  approvedAt?: ISODateTimeString;
  rejectedById?: UUID;
  rejectedAt?: ISODateTimeString;
  rejectionReason?: string;
  attachmentId?: UUID;
}

export type LeaveType =
  | "annual"
  | "sick"
  | "casual"
  | "maternity"
  | "paternity"
  | "bereavement"
  | "marriage"
  | "compensatory"
  | "unpaid"
  | "study"
  | "sabbatical"
  | "other";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled" | "withdrawn";

export interface Holiday extends BaseEntity {
  name: string;
  date: ISODateString;
  isRecurring: boolean;
  recurrenceRule?: string;
  applicableLocations: string[];
  type: "national" | "regional" | "firm" | "optional";
}

export interface Report {
  id: UUID;
  name: string;
  description?: string;
  category: ReportCategory;
  parameters: ReportParameter[];
  generatedAt?: ISODateTimeString;
  generatedBy?: UUID;
  fileUrl?: string;
  status: "generating" | "ready" | "failed";
  schedule?: ReportSchedule;
}

export type ReportCategory =
  | "compliance"
  | "notices_reviews"
  | "communication"
  | "work"
  | "finance"
  | "practice_health";

export interface ReportParameter {
  key: string;
  label: string;
  type: "date" | "date_range" | "select" | "multi_select" | "text" | "number" | "boolean";
  required: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: unknown }[];
}

export interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  recipients: UUID[];
  format: "pdf" | "excel" | "csv";
  isActive: boolean;
}

export interface Notification extends BaseEntity {
  userId: UUID;
  type: NotificationType;
  title: string;
  message: string;
  priority: Priority;
  entityType?: EntityType;
  entityId?: UUID;
  actionUrl?: string;
  isRead: boolean;
  readAt?: ISODateTimeString;
  metadata?: Record<string, unknown>;
}

export type NotificationType =
  | "assignment"
  | "deadline"
  | "overdue"
  | "review"
  | "mention"
  | "communication_followup"
  | "document_received"
  | "campaign_event"
  | "payment"
  | "approval"
  | "system"
  | "reminder";

export interface ActivityLog extends BaseEntity {
  entityType: EntityType;
  entityId: UUID;
  action: string;
  performedBy: UUID;
  performedByName: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: "dialog" | "navigation" | "api";
  target: string;
  prefills?: Record<string, unknown>;
  requiredPermissions?: string[];
  contexts: ("client" | "matter" | "task" | "document" | "communication" | "global")[];
}

export interface PhysicalFile extends BaseEntity {
  fileNumber: string;
  title: string;
  description?: string;
  clientId?: UUID;
  matterId?: UUID;
  complianceCycleId?: UUID;
  storageLocation: PhysicalFileLocation;
  currentLocation?: PhysicalFileLocation;
  status: PhysicalFileStatus;
  custodianId?: UUID;
  checkedOutById?: UUID;
  checkedOutAt?: ISODateTimeString;
  dueBackAt?: ISODateTimeString;
  movementHistory: PhysicalFileMovement[];
  tags: string[];
  isConfidential: boolean;
  retentionPolicy?: RetentionPolicy;
  relatedDocumentIds: UUID[];
}

export interface PhysicalFileLocation {
  building?: string;
  room?: string;
  cabinet?: string;
  shelf?: string;
  box?: string;
  slot?: string;
  description?: string;
}

export type PhysicalFileStatus =
  | "stored"
  | "checked_out"
  | "in_transit"
  | "missing"
  | "archived"
  | "disposed"
  | "digitized";

export interface PhysicalFileMovement {
  id: UUID;
  fromLocation?: PhysicalFileLocation;
  toLocation: PhysicalFileLocation;
  movedById: UUID;
  movedAt: ISODateTimeString;
  reason?: string;
  checkedOutById?: UUID;
  dueBackAt?: ISODateTimeString;
  returnedAt?: ISODateTimeString;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: "dialog" | "navigation" | "api";
  target: string;
  prefills?: Record<string, unknown>;
  requiredPermissions?: string[];
  contexts: ("client" | "matter" | "task" | "document" | "communication" | "global")[];
}
