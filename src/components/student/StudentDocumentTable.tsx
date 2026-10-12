// src/components/dashboard/DocumentTable.tsx
import {
  FileText,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Search,
  Filter,
  ChevronDown,
  Info,
  RotateCcw,
} from "lucide-react";
import { getExpiryStatus } from "../../utils/documentUtils";
import type { DocumentItem } from "../../types/document";
interface DocumentTableProps {
  documents: DocumentItem[];
  loadingDocuments: boolean;
  downloadingPath: string | null;
  deletingPath: string | null;
  handleDownload: (path: string) => void;
  handleDelete: (path: string) => void;
  onPreview: (doc: DocumentItem) => void;
  search: string;
  setSearch: (val: string) => void;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
}

const categories = [
  "Academic",
  "Identity",
  "Financial",
  "Scholarships",
  "Certificates",
  "Government Documents",
  "Resume",
  "Others",
];

export default function DocumentTable({
  documents,
  loadingDocuments,
  downloadingPath,
  deletingPath,
  handleDownload,
  handleDelete,
  onPreview,
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
}: DocumentTableProps) {
  const resetFilters = () => {
    setSearch("");
    setActiveCategory("All");
  };

  const hasActiveFilters = search.trim() !== "" || activeCategory !== "All";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#14213d]/10 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header and Controls */}
      <div className="border-b border-[#14213d]/10 p-5 sm:p-6 bg-white">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213d] text-[#fca311] font-bold shadow-xs transition-transform duration-200 hover:scale-105">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#14213d]">My Documents</h2>
              <p className="mt-0.5 text-xs text-[#14213d]/60 font-medium">
                View, download, and manage your uploaded files.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative min-w-0 sm:w-64">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, category, or purpose..."
                className="w-full rounded-xl border border-[#14213d]/20 bg-[#e5e5e5]/30 py-2.5 pl-10 pr-3 text-xs font-medium outline-none transition-all duration-200 placeholder:text-[#14213d]/40 focus:bg-white focus:border-[#14213d] focus:ring-4 focus:ring-[#fca311]/25"
              />
            </div>

            {/* Category filter */}
            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#14213d]/50"
              />
              <select
                aria-label="Filter by category"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#14213d]/20 bg-white py-2.5 pl-9 pr-9 text-xs font-bold text-[#14213d] outline-none transition-all duration-200 focus:border-[#14213d] focus:ring-4 focus:ring-[#fca311]/25 sm:w-44 cursor-pointer hover:border-[#14213d]/40"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#14213d]/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="bg-[#14213d] text-white">
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Document
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Category
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Purpose
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Issue Date
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#e5e5e5]">
                Expiry
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
            {loadingDocuments ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-xs font-bold text-[#14213d]/60">
                  Loading documents...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  {/* Custom SVG Empty State Illustration */}
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
                      <svg
                        className="h-full w-full text-[#14213d]/15"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="25" y="30" width="70" height="60" rx="12" fill="currentColor" />
                        <rect
                          x="35"
                          y="40"
                          width="50"
                          height="40"
                          rx="8"
                          fill="white"
                          stroke="#14213d"
                          strokeWidth="2.5"
                        />
                        <path
                          d="M45 52H75M45 62H65"
                          stroke="#14213d"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx="78" cy="72" r="12" fill="#fca311" />
                        <path
                          d="M74 72L77 75L82 69"
                          stroke="#14213d"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <h3 className="text-base font-extrabold text-[#14213d]">
                      {hasActiveFilters ? "No matching documents" : "Your vault is empty"}
                    </h3>
                    <p className="mt-1 text-xs text-[#14213d]/60 max-w-xs leading-relaxed font-medium">
                      {hasActiveFilters
                        ? "No document matches your search terms or filter selection."
                        : "You haven't uploaded any academic documents to DocVault yet."}
                    </p>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#14213d] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-[#0d1629] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        <RotateCcw size={14} /> Clear search & filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const filePath = doc.filePath;
                const fileName = doc.fileName || filePath?.split("/").pop() || "Document";
                const documentCategory = doc.category || "Others";
                const documentStatus = doc.status || "Pending";
                const expiryStatus = getExpiryStatus(doc);

                const isDownloading = downloadingPath === filePath;
                const isDeleting = deletingPath === filePath;

                return (
                  <tr
                    key={`${doc.studentId}-${doc.documentId}`}
                    className="group transition-colors duration-150 hover:bg-[#e5e5e5]/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14213d]/10 text-[#14213d] font-bold transition-transform duration-200 group-hover:scale-105">
                          <FileText size={20} />
                        </div>
                        <div className="max-w-[200px]">
                          <p
                            title={fileName}
                            className="truncate text-xs font-bold text-[#14213d]"
                          >
                            {fileName}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-[#14213d]/50 font-medium">
                            {doc.contentType || "File"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-[#fca311]/20 px-2.5 py-1 text-xs font-bold text-[#14213d]">
                        {documentCategory}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-[#14213d]/70">
                      {doc.purpose || "General"}
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-[#14213d]/70 whitespace-nowrap">
                      {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : "—"}
                    </td>

                    {/* Expiry Date & Badge with Interactive Hover Tooltip */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[#14213d]/70 whitespace-nowrap">
                          {doc.hasExpiry
                            ? doc.expiryDate
                              ? new Date(doc.expiryDate).toLocaleDateString()
                              : "—"
                            : "No expiry"}
                        </span>

                        <div className="group/tooltip relative inline-block w-fit cursor-help">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              expiryStatus.type === "expired"
                                ? "bg-rose-100 text-rose-800"
                                : expiryStatus.type === "soon"
                                ? "bg-[#fca311]/20 text-[#14213d]"
                                : expiryStatus.type === "valid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-[#e5e5e5] text-[#14213d]/60"
                            }`}
                          >
                            {expiryStatus.type === "expired" && <XCircle size={12} />}
                            {expiryStatus.type === "soon" && <AlertTriangle size={12} />}
                            {expiryStatus.type === "valid" && <CheckCircle size={12} />}
                            {expiryStatus.label}
                          </span>

                          {/* Hover Tooltip Box */}
                          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover/tooltip:opacity-100 group-hover/tooltip:-translate-y-1 z-30 w-44 rounded-xl bg-[#14213d] p-2 text-[10px] font-medium text-white shadow-xl">
                            <p className="font-bold text-[#fca311] flex items-center gap-1 mb-0.5">
                              <Info size={11} /> Expiry Info
                            </p>
                            <p className="text-white/80 leading-snug">
                              {expiryStatus.type === "expired"
                                ? "This document has passed its validity period. Please upload an updated copy."
                                : expiryStatus.type === "soon"
                                ? "This document will expire within 30 days. Plan your renewal ahead."
                                : expiryStatus.type === "valid"
                                ? "Document is active and valid for verification."
                                : "This document does not have an expiration date."}
                            </p>
                            <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-[#14213d]" />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="px-5 py-4">
                      {documentStatus === "Approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Approved
                        </span>
                      )}
                      {documentStatus === "Pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fca311]/20 px-3 py-1 text-xs font-bold text-[#14213d]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#fca311] animate-ping" />
                          Pending
                        </span>
                      )}
                      {documentStatus === "Rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Preview Button */}
                        <button
                          type="button"
                          title="Preview document"
                          aria-label={`Preview ${fileName}`}
                          onClick={() => onPreview(doc)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#14213d]/20 bg-white text-[#14213d] transition-all duration-150 hover:bg-[#14213d] hover:text-white hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-2xs"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Download Button */}
                        <button
                          type="button"
                          title="Download document"
                          aria-label={`Download ${fileName}`}
                          onClick={() => handleDownload(filePath)}
                          disabled={isDownloading}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#fca311] bg-[#fca311]/15 text-[#14213d] font-bold transition-all duration-150 hover:bg-[#fca311] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs"
                        >
                          <Download size={15} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          title="Delete document"
                          aria-label={`Delete ${fileName}`}
                          onClick={() => handleDelete(filePath)}
                          disabled={isDeleting}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-300 bg-rose-50 text-rose-700 transition-all duration-150 hover:bg-rose-600 hover:text-white hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}