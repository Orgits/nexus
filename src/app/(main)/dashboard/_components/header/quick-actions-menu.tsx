"use client";

import { useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import {
  Briefcase,
  Calendar,
  CheckSquare,
  FileText,
  Mail,
  MessageSquare,
  Plus,
  Upload,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  disabled?: boolean;
  contextPrefill?: Record<string, unknown>;
}

const quickActions: QuickAction[] = [
  {
    id: "add-client",
    label: "Add Client",
    icon: <Users className="h-4 w-4" />,
    href: "/dashboard/clients/new",
  },
  {
    id: "create-matter",
    label: "Create Matter",
    icon: <Briefcase className="h-4 w-4" />,
    href: "/dashboard/matters/new",
  },
  {
    id: "create-task",
    label: "Create Task",
    icon: <CheckSquare className="h-4 w-4" />,
    href: "/dashboard/tasks/new",
  },
  {
    id: "send-message",
    label: "Send Message",
    icon: <MessageSquare className="h-4 w-4" />,
    href: "/dashboard/communications/compose",
  },
  {
    id: "upload-document",
    label: "Upload Document",
    icon: <Upload className="h-4 w-4" />,
    href: "/dashboard/documents/upload",
  },
  {
    id: "create-invoice",
    label: "Create Invoice",
    icon: <Wallet className="h-4 w-4" />,
    href: "/dashboard/invoices/new",
  },
  {
    id: "create-notice",
    label: "Create Notice",
    icon: <FileText className="h-4 w-4" />,
    href: "/dashboard/notices/new",
  },
  {
    id: "create-campaign",
    label: "Create Campaign",
    icon: <Mail className="h-4 w-4" />,
    href: "/dashboard/campaigns/new",
  },
  {
    id: "log-call",
    label: "Log Call",
    icon: <Calendar className="h-4 w-4" />,
    href: "/dashboard/calendar/new?type=call",
  },
];

export function QuickActionsMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, _setMounted] = useState(false);

  const getContextualActions = (): QuickAction[] => {
    const actions = [...quickActions];

    if (pathname.startsWith("/dashboard/clients/")) {
      const clientId = pathname.split("/")[3];
      return actions.map((a) =>
        a.id === "create-matter" ||
        a.id === "create-task" ||
        a.id === "send-message" ||
        a.id === "upload-document" ||
        a.id === "create-invoice"
          ? { ...a, contextPrefill: { clientId } }
          : a,
      );
    }

    if (pathname.startsWith("/dashboard/matters/")) {
      const matterId = pathname.split("/")[3];
      return actions.map((a) =>
        a.id === "create-task" || a.id === "send-message" || a.id === "upload-document" || a.id === "create-invoice"
          ? { ...a, contextPrefill: { matterId } }
          : a,
      );
    }

    if (pathname.startsWith("/dashboard/tasks/")) {
      const taskId = pathname.split("/")[3];
      return actions.map((a) =>
        a.id === "send-message" || a.id === "upload-document" ? { ...a, contextPrefill: { taskId } } : a,
      );
    }

    return actions;
  };

  const contextualActions = getContextualActions();

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" aria-label="Quick Actions">
          <Plus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" sideOffset={5}>
        <DropdownMenuLabel className="font-medium">Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {contextualActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => {
                if (action.href) {
                  router.push(action.href);
                } else if (action.action) {
                  action.action();
                }
              }}
              disabled={action.disabled}
              className="flex items-center gap-2"
            >
              <span className="flex h-5 w-5 items-center justify-center">{action.icon}</span>
              {action.label}
              {action.contextPrefill && <span className="ml-auto text-xs text-muted-foreground">Prefilled</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
