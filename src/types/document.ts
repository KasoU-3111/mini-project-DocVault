// src/types/document.ts

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
  issueDate?: string;
  expiryDate?: string;
  hasExpiry?: boolean;
  purpose?: string;
}

export type CategoryReadiness = "ready" | "pending" | "invalid" | "missing";

export const READINESS_RULES = {
  Admission: ["Identity", "Academic", "Certificates"],
  Internship: ["Resume", "Identity", "Academic", "Certificates"],
  Placement: ["Resume", "Identity", "Academic", "Certificates"],
  Scholarship: ["Identity", "Academic", "Financial"],
  Examination: ["Identity", "Academic"],
} as const;

export type ReadinessPurpose = keyof typeof READINESS_RULES;