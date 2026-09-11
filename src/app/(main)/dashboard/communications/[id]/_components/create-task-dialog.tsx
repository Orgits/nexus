"use client";

import { useState } from "react";

import { Calendar, FileText, User as UserIcon, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getClientById, mockClients } from "@/mock-data/clients";
import { getMatterById, mockMatters } from "@/mock-data/matters";
import { getTeamById, getUserById, mockTeams, mockUsers } from "@/mock-data/users";
import type { Communication, Priority, Task, TaskStatus } from "@/types";

interface CreateTaskFromCommunicationProps {
  communication: Communication;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

export function CreateTaskFromCommunicationDialog({
  communication,
  onClose,
  onTaskCreated,
}: CreateTaskFromCommunicationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [title, setTitle] = useState(`Follow up: ${communication.subject || communication.content.slice(0, 50)}`);
  const [description, setDescription] = useState(
    `Created from communication ${communication.communicationNumber} (${communication.channel.toUpperCase()})\n\n${communication.content}`,
  );
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>(communication.isInternal ? "medium" : "high");
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split("T")[0];
  });
  const [assignedUserId, setAssignedUserId] = useState(communication.isInternal ? communication.from.id : "");
  const [assignedTeamId, setAssignedTeamId] = useState("");
  const [clientId, setClientId] = useState(communication.clientId || "");
  const [matterId, setMatterId] = useState(communication.matterId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignedUser = assignedUserId ? getUserById(assignedUserId) : null;
  const _assignedTeam = assignedTeamId ? getTeamById(assignedTeamId) : null;
  const client = clientId ? getClientById(clientId) : null;
  const matter = matterId ? getMatterById(matterId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newTask: Task = {
      id: `task-${Date.now()}` as any,
      tenantId: communication.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: communication.tenantId === "tenant-001" ? "user-admin-001" : "user-admin-001",
      updatedBy: communication.tenantId === "tenant-001" ? "user-admin-001" : "user-admin-001",
      taskNumber: `TSK-${Date.now().toString().slice(-6)}`,
      title,
      description,
      clientId: clientId || undefined,
      matterId: matterId || undefined,
      assignedUserId: assignedUserId || assignedUser?.id || "user-admin-001",
      assignedTeamId: assignedTeamId || undefined,
      createdById: assignedUserId || assignedUser?.id || "user-admin-001",
      priority,
      status,
      dueDate,
      startDate: new Date().toISOString().split("T")[0],
      estimatedHours: undefined,
      actualHours: 0,
      progress: 0,
      dependencies: [],
      subtasks: [],
      checklistItems: [],
      sourceCommunicationId: communication.id,
      tags: ["from-communication", communication.channel],
      isBillable: true,
    };

    setTimeout(() => {
      onTaskCreated(newTask);
      setIsSubmitting(false);
      setIsOpen(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task from Communication</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Task Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status" className="font-medium">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="rework">Rework</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="font-medium">
                Priority
              </Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              Due Date
            </Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assignedUserId" className="flex items-center gap-1 font-medium">
                <UserIcon className="h-3.5 w-3.5" />
                Assigned To
              </Label>
              <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} ({user.role.replace(/_/g, " ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTeamId" className="flex items-center gap-1 font-medium">
                <Users className="h-3.5 w-3.5" />
                Team
              </Label>
              <Select value={assignedTeamId} onValueChange={setAssignedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Team</SelectItem>
                  {mockTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientId" className="font-medium">
                Client
              </Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Client</SelectItem>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.displayName || client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matterId" className="flex items-center gap-1 font-medium">
                <FileText className="h-3.5 w-3.5" />
                Matter
              </Label>
              <Select value={matterId} onValueChange={setMatterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select matter (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Matter</SelectItem>
                  {mockMatters
                    .filter((m) => !clientId || m.clientId === clientId)
                    .map((matter) => (
                      <SelectItem key={matter.id} value={matter.id}>
                        {matter.name} ({matter.matterNumber})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border-primary border-l-4 bg-muted/30 p-4">
            <p className="mb-2 font-medium text-sm">Communication Context</p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Communication ID:</span> {communication.communicationNumber}
              </div>
              <div>
                <span className="text-muted-foreground">Channel:</span> {communication.channel.toUpperCase()}
              </div>
              <div>
                <span className="text-muted-foreground">Direction:</span> {communication.direction}
              </div>
              <div>
                <span className="text-muted-foreground">From:</span> {communication.from.name}
              </div>
              {client && (
                <div>
                  <span className="text-muted-foreground">Client:</span> {client.displayName || client.name}
                </div>
              )}
              {matter && (
                <div>
                  <span className="text-muted-foreground">Matter:</span> {matter.name}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
