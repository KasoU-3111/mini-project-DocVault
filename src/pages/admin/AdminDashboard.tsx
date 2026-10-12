import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Search,
  LogOut,
  ChevronDown,
  Filter,
  Menu,
  Eye,
  GraduationCap,
  AlertCircle,
  LoaderCircle,
  FolderOpen,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminDocuments,
  updateDocumentStatus,
} from "../../services/apiService";
import { downloadDocument } from "../../services/storageService";

type DocumentStatus = "Pending" | "Approved" | "Rejected";

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
}

const statusStyles: Record<DocumentStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingDocument, setUpdatingDocument] = useState<string | null>(
    null
  );
  const [downloadingDocument, setDownloadingDocument] = useState<string | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadDocuments = async () => {
    try {
      setError("");
      const result = await getAdminDocuments();
      setDocuments(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Error loading admin documents:", err);
      setError("Unable to load documents. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage("");
    await loadDocuments();
  };

  const handleStatusUpdate = async (
    document: DocumentItem,
    status: "Approved" | "Rejected"
  ) => {
    const key = document.documentId;

    try {
      setUpdatingDocument(key);
      setError("");
      setMessage("");

      await updateDocumentStatus(
        document.studentId,
        document.documentId,
        status
      );

      setMessage(
        status === "Approved"
          ? "Document approved successfully."
          : "Document rejected successfully."
      );

      await loadDocuments();
    } catch (err) {
      console.error("Error updating document status:", err);
      setError("Could not update the document status. Please try again.");
    } finally {
      setUpdatingDocument(null);
    }
  };

  const handleDownload = async (document: DocumentItem) => {
    try {
      setDownloadingDocument(document.documentId);
      setError("");
      setMessage("");

      await downloadDocument(document.filePath);

      setMessage(`Downloaded ${document.fileName} successfully.`);
    } catch (err) {
      console.error("Error downloading document:", err);
      setError("Download failed. Please check your access and try again.");
    } finally {
      setDownloadingDocument(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
    }
  };

  const counts = useMemo(
    () => ({
      total: documents.length,
      pending: documents.filter((doc) => doc.status === "Pending").length,
      approved: documents.filter((doc) => doc.status === "Approved").length,
      rejected: documents.filter((doc) => doc.status === "Rejected").length,
    }),
    [documents]
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          documents
            .map((doc) => doc.category)
            .filter((category): category is string => Boolean(category))
        )
      ).sort(),
    [documents]
  );

  const filteredDocuments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return documents.filter((doc) => {
      const matchesSearch =
        !query ||
        (doc.fileName || "").toLowerCase().includes(query) ||
        (doc.studentId || "").toLowerCase().includes(query) ||
        (doc.category || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || doc.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || doc.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [documents, searchTerm, statusFilter, categoryFilter]);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes < 0) return "—";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statCards = [
    {
      label: "Total Documents",
      value: counts.total,
      description: "All submitted documents",
      icon: FileText,
      color: "text-violet-600",
      background: "bg-violet-100",
      accent: "border-violet-200",
    },
    {
      label: "Pending Review",
      value: counts.pending,
      description: "Awaiting verification",
      icon: Clock3,
      color: "text-amber-600",
      background: "bg-amber-100",
      accent: "border-amber-200",
    },
    {
      label: "Approved",
      value: counts.approved,
      description: "Successfully verified",
      icon: CheckCircle2,
      color: "text-emerald-600",
      background: "bg-emerald-100",
      accent: "border-emerald-200",
    },
    {
      label: "Rejected",
      value: counts.rejected,
      description: "Requires attention",
      icon: XCircle,
      color: "text-rose-600",
      background: "bg-rose-100",
      accent: "border-rose-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6FC] text-[#24213F]">
      <div className="flex min-h-screen">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-[#332064] via-[#442A85] to-[#30205D] text-white transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 shadow-lg">
              <FolderOpen size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">DocVault</h1>
              <p className="mt-0.5 text-xs text-purple-200">
                Document Management
              </p>
            </div>
          </div>

          <div className="px-5 pt-7">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-200/70">
              Workspace
            </p>

            <a
              href="#overview"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold shadow-sm"
            >
              <LayoutDashboard size={19} />
              Dashboard Overview
            </a>

            <a
              href="#documents"
              onClick={() => setSidebarOpen(false)}
              className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-purple-100 transition hover:bg-white/10"
            >
              <FileText size={19} />
              Student Documents
              <span className="ml-auto rounded-lg bg-white/15 px-2 py-0.5 text-xs">
                {counts.total}
              </span>
            </a>

            <a
              href="#documents"
              onClick={() => {
                setStatusFilter("Pending");
                setSidebarOpen(false);
              }}
              className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-purple-100 transition hover:bg-white/10"
            >
              <Clock3 size={19} />
              Pending Reviews
              <span className="ml-auto rounded-lg bg-amber-300/20 px-2 py-0.5 text-xs text-amber-100">
                {counts.pending}
              </span>
            </a>
          </div>

          <div className="mx-5 mt-8 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
              <ShieldCheck size={21} />
            </div>
            <h3 className="text-sm font-semibold">Secure document review</h3>
            <p className="mt-2 text-xs leading-5 text-purple-100/75">
              Review student submissions and update their verification status.
            </p>
          </div>

          <div className="mt-auto border-t border-white/10 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-300 to-indigo-300 text-[#382366]">
                <GraduationCap size={22} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Administrator</p>
                <p className="text-xs text-purple-200">Admin workspace</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-[#EAE7F4] bg-white/90 backdrop-blur-xl">
            <div className="flex min-h-[78px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="Open navigation"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-gray-200 p-2 lg:hidden"
                >
                  <Menu size={21} />
                </button>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">
                    DocVault / Admin
                  </p>
                  <h2 className="mt-1 truncate text-lg font-bold sm:text-xl">
                    Admin Dashboard
                  </h2>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 rounded-xl border border-[#E7E2F6] bg-white px-3 py-2.5 text-sm font-semibold text-[#5941B8] shadow-sm transition hover:bg-[#F6F2FF] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline">
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </span>
                </button>

                <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#EEE8FF] text-[#6045C5] sm:flex">
                  <GraduationCap size={22} />
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
            {/* Welcome banner */}
            <section
              id="overview"
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6847D9] via-[#7756E8] to-[#9276F2] p-6 text-white shadow-lg shadow-purple-200/50 sm:p-8"
            >
              <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
              <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

              <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold">
                    <ShieldCheck size={15} />
                    Admin Control Center
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Welcome back, Admin!
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-purple-50 sm:text-base">
                    Manage student documents, review submissions, and keep
                    verification organized from one place.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                    <FileText size={25} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{counts.total}</p>
                    <p className="text-xs text-purple-50">
                      Documents submitted
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Status messages */}
            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                <p>{message}</p>
              </div>
            )}

            {/* Statistics */}
            <section className="mt-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Document Overview</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    A quick summary of document verification activity.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.label}
                      className={`rounded-2xl border ${card.accent} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {card.label}
                          </p>
                          <p className="mt-3 text-3xl font-bold tracking-tight text-[#292444]">
                            {loading ? "—" : card.value}
                          </p>
                        </div>

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.background} ${card.color}`}
                        >
                          <Icon size={23} />
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-gray-500">
                        {card.description}
                      </p>

                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${card.background}`}
                          style={{
                            width:
                              counts.total === 0
                                ? "0%"
                                : `${Math.min(
                                    100,
                                    (card.value / counts.total) * 100
                                  )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Documents section */}
            <section
              id="documents"
              className="mt-8 overflow-hidden rounded-3xl border border-[#EAE7F4] bg-white shadow-sm"
            >
              <div className="border-b border-[#F0EDF7] p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EBFF] text-[#6847D9]">
                        <FileText size={21} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">
                          Student Documents
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                          Review and manage submitted documents.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Search */}
                    <div className="relative min-w-0 sm:w-64">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search name or student ID..."
                        className="w-full rounded-xl border border-[#E8E4F1] bg-[#FCFBFF] py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#8C70ED] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                      <Filter
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                        className="w-full appearance-none rounded-xl border border-[#E8E4F1] bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-[#8C70ED] focus:ring-4 focus:ring-purple-100 sm:w-40"
                      >
                        <option value="All">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>

                    {/* Category filter */}
                    <div className="relative">
                      <select
                        value={categoryFilter}
                        onChange={(event) =>
                          setCategoryFilter(event.target.value)
                        }
                        className="w-full appearance-none rounded-xl border border-[#E8E4F1] bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-[#8C70ED] focus:ring-4 focus:ring-purple-100 sm:w-44"
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
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-[#4E3A99]">
                      {filteredDocuments.length}
                    </span>{" "}
                    of {documents.length} documents
                  </p>

                  {(searchTerm ||
                    statusFilter !== "All" ||
                    categoryFilter !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("All");
                        setCategoryFilter("All");
                      }}
                      className="text-xs font-semibold text-[#6847D9] hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#FAF9FE]">
                      <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Document
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Student ID
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Category
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        File Size
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Uploaded
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#F1EEF7]">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <LoaderCircle
                              size={30}
                              className="animate-spin text-[#7657DF]"
                            />
                            <p className="text-sm text-gray-500">
                              Loading student documents...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredDocuments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <div className="mx-auto flex max-w-sm flex-col items-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#7657DF]">
                              <FolderOpen size={27} />
                            </div>
                            <h3 className="mt-4 font-semibold text-gray-800">
                              No documents found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Try changing your search or filter settings.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("All");
                                setCategoryFilter("All");
                              }}
                              className="mt-4 rounded-xl bg-[#6847D9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5635C6]"
                            >
                              Reset filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((doc) => {
                        const isUpdating =
                          updatingDocument === doc.documentId;
                        const isDownloading =
                          downloadingDocument === doc.documentId;

                        return (
                          <tr
                            key={`${doc.studentId}-${doc.documentId}`}
                            className="transition hover:bg-[#FCFBFF]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EBFF] text-[#6847D9]">
                                  <FileText size={21} />
                                </div>
                                <div className="max-w-[220px]">
                                  <p
                                    title={doc.fileName}
                                    className="truncate text-sm font-semibold text-[#2D2947]"
                                  >
                                    {doc.fileName || "Untitled document"}
                                  </p>
                                  <p className="mt-1 truncate text-xs text-gray-400">
                                    {doc.contentType || "Document file"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 font-mono text-xs text-gray-600">
                                {doc.studentId || "—"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-lg bg-[#F3F0FF] px-3 py-1.5 text-xs font-medium text-[#6447BD]">
                                {doc.category || "Other"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {formatFileSize(doc.fileSize)}
                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {formatDate(doc.uploadDate)}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                  statusStyles[doc.status] ||
                                  "bg-gray-100 text-gray-600"
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {doc.status || "Pending"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  title="Download document"
                                  aria-label={`Download ${doc.fileName}`}
                                  onClick={() => void handleDownload(doc)}
                                  disabled={isDownloading || isUpdating}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5DDFB] bg-white text-[#6847D9] transition hover:bg-[#F2EEFF] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isDownloading ? (
                                    <LoaderCircle
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Download size={16} />
                                  )}
                                </button>

                                {doc.status !== "Approved" && (
                                  <button
                                    type="button"
                                    title="Approve document"
                                    aria-label={`Approve ${doc.fileName}`}
                                    onClick={() =>
                                      void handleStatusUpdate(doc, "Approved")
                                    }
                                    disabled={isUpdating || isDownloading}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isUpdating ? (
                                      <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2 size={16} />
                                    )}
                                  </button>
                                )}

                                {doc.status !== "Rejected" && (
                                  <button
                                    type="button"
                                    title="Reject document"
                                    aria-label={`Reject ${doc.fileName}`}
                                    onClick={() =>
                                      void handleStatusUpdate(doc, "Rejected")
                                    }
                                    disabled={isUpdating || isDownloading}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <XCircle size={16} />
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
              <div className="flex flex-col justify-between gap-2 border-t border-[#F0EDF7] bg-[#FCFBFE] px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center">
                <p>
                  Document verification dashboard
                </p>
                <p className="flex items-center gap-1.5">
                  <Eye size={14} />
                  Review each submission before updating its status.
                </p>
              </div>
            </section>

            <footer className="py-6 text-center text-xs text-gray-400">
              DocVault · Student Digital Document Repository
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}