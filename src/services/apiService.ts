// src/services/apiService.ts
import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL = "https://7m4149xq60.execute-api.ap-south-1.amazonaws.com";

export interface SaveDocumentMetadataInput {
  fileName: string;
  category: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  issueDate: string;
  expiryDate: string;
  hasExpiry: boolean;
  purpose: string;
}

export async function saveDocumentMetadata(document: SaveDocumentMetadataInput) {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName: document.fileName,
      category: document.category,
      filePath: document.filePath,
      fileSize: document.fileSize,
      contentType: document.contentType,
      issueDate: document.issueDate,
      expiryDate: document.expiryDate,
      hasExpiry: document.hasExpiry,
      purpose: document.purpose,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to save document metadata.");
  }

  return data;
}

export async function deleteDocumentMetadata(filePath: string) {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filePath,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to delete document metadata.");
  }

  return data;
}

export async function getDocuments() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to get documents.");
  }

  return data.documents || [];
}

export async function getAdminDocuments() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_BASE_URL}/admin/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to get admin documents.");
  }

  return data.documents || [];
}

export async function updateDocumentStatus(
  studentId: string,
  documentId: string,
  status: "Approved" | "Rejected"
) {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(`${API_BASE_URL}/admin/documents`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      studentId,
      documentId,
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to update document status.");
  }

  return data;
}