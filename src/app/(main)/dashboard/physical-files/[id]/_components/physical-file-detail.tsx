"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Archive,
  Building2,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  Shield,
  Trash2,
  Truck,
  User as UserIcon,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { Breadcrumb, ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getMatterById } from "@/mock-data/matters";
import { getPhysicalFileById, getPhysicalFilesByClient } from "@/mock-data/registers";
import { getUserById } from "@/mock-data/users";
import type { Client, Matter, PhysicalFile, PhysicalFileStatus, User as UserType } from "@/types";

const physicalFileTabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "movement", label: "Movement History", icon: Truck },
  { id: "documents", label: "Related Documents", icon: FileText },
  { id: "activity", label: "Activity", icon: Clock },
] as const;

const statusColors: Record<PhysicalFileStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  stored: { bg: "bg-green-100", text: "text-green-800", icon: <Archive className="h-3 w-3" /> },
  checked_out: { bg: "bg-blue-100", text: "text-blue-800", icon: <Truck className="h-3 w-3" /> },
  in_transit: { bg: "bg-amber-100", text: "text-amber-800", icon: <Truck className="h-3 w-3" /> },
  missing: { bg: "bg-red-100", text: "text-red-800", icon: <AlertCircle className="h-3 w-3" /> },
  archived: { bg: "bg-gray-100", text: "text-gray-800", icon: <Archive className="h-3 w-3" /> },
  disposed: { bg: "bg-slate-100", text: "text-slate-800", icon: <Trash2 className="h-3 w-3" /> },
  digitized: { bg: "bg-purple-100", text: "text-purple-800", icon: <FileText className="h-3 w-3" /> },
};

function getStatusConfig(status: PhysicalFileStatus) {
  return (
    statusColors[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: <FileText className="h-3 w-3" />,
    }
  );
}

function formatLocation(location: PhysicalFile["storageLocation"] | undefined): string {
  if (!location) return "—";
  const parts = [
    location.building,
    location.room,
    location.cabinet,
    location.shelf,
    location.box,
    location.slot,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" > ") : location.description || "—";
}

export function PhysicalFileDetail({ id }: { id: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  const physicalFile = getPhysicalFileById(id);
  if (!physicalFile) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Physical File not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The physical file you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/physical-files")}
          className="text-primary hover:underline"
        >
          Back to Physical Files
        </button>
      </div>
    );
  }

  const client = physicalFile.clientId ? getClientById(physicalFile.clientId) : undefined;
  const matter = physicalFile.matterId ? getMatterById(physicalFile.matterId) : undefined;
  const custodian = physicalFile.custodianId ? getUserById(physicalFile.custodianId) : undefined;
  const checkedOutBy = physicalFile.checkedOutById ? getUserById(physicalFile.checkedOutById) : undefined;

  const isOverdue = !!(physicalFile.dueBackAt && new Date(physicalFile.dueBackAt) < new Date());
  const relatedFiles = physicalFile.clientId
    ? getPhysicalFilesByClient(physicalFile.clientId).filter((f) => f.id !== id)
    : [];

  const statusConfig = getStatusConfig(physicalFile.status);

  const handleCheckOut = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Check out file ${physicalFile.fileNumber}`);
    setShowCheckOutDialog(false);
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Check in file ${physicalFile.fileNumber}`);
    setShowCheckInDialog(false);
  };

  const handleMove = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Move file ${physicalFile.fileNumber}`);
    setShowMoveDialog(false);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Physical Files", href: "/dashboard/physical-files" },
          { label: physicalFile.fileNumber, href: `/dashboard/physical-files/${physicalFile.id}` },
          { label: physicalFile.title },
        ]}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate font-semibold text-xl">{physicalFile.title}</h1>
          <p className="truncate text-muted-foreground text-sm">File ID: {physicalFile.fileNumber}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={`${statusConfig.bg} ${statusConfig.text} gap-1`}>
            {statusConfig.icon}
            {physicalFile.status.replace(/_/g, " ")}
          </Badge>
          {physicalFile.isConfidential && (
            <Badge variant="destructive" className="gap-1">
              <Shield className="h-3 w-3" />
              Confidential
            </Badge>
          )}
        </div>
      </div>

      {showCheckOutDialog && (
        <CheckOutDialog onClose={() => setShowCheckOutDialog(false)} onCheckOut={handleCheckOut} />
      )}
      {showCheckInDialog && <CheckInDialog onClose={() => setShowCheckInDialog(false)} onCheckIn={handleCheckIn} />}
      {showMoveDialog && <MoveDialog onClose={() => setShowMoveDialog(false)} onMove={handleMove} />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {physicalFileTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-1 px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PhysicalFileOverviewTab
            physicalFile={physicalFile}
            client={client}
            matter={matter}
            custodian={custodian}
            checkedOutBy={checkedOutBy}
            isOverdue={isOverdue}
            formatLocation={formatLocation}
            statusConfig={statusConfig}
            onCheckOut={() => setShowCheckOutDialog(true)}
            onCheckIn={() => setShowCheckInDialog(true)}
            onMove={() => setShowMoveDialog(true)}
          />
        </TabsContent>

        <TabsContent value="movement" className="space-y-6">
          <PhysicalFileMovementTab physicalFile={physicalFile} formatLocation={formatLocation} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <PhysicalFileDocumentsTab
            physicalFile={physicalFile}
            relatedFiles={relatedFiles}
            formatLocation={formatLocation}
            statusColors={statusColors}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <PhysicalFileActivityTab physicalFile={physicalFile} formatLocation={formatLocation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PhysicalFileOverviewTab({
  physicalFile,
  client,
  matter,
  custodian,
  checkedOutBy,
  isOverdue,
  formatLocation,
  statusConfig,
  onCheckOut,
  onCheckIn,
  onMove,
}: {
  physicalFile: PhysicalFile;
  client: Client | undefined;
  matter: Matter | undefined;
  custodian: UserType | undefined;
  checkedOutBy: UserType | undefined;
  isOverdue: boolean;
  formatLocation: (location: PhysicalFile["storageLocation"] | undefined) => string;
  statusConfig: { bg: string; text: string; icon: React.ReactNode };
  onCheckOut: () => void;
  onCheckIn: () => void;
  onMove: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Key Information" className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="Status"
          value={
            <Badge variant="secondary" className={`${statusConfig.bg} ${statusConfig.text} gap-1`}>
              {statusConfig.icon}
              {physicalFile.status.replace(/_/g, " ")}
            </Badge>
          }
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile label="Custodian" value={custodian?.fullName ?? "—"} icon={<UserIcon className="h-5 w-5" />} />
        <StatTile
          label="Location"
          value={formatLocation(physicalFile.currentLocation ?? physicalFile.storageLocation)}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatTile
          label="Due Back"
          value={physicalFile.dueBackAt ? formatDate(physicalFile.dueBackAt) : "—"}
          hint={isOverdue ? "Overdue" : undefined}
          icon={<Clock className="h-5 w-5" />}
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="File Details">
          <KeyValueList
            items={[
              { label: "File Number", value: physicalFile.fileNumber },
              { label: "Title", value: physicalFile.title },
              { label: "Description", value: physicalFile.description ?? "—" },
              {
                label: "Status",
                value: (
                  <Badge variant="secondary" className={`${statusConfig.bg} ${statusConfig.text} gap-1`}>
                    {statusConfig.icon}
                    {physicalFile.status.replace(/_/g, " ")}
                  </Badge>
                ),
              },
              { label: "Confidential", value: physicalFile.isConfidential ? "Yes" : "No" },
              { label: "Tags", value: physicalFile.tags.length > 0 ? physicalFile.tags.join(", ") : "—" },
              {
                label: "Retention",
                value: physicalFile.retentionPolicy
                  ? `${physicalFile.retentionPolicy.retentionYears} years (${physicalFile.retentionPolicy.disposalAction})`
                  : "—",
              },
              { label: "Legal Basis", value: physicalFile.retentionPolicy?.legalBasis ?? "—" },
              { label: "Created At", value: formatDateTime(physicalFile.createdAt) },
              { label: "Updated At", value: formatDateTime(physicalFile.updatedAt) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Storage & Location">
          <KeyValueList
            items={[
              { label: "Storage Location", value: formatLocation(physicalFile.storageLocation) },
              {
                label: "Current Location",
                value: formatLocation(physicalFile.currentLocation ?? physicalFile.storageLocation),
              },
              { label: "Custodian", value: custodian?.fullName ?? "—" },
              { label: "Checked Out By", value: checkedOutBy?.fullName ?? "—" },
              {
                label: "Checked Out At",
                value: physicalFile.checkedOutAt ? formatDateTime(physicalFile.checkedOutAt) : "—",
              },
              { label: "Due Back", value: physicalFile.dueBackAt ? formatDateTime(physicalFile.dueBackAt) : "—" },
              { label: "Overdue", value: isOverdue ? "Yes" : "No" },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="Client & Matter">
        <div className="grid gap-4 md:grid-cols-2">
          {client && <ClientLink client={client} showStatus={true} />}
          {matter && <MatterLink matter={matter} showStatus={true} showClient={true} client={client} />}
        </div>
      </SectionCard>

      <SectionCard title="Actions">
        <div className="flex flex-wrap gap-2">
          {physicalFile.status === "stored" && (
            <Button onClick={onCheckOut}>
              <Truck className="mr-1.5 h-4 w-4" />
              Check Out
            </Button>
          )}
          {physicalFile.status === "checked_out" && (
            <Button variant="default" onClick={onCheckIn}>
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Check In
            </Button>
          )}
          <Button variant="outline" onClick={onMove}>
            <Truck className="mr-1.5 h-4 w-4" />
            Move Location
          </Button>
          <Button variant="outline" onClick={() => alert("Digitize file")}>
            <FileText className="mr-1.5 h-4 w-4" />
            Digitize
          </Button>
          <Button variant="outline" onClick={() => alert("Archive file")}>
            <Archive className="mr-1.5 h-4 w-4" />
            Archive
          </Button>
          <Button variant="ghost" onClick={() => alert("Print label")}>
            <Plus className="mr-1.5 h-4 w-4" />
            Print Label
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function PhysicalFileMovementTab({
  physicalFile,
  formatLocation,
}: {
  physicalFile: PhysicalFile;
  formatLocation: (location: PhysicalFile["storageLocation"] | undefined) => string;
}) {
  if (physicalFile.movementHistory.length === 0) {
    return (
      <EmptyState
        icon={<Truck className="h-12 w-12 text-muted-foreground/50" />}
        title="No movement history"
        description="This physical file has no recorded movements."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Movement Timeline">
        <DataTable<PhysicalFile["movementHistory"][0]>
          data={physicalFile.movementHistory}
          columns={[
            {
              accessorKey: "movedAt",
              header: "Date",
              cell: ({ row }: { row: { original: PhysicalFile["movementHistory"][0] } }) => (
                <span className="whitespace-nowrap text-sm">{formatDateTime(row.original.movedAt)}</span>
              ),
            },
            {
              accessorKey: "reason",
              header: "Reason",
              cell: ({ row }: { row: { original: PhysicalFile["movementHistory"][0] } }) => (
                <span className="text-sm">{row.original.reason || "—"}</span>
              ),
            },
            {
              accessorKey: "fromLocation",
              header: "From Location",
              cell: ({ row }: { row: { original: PhysicalFile["movementHistory"][0] } }) => (
                <span className="font-mono text-xs">{formatLocation(row.original.fromLocation)}</span>
              ),
            },
            {
              accessorKey: "toLocation",
              header: "To Location",
              cell: ({ row }: { row: { original: PhysicalFile["movementHistory"][0] } }) => (
                <span className="font-mono text-xs">{formatLocation(row.original.toLocation)}</span>
              ),
            },
            {
              accessorKey: "movedById",
              header: "Moved By",
              cell: ({ row }: { row: { original: PhysicalFile["movementHistory"][0] } }) => {
                const user = getUserById(row.original.movedById);
                return <span className="text-sm">{user?.fullName ?? row.original.movedById}</span>;
              },
            },
            {
              accessorKey: "checkedOutById",
              header: "Checked Out By",
              cell: ({ row }: { row: { original: PhysicalFile["movementHistory"][0] } }) => {
                if (!row.original.checkedOutById) return <span className="text-muted-foreground text-sm">—</span>;
                const user = getUserById(row.original.checkedOutById);
                return <span className="text-sm">{user?.fullName ?? row.original.checkedOutById}</span>;
              },
            },
            {
              accessorKey: "dueBackAt",
              header: "Due Back",
              cell: ({ row }: { row: { original: PhysicalFile["movementHistory"][0] } }) => {
                if (!row.original.dueBackAt) return <span className="text-muted-foreground text-sm">—</span>;
                const isOverdue = new Date(row.original.dueBackAt) < new Date();
                return (
                  <span className={isOverdue ? "text-destructive font-medium text-sm" : "text-sm"}>
                    {formatDateTime(row.original.dueBackAt)}
                    {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
                  </span>
                );
              },
            },
            {
              accessorKey: "returnedAt",
              header: "Returned At",
              cell: ({ row }: { row: { original: PhysicalFile["movementHistory"][0] } }) => (
                <span className="text-sm">
                  {row.original.returnedAt ? formatDateTime(row.original.returnedAt) : "—"}
                </span>
              ),
            },
          ]}
          getRowId={(row) => row.id}
          pageSize={20}
          emptyMessage="No movement history"
        />
      </SectionCard>
    </div>
  );
}

function PhysicalFileDocumentsTab({
  physicalFile,
  relatedFiles,
  formatLocation,
  statusColors,
}: {
  physicalFile: PhysicalFile;
  relatedFiles: PhysicalFile[];
  formatLocation: (location: PhysicalFile["storageLocation"] | undefined) => string;
  statusColors: Record<PhysicalFileStatus, { bg: string; text: string; icon: React.ReactNode }>;
}) {
  return (
    <div className="space-y-6">
      {physicalFile.relatedDocumentIds.length > 0 && (
        <SectionCard title={`Linked Digital Documents (${physicalFile.relatedDocumentIds.length})`}>
          <div className="flex flex-wrap gap-2">
            {physicalFile.relatedDocumentIds.map((docId) => (
              <Badge key={docId} variant="secondary" className="gap-1">
                <FileText className="h-3 w-3" />
                {docId}
              </Badge>
            ))}
          </div>
        </SectionCard>
      )}

      {relatedFiles.length > 0 && (
        <SectionCard title={`Other Files for Same Client (${relatedFiles.length})`}>
          <DataTable<PhysicalFile>
            data={relatedFiles}
            columns={[
              {
                accessorKey: "fileNumber",
                header: "File #",
                cell: ({ row }: { row: { original: PhysicalFile } }) => (
                  <p className="font-medium text-sm">{row.original.fileNumber}</p>
                ),
              },
              {
                accessorKey: "title",
                header: "Title",
                cell: ({ row }: { row: { original: PhysicalFile } }) => <p className="text-sm">{row.original.title}</p>,
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: PhysicalFile } }) => {
                  const config = statusColors[row.original.status] || {
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                    icon: <FileText className="h-3 w-3" />,
                  };
                  return (
                    <Badge variant="secondary" className={`${config.bg} ${config.text} gap-1`}>
                      {config.icon}
                      {row.original.status.replace(/_/g, " ")}
                    </Badge>
                  );
                },
              },
              {
                accessorKey: "currentLocation",
                header: "Current Location",
                cell: ({ row }: { row: { original: PhysicalFile } }) => (
                  <span className="font-mono text-xs">
                    {formatLocation(row.original.currentLocation ?? row.original.storageLocation)}
                  </span>
                ),
              },
            ]}
            getRowId={(row) => row.id}
            pageSize={10}
            emptyMessage="No related files"
            rowActions={[
              {
                label: "View",
                action: (row) => alert(`View file ${row.fileNumber}`),
              },
            ]}
          />
        </SectionCard>
      )}

      {physicalFile.relatedDocumentIds.length === 0 && relatedFiles.length === 0 && (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No related documents or files"
          description="This physical file is not linked to any digital documents or other physical files."
        />
      )}
    </div>
  );
}

function PhysicalFileActivityTab({
  physicalFile,
  formatLocation,
}: {
  physicalFile: PhysicalFile;
  formatLocation: (location: PhysicalFile["storageLocation"] | undefined) => string;
}) {
  const allActivities = [
    {
      id: `pf-created-${physicalFile.id}`,
      type: "document" as const,
      title: `Physical file created: ${physicalFile.fileNumber}`,
      description: physicalFile.title,
      timestamp: physicalFile.createdAt,
      entityUrl: "#",
    },
    ...physicalFile.movementHistory.map((m) => ({
      id: m.id,
      type: "document" as const,
      title: `File moved: ${m.reason || "Location change"}`,
      description: `${formatLocation(m.fromLocation)} → ${formatLocation(m.toLocation)}`,
      timestamp: m.movedAt,
      entityUrl: "#",
    })),
    ...(physicalFile.checkedOutAt
      ? [
          {
            id: `pf-checkout-${physicalFile.id}`,
            type: "document" as const,
            title: `File checked out`,
            description: `By ${physicalFile.checkedOutById ? getUserById(physicalFile.checkedOutById)?.fullName : "Unknown"}`,
            timestamp: physicalFile.checkedOutAt,
            entityUrl: "#",
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <SectionCard title="Activity Timeline">
      <ActivityTimeline activities={allActivities} grouped maxItems={50} />
    </SectionCard>
  );
}

function CheckOutDialog({ onClose, onCheckOut }: { onClose: () => void; onCheckOut: (e: React.FormEvent) => void }) {
  const [checkedOutById, setCheckedOutById] = useState("");
  const [dueBackAt, setDueBackAt] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  });
  const [reason, setReason] = useState("");

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Check Out Physical File</DialogTitle>
        </DialogHeader>
        <form onSubmit={onCheckOut} className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="checkedOutById" className="font-medium">
              Checked Out By
            </Label>
            <Select value={checkedOutById} onValueChange={setCheckedOutById}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "user-partner-1",
                  "user-partner-2",
                  "user-senior-1",
                  "user-senior-2",
                  "user-manager-1",
                  "user-manager-2",
                  "user-associate-1",
                  "user-associate-2",
                  "user-support-1",
                ].map((userId) => {
                  const user = getUserById(userId);
                  return user ? (
                    <SelectItem key={userId} value={userId}>
                      {user.fullName} ({user.role.replace(/_/g, " ")})
                    </SelectItem>
                  ) : null;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueBackAt" className="flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5" />
              Due Back Date
            </Label>
            <Input
              id="dueBackAt"
              type="date"
              value={dueBackAt}
              onChange={(e) => setDueBackAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason" className="font-medium">
              Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for checkout"
              rows={3}
            />
          </div>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Check Out</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CheckInDialog({ onClose, onCheckIn }: { onClose: () => void; onCheckIn: (e: React.FormEvent) => void }) {
  const [condition, setCondition] = useState("good");
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Check In Physical File</DialogTitle>
        </DialogHeader>
        <form onSubmit={onCheckIn} className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="condition" className="font-medium">
              Condition
            </Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="pages_missing">Pages Missing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the return"
              rows={3}
            />
          </div>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Check In</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MoveDialog({ onClose, onMove }: { onClose: () => void; onMove: (e: React.FormEvent) => void }) {
  const [toBuilding, setToBuilding] = useState("");
  const [toRoom, setToRoom] = useState("");
  const [toCabinet, setToCabinet] = useState("");
  const [toShelf, setToShelf] = useState("");
  const [toBox, setToBox] = useState("");
  const [toSlot, setToSlot] = useState("");
  const [toDescription, setToDescription] = useState("");
  const [reason, setReason] = useState("");

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Move Physical File</DialogTitle>
        </DialogHeader>
        <form onSubmit={onMove} className="space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="toBuilding" className="font-medium">
                Building
              </Label>
              <Input
                id="toBuilding"
                value={toBuilding}
                onChange={(e) => setToBuilding(e.target.value)}
                placeholder="Building name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toRoom" className="font-medium">
                Room
              </Label>
              <Input id="toRoom" value={toRoom} onChange={(e) => setToRoom(e.target.value)} placeholder="Room name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toCabinet" className="font-medium">
                Cabinet
              </Label>
              <Input
                id="toCabinet"
                value={toCabinet}
                onChange={(e) => setToCabinet(e.target.value)}
                placeholder="Cabinet identifier"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toShelf" className="font-medium">
                Shelf
              </Label>
              <Input
                id="toShelf"
                value={toShelf}
                onChange={(e) => setToShelf(e.target.value)}
                placeholder="Shelf number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toBox" className="font-medium">
                Box
              </Label>
              <Input id="toBox" value={toBox} onChange={(e) => setToBox(e.target.value)} placeholder="Box number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toSlot" className="font-medium">
                Slot
              </Label>
              <Input
                id="toSlot"
                value={toSlot}
                onChange={(e) => setToSlot(e.target.value)}
                placeholder="Slot identifier"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="toDescription" className="font-medium">
              Description
            </Label>
            <Input
              id="toDescription"
              value={toDescription}
              onChange={(e) => setToDescription(e.target.value)}
              placeholder="Location description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason" className="font-medium">
              Reason for Move
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for moving the file"
              rows={3}
            />
          </div>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Move File</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
