"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Building2, MapPin } from "lucide-react";

import { ClientStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { clientCategoryLabel, clientTypeLabel, serviceTypeLabel } from "@/lib/labels";
import { getUserById } from "@/mock-data/users";
import type { Client } from "@/types";

export const clientColumns: ColumnDef<import("@/lib/data-table-features").DataTableFeatures, Client>[] = [
  {
    accessorKey: "name",
    header: "Client",
    enableHiding: false,
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{client.displayName || client.name}</p>
            {client.legalName && client.legalName !== client.name && (
              <p className="truncate text-muted-foreground text-xs">{client.legalName}</p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <span className="text-sm">{clientTypeLabel(row.original.type)}</span>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {clientCategoryLabel(row.original.category)}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <ClientStatusBadge status={row.original.status} />,
  },
  {
    id: "responsibleUser",
    accessorKey: "responsibleUserId",
    header: "Responsible",
    cell: ({ row }) => {
      const user = getUserById(row.original.responsibleUserId);
      return <span className="text-sm">{user?.fullName ?? row.original.responsibleUserId}</span>;
    },
  },
  {
    id: "services",
    header: "Active Services",
    enableSorting: false,
    cell: ({ row }) => {
      const services = row.original.services.filter((s) => s.isActive);
      return (
        <div className="flex flex-wrap gap-1">
          {services.slice(0, 3).map((service) => (
            <Badge key={service.id} variant="outline" className="text-xs">
              {serviceTypeLabel(service.serviceType)}
            </Badge>
          ))}
          {services.length > 3 && (
            <Badge variant="outline" className="text-muted-foreground text-xs">
              +{services.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "location",
    header: "Location",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <MapPin className="size-3.5" />
        <span>
          {row.original.address.city}, {row.original.address.state}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Added",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.original.createdAt)}</span>,
  },
];
