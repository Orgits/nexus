"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { AlertTriangle, CheckCircle, Clock, Download, FileText, RotateCcw, Send } from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { Breadcrumb, ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { DocumentRequestStatusBadge } from "@/components/ca-nexus/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import { getClientById } from "@/mock-data/clients";
import { getAllDocumentRequests, getDocumentRequestById } from "@/mock-data/compliance";
import { getMatterById } from "@/mock-data/matters";
import { getUserById } from "@/mock-data/users";
import type { Client, DocumentRequest, DocumentRequestItem, Matter, User } from "@/types";

const documentRequestTabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "items", label: "Items", icon: FileText },
  { id: "activity", label: "Activity", icon: Clock },
] as const;

type Channel = "email" | "whatsapp" | "sms";

export function DocumentRequestDetail({ id }: { id: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);

  const documentRequest = getDocumentRequestById(id);
  if (!documentRequest) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Document Request not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The document request you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/documents/requests")}
          className="text-primary hover:underline"
        >
          Back to Document Requests
        </button>
      </div>
    );
  }

  const client = documentRequest.clientId ? getClientById(documentRequest.clientId) : undefined;
  const matter = documentRequest.matterId ? getMatterById(documentRequest.matterId) : undefined;
  const requestedBy = documentRequest.requestedById ? getUserById(documentRequest.requestedById) : undefined;
  const complianceCycle = documentRequest.complianceCycleId
    ? getAllDocumentRequests().find((r) => r.complianceCycleId === documentRequest.complianceCycleId)
    : undefined;

  const mandatoryItems = documentRequest.items.filter((i) => i.isMandatory);
  const receivedItems = documentRequest.items.filter((i) => i.isReceived);
  const mandatoryReceived = mandatoryItems.filter((i) => i.isReceived).length;
  const mandatoryTotal = mandatoryItems.length;
  const isFullyReceived = mandatoryReceived === mandatoryTotal && mandatoryTotal > 0;
  const isOverdue = !!(
    documentRequest.sentAt &&
    ["sent", "reminder_sent", "partially_received"].includes(documentRequest.status) &&
    new Date(documentRequest.sentAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Send document request ${documentRequest.id}`);
    setShowSendDialog(false);
  };

  const handleReminder = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Send reminder for document request ${documentRequest.id}`);
    setShowReminderDialog(false);
  };

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Mark document request ${documentRequest.id} as received`);
    setShowReceiveDialog(false);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[{ label: "Document Requests", href: "/dashboard/documents/requests" }, { label: documentRequest.id }]}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate font-semibold text-xl">Document Request</h1>
          <p className="truncate text-muted-foreground text-sm">Request ID: {documentRequest.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DocumentRequestStatusBadge status={documentRequest.status} />
          {isOverdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
        </div>
      </div>

      {showSendDialog && (
        <SendDialog documentRequest={documentRequest} onClose={() => setShowSendDialog(false)} onSend={handleSend} />
      )}
      {showReminderDialog && (
        <ReminderDialog
          documentRequest={documentRequest}
          onClose={() => setShowReminderDialog(false)}
          onReminder={handleReminder}
        />
      )}
      {showReceiveDialog && (
        <ReceiveDialog
          documentRequest={documentRequest}
          onClose={() => setShowReceiveDialog(false)}
          onReceive={handleReceive}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {documentRequestTabs.map((tab) => (
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
          <DocumentRequestOverviewTab
            documentRequest={documentRequest}
            client={client}
            matter={matter}
            requestedBy={requestedBy}
            complianceCycle={complianceCycle}
            mandatoryReceived={mandatoryReceived}
            mandatoryTotal={mandatoryTotal}
            isFullyReceived={isFullyReceived}
            isOverdue={isOverdue}
            receivedItems={receivedItems}
            onSend={() => setShowSendDialog(true)}
            onReminder={() => setShowReminderDialog(true)}
            onReceive={() => setShowReceiveDialog(true)}
          />
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <DocumentRequestItemsTab documentRequest={documentRequest} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <DocumentRequestActivityTab documentRequest={documentRequest} requestedBy={requestedBy} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocumentRequestOverviewTab({
  documentRequest,
  client,
  matter,
  requestedBy,
  complianceCycle,
  mandatoryReceived,
  mandatoryTotal,
  isFullyReceived,
  isOverdue,
  receivedItems,
  onSend,
  onReminder,
  onReceive,
}: {
  documentRequest: DocumentRequest;
  client: Client | undefined;
  matter: Matter | undefined;
  requestedBy: User | undefined;
  complianceCycle: (DocumentRequest & { complianceCycleId: string; complianceCycleName: string }) | undefined;
  mandatoryReceived: number;
  mandatoryTotal: number;
  isFullyReceived: boolean;
  isOverdue: boolean;
  receivedItems: DocumentRequest["items"];
  onSend: () => void;
  onReminder: () => void;
  onReceive: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Key Metrics" className="grid gap-4 md:grid-cols-5">
        <StatTile
          label="Status"
          value={<DocumentRequestStatusBadge status={documentRequest.status} />}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatTile label="Items" value={documentRequest.items.length} icon={<FileText className="h-5 w-5" />} />
        <StatTile
          label="Mandatory Received"
          value={`${mandatoryReceived}/${mandatoryTotal}`}
          hint={isFullyReceived ? "Complete" : undefined}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatTile
          label="Reminders Sent"
          value={documentRequest.reminderCount}
          icon={<RotateCcw className="h-5 w-5" />}
        />
        <StatTile
          label="Overdue"
          value={isOverdue ? "Yes" : "No"}
          hint={isOverdue ? "Past 30 days" : undefined}
          icon={
            isOverdue ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )
          }
        />
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Request Details">
          <KeyValueList
            items={[
              { label: "Request ID", value: documentRequest.id },
              {
                label: "Compliance Cycle",
                value: complianceCycle?.complianceCycleName ?? documentRequest.complianceCycleId ?? "—",
              },
              { label: "Requested By", value: requestedBy?.fullName ?? documentRequest.requestedById },
              { label: "Status", value: <DocumentRequestStatusBadge status={documentRequest.status} /> },
              { label: "Sent At", value: documentRequest.sentAt ? formatDateTime(documentRequest.sentAt) : "Not sent" },
              { label: "Reminder Count", value: documentRequest.reminderCount },
              {
                label: "Last Reminder",
                value: documentRequest.lastReminderAt ? formatDateTime(documentRequest.lastReminderAt) : "—",
              },
              {
                label: "Received At",
                value: documentRequest.receivedAt ? formatDateTime(documentRequest.receivedAt) : "—",
              },
              { label: "Created At", value: formatDateTime(documentRequest.createdAt) },
              { label: "Updated At", value: formatDateTime(documentRequest.updatedAt) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Progress">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Mandatory Items Received</span>
                <span className="font-medium">
                  {mandatoryReceived}/{mandatoryTotal}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: mandatoryTotal > 0 ? `${(mandatoryReceived / mandatoryTotal) * 100}%` : "0%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>All Items Received</span>
                <span className="font-medium">
                  {receivedItems.length}/{documentRequest.items.length}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{
                    width:
                      documentRequest.items.length > 0
                        ? `${(receivedItems.length / documentRequest.items.length) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
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
          {documentRequest.status === "draft" || documentRequest.status === "not_sent" ? (
            <Button onClick={onSend}>
              <Send className="mr-1.5 h-4 w-4" />
              Send Request
            </Button>
          ) : null}
          {["sent", "reminder_sent", "partially_received"].includes(documentRequest.status) && (
            <>
              <Button variant="outline" onClick={onReminder}>
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Send Reminder
              </Button>
              <Button variant="default" onClick={onReceive}>
                <CheckCircle className="mr-1.5 h-4 w-4" />
                Mark Received
              </Button>
            </>
          )}
          {documentRequest.status === "received" && (
            <Button variant="outline" onClick={() => alert("Close request")}>
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Close Request
            </Button>
          )}
          <Button variant="ghost" onClick={() => alert("Export request")}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function DocumentRequestItemsTab({ documentRequest }: { documentRequest: DocumentRequest }) {
  return (
    <div className="space-y-6">
      <SectionCard title={`Items (${documentRequest.items.length})`}>
        {documentRequest.items.length > 0 ? (
          <DataTable<DocumentRequestItem>
            data={documentRequest.items}
            columns={[
              {
                accessorKey: "documentType",
                header: "Document Type",
                cell: ({ row }: { row: { original: DocumentRequestItem } }) => (
                  <span className="capitalize">{row.original.documentType.replace(/_/g, " ")}</span>
                ),
              },
              {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }: { row: { original: DocumentRequestItem } }) => (
                  <span className="text-sm">{row.original.description ?? "—"}</span>
                ),
              },
              {
                accessorKey: "isMandatory",
                header: "Mandatory",
                cell: ({ row }: { row: { original: DocumentRequestItem } }) => (
                  <Badge variant={row.original.isMandatory ? "destructive" : "outline"}>
                    {row.original.isMandatory ? "Required" : "Optional"}
                  </Badge>
                ),
              },
              {
                accessorKey: "isReceived",
                header: "Received",
                cell: ({ row }: { row: { original: DocumentRequestItem } }) => (
                  <Badge variant={row.original.isReceived ? "default" : "outline"} className="gap-1">
                    {row.original.isReceived ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {row.original.isReceived ? "Yes" : "No"}
                  </Badge>
                ),
              },
              {
                accessorKey: "receivedAt",
                header: "Received At",
                cell: ({ row }: { row: { original: DocumentRequestItem } }) => (
                  <span className="text-sm">
                    {row.original.receivedAt ? formatDateTime(row.original.receivedAt) : "—"}
                  </span>
                ),
              },
              {
                accessorKey: "receivedDocumentId",
                header: "Linked Document",
                cell: ({ row }: { row: { original: DocumentRequestItem } }) => (
                  <span className="text-sm">{row.original.receivedDocumentId ?? "—"}</span>
                ),
              },
            ]}
            getRowId={(row) => `item-${row.documentType}`}
            pageSize={20}
            emptyMessage="No items"
          />
        ) : (
          <EmptyState
            icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
            title="No items"
            description="This document request has no items."
          />
        )}
      </SectionCard>
    </div>
  );
}

function DocumentRequestActivityTab({
  documentRequest,
  requestedBy,
}: {
  documentRequest: DocumentRequest;
  requestedBy: User | undefined;
}) {
  const allActivities = [
    {
      id: `dr-created-${documentRequest.id}`,
      type: "document" as const,
      title: `Document request created: ${documentRequest.id}`,
      description: `Requested by ${requestedBy?.fullName ?? documentRequest.requestedById}`,
      timestamp: documentRequest.createdAt,
      entityUrl: "#",
    },
    ...(documentRequest.sentAt
      ? [
          {
            id: `dr-sent-${documentRequest.id}`,
            type: "document" as const,
            title: `Document request sent`,
            description: `${documentRequest.items.length} items sent to client`,
            timestamp: documentRequest.sentAt,
            entityUrl: "#",
          },
        ]
      : []),
    ...(documentRequest.lastReminderAt
      ? Array.from({ length: documentRequest.reminderCount }, (_, i) => ({
          id: `dr-reminder-${i}-${documentRequest.id}`,
          type: "document" as const,
          title: `Reminder sent`,
          description: `Reminder ${i + 1} sent to client`,
          timestamp: new Date(
            new Date(documentRequest.sentAt ?? documentRequest.createdAt).getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          entityUrl: "#",
        }))
      : []),
    ...documentRequest.items
      .filter((i) => i.isReceived && i.receivedAt)
      .map((item) => ({
        id: `dr-item-received-${item.documentType}-${documentRequest.id}`,
        type: "document" as const,
        title: `Item received: ${item.documentType.replace(/_/g, " ")}`,
        description: item.description ?? "Document received",
        timestamp: item.receivedAt,
        entityUrl: "#",
      })),
    ...(documentRequest.receivedAt
      ? [
          {
            id: `dr-received-${documentRequest.id}`,
            type: "document" as const,
            title: `Document request fully received`,
            description: "All mandatory items received",
            timestamp: documentRequest.receivedAt,
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

function SendDialog({
  _documentRequest,
  onClose,
  onSend,
}: {
  documentRequest: DocumentRequest;
  onClose: () => void;
  onSend: (e: React.FormEvent) => void;
}) {
  const [channel, setChannel] = useState<Channel>("email");
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Document Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSend} className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="channel" className="font-medium">
              Channel
            </Label>
            <Select value={channel} onValueChange={(v: Channel) => setChannel(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-medium">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes to include with the request"
              rows={3}
            />
          </div>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Send Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReminderDialog({
  _documentRequest,
  onClose,
  onReminder,
}: {
  documentRequest: DocumentRequest;
  onClose: () => void;
  onReminder: (e: React.FormEvent) => void;
}) {
  const [channel, setChannel] = useState<Channel>("email");
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={onReminder} className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="channel" className="font-medium">
              Channel
            </Label>
            <Select value={channel} onValueChange={(v: Channel) => setChannel(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-medium">
              Reminder Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for this reminder"
              rows={3}
            />
          </div>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Send Reminder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReceiveDialog({
  documentRequest,
  onClose,
  onReceive,
}: {
  documentRequest: DocumentRequest;
  onClose: () => void;
  onReceive: (e: React.FormEvent) => void;
}) {
  const [receivedItems, setReceivedItems] = useState<Record<string, boolean>>(
    Object.fromEntries(documentRequest.items.map((item) => [item.documentType, item.isReceived])),
  );

  const toggleItem = (documentType: string) => {
    setReceivedItems((prev) => ({ ...prev, [documentType]: !prev[documentType] }));
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mark Items as Received</DialogTitle>
        </DialogHeader>
        <form onSubmit={onReceive} className="space-y-4 p-4">
          <div className="space-y-3">
            {documentRequest.items.map((item) => (
              <div key={item.documentType} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={receivedItems[item.documentType]}
                    onChange={() => toggleItem(item.documentType)}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="font-medium capitalize">{item.documentType.replace(/_/g, " ")}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {item.isMandatory && (
                      <Badge variant="destructive" className="text-[10px] mt-1">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant={receivedItems[item.documentType] ? "default" : "outline"}>
                  {receivedItems[item.documentType] ? "Received" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Confirm Received</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
