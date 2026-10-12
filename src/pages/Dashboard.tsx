
import { useEffect, useMemo, useState } from "react";
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
  LayoutDashboard,
  FolderOpen,
  CloudUpload,
  Search,
  ShieldCheck,
  GraduationCap,
  Wallet,
  Award,
  IdCard,
  FileBadge,
  Files,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  CalendarDays,
  HardDrive,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from "../services/storageService";

import {
  saveDocumentMetadata,
  deleteDocumentMetadata,
  getDocuments,
} from "../services/apiService";


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
  issueDate?: string;
  expiryDate?: string;
  hasExpiry?: boolean;
  purpose?: string;
}

type CategoryReadiness = "ready" | "pending" | "invalid" | "missing";

const categories = [
  { name: "Identity", icon: IdCard, color: "violet" },
  { name: "Academic", icon: GraduationCap, color: "blue" },
  { name: "Financial", icon: Wallet, color: "emerald" },
  { name: "Scholarships", icon: Award, color: "amber" },
  { name: "Certificates", icon: FileBadge, color: "pink" },
  { name: "Government Documents", icon: ShieldCheck, color: "cyan" },
  { name: "Resume", icon: Files, color: "indigo" },
  { name: "Others", icon: FolderOpen, color: "slate" },
];

const readinessRules = {
  Admission: ["Identity", "Academic", "Certificates"],
  Internship: ["Resume", "Identity", "Academic", "Certificates"],
  Placement: ["Resume", "Identity", "Academic", "Certificates"],
  Scholarship: ["Identity", "Academic", "Financial"],
  Examination: ["Identity", "Academic"],
};

type ReadinessPurpose = keyof typeof readinessRules;

const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("Academic");
  const [issueDate, setIssueDate] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [purpose, setPurpose] = useState("General");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const items = await getDocuments();
      setDocuments(items);
    } catch (error) {
      console.error("Failed to load documents:", error);
      setMessage("We couldn't load your documents. Please refresh and try again.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

  const getExpiryStatus = (document: DocumentItem) => {
    if (!document.hasExpiry) return { label: "No expiry", type: "none" };
    if (!document.expiryDate) return { label: "Date missing", type: "none" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(`${document.expiryDate.slice(0, 10)}T00:00:00`);
    const daysRemaining = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) return { label: "Expired", type: "expired" };
    if (daysRemaining <= 30) return { label: "Expiring soon", type: "soon" };
    return { label: "Valid", type: "valid" };
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }
    if (!category || !purpose || !issueDate) {
      setMessage("Please select a category and purpose, and enter the issue date.");
      return;
    }
    if (hasExpiry && !expiryDate) {
      setMessage("Please enter the document expiry date.");
      return;
    }
    if (hasExpiry && expiryDate < issueDate) {
      setMessage("Expiry date cannot be before the issue date.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const uploadResult = await uploadDocument(selectedFile, category);
      const filePath =
        (uploadResult as { path?: string; key?: string })?.path ||
        (uploadResult as { key?: string })?.key ||
        "";

      if (!filePath) {
        throw new Error("The storage service did not return a document path.");
      }

      await saveDocumentMetadata({
        fileName: selectedFile.name,
        category,
        filePath,
        fileSize: selectedFile.size,
        contentType: selectedFile.type,
        issueDate,
        expiryDate: hasExpiry ? expiryDate : "",
        hasExpiry,
        purpose,
      });

      await loadDocuments();
      setMessage("Your document was uploaded successfully.");
      setSelectedFile(null);
      setIssueDate("");
      setHasExpiry(false);
      setExpiryDate("");
      setPurpose("General");

      const input = document.getElementById("document") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (path: string) => {
    try {
      setDownloadingPath(path);
      setMessage("");
      await downloadDocument(path);
      setMessage("Your document download has started.");
    } catch (error) {
      console.error("Download error:", error);
      setMessage("Download failed. Please try again.");
    } finally {
      setDownloadingPath(null);
    }
  };

  const handleDelete = async (path: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this document?")) {
      return;
    }

    try {
      setDeletingPath(path);
      setMessage("");
      await deleteDocument(path);
      await deleteDocumentMetadata(path);
      await loadDocuments();
      setMessage("Your document was deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Delete failed. Please try again.");
    } finally {
      setDeletingPath(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Logout failed. Please try again.");
    }
  };

  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter((d) => d.status === "Approved").length;
  const pendingDocuments = documents.filter((d) => d.status === "Pending").length;
  const totalStorage = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);
  
  const totalCategories = new Set(documents.map((d) => d.category || "Others")).size;

  const getCategoryReadiness = (categoryName: string): CategoryReadiness => {
    const matching = documents.filter((d) => d.category === categoryName);
    if (matching.length === 0) return "missing";

    const isExpired = (d: DocumentItem) => getExpiryStatus(d).type === "expired";
    if (matching.some((d) => d.status === "Approved" && !isExpired(d))) {
      return "ready";
    }
    if (matching.some((d) => d.status === "Pending" && !isExpired(d))) {
      return "pending";
    }
    return "invalid";
  };

  const getReadiness = (purposeName: ReadinessPurpose) => {
    const categoryResults = readinessRules[purposeName].map((name) => ({
      category: name,
      status: getCategoryReadiness(name),
    }));
    const ready = categoryResults.filter((item) => item.status === "ready").length;
    const pending = categoryResults.filter((item) => item.status === "pending").length;
    const invalid = categoryResults.filter((item) => item.status === "invalid").length;
    const missing = categoryResults.filter((item) => item.status === "missing").length;

    return {
      total: categoryResults.length,
      ready,
      pending,
      invalid,
      missing,
      percentage: Math.round((ready / categoryResults.length) * 100),
      categoryResults,
    };
  };

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesCategory =
        activeCategory === "All" || doc.category === activeCategory;
      const matchesSearch =
        !query ||
        doc.fileName.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query) ||
        (doc.purpose || "General").toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [documents, search, activeCategory]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  const statusClass = (status: DocumentStatus) => {
    if (status === "Approved") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    if (status === "Rejected") return "bg-rose-50 text-rose-700 ring-rose-200";
    return "bg-amber-50 text-amber-700 ring-amber-200";
  };

  const readinessClass = (status: CategoryReadiness) => {
    if (status === "ready") return "bg-emerald-50 text-emerald-700";
    if (status === "pending") return "bg-amber-50 text-amber-700";
    if (status === "invalid") return "bg-rose-50 text-rose-700";
    return "bg-slate-100 text-slate-500";
  };

  const Sidebar = () => (
    <aside className="flex h-full flex-col bg-[#292052] text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-950/30">
          <FileText size={24} />
        </div>
        <div>
          <p className="text-xl font-extrabold tracking-tight">DocVault</p>
          <p className="text-xs text-violet-200">Your documents, together</p>
        </div>
      </div>

      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
          Workspace
        </p>
        <nav className="space-y-1.5">
          <button onClick={() => scrollTo("overview")} className="flex w-full items-center gap-3 rounded-xl bg-white/15 px-3 py-3 text-left text-sm font-semibold shadow-inner transition hover:bg-white/20">
            <LayoutDashboard size={18} className="text-violet-200" /> Dashboard
          </button>
          <button onClick={() => scrollTo("documents")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-violet-100 transition hover:bg-white/10">
            <FolderOpen size={18} className="text-sky-300" /> My Documents
          </button>
          <button onClick={() => scrollTo("upload")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-violet-100 transition hover:bg-white/10">
            <CloudUpload size={18} className="text-teal-300" /> Upload Document
          </button>
          <button onClick={() => scrollTo("categories")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-violet-100 transition hover:bg-white/10">
            <Files size={18} className="text-amber-300" /> Categories
          </button>
          <button onClick={() => scrollTo("readiness")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-violet-100 transition hover:bg-white/10">
            <ShieldCheck size={18} className="text-pink-300" /> Document Readiness
          </button>
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Sparkles size={16} className="text-amber-300" /> Stay organized
          </div>
          <p className="text-xs leading-5 text-violet-200">
            Keep your academic documents secure and ready when you need them.
          </p>
        </div>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-violet-100 transition hover:bg-rose-500/15 hover:text-rose-200">
          <LogOut size={18} /> Log out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f7f6ff] text-[#202443]">
      <div className="min-h-screen lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/50" />
            <div className="relative h-full w-[270px] shadow-2xl">
              <button aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} className="absolute right-3 top-4 z-10 rounded-lg p-2 text-white hover:bg-white/10">
                <X size={20} />
              </button>
              <Sidebar />
            </div>
          </div>
        )}

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="rounded-xl border border-violet-100 bg-white p-2.5 text-violet-700 shadow-sm lg:hidden" aria-label="Open navigation">
                <Menu size={21} />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Student workspace</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Welcome back, Student! 👋</h1>
                <p className="mt-1 text-sm text-slate-500">Your academic documents, organized and secure.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-2xl border border-violet-100 bg-white px-3 py-2.5 shadow-sm sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white">S</div>
                <div>
                  <p className="text-sm font-bold">Student</p>
                  <p className="text-xs text-slate-500">Personal workspace</p>
                </div>
              </div>
              <button onClick={() => void loadDocuments()} title="Refresh documents" className="rounded-xl border border-violet-100 bg-white p-3 text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <RefreshCw size={18} />
              </button>
            </div>
          </header>

          <section id="overview" className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#6c4cf1] via-[#6258ee] to-[#3986f7] p-6 text-white shadow-xl shadow-violet-200/70 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 right-1/3 h-52 w-52 rounded-full bg-teal-300/15 blur-2xl" />
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <ShieldCheck size={14} /> Your secure document space
              </div>
              <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">Everything important, in one place.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
                Store, track and manage your college documents with confidence.
              </p>
              <button onClick={() => scrollTo("upload")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                <CloudUpload size={18} /> Upload a document <ChevronRight size={16} />
              </button>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-3 border-t border-white/20 pt-4 text-xs text-white/85 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0 sm:border-0 sm:pt-0">
              <div className="flex -space-x-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 bg-teal-400 text-white"><Check size={15} /></span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 bg-amber-400 text-white"><FileText size={15} /></span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 bg-pink-400 text-white"><ShieldCheck size={15} /></span>
              </div>
              <span>Storage · Verification · Readiness</span>
            </div>
          </section>

          {message && (
            <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm text-violet-800 shadow-sm">
              <CheckCircle size={18} className="mt-0.5 shrink-0 text-violet-600" />
              <span className="flex-1">{message}</span>
              <button onClick={() => setMessage("")} aria-label="Dismiss message" className="text-slate-400 hover:text-slate-700"><X size={16} /></button>
            </div>
          )}

          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6c4cf1] to-[#8a68fa] p-5 text-white shadow-lg shadow-violet-200 transition duration-200 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute -right-4 -top-5 h-24 w-24 rounded-full bg-white/10" />
              <div className="relative flex items-start justify-between">
                <div><p className="text-sm font-medium text-white/80">Total documents</p><p className="mt-3 text-3xl font-extrabold">{totalDocuments}</p><p className="mt-1 text-xs text-white/75">Stored in your vault</p></div>
                <div className="rounded-xl bg-white/20 p-3"><Files size={22} /></div>
              </div>
            </div>

            <div className="group rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div><p className="text-sm font-medium text-slate-500">Verified documents</p><p className="mt-3 text-3xl font-extrabold text-[#202443]">{verifiedDocuments}</p><p className="mt-1 text-xs text-emerald-700">Approved by admin</p></div>
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><CheckCircle size={22} /></div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-emerald-50"><div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500" style={{ width: `${totalDocuments ? (verifiedDocuments / totalDocuments) * 100 : 0}%` }} /></div>
            </div>

            <div className="group rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div><p className="text-sm font-medium text-slate-500">Pending verification</p><p className="mt-3 text-3xl font-extrabold text-[#202443]">{pendingDocuments}</p><p className="mt-1 text-xs text-amber-700">Awaiting review</p></div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600"><Clock size={22} /></div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-amber-50"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400" style={{ width: `${totalDocuments ? (pendingDocuments / totalDocuments) * 100 : 0}%` }} /></div>
            </div>

            <div className="group rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div><p className="text-sm font-medium text-slate-500">Storage used</p><p className="mt-3 text-3xl font-extrabold text-[#202443]">{formatBytes(totalStorage)}</p><p className="mt-1 text-xs text-sky-700">Across your documents</p></div>
                <div className="rounded-xl bg-sky-50 p-3 text-sky-600"><HardDrive size={22} /></div>
              </div>
              <p className="mt-4 text-xs text-slate-400">{totalCategories} document categories</p>
            </div>
          </section>

          <section id="readiness" className="mb-8 scroll-mt-6 rounded-[24px] border border-violet-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2"><div className="rounded-xl bg-violet-100 p-2 text-violet-700"><ShieldCheck size={20} /></div><h2 className="text-xl font-extrabold">Document readiness</h2></div>
                <p className="mt-2 text-sm text-slate-500">Check which documents you have ready for important goals.</p>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">5 purposes</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(Object.keys(readinessRules) as ReadinessPurpose[]).map((purposeName, index) => {
                const readiness = getReadiness(purposeName);
                const accents = [
                  "from-violet-500 to-purple-400",
                  "from-sky-500 to-blue-400",
                  "from-teal-500 to-emerald-400",
                  "from-amber-400 to-orange-400",
                  "from-pink-500 to-rose-400",
                ];
                const PurposeIcon = [GraduationCap, Files, Award, Wallet, CalendarDays][index];
                return (
                  <div key={purposeName} className="rounded-2xl border border-slate-100 bg-[#fcfbff] p-5 transition hover:border-violet-200 hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3"><div className="rounded-xl bg-white p-2.5 text-violet-700 shadow-sm"><PurposeIcon size={20} /></div><h3 className="font-bold">{purposeName}</h3></div>
                      <span className="text-sm font-extrabold text-violet-700">{readiness.ready}/{readiness.total}</span>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full bg-gradient-to-r ${accents[index]} transition-all duration-500`} style={{ width: `${readiness.percentage}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs"><span className="font-medium text-slate-500">{readiness.percentage}% ready</span><span className={readiness.percentage === 100 ? "font-semibold text-emerald-600" : "text-slate-400"}>{readiness.percentage === 100 ? "All set!" : "In progress"}</span></div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {readiness.categoryResults.map((item) => (
                        <span key={item.category} className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${readinessClass(item.status)}`}>
                          {item.status === "ready" ? "✓ " : item.status === "pending" ? "◷ " : item.status === "invalid" ? "× " : "＋ "}{item.category}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="categories" className="mb-8 scroll-mt-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-xl font-extrabold">Browse categories</h2><p className="mt-1 text-sm text-slate-500">Find your files by document type.</p></div>
              <button onClick={() => { setActiveCategory("All"); setSearch(""); scrollTo("documents"); }} className="text-sm font-semibold text-violet-700 hover:text-violet-900">View all documents →</button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
              {categories.map((item) => {
                const Icon = item.icon;
                const count = documents.filter((d) => d.category === item.name).length;
                const isActive = activeCategory === item.name;
                const iconColors: Record<string, string> = {
                  violet: "bg-violet-100 text-violet-700",
                  blue: "bg-blue-100 text-blue-700",
                  emerald: "bg-emerald-100 text-emerald-700",
                  amber: "bg-amber-100 text-amber-700",
                  pink: "bg-pink-100 text-pink-700",
                  cyan: "bg-cyan-100 text-cyan-700",
                  indigo: "bg-indigo-100 text-indigo-700",
                  slate: "bg-slate-100 text-slate-700",
                };
                return (
                  <button key={item.name} onClick={() => { setActiveCategory(isActive ? "All" : item.name); scrollTo("documents"); }} className={`rounded-2xl border bg-white p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-md ${isActive ? "border-violet-400 ring-2 ring-violet-100" : "border-slate-100 hover:border-violet-200"}`}>
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconColors[item.color]}`}><Icon size={20} /></div>
                    <p className="line-clamp-2 min-h-10 text-xs font-bold leading-5 text-[#202443]">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{count} {count === 1 ? "file" : "files"}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section id="upload" className="mb-8 scroll-mt-6 overflow-hidden rounded-[24px] border border-violet-100 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#30205f] via-[#5140a5] to-[#6c4cf1] p-6 text-white sm:p-8">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[25px] border-white/10" />
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-inner"><CloudUpload size={29} /></div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Add to your vault</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Upload your documents</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">Keep your important documents safe, organized and accessible whenever you need them.</p>
                  <div className="mt-7 space-y-3 text-sm text-white/85">
                    <p className="flex items-center gap-2"><CheckCircle size={16} className="text-teal-300" /> Private cloud storage</p>
                    <p className="flex items-center gap-2"><CheckCircle size={16} className="text-teal-300" /> Track expiry dates</p>
                    <p className="flex items-center gap-2"><CheckCircle size={16} className="text-teal-300" /> Monitor verification</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <div className="mb-5"><h3 className="text-lg font-extrabold">Document details</h3><p className="mt-1 text-sm text-slate-500">Add the details so you can find your document later.</p></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="mb-1.5 block text-xs font-bold text-slate-600">Document category</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
                      {categories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="purpose" className="mb-1.5 block text-xs font-bold text-slate-600">Document purpose</label>
                    <select id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
                      {["General", "Scholarship", "Internship", "Placement", "Admission", "Examination"].map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="issueDate" className="mb-1.5 block text-xs font-bold text-slate-600">Issue date</label>
                    <input id="issueDate" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
                  </div>
                  <div>
                    <label htmlFor="hasExpiry" className="mb-1.5 block text-xs font-bold text-slate-600">Does it expire?</label>
                    <select id="hasExpiry" value={hasExpiry ? "yes" : "no"} onChange={(e) => { const value = e.target.value === "yes"; setHasExpiry(value); if (!value) setExpiryDate(""); }} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
                      <option value="no">No expiry date</option><option value="yes">Yes, it expires</option>
                    </select>
                  </div>
                  {hasExpiry && (
                    <div className="sm:col-span-2">
                      <label htmlFor="expiryDate" className="mb-1.5 block text-xs font-bold text-slate-600">Expiry date</label>
                      <input id="expiryDate" type="date" min={issueDate || undefined} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label htmlFor="document" className="mb-1.5 block text-xs font-bold text-slate-600">Choose a file</label>
                    <label htmlFor="document" className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-4 transition hover:border-violet-400 hover:bg-violet-50">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm"><Upload size={22} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">{selectedFile ? selectedFile.name : "Click to choose a document"}</p>
                        <p className="mt-1 text-xs text-slate-500">{selectedFile ? formatBytes(selectedFile.size) : "Select a PDF, image or other supported file"}</p>
                      </div>
                      <span className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-bold text-violet-700">Browse</span>
                    </label>
                    <input id="document" type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="sr-only" />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">Your file is uploaded to your private DocVault storage.</p>
                  <button onClick={() => void handleUpload()} disabled={uploading || !selectedFile} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6c4cf1] to-[#3986f7] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50">
                    {uploading ? <RefreshCw size={17} className="animate-spin" /> : <CloudUpload size={17} />}
                    {uploading ? "Uploading..." : "Upload document"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section id="documents" className="scroll-mt-6 overflow-hidden rounded-[24px] border border-violet-100 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
              <div><h2 className="text-xl font-extrabold">My documents</h2><p className="mt-1 text-sm text-slate-500">Search, download and manage your uploaded files.</p></div>
              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">{filteredDocuments.length} files</span>
            </div>

            <div className="flex flex-col gap-3 border-b border-slate-100 bg-[#fcfbff] p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by file name, category or purpose..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
              </div>
              <select aria-label="Filter by category" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
                <option value="All">All categories</option>
                {categories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
            </div>

            {loadingDocuments ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500"><RefreshCw size={25} className="mb-3 animate-spin text-violet-600" /><p className="text-sm">Loading your documents...</p></div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-400"><FolderOpen size={30} /></div>
                <h3 className="font-bold text-slate-800">{documents.length === 0 ? "Your vault is ready for its first document" : "No matching documents found"}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{documents.length === 0 ? "Upload a document to start organizing your academic records in one secure place." : "Try another search term or choose a different category filter."}</p>
                {documents.length === 0 && <button onClick={() => scrollTo("upload")} className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700">Upload your first document</button>}
                {(search || activeCategory !== "All") && <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="mt-4 text-sm font-semibold text-violet-700 hover:text-violet-900">Clear filters</button>}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => {
                  const path = doc.filePath;
                  const fileName = doc.fileName || path.split("/").pop() || "Document";
                  const expiry = getExpiryStatus(doc);
                  const isDownloading = downloadingPath === path;
                  const isDeleting = deletingPath === path;
                  return (
                    <article key={`${doc.studentId}-${doc.documentId}`} className="flex flex-col gap-4 p-4 transition hover:bg-violet-50/40 sm:p-5 xl:flex-row xl:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 text-violet-700"><FileText size={23} /></div>
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-bold text-slate-800">{fileName}</p>
                          <p className="mt-1 text-xs text-slate-400">{doc.contentType || "Document"} · {formatBytes(doc.fileSize)}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">{doc.category || "Others"}</span>
                            <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">{doc.purpose || "General"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3 xl:w-[330px]">
                        <div><p className="mb-1 text-slate-400">Issue date</p><p className="font-semibold text-slate-700">{formatDate(doc.issueDate)}</p></div>
                        <div><p className="mb-1 text-slate-400">Expiry</p><p className="font-semibold text-slate-700">{doc.hasExpiry ? formatDate(doc.expiryDate) : "No expiry"}</p><span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${expiry.type === "expired" ? "bg-rose-50 text-rose-700" : expiry.type === "soon" ? "bg-amber-50 text-amber-700" : expiry.type === "valid" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{expiry.type === "expired" ? <XCircle size={11} /> : expiry.type === "soon" ? <AlertTriangle size={11} /> : expiry.type === "valid" ? <CheckCircle size={11} /> : null}{expiry.label}</span></div>
                        <div><p className="mb-1 text-slate-400">Verification</p><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${statusClass(doc.status || "Pending")}`}>{doc.status === "Approved" ? <CheckCircle size={12} /> : doc.status === "Rejected" ? <XCircle size={12} /> : <Clock size={12} />}{doc.status || "Pending"}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button onClick={() => void handleDownload(path)} disabled={isDownloading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-3.5 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-50 disabled:opacity-50">
                          <Download size={15} />{isDownloading ? "Downloading..." : "Download"}
                        </button>
                        <button onClick={() => void handleDelete(path)} disabled={isDeleting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50">
                          <Trash2 size={15} />{isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-[#fcfbff] px-5 py-4 text-xs text-slate-400">
              <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-600" /> Documents stored securely in your private vault</span>
              <span>{totalDocuments} total · {formatBytes(totalStorage)} used</span>
            </div>
          </section>

          <footer className="py-7 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-500">DocVault · College Digital Document Vault</p>
            <p className="mt-1">Organized documents. Clearer next steps.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
