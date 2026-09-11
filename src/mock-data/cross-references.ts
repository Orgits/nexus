import type { Communication, Document, Task } from "@/types";

import { mockCommunications, mockDocuments, mockMatters, mockTasks } from "./data-index";

export const getTasksByConversation = (conversationId: string): Task[] => {
  const linkedTaskIds = mockCommunications
    .filter((c) => c.conversationId === conversationId && c.linkedTaskId)
    .map((c) => c.linkedTaskId!);
  return mockTasks.filter((t) => linkedTaskIds.includes(t.id));
};

export const getTasksByDocument = (documentId: string): Task[] => {
  const linkedTaskIds = mockCommunications
    .filter((c) => c.attachments.some((a) => a.documentId === documentId) && c.linkedTaskId)
    .map((c) => c.linkedTaskId!);
  return mockTasks.filter((t) => linkedTaskIds.includes(t.id));
};

export const getCommunicationsByComplianceCycle = (complianceCycleId: string): Communication[] => {
  const matterIds = mockMatters.filter((m) => m.complianceCycleId === complianceCycleId).map((m) => m.id);
  return mockCommunications.filter((c) => c.matterId && matterIds.includes(c.matterId));
};

export const getCommunicationsByDocument = (documentId: string): Communication[] => {
  return mockCommunications.filter((c) => c.attachments.some((a) => a.documentId === documentId));
};

export const getCommunicationsByCampaign = (campaignId: string): Communication[] => {
  return mockCommunications.filter((c) => c.campaignId === campaignId);
};

export const getDocumentsByConversation = (conversationId: string): Document[] => {
  const docIds = new Set<string>();
  mockCommunications
    .filter((c) => c.conversationId === conversationId)
    .forEach((c) => {
      c.attachments.forEach((a) => {
        if (a.documentId) docIds.add(a.documentId);
      });
    });
  return mockDocuments.filter((d) => docIds.has(d.id));
};

export const getDocumentsByComplianceCycle = (complianceCycleId: string): Document[] => {
  const matterIds = mockMatters.filter((m) => m.complianceCycleId === complianceCycleId).map((m) => m.id);
  return mockDocuments.filter((d) => d.matterId && matterIds.includes(d.matterId));
};

export const getTasksByComplianceCycle = (complianceCycleId: string): Task[] => {
  const matterIds = mockMatters.filter((m) => m.complianceCycleId === complianceCycleId).map((m) => m.id);
  return mockTasks.filter((t) => t.matterId && matterIds.includes(t.matterId));
};

export const getTasksByMatter = (matterId: string): Task[] => {
  return mockTasks.filter((t) => t.matterId === matterId);
};

export const getTasksByClient = (clientId: string): Task[] => {
  const matterIds = mockMatters.filter((m) => m.clientId === clientId).map((m) => m.id);
  return mockTasks.filter((t) => matterIds.includes(t.matterId!));
};

export const getDocumentsByClient = (clientId: string): Document[] => {
  return mockDocuments.filter((d) => d.clientId === clientId);
};

export const getDocumentsByMatter = (matterId: string): Document[] => {
  return mockDocuments.filter((d) => d.matterId === matterId);
};

export const getCommunicationsByClient = (clientId: string): Communication[] => {
  return mockCommunications.filter((c) => c.clientId === clientId);
};

export const getCommunicationsByMatter = (matterId: string): Communication[] => {
  return mockCommunications.filter((c) => c.matterId === matterId);
};

export const getCommunicationsByConversation = (conversationId: string): Communication[] => {
  return mockCommunications.filter((c) => c.conversationId === conversationId);
};
