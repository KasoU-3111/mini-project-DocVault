// src/utils/documentUtils.ts
import { READINESS_RULES } from "../types/document";
import type { DocumentItem, CategoryReadiness } from "../types/document";

export const getExpiryStatus = (document: DocumentItem) => {
  if (!document.hasExpiry) {
    return { label: "No Expiry", type: "none" };
  }

  if (!document.expiryDate) {
    return { label: "No Expiry Date", type: "none" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(document.expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const difference = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(difference / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { label: "Expired", type: "expired" };
  }

  if (daysRemaining <= 30) {
    return { label: "Expiring Soon", type: "soon" };
  }

  return { label: "Valid", type: "valid" };
};

export const getCategoryReadiness = (
  categoryName: string,
  documents: DocumentItem[]
): CategoryReadiness => {
  const categoryDocuments = documents.filter(
    (doc) => doc.category === categoryName
  );

  if (categoryDocuments.length === 0) {
    return "missing";
  }

  const hasReadyDocument = categoryDocuments.some((doc) => {
    if (doc.status !== "Approved") return false;
    const expiryStatus = getExpiryStatus(doc);
    if (expiryStatus.type === "expired") return false;
    return true;
  });

  if (hasReadyDocument) return "ready";

  const hasPendingDocument = categoryDocuments.some((doc) => {
    if (doc.status !== "Pending") return false;
    const expiryStatus = getExpiryStatus(doc);
    if (expiryStatus.type === "expired") return false;
    return true;
  });

  if (hasPendingDocument) return "pending";

  return "invalid";
};

export const getReadiness = (
  purpose: keyof typeof READINESS_RULES,
  documents: DocumentItem[]
) => {
  const requiredCategories = READINESS_RULES[purpose];

  const categoryResults = requiredCategories.map((category) => ({
    category,
    status: getCategoryReadiness(category, documents),
  }));

  const ready = categoryResults.filter((item) => item.status === "ready").length;
  const pending = categoryResults.filter((item) => item.status === "pending").length;
  const invalid = categoryResults.filter((item) => item.status === "invalid").length;
  const missing = categoryResults.filter((item) => item.status === "missing").length;

  return {
    total: requiredCategories.length,
    ready,
    pending,
    invalid,
    missing,
    percentage: Math.round((ready / requiredCategories.length) * 100),
    categoryResults,
  };
};