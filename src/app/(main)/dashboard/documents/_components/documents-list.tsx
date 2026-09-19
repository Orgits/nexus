"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Building2, Clock, Download, Eye, FileText, Shield, Upload, X } from "lucide-react";

import { DataTable } from "@/components/ca-nexus/data-table";
import { DocumentUploadDialog } from "@/components/ca-nexus/document-upload-dialog";
import { EmptyDocuments } from "@/components/ca-nexus/empty-state";
import { FilterBar, type FilterConfig } from "@/components/ca-nexus/filter-bar";
import { ClientLink, MatterLink } from "@/components/ca-nexus/object-link";
import { PageHeader } from "@/components/ca-nexus/page-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { formatDateTime, formatFileSize } from "@/lib/format";
import { getClientById, mockClients } from "@/mock-data/clients";
import { mockDocuments } from "@/mock-data/documents";
import { getMatterById, mockMatters } from "@/mock-data/matters";
import { mockUsers } from "@/mock-data/users";
import type { Document } from "@/types";

const filterConfigs: FilterConfig[] = [
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
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
    ],
  },
  {
    key: "documentType",
    label: "Type",
    type: "select",
    options: [
      { value: "pan_card", label: "PAN Card" },
      { value: "aadhaar_card", label: "Aadhaar Card" },
      { value: "passport", label: "Passport" },
      { value: "incorporation_certificate", label: "Incorporation Certificate" },
      { value: "moa_aoa", label: "MOA/AOA" },
      { value: "partnership_deed", label: "Partnership Deed" },
      { value: "llp_agreement", label: "LLP Agreement" },
      { value: "gst_registration", label: "GST Registration" },
      { value: "tax_returns", label: "Tax Returns" },
      { value: "financial_statements", label: "Financial Statements" },
      { value: "bank_statements", label: "Bank Statements" },
      { value: "invoices", label: "Invoices" },
      { value: "challans", label: "Challans" },
      { value: "form_16", label: "Form 16" },
      { value: "form_26as", label: "Form 26AS" },
      { value: "tds_certificates", label: "TDS Certificates" },
      { value: "board_resolution", label: "Board Resolution" },
      { value: "share_certificate", label: "Share Certificate" },
      { value: "register_of_members", label: "Register of Members" },
      { value: "dsc_token", label: "DSC Token" },
      { value: "authorization_letter", label: "Authorization Letter" },
      { value: "engagement_letter", label: "Engagement Letter" },
      { value: "kyc_documents", label: "KYC Documents" },
      { value: "other", label: "Other" },
    ],
  },
  {
    key: "ocrStatus",
    label: "OCR Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "processing", label: "Processing" },
      { value: "completed", label: "Completed" },
      { value: "failed", label: "Failed" },
      { value: "not_applicable", label: "N/A" },
    ],
  },
  {
    key: "virusScanStatus",
    label: "Virus Scan",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "clean", label: "Clean" },
      { value: "infected", label: "Infected" },
      { value: "quarantined", label: "Quarantined" },
      { value: "failed", label: "Failed" },
    ],
  },
  {
    key: "isConfidential",
    label: "Confidential",
    type: "select",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
  {
    key: "clientId",
    label: "Client",
    type: "select",
    options: mockClients.map((c) => ({ value: c.id, label: c.displayName || c.name })),
  },
  {
    key: "matterId",
    label: "Matter",
    type: "select",
    options: mockMatters.map((m) => ({ value: m.id, label: m.name })),
  },
  {
    key: "uploadedById",
    label: "Uploaded By",
    type: "select",
    options: mockUsers.map((u) => ({ value: u.id, label: u.fullName })),
  },
];

const VIEW_OPTIONS = [
  { id: "all", label: "All Documents", icon: FileText },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "confidential", label: "Confidential", icon: Shield },
  { id: "ocr_pending", label: "OCR Pending", icon: AlertTriangle },
  { id: "kyc", label: "KYC", icon: Shield },
  { id: "tax", label: "Tax", icon: FileText },
  { id: "financial", label: "Financial", icon: Building2 },
] as const;

export function DocumentsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get("view") as (typeof VIEW_OPTIONS)[number]["id"]) || "all";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortConfig, _setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  });
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const filtered = useMemo(() => {
    let result = [...mockDocuments];

    if (view !== "all") {
      switch (view) {
        case "recent": {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          result = result.filter((d) => new Date(d.createdAt) >= weekAgo);
          break;
        }
        case "confidential":
          result = result.filter((d) => d.isConfidential);
          break;
        case "ocr_pending":
          result = result.filter((d) => d.ocrStatus === "pending" || d.ocrStatus === "processing");
          break;
        case "kyc":
          result = result.filter((d) => d.category === "kyc");
          break;
        case "tax":
          result = result.filter((d) => d.category === "tax_return");
          break;
        case "financial":
          result = result.filter((d) => d.category === "financial_statement");
          break;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.documentNumber.toLowerCase().includes(q) ||
          d.originalFileName.toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.documentType.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      if (key === "isConfidential") {
        result = result.filter((d) => (value === "true") === d.isConfidential);
      } else {
        result = result.filter((d) => (d as unknown as Record<string, unknown>)[key] === value);
      }
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Document] as string | number | Date | undefined;
      const bVal = b[sortConfig.key as keyof Document] as string | number | Date | undefined;
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      const aComparable = aVal instanceof Date ? aVal.getTime() : aVal;
      const bComparable = bVal instanceof Date ? bVal.getTime() : bVal;
      if (aComparable < bComparable) return sortConfig.direction === "asc" ? -1 : 1;
      if (aComparable > bComparable) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [search, filters, view, sortConfig]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const confidential = filtered.filter((d) => d.isConfidential).length;
    const ocrPending = filtered.filter((d) => d.ocrStatus === "pending" || d.ocrStatus === "processing").length;
    const ocrCompleted = filtered.filter((d) => d.ocrStatus === "completed").length;
    const kyc = filtered.filter((d) => d.category === "kyc").length;
    const tax = filtered.filter((d) => d.category === "tax_return").length;
    const financial = filtered.filter((d) => d.category === "financial_statement").length;
    const totalSize = filtered.reduce((sum, d) => sum + d.fileSize, 0);

    return { total, confidential, ocrPending, ocrCompleted, kyc, tax, financial, totalSize };
  }, [filtered]);

  const getOcrBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getOcrBadgeIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Eye className="mr-1 h-3 w-3" />;
      case "pending":
        return <AlertTriangle className="mr-1 h-3 w-3" />;
      case "processing":
        return <Clock className="mr-1 h-3 w-3 animate-spin" />;
      default:
        return <X className="mr-1 h-3 w-3" />;
    }
  };

  const getVirusScanBadgeVariant = (status: string): "default" | "destructive" | "outline" => {
    switch (status) {
      case "clean":
        return "default";
      case "infected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getVirusScanShieldClass = (status: string): string => {
    switch (status) {
      case "clean":
        return "mr-1 h-3 w-3 text-green-600";
      case "infected":
        return "mr-1 h-3 w-3 text-red-600";
      default:
        return "mr-1 h-3 w-3";
    }
  };

  const documentColumns: ColumnDef<DataTableFeatures, Document>[] = [
    {
      accessorKey: "documentNumber",
      header: "Document #",
      enableHiding: false,
      cell: ({ row }: { row: { original: Document } }) => (
        <div>
          <p className="font-medium text-sm">{row.original.documentNumber}</p>
          <p className="text-muted-foreground text-xs">
            {row.original.version > 1 ? `v${row.original.version}` : "Latest"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "originalFileName",
      header: "File Name",
      cell: ({ row }: { row: { original: Document } }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">{row.original.originalFileName}</p>
            <p className="text-muted-foreground text-xs">{row.original.fileName}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: { row: { original: Document } }) => (
        <Badge variant="secondary" className="gap-1 capitalize">
          {row.original.category === "kyc" && <Shield className="h-3 w-3" />}
          {row.original.category === "tax_return" && <FileText className="h-3 w-3" />}
          {row.original.category === "financial_statement" && <Building2 className="h-3 w-3" />}
          {row.original.category.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "documentType",
      header: "Type",
      cell: ({ row }: { row: { original: Document } }) => (
        <span className="text-sm capitalize">{row.original.documentType.replace(/_/g, " ")}</span>
      ),
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }: { row: { original: Document } }) => {
        const client = getClientById(row.original.clientId);
        return client ? (
          <ClientLink client={client} showStatus={true} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "matterId",
      header: "Matter",
      cell: ({ row }: { row: { original: Document } }) => {
        if (!row.original.matterId) return <span className="text-muted-foreground text-sm">—</span>;
        const matter = getMatterById(row.original.matterId);
        return matter ? (
          <MatterLink matter={matter} showStatus={false} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "fileSize",
      header: "Size",
      cell: ({ row }: { row: { original: Document } }) => (
        <span className="whitespace-nowrap text-sm">{formatFileSize(row.original.fileSize)}</span>
      ),
    },
    {
      accessorKey: "ocrStatus",
      header: "OCR",
      cell: ({ row }: { row: { original: Document } }) => (
        <Badge variant={getOcrBadgeVariant(row.original.ocrStatus)}>
          {getOcrBadgeIcon(row.original.ocrStatus)}
          {row.original.ocrStatus.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "virusScanStatus",
      header: "Virus Scan",
      cell: ({ row }: { row: { original: Document } }) => (
        <Badge variant={getVirusScanBadgeVariant(row.original.virusScanStatus)}>
          <Shield className={getVirusScanShieldClass(row.original.virusScanStatus)} />
          {row.original.virusScanStatus}
        </Badge>
      ),
    },
    {
      accessorKey: "isConfidential",
      header: "Confidential",
      cell: ({ row }: { row: { original: Document } }) => (
        <Badge variant={row.original.isConfidential ? "destructive" : "outline"}>
          <Shield className="mr-1 h-3 w-3" />
          {row.original.isConfidential ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Uploaded",
      enableSorting: true,
      cell: ({ row }: { row: { original: Document } }) => (
        <span className="whitespace-nowrap text-sm">{formatDateTime(row.original.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Document Repository"
        description="Centralized document management with search, classification, and metadata"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={view}
              onValueChange={(value) => router.push(`/dashboard/documents${value !== "all" ? `?view=${value}` : ""}`)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Documents" />
              </SelectTrigger>
              <SelectContent>
                {VIEW_OPTIONS.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowUploadDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            {showUploadDialog && (
              <DocumentUploadDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                onUploadComplete={() => {
                  // In a real app, this would refresh the document list
                  console.log("Documents uploaded");
                }}
              />
            )}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
        <StatCard title="Total" value={summary.total} icon={<FileText className="h-5 w-5" />} />
        <StatCard
          title="Confidential"
          value={summary.confidential}
          icon={<Shield className="h-5 w-5 text-red-600" />}
        />
        <StatCard
          title="OCR Pending"
          value={summary.ocrPending}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
        <StatCard title="OCR Complete" value={summary.ocrCompleted} icon={<Eye className="h-5 w-5 text-green-600" />} />
        <StatCard title="KYC" value={summary.kyc} icon={<Shield className="h-5 w-5 text-blue-600" />} />
        <StatCard title="Tax" value={summary.tax} icon={<FileText className="h-5 w-5 text-purple-600" />} />
        <StatCard
          title="Financial"
          value={summary.financial}
          icon={<Building2 className="h-5 w-5 text-indigo-600" />}
        />
      </div>

      <FilterBar
        filters={filterConfigs}
        values={{ search, ...filters }}
        searchPlaceholder="Search documents by name, type, tags..."
        onSearch={setSearch}
        onChange={(values) => {
          const { search: s, ...rest } = values;
          if (typeof s === "string") setSearch(s);
          setFilters(rest);
        }}
        compact
      />

      {filtered.length > 0 ? (
        <DataTable<Document>
          data={filtered}
          columns={documentColumns}
          getRowId={(row) => row.id}
          enableRowSelection
          pageSize={20}
          emptyMessage="No documents match your search or filters"
          rowActions={[
            {
              label: "View Details",
              action: (row) => router.push(`/dashboard/documents/${row.id}`),
            },
            {
              label: "Download",
              action: (row) => alert(`Download ${row.originalFileName}`),
              icon: <Download className="h-3.5 w-3.5" />,
            },
            {
              label: "View OCR",
              action: (row) => alert(`View OCR for ${row.originalFileName}`),
              icon: <Eye className="h-3.5 w-3.5" />,
              show: (row) => row.ocrStatus === "completed",
            },
          ]}
        />
      ) : (
        <EmptyDocuments onUpload={() => alert("Upload new document")} />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="font-bold text-2xl">{value}</p>
        </div>
        <div className="rounded-lg bg-muted p-2">{icon}</div>
      </div>
    </div>
  );
}
