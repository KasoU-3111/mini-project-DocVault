import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  LogOut,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from "../../services/storageService";

import {
  saveDocumentMetadata,
  deleteDocumentMetadata,
  getDocuments,
} from "../../services/apiService";

type DocumentStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

interface DocumentItem {
  studentId: string;
  documentId: string;
  fileName: string;
  category: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  status: DocumentStatus;
  uploadDate: string;

  // Document readiness fields
  issueDate?: string;
  expiryDate?: string;
  hasExpiry?: boolean;
  purpose?: string;
}

type CategoryReadiness =
  | "ready"
  | "pending"
  | "invalid"
  | "missing";

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [category, setCategory] =
    useState("Academic");

  const [issueDate, setIssueDate] =
    useState("");

  const [hasExpiry, setHasExpiry] =
    useState(false);

  const [expiryDate, setExpiryDate] =
    useState("");

  const [purpose, setPurpose] =
    useState("General");

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [downloadingPath, setDownloadingPath] =
    useState<string | null>(null);

  const [deletingPath, setDeletingPath] =
    useState<string | null>(null);

  // =====================================================
  // Load documents
  // =====================================================

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);

      const items = await getDocuments();

      setDocuments(items);
    } catch (error) {
      console.error(
        "Failed to load documents:",
        error
      );

      setMessage(
        "Failed to load documents."
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // =====================================================
  // Upload document
  // =====================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage(
        "Please select a file first."
      );
      return;
    }

    if (!category) {
      setMessage(
        "Please select a document category."
      );
      return;
    }

    if (!issueDate) {
      setMessage(
        "Please enter the document issue date."
      );
      return;
    }

    if (hasExpiry && !expiryDate) {
      setMessage(
        "Please enter the document expiry date."
      );
      return;
    }

    if (
      hasExpiry &&
      expiryDate &&
      issueDate &&
      expiryDate < issueDate
    ) {
      setMessage(
        "Expiry date cannot be before the issue date."
      );
      return;
    }

    if (!purpose) {
      setMessage(
        "Please select a document purpose."
      );
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      // Upload file to S3
      const uploadResult =
        await uploadDocument(
          selectedFile,
          category
        );

      const filePath =
        (uploadResult as any)?.path ||
        (uploadResult as any)?.key ||
        "";

      // Save metadata to DynamoDB
      await saveDocumentMetadata({
        fileName:
          selectedFile.name,

        category:
          category,

        filePath:
          filePath,

        fileSize:
          selectedFile.size,

        contentType:
          selectedFile.type,

        issueDate:
          issueDate,

        expiryDate:
          hasExpiry
            ? expiryDate
            : "",

        hasExpiry:
          hasExpiry,

        purpose:
          purpose,
      });

      // Reload documents
      await loadDocuments();

      setMessage(
        "Document uploaded successfully!"
      );

      // Reset form
      setSelectedFile(null);
      setIssueDate("");
      setHasExpiry(false);
      setExpiryDate("");
      setPurpose("General");

      const fileInput =
        document.getElementById(
          "document"
        ) as HTMLInputElement;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      setMessage(
        "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // Get expiry status
  // =====================================================

  const getExpiryStatus = (
    document: DocumentItem
  ) => {
    if (!document.hasExpiry) {
      return {
        label: "No Expiry",
        type: "none",
      };
    }

    if (!document.expiryDate) {
      return {
        label: "No Expiry Date",
        type: "none",
      };
    }

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const expiry =
      new Date(
        document.expiryDate
      );

    expiry.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      expiry.getTime() -
      today.getTime();

    const daysRemaining =
      Math.ceil(
        difference /
          (1000 *
            60 *
            60 *
            24)
      );

    if (daysRemaining < 0) {
      return {
        label: "Expired",
        type: "expired",
      };
    }

    if (daysRemaining <= 30) {
      return {
        label: "Expiring Soon",
        type: "soon",
      };
    }

    return {
      label: "Valid",
      type: "valid",
    };
  };

  // =====================================================
  // Download document
  // =====================================================

  const handleDownload = async (
    path: string
  ) => {
    try {
      setDownloadingPath(path);
      setMessage("");

      await downloadDocument(path);

      setMessage(
        "Document downloaded successfully!"
      );
    } catch (error) {
      console.error(
        "Download error:",
        error
      );

      setMessage(
        "Download failed. Please try again."
      );
    } finally {
      setDownloadingPath(null);
    }
  };

  // =====================================================
  // Delete document
  // =====================================================

  const handleDelete = async (
    path: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this document?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingPath(path);
      setMessage("");

      // Delete file from S3
      await deleteDocument(path);

      // Delete metadata from DynamoDB
      await deleteDocumentMetadata(path);

      // Reload documents
      await loadDocuments();

      setMessage(
        "Document deleted successfully!"
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setMessage(
        "Delete failed. Please try again."
      );
    } finally {
      setDeletingPath(null);
    }
  };

  // =====================================================
  // Logout
  // =====================================================

  const handleLogout = async () => {
    try {
      await logout();

      navigate("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // =====================================================
  // Statistics
  // =====================================================

  const totalDocuments =
    documents.length;

  const totalCategories =
    new Set(
      documents.map(
        (document) =>
          document.category ||
          "Others"
      )
    ).size;

  const pendingDocuments =
    documents.filter(
      (document) =>
        document.status === "Pending"
    ).length;

  const expiredDocuments =
    documents.filter(
      (document) =>
        getExpiryStatus(document)
          .type === "expired"
    ).length;

  const expiringSoonDocuments =
    documents.filter(
      (document) =>
        getExpiryStatus(document)
          .type === "soon"
    ).length;

  // =====================================================
  // Document Readiness
  // =====================================================

  const readinessRules = {
    Admission: [
      "Identity",
      "Academic",
      "Certificates",
    ],

    Internship: [
      "Resume",
      "Identity",
      "Academic",
      "Certificates",
    ],

    Placement: [
      "Resume",
      "Identity",
      "Academic",
      "Certificates",
    ],

    Scholarship: [
      "Identity",
      "Academic",
      "Financial",
    ],

    Examination: [
      "Identity",
      "Academic",
    ],
  };

  // =====================================================
  // Get readiness for one category
  // =====================================================

  const getCategoryReadiness = (
    categoryName: string
  ): CategoryReadiness => {
    const categoryDocuments =
      documents.filter(
        (document) =>
          document.category ===
          categoryName
      );

    // No document uploaded
    if (categoryDocuments.length === 0) {
      return "missing";
    }

    // Check for an approved and valid document
    const hasReadyDocument =
      categoryDocuments.some(
        (document) => {
          if (
            document.status !==
            "Approved"
          ) {
            return false;
          }

          const expiryStatus =
            getExpiryStatus(document);

          // Expired documents are not ready
          if (
            expiryStatus.type ===
            "expired"
          ) {
            return false;
          }

          return true;
        }
      );

    if (hasReadyDocument) {
      return "ready";
    }

    // Check for pending and non-expired document
    const hasPendingDocument =
      categoryDocuments.some(
        (document) => {
          if (
            document.status !==
            "Pending"
          ) {
            return false;
          }

          const expiryStatus =
            getExpiryStatus(document);

          // Expired pending documents are invalid
          if (
            expiryStatus.type ===
            "expired"
          ) {
            return false;
          }

          return true;
        }
      );

    if (hasPendingDocument) {
      return "pending";
    }

    // Rejected or expired documents
    return "invalid";
  };

  // =====================================================
  // Get complete readiness information
  // =====================================================

  const getReadiness = (
    purpose: keyof typeof readinessRules
  ) => {
    const requiredCategories =
      readinessRules[purpose];

    const categoryResults =
      requiredCategories.map(
        (category) => ({
          category,
          status:
            getCategoryReadiness(
              category
            ),
        })
      );

    const ready =
      categoryResults.filter(
        (item) =>
          item.status === "ready"
      ).length;

    const pending =
      categoryResults.filter(
        (item) =>
          item.status === "pending"
      ).length;

    const invalid =
      categoryResults.filter(
        (item) =>
          item.status === "invalid"
      ).length;

    const missing =
      categoryResults.filter(
        (item) =>
          item.status === "missing"
      ).length;

    return {
      total:
        requiredCategories.length,

      ready,

      pending,

      invalid,

      missing,

      percentage:
        Math.round(
          (ready /
            requiredCategories.length) *
            100
        ),

      categoryResults,
    };
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =================================================
          Navbar
      ================================================= */}

      <nav className="bg-white border-b border-slate-200 px-6 py-4">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">

              <FileText
                className="text-white"
                size={22}
              />

            </div>

            <div>

              <h1 className="text-xl font-bold text-slate-800">
                DocVault
              </h1>

              <p className="text-xs text-slate-500">
                College Digital Document Vault
              </p>

            </div>

          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </nav>

      {/* =================================================
          Main Content
      ================================================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-slate-800">
            Welcome to DocVault 👋
          </h2>

          <p className="text-slate-500 mt-2">
            Manage your college documents securely in one place.
          </p>

        </div>

        {/* Message */}

        {message && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">
            {message}
          </div>
        )}

        {/* =================================================
            Statistics
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">

          {/* Total Documents */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <p className="text-sm text-slate-500">
              Total Documents
            </p>

            <h3 className="text-3xl font-bold text-slate-800 mt-2">
              {totalDocuments}
            </h3>

          </div>

          {/* Categories */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <p className="text-sm text-slate-500">
              Categories
            </p>

            <h3 className="text-3xl font-bold text-slate-800 mt-2">
              {totalCategories}
            </h3>

          </div>

          {/* Pending */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <p className="text-sm text-slate-500">
              Pending Documents
            </p>

            <h3 className="text-3xl font-bold text-slate-800 mt-2">
              {pendingDocuments}
            </h3>

          </div>

          {/* Expiring Soon */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <p className="text-sm text-slate-500">
              Expiring Soon
            </p>

            <h3 className="text-3xl font-bold text-orange-600 mt-2">
              {expiringSoonDocuments}
            </h3>

          </div>

          {/* Expired */}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

            <p className="text-sm text-slate-500">
              Expired
            </p>

            <h3 className="text-3xl font-bold text-red-600 mt-2">
              {expiredDocuments}
            </h3>

          </div>

        </div>

        {/* =================================================
            Document Readiness
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">

          <div className="mb-6">

            <h3 className="text-xl font-semibold text-slate-800">
              Document Readiness
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Check whether your documents are ready for different purposes.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {(Object.keys(
              readinessRules
            ) as Array<
              keyof typeof readinessRules
            >).map((purposeName) => {

              const readiness =
                getReadiness(
                  purposeName
                );

              const isComplete =
                readiness.percentage ===
                100;

              return (

                <div
                  key={purposeName}
                  className="border border-slate-200 rounded-xl p-5"
                >

                  {/* Header */}

                  <div className="flex items-center justify-between mb-3">

                    <h4 className="font-semibold text-slate-800">
                      {purposeName}
                    </h4>

                    <span
                      className={`text-sm font-semibold ${
                        isComplete
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {readiness.ready}/
                      {readiness.total}
                    </span>

                  </div>

                  {/* Progress Bar */}

                  <div className="w-full bg-slate-200 rounded-full h-2 mb-3">

                    <div
                      className={`h-2 rounded-full ${
                        isComplete
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                      style={{
                        width: `${readiness.percentage}%`,
                      }}
                    />

                  </div>

                  <p className="text-sm text-slate-500 mb-4">
                    {readiness.percentage}% ready
                  </p>

                  {/* Ready */}

                  {readiness.ready >
                    0 && (

                    <div className="mb-3">

                      <p className="text-xs font-medium text-green-700 mb-2">
                        Ready
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {readiness.categoryResults
                          .filter(
                            (item) =>
                              item.status ===
                              "ready"
                          )
                          .map(
                            (item) => (

                              <span
                                key={
                                  item.category
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs"
                              >

                                <CheckCircle
                                  size={13}
                                />

                                {item.category}

                              </span>

                            )
                          )}

                      </div>

                    </div>

                  )}

                  {/* Pending */}

                  {readiness.pending >
                    0 && (

                    <div className="mb-3">

                      <p className="text-xs font-medium text-orange-700 mb-2">
                        Pending Approval
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {readiness.categoryResults
                          .filter(
                            (item) =>
                              item.status ===
                              "pending"
                          )
                          .map(
                            (item) => (

                              <span
                                key={
                                  item.category
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs"
                              >

                                <Clock
                                  size={13}
                                />

                                {item.category}

                              </span>

                            )
                          )}

                      </div>

                    </div>

                  )}

                  {/* Missing */}

                  {readiness.missing >
                    0 && (

                    <div className="mb-3">

                      <p className="text-xs font-medium text-slate-600 mb-2">
                        Missing
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {readiness.categoryResults
                          .filter(
                            (item) =>
                              item.status ===
                              "missing"
                          )
                          .map(
                            (item) => (

                              <span
                                key={
                                  item.category
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs"
                              >

                                {item.category}

                              </span>

                            )
                          )}

                      </div>

                    </div>

                  )}

                  {/* Invalid */}

                  {readiness.invalid >
                    0 && (

                    <div>

                      <p className="text-xs font-medium text-red-700 mb-2">
                        Missing / Invalid
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {readiness.categoryResults
                          .filter(
                            (item) =>
                              item.status ===
                              "invalid"
                          )
                          .map(
                            (item) => (

                              <span
                                key={
                                  item.category
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs"
                              >

                                <XCircle
                                  size={13}
                                />

                                {item.category}

                              </span>

                            )
                          )}

                      </div>

                    </div>

                  )}

                  {/* Complete Message */}

                  {isComplete && (

                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600">

                      <CheckCircle
                        size={16}
                      />

                      All required documents are ready

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        </div>

        {/* =================================================
            Upload Section
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">

          <div className="text-center">

            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">

              <Upload
                className="text-blue-600"
                size={30}
              />

            </div>

            <h3 className="text-xl font-semibold text-slate-800">
              Upload Your Documents
            </h3>

            <p className="text-slate-500 mt-2 mb-6">
              Store and track your college documents securely in DocVault.
            </p>

            {/* Form */}

            <div className="max-w-2xl mx-auto text-left grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Category */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="Academic">
                    Academic
                  </option>

                  <option value="Identity">
                    Identity
                  </option>

                  <option value="Financial">
                    Financial
                  </option>

                  <option value="Scholarships">
                    Scholarships
                  </option>

                  <option value="Certificates">
                    Certificates
                  </option>

                  <option value="Government Documents">
                    Government Documents
                  </option>

                  <option value="Resume">
                    Resume
                  </option>

                  <option value="Others">
                    Others
                  </option>

                </select>

              </div>

              {/* Purpose */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Purpose
                </label>

                <select
                  value={purpose}
                  onChange={(e) =>
                    setPurpose(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="General">
                    General
                  </option>

                  <option value="Scholarship">
                    Scholarship
                  </option>

                  <option value="Internship">
                    Internship
                  </option>

                  <option value="Placement">
                    Placement
                  </option>

                  <option value="Admission">
                    Admission
                  </option>

                  <option value="Examination">
                    Examination
                  </option>

                </select>

              </div>

              {/* Issue Date */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Issue Date
                </label>

                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) =>
                    setIssueDate(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* Expiry Toggle */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Does this document expire?
                </label>

                <select
                  value={
                    hasExpiry
                      ? "yes"
                      : "no"
                  }
                  onChange={(e) => {
                    const value =
                      e.target.value ===
                      "yes";

                    setHasExpiry(
                      value
                    );

                    if (!value) {
                      setExpiryDate("");
                    }
                  }}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="no">
                    No
                  </option>

                  <option value="yes">
                    Yes
                  </option>

                </select>

              </div>

              {/* Expiry Date */}

              {hasExpiry && (

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    value={expiryDate}
                    min={
                      issueDate ||
                      undefined
                    }
                    onChange={(e) =>
                      setExpiryDate(
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

              )}

              {/* File */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Document
                </label>

                <input
                  id="document"
                  type="file"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0] ||
                      null;

                    setSelectedFile(
                      file
                    );
                  }}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                />

              </div>

            </div>

            {/* Upload Button */}

            <button
              onClick={handleUpload}
              disabled={
                uploading ||
                !selectedFile
              }
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {uploading
                ? "Uploading..."
                : "Upload Document"}

            </button>

          </div>

        </div>

        {/* =================================================
            Documents Section
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">

            <h3 className="text-xl font-semibold text-slate-800">
              My Documents
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              View, manage and track your uploaded documents.
            </p>

          </div>

          {/* Loading */}

          {loadingDocuments && (
            <div className="p-10 text-center text-slate-500">
              Loading documents...
            </div>
          )}

          {/* No documents */}

          {!loadingDocuments &&
            documents.length === 0 && (
              <div className="p-10 text-center">

                <FileText
                  className="mx-auto text-slate-300 mb-3"
                  size={48}
                />

                <p className="text-slate-500">
                  No documents uploaded yet.
                </p>

              </div>
            )}

          {/* Documents */}

          {!loadingDocuments &&
            documents.length > 0 && (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50 border-b border-slate-200">

                    <tr>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Document
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Category
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Purpose
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Issue Date
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Expiry
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Status
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {documents.map(
                      (document) => {

                        const filePath =
                          document.filePath;

                        const fileName =
                          document.fileName ||
                          filePath
                            ?.split("/")
                            .pop() ||
                          "Document";

                        const documentCategory =
                          document.category ||
                          "Others";

                        const documentStatus =
                          document.status ||
                          "Pending";

                        const expiryStatus =
                          getExpiryStatus(
                            document
                          );

                        const isDownloading =
                          downloadingPath ===
                          filePath;

                        const isDeleting =
                          deletingPath ===
                          filePath;

                        return (

                          <tr
                            key={`${document.studentId}-${document.documentId}`}
                            className="border-b last:border-b-0 hover:bg-slate-50"
                          >

                            {/* Document */}

                            <td className="px-6 py-4">

                              <div className="flex items-center gap-3">

                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">

                                  <FileText
                                    className="text-blue-600"
                                    size={20}
                                  />

                                </div>

                                <div>

                                  <p className="font-medium text-slate-800">
                                    {fileName}
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    {document.contentType ||
                                      "File"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* Category */}

                            <td className="px-6 py-4 text-slate-600">
                              {documentCategory}
                            </td>

                            {/* Purpose */}

                            <td className="px-6 py-4 text-slate-600">
                              {document.purpose ||
                                "General"}
                            </td>

                            {/* Issue Date */}

                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">

                              {document.issueDate
                                ? new Date(
                                    document.issueDate
                                  ).toLocaleDateString()
                                : "-"}

                            </td>

                            {/* Expiry */}

                            <td className="px-6 py-4">

                              <div className="flex flex-col gap-1">

                                <span className="text-slate-600 whitespace-nowrap">

                                  {document.hasExpiry
                                    ? document.expiryDate
                                      ? new Date(
                                          document.expiryDate
                                        ).toLocaleDateString()
                                      : "-"
                                    : "No expiry"}

                                </span>

                                <span
                                  className={`inline-flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${
                                    expiryStatus.type ===
                                    "expired"
                                      ? "bg-red-100 text-red-700"
                                      : expiryStatus.type ===
                                        "soon"
                                      ? "bg-orange-100 text-orange-700"
                                      : expiryStatus.type ===
                                        "valid"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >

                                  {expiryStatus.type ===
                                    "expired" && (
                                    <XCircle
                                      size={13}
                                    />
                                  )}

                                  {expiryStatus.type ===
                                    "soon" && (
                                    <AlertTriangle
                                      size={13}
                                    />
                                  )}

                                  {expiryStatus.type ===
                                    "valid" && (
                                    <CheckCircle
                                      size={13}
                                    />
                                  )}

                                  {expiryStatus.label}

                                </span>

                              </div>

                            </td>

                            {/* Status */}

                            <td className="px-6 py-4">

                              {documentStatus ===
                                "Approved" && (

                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">

                                  <CheckCircle
                                    size={14}
                                  />

                                  Approved

                                </span>

                              )}

                              {documentStatus ===
                                "Rejected" && (

                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">

                                  <XCircle
                                    size={14}
                                  />

                                  Rejected

                                </span>

                              )}

                              {documentStatus ===
                                "Pending" && (

                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">

                                  <Clock
                                    size={14}
                                  />

                                  Pending

                                </span>

                              )}

                            </td>

                            {/* Actions */}

                            <td className="px-6 py-4">

                              <div className="flex flex-wrap gap-2">

                                {/* Download */}

                                <button
                                  onClick={() =>
                                    handleDownload(
                                      filePath
                                    )
                                  }
                                  disabled={
                                    isDownloading
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >

                                  <Download
                                    size={15}
                                  />

                                  {isDownloading
                                    ? "Downloading..."
                                    : "Download"}

                                </button>

                                {/* Delete */}

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      filePath
                                    )
                                  }
                                  disabled={
                                    isDeleting
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >

                                  <Trash2
                                    size={15}
                                  />

                                  {isDeleting
                                    ? "Deleting..."
                                    : "Delete"}

                                </button>

                              </div>

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;