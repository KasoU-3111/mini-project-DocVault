// src/components/student/StudentSummaryCards.tsx
import { Files, CheckCircle, Clock, HardDrive } from "lucide-react";

interface StudentSummaryCardsProps {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  totalStorage: number;
}

const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function StudentSummaryCards({
  totalDocuments,
  verifiedDocuments,
  pendingDocuments,
  totalStorage,
}: StudentSummaryCardsProps) {
  return (
    <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-[#14213d]/15 bg-white p-5 shadow-2xs transition duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#14213d]/60">
              Total Documents
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#14213d]">
              {totalDocuments}
            </p>
            <p className="mt-1 text-xs text-[#14213d]/50 font-medium">Stored in your vault</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14213d]/10 text-[#14213d] font-bold">
            <Files size={22} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xs transition duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#14213d]/60">
              Verified Documents
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#14213d]">
              {verifiedDocuments}
            </p>
            <p className="mt-1 text-xs text-emerald-700 font-semibold">Approved by admin</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
            <CheckCircle size={22} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#fca311]/30 bg-white p-5 shadow-2xs transition duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#14213d]/60">
              Pending Review
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#14213d]">
              {pendingDocuments}
            </p>
            <p className="mt-1 text-xs text-[#fca311] font-bold">Awaiting review</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fca311]/15 text-[#fca311] font-bold">
            <Clock size={22} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#14213d]/15 bg-white p-5 shadow-2xs transition duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#14213d]/60">
              Storage Used
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#14213d]">
              {formatBytes(totalStorage)}
            </p>
            <p className="mt-1 text-xs text-[#14213d]/50 font-medium">Across all documents</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14213d]/10 text-[#14213d] font-bold">
            <HardDrive size={22} />
          </div>
        </div>
      </div>
    </section>
  );
}