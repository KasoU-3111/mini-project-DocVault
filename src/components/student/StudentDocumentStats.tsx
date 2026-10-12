// src/components/student/StudentDocumentStats.tsx
import { useMemo } from "react";
import {
  PieChart,
  BarChart2,
  HardDrive,
  ShieldCheck,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { getExpiryStatus } from "../../utils/documentUtils";

interface DocumentItem {
  studentId: string;
  documentId: string;
  fileName: string;
  category: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  status: "Pending" | "Approved" | "Rejected";
  uploadDate: string;
  issueDate?: string;
  expiryDate?: string;
  hasExpiry?: boolean;
  purpose?: string;
}

interface StudentDocumentStatsProps {
  documents: DocumentItem[];
}

const CATEGORY_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
  Academic: { bg: "bg-blue-50", bar: "bg-blue-600", text: "text-blue-700" },
  Identity: { bg: "bg-amber-50", bar: "bg-amber-500", text: "text-amber-800" },
  Financial: { bg: "bg-emerald-50", bar: "bg-emerald-600", text: "text-emerald-700" },
  Certificates: { bg: "bg-purple-50", bar: "bg-purple-600", text: "text-purple-700" },
  Scholarships: { bg: "bg-indigo-50", bar: "bg-indigo-600", text: "text-indigo-700" },
  Resume: { bg: "bg-rose-50", bar: "bg-rose-600", text: "text-rose-700" },
  Other: { bg: "bg-gray-50", bar: "bg-gray-600", text: "text-gray-700" },
};

const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function StudentDocumentStats({ documents }: StudentDocumentStatsProps) {
  const totalDocs = documents.length;

  // Category Distribution Metrics
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((doc) => {
      const cat = doc.category || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      percentage: totalDocs > 0 ? Math.round((count / totalDocs) * 100) : 0,
    }));
  }, [documents, totalDocs]);

  // Verification Status Metrics
  const statusStats = useMemo(() => {
    const approved = documents.filter((d) => d.status === "Approved").length;
    const pending = documents.filter((d) => d.status === "Pending").length;
    const rejected = documents.filter((d) => d.status === "Rejected").length;

    return {
      approved,
      pending,
      rejected,
      approvedRate: totalDocs > 0 ? Math.round((approved / totalDocs) * 100) : 0,
      pendingRate: totalDocs > 0 ? Math.round((pending / totalDocs) * 100) : 0,
      rejectedRate: totalDocs > 0 ? Math.round((rejected / totalDocs) * 100) : 0,
    };
  }, [documents, totalDocs]);

  // Expiry Health Metrics
  const expiryStats = useMemo(() => {
    let healthy = 0;
    let soon = 0;
    let expired = 0;

    documents.forEach((doc) => {
      const status = getExpiryStatus(doc);
      if (status.type === "expired") expired++;
      else if (status.type === "soon") soon++;
      else healthy++;
    });

    return { healthy, soon, expired };
  }, [documents]);

  // Storage Limit Gauge (Assume 10 MB quota)
  const totalStorageBytes = useMemo(
    () => documents.reduce((sum, d) => sum + (d.fileSize || 0), 0),
    [documents]
  );
  const maxStorageBytes = 10 * 1024 * 1024; // 10 MB
  const storageUsedPercentage = Math.min(
    100,
    Math.round((totalStorageBytes / maxStorageBytes) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Analytics Section Title */}
      <div className="flex items-center justify-between border-b border-[#14213d]/10 pb-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#14213d] flex items-center gap-2">
            <PieChart size={20} className="text-[#fca311]" /> Vault Analytics & Storage Insights
          </h2>
          <p className="text-xs text-[#14213d]/60 font-medium mt-0.5">
            Visual breakdown of document distribution, verification statuses, and storage usage.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fca311]/20 px-3 py-1 text-xs font-extrabold text-[#14213d]">
          <Sparkles size={13} className="text-[#fca311]" /> Live Metrics
        </span>
      </div>

      {/* Grid 1: Category Distribution & Verification Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Progress Bars */}
        <div className="rounded-2xl border border-[#14213d]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#14213d]/10 pb-3 mb-5">
            <h3 className="font-extrabold text-[#14213d] text-sm flex items-center gap-2">
              <BarChart2 size={17} className="text-[#14213d]" /> Document Categories
            </h3>
            <span className="text-xs font-bold text-[#14213d]/50">
              {categoryStats.length} Active Categories
            </span>
          </div>

          {categoryStats.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-[#14213d]/40">
              No document categories found.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryStats.map(({ category, count, percentage }) => {
                const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[#14213d] flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${colors.bar}`} />
                        {category}
                      </span>
                      <span className="text-[#14213d]/70 font-mono">
                        {count} file{count > 1 ? "s" : ""} ({percentage}%)
                      </span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
                      <div
                        className={`h-2.5 transition-all duration-500 rounded-full ${colors.bar}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Verification Status Distribution */}
        <div className="rounded-2xl border border-[#14213d]/10 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#14213d]/10 pb-3 mb-5">
              <h3 className="font-extrabold text-[#14213d] text-sm flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-600" /> Verification Health
              </h3>
              <span className="text-xs font-bold text-emerald-700">
                {statusStats.approvedRate}% Verified
              </span>
            </div>

            {/* Combined Segmented Status Bar */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-xs font-bold text-[#14213d]">
                <span>Status Share</span>
                <span>{totalDocs} Total Uploads</span>
              </div>
              <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-[#e5e5e5] p-0.5">
                <div
                  className="bg-emerald-500 transition-all duration-500 rounded-l-full"
                  style={{ width: `${statusStats.approvedRate}%` }}
                  title={`Approved: ${statusStats.approvedRate}%`}
                />
                <div
                  className="bg-[#fca311] transition-all duration-500"
                  style={{ width: `${statusStats.pendingRate}%` }}
                  title={`Pending: ${statusStats.pendingRate}%`}
                />
                <div
                  className="bg-rose-500 transition-all duration-500 rounded-r-full"
                  style={{ width: `${statusStats.rejectedRate}%` }}
                  title={`Rejected: ${statusStats.rejectedRate}%`}
                />
              </div>
            </div>

            {/* Status Breakdown Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-800 font-extrabold text-sm">
                  <CheckCircle2 size={15} />
                  {statusStats.approved}
                </div>
                <p className="mt-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Approved
                </p>
              </div>

              <div className="rounded-xl bg-[#fca311]/15 border border-[#fca311]/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[#14213d] font-extrabold text-sm">
                  <Clock size={15} className="text-[#fca311]" />
                  {statusStats.pending}
                </div>
                <p className="mt-1 text-[10px] font-bold text-[#14213d]/70 uppercase tracking-wider">
                  Pending
                </p>
              </div>

              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-rose-800 font-extrabold text-sm">
                  <XCircle size={15} />
                  {statusStats.rejected}
                </div>
                <p className="mt-1 text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                  Rejected
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-[#14213d]/5 p-3 text-[11px] font-medium text-[#14213d]/70 flex items-center justify-between border border-[#14213d]/10">
            <span className="flex items-center gap-1.5 font-bold text-[#14213d]">
              <FileText size={14} className="text-[#fca311]" /> Verification SLA
            </span>
            <span>Average approval time: ~4 hours</span>
          </div>
        </div>
      </div>

      {/* Grid 2: Storage Gauge & Expiry Timeline Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Storage Usage Capacity Meter */}
        <div className="rounded-2xl border border-[#14213d]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#14213d]/10 pb-3 mb-4">
            <h3 className="font-extrabold text-[#14213d] text-sm flex items-center gap-2">
              <HardDrive size={17} className="text-[#14213d]" /> Vault Storage Usage
            </h3>
            <span className="text-xs font-mono font-bold text-[#14213d]">
              {formatBytes(totalStorageBytes)} / 10 MB
            </span>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-xs font-bold text-[#14213d] mb-1.5">
              <span>Quota Capacity</span>
              <span>{storageUsedPercentage}% Used</span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-[#e5e5e5] p-0.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  storageUsedPercentage > 85
                    ? "bg-rose-600"
                    : storageUsedPercentage > 50
                    ? "bg-[#fca311]"
                    : "bg-[#14213d]"
                }`}
                style={{ width: `${Math.max(5, storageUsedPercentage)}%` }}
              />
            </div>

            <p className="mt-3 text-[11px] text-[#14213d]/60 font-medium leading-relaxed">
              Your storage is protected with client-side encryption. High resolution PDFs are
              compressed automatically to optimize vault capacity.
            </p>
          </div>
        </div>

        {/* Expiry Health Monitor */}
        <div className="rounded-2xl border border-[#14213d]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#14213d]/10 pb-3 mb-4">
            <h3 className="font-extrabold text-[#14213d] text-sm flex items-center gap-2">
              <Clock size={17} className="text-[#fca311]" /> Document Validity Timeline
            </h3>
            <span className="text-xs font-bold text-[#14213d]/50">Expiry Tracker</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200">
              <p className="text-lg font-extrabold text-emerald-800">{expiryStats.healthy}</p>
              <p className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider mt-0.5">
                Healthy
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200">
              <p className="text-lg font-extrabold text-amber-800">{expiryStats.soon}</p>
              <p className="text-[10px] font-bold uppercase text-amber-700 tracking-wider mt-0.5">
                Expiring Soon
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 p-3 border border-rose-200">
              <p className="text-lg font-extrabold text-rose-800">{expiryStats.expired}</p>
              <p className="text-[10px] font-bold uppercase text-rose-700 tracking-wider mt-0.5">
                Action Req.
              </p>
            </div>
          </div>

          {(expiryStats.soon > 0 || expiryStats.expired > 0) && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 font-semibold">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Some documents need attention. Re-upload valid copies before deadlines.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}