export interface UrgentWorkItem {
  id: string;
  type: "task" | "compliance" | "notice" | "review";
  title: string;
  clientName: string;
  matterName?: string;
  dueDate: string;
  daysOverdue: number;
  priority: "low" | "medium" | "high" | "critical" | "urgent";
  assigneeName: string;
  href: string;
}

export interface UpcomingDeadlineItem {
  id: string;
  type: "compliance" | "task" | "notice" | "meeting";
  title: string;
  clientName: string;
  dueDate: string;
  daysRemaining: number;
  priority: "low" | "medium" | "high" | "critical" | "urgent";
  href: string;
}

export interface MissingDocumentItem {
  id: string;
  clientName: string;
  matterName: string;
  documentName: string;
  requestedDate: string;
  reminderCount: number;
  daysWaiting: number;
  status: "not_sent" | "sent" | "reminder_sent" | "partially_received" | "received";
  href: string;
}

export interface PendingReviewItem {
  id: string;
  objectType: "matter" | "task" | "document" | "compliance";
  objectName: string;
  clientName: string;
  submitterName: string;
  stage: string;
  submittedDate: string;
  daysAging: number;
  priority: "low" | "medium" | "high" | "critical" | "urgent";
  href: string;
}

export interface RecentClientItem {
  id: string;
  name: string;
  type: string;
  pendingWork: number;
  nextDeadline?: string;
  status: string;
  href: string;
}

export interface RecentMatterItem {
  id: string;
  name: string;
  clientName: string;
  status: string;
  progress: number;
  dueDate: string;
  href: string;
}

export interface TeamWorkloadItem {
  userId: string;
  userName: string;
  role: string;
  openTasks: number;
  openMatters: number;
  estimatedHours: number;
  actualHours: number;
  capacity: number;
  utilization: number;
  isOverloaded: boolean;
  isUnderutilized: boolean;
  href: string;
}

export interface CommunicationFollowupItem {
  id: string;
  type: "email" | "whatsapp" | "sms" | "call";
  clientName: string;
  subject: string;
  lastActivity: string;
  daysSinceActivity: number;
  followUpDue: string;
  href: string;
}

export const mockUrgentWork: UrgentWorkItem[] = [
  {
    id: "urgent-1",
    type: "notice",
    title: "IT Notice u/s 143(2) - Scrutiny Assessment",
    clientName: "ABC Pvt Ltd",
    matterName: "ABC Pvt Ltd - ITR FY 2024-25",
    dueDate: "2024-07-15",
    daysOverdue: 0,
    priority: "high",
    assigneeName: "Anjali Gupta",
    href: "/dashboard/notices/notice-abc-it-001",
  },
  {
    id: "urgent-2",
    type: "compliance",
    title: "GST April Return Overdue - Multi-state",
    clientName: "RetailMax Chain",
    matterName: "RetailMax Chain - GST Q1 2024-25",
    dueDate: "2024-05-11",
    daysOverdue: 55,
    priority: "urgent",
    assigneeName: "Anjali Gupta",
    href: "/dashboard/compliance/gst/cycle-rtl-gst-apr",
  },
  {
    id: "urgent-3",
    type: "task",
    title: "TDS Challan Verification for Q1",
    clientName: "ABC Pvt Ltd",
    matterName: "ABC Pvt Ltd - TDS Q1 2024-25",
    dueDate: "2024-07-25",
    daysOverdue: 0,
    priority: "high",
    assigneeName: "Kavya Nair",
    href: "/dashboard/tasks/task-abc-tds-001",
  },
  {
    id: "urgent-4",
    type: "review",
    title: "GST Q1 Reconciliation Review",
    clientName: "ABC Pvt Ltd",
    matterName: "ABC Pvt Ltd - GST Q1 2024-25",
    dueDate: "2024-07-11",
    daysOverdue: 0,
    priority: "high",
    assigneeName: "Priya Sharma",
    href: "/dashboard/reviews/matter-abc-gst-001",
  },
  {
    id: "urgent-5",
    type: "compliance",
    title: "ITR Filing - Global Corp Transfer Pricing",
    clientName: "Global Corp India",
    matterName: "Global Corp India - ITR FY 2024-25",
    dueDate: "2024-10-31",
    daysOverdue: 0,
    priority: "critical",
    assigneeName: "Rohit Agarwal",
    href: "/dashboard/compliance/itr/cycle-glb-itr-24",
  },
  {
    id: "urgent-6",
    type: "notice",
    title: "TDS Demand Notice - Short Deduction",
    clientName: "Global Corp India",
    matterName: "Global Corp India - TDS Q1 2024-25",
    dueDate: "2024-07-01",
    daysOverdue: 0,
    priority: "high",
    assigneeName: "Siddharth Reddy",
    href: "/dashboard/notices/notice-glb-tds-001",
  },
  {
    id: "urgent-7",
    type: "task",
    title: "Audit Planning Meeting Preparation",
    clientName: "ABC Pvt Ltd",
    matterName: "ABC Pvt Ltd - Statutory Audit FY 2024-25",
    dueDate: "2024-07-20",
    daysOverdue: 0,
    priority: "medium",
    assigneeName: "Vikram Mehta",
    href: "/dashboard/tasks/task-abc-audit-001",
  },
];

export const mockUpcomingDeadlines: UpcomingDeadlineItem[] = [
  {
    id: "deadline-1",
    type: "notice",
    title: "IT Notice Response Due",
    clientName: "ABC Pvt Ltd",
    dueDate: "2024-07-15",
    daysRemaining: 2,
    priority: "high",
    href: "/dashboard/notices/notice-abc-it-001",
  },
  {
    id: "deadline-2",
    type: "compliance",
    title: "GST Q1 Return Filing",
    clientName: "ABC Pvt Ltd",
    dueDate: "2024-07-11",
    daysRemaining: 0,
    priority: "high",
    href: "/dashboard/compliance/gst/cycle-abc-gst-apr",
  },
  {
    id: "deadline-3",
    type: "task",
    title: "TDS 24Q Filing",
    clientName: "ABC Pvt Ltd",
    dueDate: "2024-07-31",
    daysRemaining: 18,
    priority: "medium",
    href: "/dashboard/tasks/task-abc-tds-001",
  },
  {
    id: "deadline-4",
    type: "compliance",
    title: "GST Q1 Filing - RetailMax",
    clientName: "RetailMax Chain",
    dueDate: "2024-07-11",
    daysRemaining: 0,
    priority: "urgent",
    href: "/dashboard/compliance/gst/cycle-rtl-gst-apr",
  },
  {
    id: "deadline-5",
    type: "notice",
    title: "TDS Demand Response",
    clientName: "Global Corp India",
    dueDate: "2024-07-01",
    daysRemaining: -5,
    priority: "high",
    href: "/dashboard/notices/notice-glb-tds-001",
  },
  {
    id: "deadline-6",
    type: "meeting",
    title: "Audit Planning Meeting",
    clientName: "ABC Pvt Ltd",
    dueDate: "2024-07-20",
    daysRemaining: 7,
    priority: "medium",
    href: "/dashboard/calendar/cal-abc-audit-meeting",
  },
  {
    id: "deadline-7",
    type: "compliance",
    title: "GSTR-3B May Filing",
    clientName: "ABC Pvt Ltd",
    dueDate: "2024-06-11",
    daysRemaining: -25,
    priority: "high",
    href: "/dashboard/compliance/gst/cycle-abc-gst-may",
  },
  {
    id: "deadline-8",
    type: "task",
    title: "ITR Computation Review",
    clientName: "Global Corp India",
    dueDate: "2024-08-31",
    daysRemaining: 49,
    priority: "critical",
    href: "/dashboard/tasks/task-glb-itr-001",
  },
  {
    id: "deadline-9",
    type: "compliance",
    title: "ITR Filing Deadline (Multiple)",
    clientName: "Multiple Clients",
    dueDate: "2024-10-31",
    daysRemaining: 110,
    priority: "high",
    href: "/dashboard/compliance/itr",
  },
];

export const mockMissingDocuments: MissingDocumentItem[] = [
  {
    id: "md-1",
    clientName: "RetailMax Chain",
    matterName: "RetailMax Chain - GST Q1 2024-25",
    documentName: "Multi-state Sales Invoices (April)",
    requestedDate: "2024-04-20",
    reminderCount: 3,
    daysWaiting: 72,
    status: "reminder_sent",
    href: "/dashboard/documents/requests/dr-rtl-gst-apr",
  },
  {
    id: "md-2",
    clientName: "ABC Pvt Ltd",
    matterName: "ABC Pvt Ltd - GST Q1 2024-25",
    documentName: "May 2024 Sales Invoices",
    requestedDate: "2024-05-20",
    reminderCount: 1,
    daysWaiting: 42,
    status: "sent",
    href: "/dashboard/documents/requests/dr-abc-gst-may",
  },
  {
    id: "md-3",
    clientName: "TechNova Solutions",
    matterName: "TechNova Solutions - GST Q1 2024-25",
    documentName: "April 2024 Invoices",
    requestedDate: "2024-04-10",
    reminderCount: 0,
    daysWaiting: 82,
    status: "not_sent",
    href: "/dashboard/documents/requests/dr-tech-gst-apr",
  },
  {
    id: "md-4",
    clientName: "ABC Pvt Ltd",
    matterName: "ABC Pvt Ltd - TDS Q1 2024-25",
    documentName: "TDS Challans Q1",
    requestedDate: "2024-04-15",
    reminderCount: 2,
    daysWaiting: 77,
    status: "reminder_sent",
    href: "/dashboard/documents/requests/dr-abc-tds-q1",
  },
  {
    id: "md-5",
    clientName: "Sharma & Associates",
    matterName: "Sharma & Associates - ITR FY 2024-25",
    documentName: "Financial Statements FY 2023-24",
    requestedDate: "2024-05-01",
    reminderCount: 1,
    daysWaiting: 61,
    status: "sent",
    href: "/dashboard/documents/requests/dr-sharma-itr",
  },
];

export const mockPendingReviews: PendingReviewItem[] = [
  {
    id: "pr-1",
    objectType: "matter",
    objectName: "ABC Pvt Ltd - GST Q1 2024-25",
    clientName: "ABC Pvt Ltd",
    submitterName: "Anjali Gupta",
    stage: "Partner Review",
    submittedDate: "2024-07-05",
    daysAging: 11,
    priority: "high",
    href: "/dashboard/reviews/matter-abc-gst-001",
  },
  {
    id: "pr-2",
    objectType: "matter",
    objectName: "Global Corp India - TDS Q1 2024-25",
    clientName: "Global Corp India",
    submitterName: "Siddharth Reddy",
    stage: "Manager Review",
    submittedDate: "2024-07-15",
    daysAging: 1,
    priority: "medium",
    href: "/dashboard/reviews/matter-glb-tds-001",
  },
  {
    id: "pr-3",
    objectType: "task",
    objectName: "ITR Computation - Global Corp",
    clientName: "Global Corp India",
    submitterName: "Rohit Agarwal",
    stage: "Senior Review",
    submittedDate: "2024-07-10",
    daysAging: 6,
    priority: "critical",
    href: "/dashboard/reviews/task-glb-itr-001",
  },
  {
    id: "pr-4",
    objectType: "compliance",
    objectName: "Precision Mfg Co - GST April 2024",
    clientName: "Precision Mfg Co",
    submitterName: "Siddharth Reddy",
    stage: "Partner Review",
    submittedDate: "2024-07-05",
    daysAging: 11,
    priority: "high",
    href: "/dashboard/reviews/cycle-mfg-gst-apr",
  },
  {
    id: "pr-5",
    objectType: "document",
    objectName: "TP Documentation - Global Corp",
    clientName: "Global Corp India",
    submitterName: "Rohit Agarwal",
    stage: "Partner Review",
    submittedDate: "2024-06-20",
    daysAging: 26,
    priority: "critical",
    href: "/dashboard/reviews/doc-tp-glb-001",
  },
];

export const mockRecentClients: RecentClientItem[] = [
  {
    id: "client-abc",
    name: "ABC Pvt Ltd",
    type: "Multi-service",
    pendingWork: 4,
    nextDeadline: "2024-07-11",
    status: "active",
    href: "/dashboard/clients/client-abc-001",
  },
  {
    id: "client-global",
    name: "Global Corp India",
    type: "Multi-service",
    pendingWork: 3,
    nextDeadline: "2024-07-31",
    status: "active",
    href: "/dashboard/clients/client-global-001",
  },
  {
    id: "client-rtl",
    name: "RetailMax Chain",
    type: "Compliance",
    pendingWork: 2,
    nextDeadline: "2024-07-11",
    status: "active",
    href: "/dashboard/clients/client-rtl-001",
  },
  {
    id: "client-mfg",
    name: "Precision Mfg Co",
    type: "Multi-service",
    pendingWork: 2,
    nextDeadline: "2024-07-11",
    status: "active",
    href: "/dashboard/clients/client-mfg-001",
  },
  {
    id: "client-tech",
    name: "TechNova Solutions",
    type: "Advisory",
    pendingWork: 2,
    nextDeadline: "2024-07-11",
    status: "active",
    href: "/dashboard/clients/client-tech-001",
  },
];

export const mockRecentMatters: RecentMatterItem[] = [
  {
    id: "matter-abc-gst",
    name: "ABC Pvt Ltd - GST Q1 2024-25",
    clientName: "ABC Pvt Ltd",
    status: "ready_for_review",
    progress: 90,
    dueDate: "2024-07-11",
    href: "/dashboard/matters/matter-abc-gst-001",
  },
  {
    id: "matter-abc-itr",
    name: "ABC Pvt Ltd - ITR FY 2024-25",
    clientName: "ABC Pvt Ltd",
    status: "in_progress",
    progress: 55,
    dueDate: "2024-10-31",
    href: "/dashboard/matters/matter-abc-itr-001",
  },
  {
    id: "matter-glb-itr",
    name: "Global Corp India - ITR FY 2024-25",
    clientName: "Global Corp India",
    status: "in_progress",
    progress: 58,
    dueDate: "2024-10-31",
    href: "/dashboard/matters/matter-glb-itr-001",
  },
  {
    id: "matter-mfg-gst",
    name: "Precision Mfg Co - GST Q1 2024-25",
    clientName: "Precision Mfg Co",
    status: "ready_for_review",
    progress: 87,
    dueDate: "2024-07-11",
    href: "/dashboard/matters/matter-mfg-gst-001",
  },
  {
    id: "matter-glb-tds",
    name: "Global Corp India - TDS Q1 2024-25",
    clientName: "Global Corp India",
    status: "ready_for_review",
    progress: 80,
    dueDate: "2024-07-31",
    href: "/dashboard/matters/matter-glb-tds-001",
  },
];

export const mockTeamWorkload: TeamWorkloadItem[] = [
  {
    userId: "user-senior-001",
    userName: "Anjali Gupta",
    role: "Senior Associate",
    openTasks: 8,
    openMatters: 5,
    estimatedHours: 45,
    actualHours: 38,
    capacity: 40,
    utilization: 95,
    isOverloaded: false,
    isUnderutilized: false,
    href: "/dashboard/workload/users/user-senior-001",
  },
  {
    userId: "user-senior-002",
    userName: "Rohit Agarwal",
    role: "Senior Associate",
    openTasks: 6,
    openMatters: 4,
    estimatedHours: 50,
    actualHours: 42,
    capacity: 40,
    utilization: 105,
    isOverloaded: true,
    isUnderutilized: false,
    href: "/dashboard/workload/users/user-senior-002",
  },
  {
    userId: "user-associate-001",
    userName: "Kavya Nair",
    role: "Associate",
    openTasks: 12,
    openMatters: 3,
    estimatedHours: 35,
    actualHours: 28,
    capacity: 40,
    utilization: 70,
    isOverloaded: false,
    isUnderutilized: true,
    href: "/dashboard/workload/users/user-associate-001",
  },
  {
    userId: "user-associate-002",
    userName: "Siddharth Reddy",
    role: "Associate",
    openTasks: 10,
    openMatters: 4,
    estimatedHours: 38,
    actualHours: 32,
    capacity: 40,
    utilization: 80,
    isOverloaded: false,
    isUnderutilized: false,
    href: "/dashboard/workload/users/user-associate-002",
  },
  {
    userId: "user-manager-001",
    userName: "Neha Singh",
    role: "Manager",
    openTasks: 4,
    openMatters: 8,
    estimatedHours: 30,
    actualHours: 25,
    capacity: 35,
    utilization: 71,
    isOverloaded: false,
    isUnderutilized: false,
    href: "/dashboard/workload/users/user-manager-001",
  },
  {
    userId: "user-manager-002",
    userName: "Vikram Mehta",
    role: "Manager",
    openTasks: 3,
    openMatters: 6,
    estimatedHours: 28,
    actualHours: 22,
    capacity: 35,
    utilization: 63,
    isOverloaded: false,
    isUnderutilized: true,
    href: "/dashboard/workload/users/user-manager-002",
  },
];

export const mockCommunicationFollowups: CommunicationFollowupItem[] = [
  {
    id: "cf-1",
    type: "email",
    clientName: "ABC Pvt Ltd",
    subject: "Re: Documents for ITR Filing FY 2024-25",
    lastActivity: "2024-06-28T10:30:00Z",
    daysSinceActivity: 8,
    followUpDue: "Today",
    href: "/dashboard/communications/comm-abc-email-001",
  },
  {
    id: "cf-2",
    type: "whatsapp",
    clientName: "RetailMax Chain",
    subject: "GST Document Collection - April",
    lastActivity: "2024-06-15T14:22:00Z",
    daysSinceActivity: 21,
    followUpDue: "Overdue",
    href: "/dashboard/communications/comm-rtl-wa-001",
  },
  {
    id: "cf-3",
    type: "email",
    clientName: "Global Corp India",
    subject: "Transfer Pricing Documentation Review",
    lastActivity: "2024-06-20T09:15:00Z",
    daysSinceActivity: 16,
    followUpDue: "Tomorrow",
    href: "/dashboard/communications/comm-glb-email-001",
  },
  {
    id: "cf-4",
    type: "call",
    clientName: "TechNova Solutions",
    subject: "Quarterly Advisory Call Follow-up",
    lastActivity: "2024-07-01T11:00:00Z",
    daysSinceActivity: 5,
    followUpDue: "Tomorrow",
    href: "/dashboard/communications/comm-tech-call-001",
  },
  {
    id: "cf-5",
    type: "whatsapp",
    clientName: "XYZ LLP",
    subject: "GSTR-3B Filing Confirmation",
    lastActivity: "2024-05-12T16:45:00Z",
    daysSinceActivity: 55,
    followUpDue: "This week",
    href: "/dashboard/communications/comm-xyz-wa-001",
  },
];
