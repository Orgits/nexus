"use client";

import { useCallback, useRef, useState } from "react";

import { cn } from "cn";
import { CheckCircle, FileText, Loader2, Upload, X, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockClients } from "@/mock-data/clients";
import { mockMatters } from "@/mock-data/matters";
import { mockUsers } from "@/mock-data/users";
import type { Document, DocumentCategory, DocumentType } from "@/types";

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  documentId?: string;
}

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (documents: Document[]) => void;
  prefillClientId?: string;
  prefillMatterId?: string;
  prefillTaskId?: string;
  prefillComplianceCycleId?: string;
}

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "kyc", label: "KYC" },
  { value: "registration", label: "Registration" },
  { value: "tax_return", label: "Tax Return" },
  { value: "financial_statement", label: "Financial Statement" },
  { value: "invoice", label: "Invoice" },
  { value: "challan", label: "Challan" },
  { value: "certificate", label: "Certificate" },
  { value: "correspondence", label: "Correspondence" },
  { value: "contract", label: "Contract" },
  { value: "board_resolution", label: "Board Resolution" },
  { value: "register", label: "Register" },
  { value: "workpaper", label: "Workpaper" },
  { value: "evidence", label: "Evidence" },
  { value: "engagement_letter", label: "Engagement Letter" },
  { value: "authorization", label: "Authorization" },
  { value: "other", label: "Other" },
];

const DOCUMENT_TYPES: { value: DocumentType; label: string; category: DocumentCategory }[] = [
  { value: "pan_card", label: "PAN Card", category: "kyc" },
  { value: "aadhaar_card", label: "Aadhaar Card", category: "kyc" },
  { value: "passport", label: "Passport", category: "kyc" },
  { value: "incorporation_certificate", label: "Incorporation Certificate", category: "registration" },
  { value: "moa_aoa", label: "MOA/AOA", category: "registration" },
  { value: "partnership_deed", label: "Partnership Deed", category: "registration" },
  { value: "llp_agreement", label: "LLP Agreement", category: "registration" },
  { value: "gst_registration", label: "GST Registration", category: "registration" },
  { value: "tax_returns", label: "Tax Returns", category: "tax_return" },
  { value: "financial_statements", label: "Financial Statements", category: "financial_statement" },
  { value: "bank_statements", label: "Bank Statements", category: "financial_statement" },
  { value: "invoices", label: "Invoices", category: "invoice" },
  { value: "challans", label: "Challans", category: "challan" },
  { value: "form_16", label: "Form 16", category: "tax_return" },
  { value: "form_26as", label: "Form 26AS", category: "tax_return" },
  { value: "tds_certificates", label: "TDS Certificates", category: "tax_return" },
  { value: "board_resolution", label: "Board Resolution", category: "board_resolution" },
  { value: "share_certificate", label: "Share Certificate", category: "register" },
  { value: "register_of_members", label: "Register of Members", category: "register" },
  { value: "dsc_token", label: "DSC Token", category: "register" },
  { value: "authorization_letter", label: "Authorization Letter", category: "authorization" },
  { value: "engagement_letter", label: "Engagement Letter", category: "engagement_letter" },
  { value: "kyc_documents", label: "KYC Documents", category: "kyc" },
  { value: "other", label: "Other", category: "other" },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "text/csv",
];

function validateFile(file: File): string | undefined {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File type "${file.type}" is not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TIFF, CSV`;
  }
  return undefined;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
  prefillClientId,
  prefillMatterId,
  prefillTaskId,
  prefillComplianceCycleId,
}: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [documentType, setDocumentType] = useState<DocumentType>("other");
  const [clientId, setClientId] = useState(prefillClientId ?? "");
  const [matterId, setMatterId] = useState(prefillMatterId ?? "");
  const [taskId, setTaskId] = useState(prefillTaskId ?? "");
  const [complianceCycleId, setComplianceCycleId] = useState(prefillComplianceCycleId ?? "");
  const [uploadedById, setUploadedById] = useState("");
  const [tags, setTags] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [_completedDocuments, setCompletedDocuments] = useState<Document[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLButtonElement>(null);

  const filteredDocumentTypes = DOCUMENT_TYPES.filter((t) => t.category === category);
  const filteredMatters = clientId ? mockMatters.filter((m) => m.clientId === clientId) : mockMatters;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => {
      const validationError = validateFile(file);
      return {
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        progress: 0,
        status: validationError ? "error" : "pending",
        error: validationError,
      };
    });
    setFiles((prev) => [...prev, ...uploadFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      addFiles(selectedFiles);
      const input = fileInputRef.current;
      // biome-ignore lint/suspicious/noUnnecessaryConditions: Ref is assigned in JSX and non-null when onChange fires
      if (input) {
        input.value = "";
      }
    },
    [addFiles],
  );

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDropZoneKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== "completed"));
  };

  const simulateUpload = async (file: UploadFile): Promise<Document> => {
    return new Promise((resolve) => {
      const steps = 10;
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress: Math.min((currentStep / steps) * 100, 100) } : f)),
        );
        if (currentStep >= steps) {
          clearInterval(interval);
          setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress: 100, status: "completed" } : f)));
          const newDoc: Document = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            documentNumber: `DOC-${Date.now().toString().slice(-6)}`,
            fileName: file.file.name,
            originalFileName: file.file.name,
            fileSize: file.file.size,
            mimeType: file.file.type,
            category,
            documentType,
            clientId: clientId || undefined,
            matterId: matterId || undefined,
            taskId: taskId || undefined,
            complianceCycleId: complianceCycleId || undefined,
            uploadedById: uploadedById || "user-admin-001",
            tags: tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            isConfidential,
            description: description || undefined,
            version: 1,
            isLatestVersion: true,
            ocrStatus: "pending",
            virusScanStatus: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: "user-admin-001",
            updatedBy: "user-admin-001",
            tenantId: "tenant-001",
            fileUrl: "",
            thumbnailUrl: undefined,
            sourceCommunicationId: undefined,
            previousVersionId: undefined,
            metadata: {},
            retentionPolicy: undefined,
          };
          resolve(newDoc);
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    const newDocuments: Document[] = [];

    for (const file of pendingFiles) {
      try {
        setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" as const } : f)));
        const newDoc = await simulateUpload(file);
        newDocuments.push(newDoc);
      } catch (_error) {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "error" as const, error: "Upload failed" } : f)),
        );
      }
    }

    setCompletedDocuments(newDocuments);
    if (onUploadComplete) {
      onUploadComplete(newDocuments);
    }
    setIsUploading(false);
  };

  const hasErrors = files.some((f) => f.status === "error");
  const hasPending = files.some((f) => f.status === "pending");
  const pendingFiles = files.filter((f) => f.status === "pending");
  const allCompleted = files.length > 0 && files.every((f) => f.status === "completed");

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Drop Zone */}
          <div className="relative">
            <button
              ref={dropZoneRef}
              type="button"
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors w-full",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
              onKeyDown={handleDropZoneKeyDown}
              tabIndex={0}
              aria-label="Drop zone for file uploads"
              disabled={isUploading}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.tiff,.csv"
                tabIndex={-1}
              />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-3 text-lg font-medium">
                {isDragging ? "Drop files here..." : "Drag & drop files here, or click to browse"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TIFF, CSV • Max 50MB each
              </p>
            </button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Files ({files.length})</h4>
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded border",
                      file.status === "error" && "border-destructive/50 bg-destructive/5",
                      file.status === "completed" && "border-green-500/50 bg-green-500/5",
                    )}
                  >
                    <FileText
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        file.status === "completed" ? "text-green-600" : "text-muted-foreground",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024).toFixed(1)} KB
                        {file.error && <span className="ml-2 text-destructive">• {file.error}</span>}
                      </p>
                      {file.status === "uploading" && (
                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                      {file.status === "completed" && (
                        <div className="mt-1 flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="h-3 w-3" />
                          Uploaded
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === "error" && (
                        <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      {file.status !== "uploading" && file.status !== "completed" && (
                        <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                {hasErrors && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiles((prev) => prev.filter((f) => f.status !== "error"))}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Remove Errors
                  </Button>
                )}
                {allCompleted && (
                  <Button variant="outline" size="sm" onClick={clearCompleted}>
                    <CheckCircle className="mr-1.5 h-4 w-4" />
                    Clear Completed
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Metadata Form */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(v: DocumentCategory) => {
                  setCategory(v);
                  setDocumentType("other");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType" className="font-medium">
                Document Type <span className="text-destructive">*</span>
              </Label>
              <Select value={documentType} onValueChange={(v: DocumentType) => setDocumentType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDocumentTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {mockClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.displayName || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matterId" className="font-medium">
                Matter
              </Label>
              <Select value={matterId} onValueChange={setMatterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select matter (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Matter</SelectItem>
                  {filteredMatters.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.matterNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskId" className="font-medium">
                Task ID
              </Label>
              <Input
                id="taskId"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="Optional task ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceCycleId" className="font-medium">
                Compliance Cycle ID
              </Label>
              <Input
                id="complianceCycleId"
                value={complianceCycleId}
                onChange={(e) => setComplianceCycleId(e.target.value)}
                placeholder="Optional compliance cycle ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uploadedById" className="font-medium">
                Uploaded By
              </Label>
              <Select value={uploadedById} onValueChange={setUploadedById}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName} ({u.role.replace(/_/g, " ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags" className="font-medium">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., kyc, urgent, client-requested"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  id="isConfidential"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isConfidential" className="font-medium cursor-pointer">
                  Confidential Document
                </Label>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>
          </div>

          {/* Action Bar */}
          <DialogFooter className="border-t pt-4">
            <div className="flex w-full items-center justify-between gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                Cancel
              </Button>
              <div className="flex-1" />
              {hasPending && (
                <Button onClick={handleUpload} disabled={isUploading || hasErrors}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {pendingFiles.length} File{pendingFiles.length > 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              )}
              {allCompleted && !isUploading && (
                <Button variant="default" onClick={() => onOpenChange(false)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Done
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
