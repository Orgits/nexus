"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "cn";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileCheck,
  FileText,
  Key,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import { ActivityTimeline } from "@/components/ca-nexus/activity-timeline";
import { DataTable } from "@/components/ca-nexus/data-table";
import { EmptyState } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { type InternalNote, InternalNoteComposer } from "@/components/ca-nexus/internal-note-composer";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { KeyValueList, SectionCard, StatTile } from "@/components/ca-nexus/page-blocks";
import { PriorityBadge, TaskStatusBadge } from "@/components/ca-nexus/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { clientCategoryLabel, clientTypeLabel, serviceTypeLabel } from "@/lib/labels";
import { getClientById, getContactsByClient, updateClientOnboarding } from "@/mock-data/clients";
import { getComplianceCyclesByClient } from "@/mock-data/compliance";
import { getDocumentsByClient } from "@/mock-data/documents";
import { getMattersByClient, mockServices } from "@/mock-data/matters";
import { getTeamById, getUserById, mockTeams, mockUsers } from "@/mock-data/users";
import type { Client, ClientService, Contact, OnboardingStage, OnboardingStatus, ServiceType, Task } from "@/types";

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  href?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "profile_created",
    label: "Profile Created",
    description: "Basic client information and legal entity details",
    icon: <Building2 className="h-5 w-5" />,
    required: true,
  },
  {
    id: "contacts_added",
    label: "Contacts Added",
    description: "Primary contact, authorized signatories, and communication preferences",
    icon: <Users className="h-5 w-5" />,
    required: true,
  },
  {
    id: "identifiers_added",
    label: "Identifiers Recorded",
    description: "PAN, TAN, GSTIN, CIN, DIN and other regulatory identifiers",
    icon: <Key className="h-5 w-5" />,
    required: true,
  },
  {
    id: "services_configured",
    label: "Services Configured",
    description: "Select and configure active services with billing and compliance settings",
    icon: <CreditCard className="h-5 w-5" />,
    required: true,
  },
  {
    id: "kyc_documents_collected",
    label: "KYC Documents Collected",
    description: "PAN, Aadhaar, incorporation certificate, MOA/AOA, partnership deed",
    icon: <FileCheck className="h-5 w-5" />,
    required: true,
  },
  {
    id: "compliance_configured",
    label: "Compliance Configured",
    description: "Set up compliance calendar, due dates, and reminder schedules",
    icon: <ShieldCheck className="h-5 w-5" />,
    required: true,
  },
  {
    id: "team_assigned",
    label: "Team Assigned",
    description: "Assign responsible CA, team, and escalation matrix",
    icon: <User className="h-5 w-5" />,
    required: true,
  },
  {
    id: "initial_matters_created",
    label: "Initial Matters Created",
    description: "Set up first compliance matters and work items",
    icon: <FileText className="h-5 w-5" />,
    required: false,
  },
  {
    id: "portal_invited",
    label: "Portal Invited",
    description: "Send portal invitation for document sharing and communication",
    icon: <Send className="h-5 w-5" />,
    required: false,
  },
];

const allStepIds = onboardingSteps.map((s) => s.id);

interface OnboardingWizardProps {
  clientId: string;
}

export function OnboardingWizard({ clientId }: OnboardingWizardProps) {
  const router = useRouter();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    stage: "profile_created",
    progress: 0,
    completedStages: [],
    pendingItems: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const client = getClientById(clientId);
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-lg">Client not found</h3>
        <p className="mb-6 text-muted-foreground text-sm">The client you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/dashboard/clients")} variant="outline">
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Back to Clients
        </Button>
      </div>
    );
  }

  const contacts = getContactsByClient(clientId);
  const documents = getDocumentsByClient(clientId);
  const matters = getMattersByClient(clientId);
  const complianceCycles = getComplianceCyclesByClient(clientId);
  const responsibleUser = getUserById(client.responsibleUserId);
  const responsibleTeam = client.responsibleTeamId ? getTeamById(client.responsibleTeamId) : undefined;

  const completedStages = (onboardingStatus.completedStages || []) as OnboardingStage[];
  const currentStage = (onboardingStatus.stage || "profile_created") as OnboardingStage;
  const currentStageIndex = allStepIds.indexOf(currentStage);
  const progress = onboardingStatus.progress || 0;

  const isStepCompleted = (stepId: string) => completedStages.includes(stepId as OnboardingStage);
  const isStepCurrent = (stepId: string) => currentStage === stepId;
  const isStepPending = (stepId: string) => !isStepCompleted(stepId) && !isStepCurrent(stepId);

  const canProceed = () => {
    const currentStep = onboardingSteps[activeStepIndex];
    if (!currentStep) return true;
    if (!currentStep.required) return true;
    return isStepCompleted(currentStep.id);
  };

  const handleNext = () => {
    if (activeStepIndex < onboardingSteps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const handleCompleteStep = (stepId: string) => {
    const stage = stepId as OnboardingStage;
    if (!completedStages.includes(stage)) {
      setOnboardingStatus((prev) => ({
        ...prev,
        completedStages: [...prev.completedStages, stage],
        progress: Math.round(((prev.completedStages.length + 1) / onboardingSteps.length) * 100),
        stage,
      }));
    }
  };

  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      await updateClientOnboarding(clientId, onboardingStatus);
      setShowCompleteDialog(false);
    } catch (error) {
      console.error("Failed to save onboarding progress:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    const finalStatus: OnboardingStatus = {
      stage: "completed" as OnboardingStage,
      progress: 100,
      completedStages: allStepIds as OnboardingStage[],
      pendingItems: [],
    };
    setOnboardingStatus(finalStatus);
    setIsSaving(true);
    try {
      await updateClientOnboarding(clientId, finalStatus);
      setShowCompleteDialog(false);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const activeStep = onboardingSteps[activeStepIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Client Onboarding</h1>
          <p className="text-muted-foreground">
            {client.displayName} • {progress}% complete • {completedStages.length}/{onboardingSteps.length} steps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/clients/${clientId}`)}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Client
          </Button>
          <Button onClick={handleSaveProgress} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Progress"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {onboardingSteps.map((step, index) => {
                const completed = isStepCompleted(step.id);
                const current = isStepCurrent(step.id);
                const pending = isStepPending(step.id);
                const isLast = index === onboardingSteps.length - 1;

                return (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <div
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-medium text-sm transition-colors",
                        completed && "bg-green-500 text-white",
                        current && !completed && "bg-primary text-white",
                        pending && "bg-muted text-muted-foreground",
                      )}
                    >
                      {completed ? <CheckCircle className="h-5 w-5" /> : index + 1}
                    </div>
                    <div className="hidden sm:block ml-2">
                      <p
                        className={cn(
                          "font-medium text-sm whitespace-nowrap",
                          completed && "text-green-700 dark:text-green-300",
                          current && !completed && "text-primary",
                          pending && "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{step.description}</p>
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "h-1 w-16 mx-2 flex-shrink-0 transition-colors",
                          index < currentStageIndex && "bg-green-500",
                          index >= currentStageIndex && "bg-muted",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-6">
            {activeStep && (
              <StepContent
                step={activeStep}
                client={client}
                contacts={contacts}
                documents={documents}
                matters={matters}
                complianceCycles={complianceCycles}
                responsibleUser={responsibleUser}
                responsibleTeam={responsibleTeam}
                onComplete={handleCompleteStep}
                isCompleted={isStepCompleted(activeStep.id)}
                onboardingStatus={onboardingStatus}
              />
            )}
          </div>

          <div className="mt-6 flex justify-between border-t pt-4">
            <Button variant="outline" onClick={handleBack} disabled={activeStepIndex === 0}>
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-2">
              {activeStepIndex < onboardingSteps.length - 1 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setShowCompleteDialog(true)} variant="default">
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Complete Onboarding
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Onboarding?</DialogTitle>
            <DialogDescription>
              This will mark all onboarding steps as complete and update the client status. You can continue editing
              later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteOnboarding} disabled={isSaving}>
              {isSaving ? "Completing..." : "Complete Onboarding"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StepContentProps {
  step: OnboardingStep;
  client: Client;
  contacts: Contact[];
  documents: any[];
  matters: any[];
  complianceCycles: any[];
  responsibleUser: any;
  responsibleTeam: any;
  onComplete: (stepId: string) => void;
  isCompleted: boolean;
  onboardingStatus: OnboardingStatus;
}

function StepContent({
  step,
  client,
  contacts,
  documents,
  matters,
  complianceCycles,
  responsibleUser,
  responsibleTeam,
  onComplete,
  isCompleted,
  onboardingStatus,
}: StepContentProps) {
  const [note, setNote] = useState("");

  switch (step.id) {
    case "profile_created":
      return <ClientProfileStep client={client} onComplete={onComplete} isCompleted={isCompleted} />;
    case "contacts_added":
      return <ContactsStep client={client} contacts={contacts} onComplete={onComplete} isCompleted={isCompleted} />;
    case "identifiers_added":
      return <IdentifiersStep client={client} onComplete={onComplete} isCompleted={isCompleted} />;
    case "services_configured":
      return <ServicesStep client={client} onComplete={onComplete} isCompleted={isCompleted} />;
    case "kyc_documents_collected":
      return (
        <KYCDocumentsStep client={client} documents={documents} onComplete={onComplete} isCompleted={isCompleted} />
      );
    case "compliance_configured":
      return (
        <ComplianceStep
          client={client}
          complianceCycles={complianceCycles}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );
    case "team_assigned":
      return (
        <TeamStep
          client={client}
          responsibleUser={responsibleUser}
          responsibleTeam={responsibleTeam}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );
    case "initial_matters_created":
      return <MattersStep client={client} matters={matters} onComplete={onComplete} isCompleted={isCompleted} />;
    case "portal_invited":
      return <PortalStep client={client} onComplete={onComplete} isCompleted={isCompleted} />;
    default:
      return null;
  }
}

function ClientProfileStep({
  client,
  onComplete,
  isCompleted,
}: {
  client: Client;
  onComplete: (id: string) => void;
  isCompleted: boolean;
}) {
  return (
    <SectionCard title="Client Profile" description="Verify basic client information and legal entity details">
      <KeyValueList
        items={[
          { label: "Client Name", value: client.name },
          { label: "Display Name", value: client.displayName },
          { label: "Legal Name", value: client.legalName || "—" },
          { label: "Entity Type", value: clientTypeLabel(client.type) },
          { label: "Category", value: clientCategoryLabel(client.category) },
          { label: "Status", value: <Badge variant="secondary">{client.status}</Badge> },
          { label: "Created", value: formatDate(client.createdAt) },
        ]}
      />
      <div className="mt-4 flex gap-2">
        <Button onClick={() => onComplete("profile_created")} disabled={isCompleted}>
          {isCompleted ? "Completed" : "Mark Complete"}
        </Button>
        <Button variant="outline" asChild>
          <a href={`/dashboard/clients/${client.id}?tab=profile`}>Edit Profile</a>
        </Button>
      </div>
    </SectionCard>
  );
}

function ContactsStep({
  client,
  contacts,
  onComplete,
  isCompleted,
}: {
  client: Client;
  contacts: Contact[];
  onComplete: (id: string) => void;
  isCompleted: boolean;
}) {
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    isPrimary: false,
    isAuthorizedSignatory: false,
  });

  const handleAddContact = () => {
    if (!newContact.firstName || !newContact.email) return;
    // In a real app, this would call an API
    setShowAddContact(false);
    setNewContact({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      designation: "",
      department: "",
      isPrimary: false,
      isAuthorizedSignatory: false,
    });
  };

  return (
    <SectionCard
      title="Contacts"
      description="Add primary contact, authorized signatories, and communication preferences"
    >
      <div className="space-y-4">
        {contacts.length > 0 ? (
          <DataTable<Contact>
            data={contacts}
            columns={[
              {
                accessorKey: "fullName",
                header: "Name",
                cell: ({ row }: { row: { original: Contact } }) => (
                  <div>
                    <p className="font-medium">
                      {row.original.firstName} {row.original.lastName}
                    </p>
                    {row.original.isPrimary && (
                      <Badge variant="secondary" className="mt-0.5 text-xs">
                        Primary
                      </Badge>
                    )}
                    {row.original.isAuthorizedSignatory && (
                      <Badge variant="outline" className="mt-0.5 text-xs">
                        Signatory
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                accessorKey: "designation",
                header: "Designation",
                cell: ({ row }: { row: { original: Contact } }) => (
                  <span className="text-sm">{row.original.designation || "—"}</span>
                ),
              },
              {
                accessorKey: "department",
                header: "Department",
                cell: ({ row }: { row: { original: Contact } }) => (
                  <span className="text-sm">{row.original.department || "—"}</span>
                ),
              },
              {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }: { row: { original: Contact } }) => (
                  <a href={`mailto:${row.original.email}`} className="text-primary hover:underline">
                    {row.original.email}
                  </a>
                ),
              },
              {
                accessorKey: "phone",
                header: "Phone",
                cell: ({ row }: { row: { original: Contact } }) => (
                  <span className="text-sm">{row.original.phone || row.original.mobile || "—"}</span>
                ),
              },
              {
                accessorKey: "preferredChannel",
                header: "Channel",
                cell: ({ row }: { row: { original: Contact } }) => (
                  <Badge variant="outline">{row.original.preferredChannel}</Badge>
                ),
              },
            ]}
            getRowId={(row) => row.id}
            pageSize={5}
            emptyMessage="No contacts"
          />
        ) : (
          <EmptyState
            icon={<Users className="h-12 w-12 text-muted-foreground/50" />}
            title="No contacts added"
            description="Add at least one primary contact to proceed."
          />
        )}
        <div className="flex gap-2">
          <Button onClick={() => setShowAddContact(true)} disabled={isCompleted}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Contact
          </Button>
          {contacts.length > 0 && (
            <Button variant="outline" onClick={() => onComplete("contacts_added")} disabled={isCompleted}>
              {isCompleted ? "Completed" : "Mark Complete"}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Add a new contact for this client.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input
                  value={newContact.firstName}
                  onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name *</Label>
                <Input
                  value={newContact.lastName}
                  onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Designation</Label>
                <Input
                  value={newContact.designation}
                  onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                  placeholder="Director"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input
                value={newContact.department}
                onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                placeholder="Finance"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={newContact.isPrimary}
                  onCheckedChange={(checked: boolean) => setNewContact({ ...newContact, isPrimary: checked })}
                />
                Primary Contact
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={newContact.isAuthorizedSignatory}
                  onCheckedChange={(checked: boolean) =>
                    setNewContact({ ...newContact, isAuthorizedSignatory: checked })
                  }
                />
                Authorized Signatory
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddContact(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={!newContact.firstName || !newContact.email}>
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}

function IdentifiersStep({
  client,
  onComplete,
  isCompleted,
}: {
  client: Client;
  onComplete: (id: string) => void;
  isCompleted: boolean;
}) {
  return (
    <SectionCard
      title="Regulatory Identifiers"
      description="Record PAN, TAN, GSTIN, CIN, DIN and other regulatory identifiers"
    >
      <div className="space-y-4">
        <KeyValueList
          items={[
            { label: "PAN", value: client.identifiers.pan || "Not recorded" },
            { label: "TAN", value: client.identifiers.tan || "Not recorded" },
            { label: "GSTIN", value: client.identifiers.gstin || "Not recorded" },
            { label: "CIN / LLPIN", value: client.identifiers.cin || "Not recorded" },
            { label: "IEC", value: client.identifiers.iec || "Not recorded" },
            { label: "DIN(s)", value: client.identifiers.din?.join(", ") || "—" },
            { label: "Aadhaar", value: client.identifiers.aadhaar || "Not recorded" },
          ]}
        />
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/dashboard/clients/${client.id}?tab=registrations`}>Edit Identifiers</a>
          </Button>
          <Button onClick={() => onComplete("identifiers_added")} disabled={isCompleted}>
            {isCompleted ? "Completed" : "Mark Complete"}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

function ServicesStep({
  client,
  onComplete,
  isCompleted,
}: {
  client: Client;
  onComplete: (id: string) => void;
  isCompleted: boolean;
}) {
  const availableServices = mockServices;

  return (
    <SectionCard
      title="Services Configuration"
      description="Select and configure active services with billing and compliance settings"
    >
      <div className="space-y-4">
        {client.services.length > 0 && (
          <div className="space-y-3">
            {client.services
              .filter((s) => s.isActive)
              .map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{serviceTypeLabel(service.serviceType)}</Badge>
                    <span className="font-medium">{service.serviceName}</span>
                    <Badge variant="outline" className="text-xs">
                      {service.frequency}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{service.rate ? `₹${service.rate.toLocaleString()}` : "—"}</div>
                    <div className="text-muted-foreground text-xs">{service.billingMethod.replace(/_/g, " ")}</div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {client.services.filter((s) => !s.isActive).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Available Services</h4>
            {availableServices
              .filter((s) => !client.services.some((cs) => cs.serviceType === s.serviceType))
              .map((service) => (
                <div key={service.serviceType} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{serviceTypeLabel(service.serviceType as ServiceType)}</Badge>
                    <span>{service.serviceName}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Add
                  </Button>
                </div>
              ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => onComplete("services_configured")}
            disabled={isCompleted || client.services.length === 0}
          >
            {isCompleted ? "Completed" : "Mark Complete"}
          </Button>
          <Button variant="outline" asChild>
            <a href={`/dashboard/clients/${client.id}?tab=overview`}>Manage Services</a>
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

function KYCDocumentsStep({
  client,
  documents,
  onComplete,
  isCompleted,
}: {
  client: Client;
  documents: Document[];
  onComplete: (id: string) => void;
  isCompleted: boolean;
}) {
  const kycDocuments = documents.filter((d) =>
    ["kyc", "registration", "incorporation", "partnership_deed"].includes(d.category),
  );

  return (
    <SectionCard
      title="KYC Documents"
      description="Collect PAN, Aadhaar, incorporation certificate, MOA/AOA, partnership deed"
    >
      <div className="space-y-4">
        {kycDocuments.length > 0 ? (
          <DataTable<Document>
            data={kycDocuments}
            columns={[
              {
                accessorKey: "originalFileName",
                header: "Document",
                cell: ({ row }: { row: { original: Document } }) => (
                  <p className="font-medium">{row.original.originalFileName}</p>
                ),
              },
              {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }: { row: { original: Document } }) => (
                  <Badge variant="secondary">{row.original.category.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "documentType",
                header: "Type",
                cell: ({ row }: { row: { original: Document } }) => (
                  <span className="text-sm">{row.original.documentType.replace(/_/g, " ")}</span>
                ),
              },
              {
                accessorKey: "ocrStatus",
                header: "OCR",
                cell: ({ row }: { row: { original: Document } }) => (
                  <Badge variant="outline">{row.original.ocrStatus.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "createdAt",
                header: "Uploaded",
                cell: ({ row }: { row: { original: Document } }) => (
                  <span className="text-sm">{formatDate(row.original.createdAt)}</span>
                ),
              },
            ]}
            getRowId={(row) => row.id}
            pageSize={5}
            emptyMessage="No KYC documents"
          />
        ) : (
          <EmptyState
            icon={<FileCheck className="h-12 w-12 text-muted-foreground/50" />}
            title="No KYC documents uploaded"
            description="Upload required KYC documents to proceed."
          />
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => onComplete("kyc_documents_collected")}
            disabled={isCompleted || kycDocuments.length === 0}
          >
            {isCompleted ? "Completed" : "Mark Complete"}
          </Button>
          <Button variant="outline" asChild>
            <a href={`/dashboard/documents?clientId=${client.id}`}>Upload Documents</a>
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

function ComplianceStep({
  client,
  complianceCycles,
  onComplete,
  isCompleted,
}: {
  client: Client;
  complianceCycles: any[];
  onComplete: (id: string) => void;
  isCompleted: boolean;
}) {
  return (
    <SectionCard
      title="Compliance Configuration"
      description="Set up compliance calendar, due dates, and reminder schedules"
    >
      <div className="space-y-4">
        <KeyValueList
          items={[
            { label: "GST Filing Frequency", value: client.complianceProfile.gstFilingFrequency ?? "Not configured" },
            { label: "TDS Applicable", value: client.complianceProfile.tdsApplicable ? "Yes" : "No" },
            { label: "MCA Applicable", value: client.complianceProfile.mcaApplicable ? "Yes" : "No" },
            { label: "Audit Applicable", value: client.complianceProfile.auditApplicable ? "Yes" : "No" },
            { label: "Financial Year Start", value: `Month ${client.complianceProfile.financialYearStart}` },
            {
              label: "Applicable Compliance Types",
              value: client.complianceProfile.applicableComplianceTypes.join(", ") || "None",
            },
          ]}
        />
        {complianceCycles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Active Compliance Cycles</h4>
            <DataTable
              data={complianceCycles}
              columns={[
                {
                  accessorKey: "serviceName",
                  header: "Service",
                  cell: ({ row }: { row: { original: any } }) => (
                    <p className="font-medium">{row.original.serviceName}</p>
                  ),
                },
                {
                  accessorKey: "period",
                  header: "Period",
                  cell: ({ row }: { row: { original: any } }) => (
                    <span className="text-sm">{row.original.period.label}</span>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: { original: any } }) => (
                    <Badge variant="secondary">{row.original.status.replace(/_/g, " ")}</Badge>
                  ),
                },
                {
                  accessorKey: "dueDate",
                  header: "Due Date",
                  cell: ({ row }: { row: { original: any } }) => (
                    <span className="text-sm">{formatDate(row.original.dueDate)}</span>
                  ),
                },
              ]}
              getRowId={(row) => row.id}
              pageSize={5}
              emptyMessage="No compliance cycles"
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={() => onComplete("compliance_configured")} disabled={isCompleted}>
            {isCompleted ? "Completed" : "Mark Complete"}
          </Button>
          <Button variant="outline" asChild>
            <a href={`/dashboard/clients/${client.id}?tab=compliance`}>Configure Compliance</a>
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

function TeamStep({
  client,
  responsibleUser,
  responsibleTeam,
  onComplete,
  isCompleted,
}: {
  client: Client;
  responsibleUser: any;
  responsibleTeam: any;
  onComplete: (id: string) => void;
  isCompleted: boolean;
}) {
  return (
    <SectionCard title="Team Assignment" description="Assign responsible CA, team, and escalation matrix">
      <div className="space-y-4">
        <KeyValueList
          items={[
            { label: "Responsible User", value: responsibleUser?.fullName || "Not assigned" },
            { label: "Responsible Team", value: responsibleTeam?.name || "Not assigned" },
          ]}
        />
        <div className="flex gap-2">
          <Button onClick={() => onComplete("team_assigned")} disabled={isCompleted}>
            {isCompleted ? "Completed" : "Mark Complete"}
          </Button>
          <Button variant="outline" asChild>
            <a href={`/dashboard/clients/${client.id}?tab=profile`}>Assign Team</a>
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

function MattersStep({
  client,
  matters,
  onComplete,
  isCompleted,
}: {
  client: Client;
  matters: any[];
  onComplete: (id: string) => void;
  isCompleted: boolean;
}) {
  return (
    <SectionCard title="Initial Matters" description="Set up first compliance matters and work items">
      <div className="space-y-4">
        {matters.length > 0 ? (
          <DataTable
            data={matters}
            columns={[
              {
                accessorKey: "name",
                header: "Matter",
                cell: ({ row }: { row: { original: any } }) => (
                  <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-muted-foreground text-xs">{row.original.matterNumber}</p>
                  </div>
                ),
              },
              {
                accessorKey: "serviceName",
                header: "Service",
                cell: ({ row }: { row: { original: any } }) => (
                  <span className="text-sm">{row.original.serviceName}</span>
                ),
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: { row: { original: any } }) => (
                  <Badge variant="secondary">{row.original.status.replace(/_/g, " ")}</Badge>
                ),
              },
              {
                accessorKey: "dueDate",
                header: "Due Date",
                cell: ({ row }: { row: { original: any } }) => (
                  <span className="text-sm">{formatDate(row.original.dueDate)}</span>
                ),
              },
            ]}
            getRowId={(row) => row.id}
            pageSize={5}
            emptyMessage="No matters"
          />
        ) : (
          <EmptyState
            icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
            title="No matters created"
            description="Create initial compliance matters for this client."
          />
        )}
        <div className="flex gap-2">
          <Button onClick={() => onComplete("initial_matters_created")} disabled={isCompleted}>
            {isCompleted ? "Completed" : "Mark Complete"}
          </Button>
          <Button variant="outline" asChild>
            <a href={`/dashboard/matters?clientId=${client.id}`}>Create Matter</a>
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

function PortalStep({
  client,
  onComplete,
  isCompleted,
}: {
  client: Client;
  onComplete: (id: string) => void;
  isCompleted: boolean;
}) {
  return (
    <SectionCard
      title="Client Portal Invitation"
      description="Send portal invitation for document sharing and communication"
    >
      <div className="space-y-4">
        <KeyValueList
          items={[
            { label: "Portal Access", value: client.portalAccessEnabled ? "Enabled" : "Disabled" },
            { label: "Portal User", value: client.portalUserId ? "Created" : "Not created" },
          ]}
        />
        <div className="flex gap-2">
          {client.portalAccessEnabled ? (
            <Button variant="secondary" disabled>
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Portal Enabled
            </Button>
          ) : (
            <Button onClick={() => onComplete("portal_invited")} disabled={isCompleted}>
              {isCompleted ? "Completed" : "Enable Portal"}
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={`/dashboard/clients/${client.id}?tab=overview`}>Manage Portal</a>
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
