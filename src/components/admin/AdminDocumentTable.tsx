// src/components/admin/AdminDocumentTable.tsx
import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  LoaderCircle,
  Download,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  Check,
  X,
} from "lucide-react";
import type { DocumentItem } from "../../types/admin";
import { formatDate, formatFileSize } from "../../utils/adminUtils";

interface AdminDocumentTableProps {
  documents: DocumentItem[];
  filteredDocuments: DocumentItem[];
  categories: string[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  updatingDocument: string | null;
  downloadingDocument: string | null;
  handleDownload: (doc: DocumentItem) => Promise<void>;
  handleStatusUpdate: (
    doc: DocumentItem,
    status: "Approved" | "Rejected"
  ) => Promise<void>;
  handleBatchStatusUpdate: (
    docIds: string[],
    status: "Approved" | "Rejected"
  ) => Promise<void>;
  onPreview: (doc: DocumentItem) => void;
  onSelectStudent: (studentId: string) => void;
}

export default function AdminDocumentTable({
  documents,
  filteredDocuments,
  categories,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  updatingDocument,
  downloadingDocument,
  handleDownload,
  handleStatusUpdate,
  handleBatchStatusUpdate,
  onPreview,
  onSelectStudent,
}: AdminDocumentTableProps) {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCategoryFilter("All");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || statusFilter !== "All" || categoryFilter !== "All";

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocIds(filteredDocuments.map((d) => d.documentId));
    } else {
      setSelectedDocIds([]);
    }
  };

  const toggleSelectDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const exportToCSV = () => {
    const headers = "Student ID,File Name,Category,File Size (Bytes),Upload Date,Status\n";
    const rows = filteredDocuments
      .map(
        (doc) =>
          `"${doc.studentId}","${doc.fileName}","${doc.category}",${doc.fileSize},"${doc.uploadDate}","${doc.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DocVault_Compliance_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="documents"
      className="mt-7 overflow-hidden rounded-2xl border border-[#14213d]/10 bg-white shadow-sm transition-all duration-300 hover:shadow-md relative"
    >
      {/* Header and Controls */}
      <div className="border-b border-[#14213d]/10 p-5 sm:p-6 bg-white">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213d] text-[#fca311] font-bold shadow-2xs transition-transform duration-200 hover:scale-105">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#14213d]">
                  Student Documents
                </h2>
                <p className="mt-0.5 text-xs text-[#14213d]/60 font-medium">
                  Review and manage submitted documents.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative min-w-0 sm:w-64">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40 transition-colors"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name or student ID..."
                className="w-full rounded-xl border border-[#14213d]/20 bg-[#e5e5e5]/30 py-2.5 pl-10 pr-3 text-xs font-medium outline-none transition-all duration-200 placeholder:text-[#14213d]/40 focus:bg-white focus:border-[#14213d] focus:ring-4 focus:ring-[#fca311]/25"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#14213d]/50"
              />
              <select
                aria-label="Filter by document status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-[#14213d]/20 bg-white py-2.5 pl-9 pr-9 text-xs font-bold text-[#14213d] outline-none transition-all duration-200 focus:border-[#14213d] focus:ring-4 focus:ring-[#fca311]/25 sm:w-40 cursor-pointer hover:border-[#14213d]/40"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#14213d]/40"
              />
            </div>

            {/* Category filter */}
            <div className="relative">
              <select
                aria-label="Filter by document category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-[#14213d]/20 bg-white py-2.5 pl-3.5 pr-9 text-xs font-bold text-[#14213d] outline-none transition-all duration-200 focus:border-[#14213d] focus:ring-4 focus:ring-[#fca311]/25 sm:w-44 cursor-pointer hover:border-[#14213d]/40"
              >
                <option value="All">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#14213d]/40"
              />
            </div>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={exportToCSV}
              title="Export report as CSV"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#14213d]/20 bg-white px-3.5 py-2.5 text-xs font-bold text-[#14213d] hover:bg-[#14213d] hover:text-white transition cursor-pointer"
            >
              <FileSpreadsheet size={15} className="text-[#fca311]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#14213d]/5 pt-3">
          <p className="text-xs text-[#14213d]/60 font-medium flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#fca311]" />
            Showing{" "}
            <span className="font-bold text-[#14213d]">
              {filteredDocuments.length}
            </span>{" "}
            of {documents.length} documents
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#fca311] hover:text-[#e0900e] transition cursor-pointer active:scale-95"
            >
              <RotateCcw size={12} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Floating Batch Action Toolbar */}
      {selectedDocIds.length > 0 && (
        <div className="sticky top-2 z-20 mx-4 my-2 flex items-center justify-between rounded-xl bg-[#14213d] px-4 py-2.5 text-white shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-xs font-bold text-[#fca311]">
            {selectedDocIds.length} document(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void handleBatchStatusUpdate(selectedDocIds, "Approved");
                setSelectedDocIds([]);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
            >
              <Check size={14} /> Approve Selected
            </button>
            <button
              type="button"
              onClick={() => {
                void handleBatchStatusUpdate(selectedDocIds, "Rejected");
                setSelectedDocIds([]);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
            >
              <X size={14} /> Reject Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedDocIds([])}
              className="text-xs text-white/70 hover:text-white ml-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="bg-[#14213d] text-white">
              <th className="px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all documents"
                  checked={
                    filteredDocuments.length > 0 &&
                    selectedDocIds.length === filteredDocuments.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-white/30 text-[#fca311] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Document
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Student ID
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Category
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                File Size
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Uploaded
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Status
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#14213d]/10">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <LoaderCircle
                      size={32}
                      className="animate-spin text-[#fca311]"
                    />
                    <p className="text-xs font-bold text-[#14213d]/60">
                      Loading student documents...
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
                      <svg
                        className="h-full w-full text-[#14213d]/15"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="60" cy="60" r="50" fill="currentColor" />
                        <path
                          d="M40 38C40 35.7909 41.7909 34 44 34H66L80 48V82C80 84.2091 78.2091 86 76 86H44C41.7909 86 40 84.2091 40 82V38Z"
                          fill="white"
                          stroke="#14213d"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M65 34V49H80"
                          stroke="#14213d"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                        />
                        <circle cx="58" cy="65" r="10" stroke="#fca311" strokeWidth="3" fill="white" />
                        <path d="M65 72L75 82" stroke="#fca311" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>

                    <h3 className="text-base font-extrabold text-[#14213d]">
                      {hasActiveFilters ? "No matching documents" : "No submissions yet"}
                    </h3>
                    <p className="mt-1 text-xs text-[#14213d]/60 max-w-xs leading-relaxed font-medium">
                      {hasActiveFilters
                        ? "We couldn't find any student documents matching your current filter settings."
                        : "There are currently no student documents submitted in the vault repository."}
                    </p>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#14213d] px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all duration-200 hover:bg-[#0d1629] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        <RotateCcw size={14} /> Reset filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => {
                const isUpdating = updatingDocument === doc.documentId;
                const isDownloading = downloadingDocument === doc.documentId;
                const isSelected = selectedDocIds.includes(doc.documentId);

                return (
                  <tr
                    key={`${doc.studentId}-${doc.documentId}`}
                    className={`group transition-colors duration-150 ${
                      isSelected ? "bg-[#fca311]/10" : "hover:bg-[#e5e5e5]/40"
                    }`}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Select ${doc.fileName}`}
                        checked={isSelected}
                        onChange={() => toggleSelectDoc(doc.documentId)}
                        className="rounded border-[#14213d]/30 text-[#fca311] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14213d]/10 text-[#14213d] font-bold transition-transform duration-200 group-hover:scale-105">
                          <FileText size={20} />
                        </div>
                        <div className="max-w-[220px]">
                          <p
                            title={doc.fileName}
                            className="truncate text-xs font-bold text-[#14213d]"
                          >
                            {doc.fileName || "Untitled document"}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-[#14213d]/50 font-medium">
                            {doc.contentType || "Document file"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Student ID Pill - Opens Student Aggregator Drawer */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => onSelectStudent(doc.studentId)}
                        title="View all documents for this student"
                        className="rounded-md bg-[#14213d]/5 px-2.5 py-1 font-mono text-xs text-[#14213d] font-bold border border-[#14213d]/10 hover:bg-[#14213d] hover:text-[#fca311] transition cursor-pointer"
                      >
                        {doc.studentId || "—"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-[#fca311]/20 px-2.5 py-1 text-xs font-bold text-[#14213d]">
                        {doc.category || "Other"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-[#14213d]/70">
                      {formatFileSize(doc.fileSize)}
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-[#14213d]/70">
                      {formatDate(doc.uploadDate)}
                    </td>

                    {/* Status with Interactive Hover Tooltip */}
                    <td className="px-5 py-4">
                      <div className="group/tooltip relative inline-block cursor-help">
                        {doc.status === "Approved" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Approved
                          </span>
                        )}
                        {doc.status === "Pending" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#fca311]/20 px-3 py-1 text-xs font-bold text-[#14213d]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#fca311] animate-ping" />
                            Pending
                          </span>
                        )}
                        {doc.status === "Rejected" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                            Rejected
                          </span>
                        )}

                        {/* Hover Tooltip Box */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover/tooltip:opacity-100 group-hover/tooltip:-translate-y-1 z-30 w-48 rounded-xl bg-[#14213d] p-2.5 text-[10px] font-medium text-white shadow-xl">
                          <p className="font-bold text-[#fca311] flex items-center gap-1 mb-0.5">
                            <Info size={11} />
                            {doc.status === "Approved"
                              ? "Verified Document"
                              : doc.status === "Pending"
                              ? "Needs Verification"
                              : "Submissions Declined"}
                          </p>
                          <p className="text-white/80 leading-snug">
                            {doc.status === "Approved"
                              ? "This file was reviewed and marked valid for college processing."
                              : doc.status === "Pending"
                              ? "Review the document preview carefully before approving or rejecting."
                              : "This file was declined. The student must re-upload a compliant document."}
                          </p>
                          <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-[#14213d]" />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Preview Document Button */}
                        <button
                          type="button"
                          title="Preview document"
                          aria-label={`Preview ${doc.fileName}`}
                          onClick={() => onPreview(doc)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#14213d]/20 bg-white text-[#14213d] transition-all duration-150 hover:bg-[#14213d] hover:text-white hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-2xs"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Download Document Button */}
                        <button
                          type="button"
                          title="Download document"
                          aria-label={`Download ${doc.fileName}`}
                          onClick={() => void handleDownload(doc)}
                          disabled={isDownloading || isUpdating}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fca311] bg-[#fca311]/15 text-[#14213d] font-bold transition-all duration-150 hover:bg-[#fca311] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs"
                        >
                          {isDownloading ? (
                            <LoaderCircle size={15} className="animate-spin" />
                          ) : (
                            <Download size={15} />
                          )}
                        </button>

                        {/* Approve Document Button */}
                        {doc.status !== "Approved" && (
                          <button
                            type="button"
                            title="Approve document"
                            aria-label={`Approve ${doc.fileName}`}
                            onClick={() =>
                              void handleStatusUpdate(doc, "Approved")
                            }
                            disabled={isUpdating || isDownloading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 transition-all duration-150 hover:bg-emerald-600 hover:text-white hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs"
                          >
                            {isUpdating ? (
                              <LoaderCircle size={15} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={15} />
                            )}
                          </button>
                        )}

                        {/* Reject Document Button */}
                        {doc.status !== "Rejected" && (
                          <button
                            type="button"
                            title="Reject document"
                            aria-label={`Reject ${doc.fileName}`}
                            onClick={() =>
                              void handleStatusUpdate(doc, "Rejected")
                            }
                            disabled={isUpdating || isDownloading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-300 bg-rose-50 text-rose-700 transition-all duration-150 hover:bg-rose-600 hover:text-white hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col justify-between gap-2 border-t border-[#14213d]/10 bg-[#e5e5e5]/20 px-5 py-3 text-xs text-[#14213d]/60 font-medium sm:flex-row sm:items-center">
        <p>Document verification dashboard</p>
        <p className="flex items-center gap-1.5">
          <Eye size={14} />
          Review each submission before updating status.
        </p>
      </div>
    </section>
  );
}