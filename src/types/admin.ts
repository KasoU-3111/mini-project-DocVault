// src/types/admin.ts

export type DocumentStatus = "Pending" | "Approved" | "Rejected";

export interface DocumentItem {
  studentId: string;
  documentId: string;
  fileName: string;
  category: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  status: DocumentStatus;
  uploadDate: string;
}

export const statusStyles: Record<DocumentStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};