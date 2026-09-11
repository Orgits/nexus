import type { ClientCategory, ClientType, CommunicationChannel, Priority, ServiceType, UserRole } from "@/types";

const clientTypeLabels: Record<ClientType, string> = {
  individual: "Individual",
  proprietorship: "Proprietorship",
  partnership: "Partnership",
  llp: "LLP",
  private_limited: "Pvt Ltd",
  public_limited: "Public Ltd",
  one_person_company: "OPC",
  section_8_company: "Section 8",
  trust: "Trust",
  society: "Society",
  huf: "HUF",
  foreign_company: "Foreign Co.",
  government: "Government",
  other: "Other",
};

export function clientTypeLabel(type: ClientType): string {
  return clientTypeLabels[type] ?? type;
}

const clientCategoryLabels: Record<ClientCategory, string> = {
  taxation: "Taxation",
  audit: "Audit",
  advisory: "Advisory",
  compliance: "Compliance",
  outsourcing: "Outsourcing",
  multi_service: "Multi-Service",
};

export function clientCategoryLabel(category: ClientCategory): string {
  return clientCategoryLabels[category] ?? category;
}

const serviceTypeLabels: Record<ServiceType, string> = {
  itr: "ITR",
  gst_monthly: "GST Monthly",
  gst_quarterly: "GST Quarterly",
  gst_annual: "GST Annual",
  tds_24q: "TDS 24Q",
  tds_26q: "TDS 26Q",
  tds_27q: "TDS 27Q",
  tds_27eq: "TDS 27EQ",
  mca_aoc4: "MCA AOC-4",
  mca_mgt7: "MCA MGT-7",
  mca_adt1: "MCA ADT-1",
  mca_dpt3: "MCA DPT-3",
  mca_other: "MCA Other",
  audit_statutory: "Statutory Audit",
  audit_tax: "Tax Audit",
  audit_internal: "Internal Audit",
  audit_special: "Special Audit",
  advisory_tax: "Tax Advisory",
  advisory_gst: "GST Advisory",
  advisory_corporate: "Corporate Advisory",
  advisory_fe: "FEMA Advisory",
  payroll: "Payroll",
  bookkeeping: "Bookkeeping",
  virtual_cfo: "Virtual CFO",
  secretarial: "Secretarial",
  registration: "Registration",
  licensing: "Licensing",
  other: "Other",
};

export function serviceTypeLabel(type: ServiceType): string {
  return serviceTypeLabels[type] ?? type;
}

const channelLabels: Record<CommunicationChannel, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  call: "Call",
  post: "Post",
};

export function channelLabel(channel: CommunicationChannel): string {
  return channelLabels[channel] ?? channel;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  partner: "Partner",
  manager: "Manager",
  senior_associate: "Senior Associate",
  associate: "Associate",
  intern: "Intern",
  support_staff: "Support Staff",
  client_portal: "Client Portal",
};

export function roleLabel(role: UserRole): string {
  return roleLabels[role] ?? role;
}

const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
  urgent: "Urgent",
};

export function priorityLabel(priority: Priority): string {
  return priorityLabels[priority] ?? priority;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
