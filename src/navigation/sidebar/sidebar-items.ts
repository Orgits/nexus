import {
  BarChart3,
  Briefcase,
  Building,
  Calendar,
  CheckSquare,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileCheck,
  FileSearch,
  FileText,
  FolderKanban,
  FolderOpen,
  Gavel,
  Inbox,
  LayoutDashboard,
  Lock,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  PackageSearch,
  ReceiptText,
  Scale,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Timer,
  UserCheck,
  UserCog,
  UserRound,
  Users,
  Users2,
  Wallet,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Workspace",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Practice",
    items: [
      {
        id: "clients",
        title: "Clients",
        url: "/dashboard/clients",
        icon: Users,
      },
      {
        id: "matters",
        title: "Matters",
        icon: Briefcase,
        subItems: [
          { id: "matters-all", title: "All Matters", url: "/dashboard/matters", icon: Briefcase },
          { id: "matters-my", title: "My Matters", url: "/dashboard/matters?view=my", icon: UserCheck },
          {
            id: "matters-pending",
            title: "Pending Information",
            url: "/dashboard/matters?view=pending",
            icon: PackageSearch,
          },
          {
            id: "matters-progress",
            title: "In Progress",
            url: "/dashboard/matters?view=progress",
            icon: ClipboardList,
          },
          { id: "matters-review", title: "Ready for Review", url: "/dashboard/matters?view=review", icon: FileCheck },
          { id: "matters-overdue", title: "Overdue", url: "/dashboard/matters?view=overdue", icon: Search },
          {
            id: "matters-completed",
            title: "Completed",
            url: "/dashboard/matters?view=completed",
            icon: ClipboardCheck,
          },
        ],
      },
      {
        id: "tasks",
        title: "Tasks",
        url: "/dashboard/tasks",
        icon: CheckSquare,
      },
    ],
  },
  {
    id: 3,
    label: "Compliance",
    items: [
      {
        id: "compliance",
        title: "Compliance Overview",
        url: "/dashboard/compliance",
        icon: FileSearch,
      },
      {
        id: "itr",
        title: "ITR",
        url: "/dashboard/compliance/itr",
        icon: FileText,
      },
      {
        id: "gst",
        title: "GST",
        url: "/dashboard/compliance/gst",
        icon: ReceiptText,
      },
      {
        id: "tds",
        title: "TDS",
        url: "/dashboard/compliance/tds",
        icon: Scale,
      },
      {
        id: "mca-roc",
        title: "MCA / ROC",
        url: "/dashboard/compliance/mca-roc",
        icon: Gavel,
      },
    ],
  },
  {
    id: 4,
    label: "Operations",
    items: [
      {
        id: "calendar",
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        id: "reviews",
        title: "Reviews",
        url: "/dashboard/reviews",
        icon: Clipboard,
      },
      {
        id: "notices",
        title: "Notices",
        url: "/dashboard/notices",
        icon: FileSearch,
      },
      {
        id: "audit",
        title: "Audit Workspace",
        url: "/dashboard/audit",
        icon: FolderKanban,
      },
      {
        id: "documents",
        title: "Documents",
        url: "/dashboard/documents",
        icon: FolderOpen,
      },
      {
        id: "physical-files",
        title: "Physical Files",
        url: "/dashboard/physical-files",
        icon: PackageSearch,
      },
    ],
  },
  {
    id: 5,
    label: "Communication",
    items: [
      {
        id: "communications",
        title: "Communications",
        url: "/dashboard/communications",
        icon: Inbox,
      },
      {
        id: "conversations",
        title: "Conversations",
        url: "/dashboard/conversations",
        icon: MessageSquare,
      },
      {
        id: "campaigns",
        title: "Outreach & Campaigns",
        url: "/dashboard/campaigns",
        icon: Megaphone,
      },
    ],
  },
  {
    id: 6,
    label: "Firm Operations",
    items: [
      {
        id: "workload",
        title: "Workload & Capacity",
        url: "/dashboard/workload",
        icon: Users2,
      },
      {
        id: "attendance",
        title: "Attendance",
        url: "/dashboard/attendance",
        icon: UserCheck,
      },
      {
        id: "leave",
        title: "Leave",
        url: "/dashboard/leave",
        icon: UserCog,
      },
      {
        id: "time-tracking",
        title: "Time Tracking",
        url: "/dashboard/time-tracking",
        icon: Timer,
      },
      {
        id: "invoices",
        title: "Invoices & Payments",
        url: "/dashboard/invoices",
        icon: Wallet,
      },
      {
        id: "expenses",
        title: "Expenses",
        url: "/dashboard/expenses",
        icon: CreditCard,
      },
    ],
  },
  {
    id: 7,
    label: "Registers",
    items: [
      {
        id: "dsc",
        title: "DSC",
        url: "/dashboard/registers/dsc",
        icon: Shield,
      },
      {
        id: "udin",
        title: "UDIN",
        url: "/dashboard/registers/udin",
        icon: FileCheck,
      },
      {
        id: "licenses",
        title: "Licenses & Renewals",
        url: "/dashboard/registers/licenses",
        icon: Building,
      },
      {
        id: "engagement-documents",
        title: "Engagement Documents",
        url: "/dashboard/registers/engagement-documents",
        icon: FileText,
      },
    ],
  },
  {
    id: 8,
    label: "Insights",
    items: [
      {
        id: "reports",
        title: "Reports & Analytics",
        url: "/dashboard/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    id: 9,
    label: "Administration",
    items: [
      {
        id: "firm-settings",
        title: "Firm Settings",
        url: "/dashboard/administration/firm-settings",
        icon: Settings,
      },
      {
        id: "users",
        title: "Users",
        url: "/dashboard/administration/users",
        icon: UserRound,
      },
      {
        id: "teams",
        title: "Teams",
        url: "/dashboard/administration/teams",
        icon: Users2,
      },
      {
        id: "roles-permissions",
        title: "Roles & Permissions",
        url: "/dashboard/administration/roles-permissions",
        icon: Lock,
      },
      {
        id: "templates",
        title: "Templates",
        url: "/dashboard/administration/templates",
        icon: ClipboardList,
      },
      {
        id: "compliance-rules",
        title: "Compliance Rules",
        url: "/dashboard/administration/compliance-rules",
        icon: FileSearch,
      },
      {
        id: "integrations",
        title: "Integrations",
        url: "/dashboard/administration/integrations",
        icon: ShoppingBag,
      },
    ],
  },
];
