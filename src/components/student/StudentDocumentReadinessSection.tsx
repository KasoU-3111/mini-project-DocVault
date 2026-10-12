// src/components/dashboard/DocumentReadinessSection.tsx
import { CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import { READINESS_RULES } from "../../types/document";
import { getReadiness } from "../../utils/documentUtils";
import type { DocumentItem } from "../../types/document";
interface DocumentReadinessSectionProps {
  documents: DocumentItem[];
}

export default function DocumentReadinessSection({
  documents,
}: DocumentReadinessSectionProps) {
  return (
    <div className="mb-8 rounded-2xl border border-[#14213d]/10 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213d] text-[#fca311] font-bold">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-[#14213d]">Document Readiness Checklist</h3>
          <p className="mt-0.5 text-xs text-[#14213d]/60 font-medium">
            Verify whether you have all required verified documents for key academic activities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(
          Object.keys(READINESS_RULES) as Array<keyof typeof READINESS_RULES>
        ).map((purposeName) => {
          const readiness = getReadiness(purposeName, documents);
          const isComplete = readiness.percentage === 100;

          return (
            <div
              key={purposeName}
              className="rounded-xl border border-[#14213d]/15 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-extrabold text-[#14213d] text-sm">{purposeName}</h4>
                <span
                  className={`text-xs font-bold ${
                    isComplete ? "text-emerald-700" : "text-[#fca311]"
                  }`}
                >
                  {readiness.ready}/{readiness.total}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isComplete ? "bg-emerald-600" : "bg-[#fca311]"
                  }`}
                  style={{ width: `${readiness.percentage}%` }}
                />
              </div>

              <p className="mb-4 text-xs font-bold text-[#14213d]/60">
                {readiness.percentage}% ready
              </p>

              {/* Ready items */}
              {readiness.ready > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-[11px] font-bold text-emerald-800">Ready & Verified</p>
                  <div className="flex flex-wrap gap-1.5">
                    {readiness.categoryResults
                      .filter((item) => item.status === "ready")
                      .map((item) => (
                        <span
                          key={item.category}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800"
                        >
                          <CheckCircle2 size={12} />
                          {item.category}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Pending items */}
              {readiness.pending > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-[11px] font-bold text-[#14213d]">Pending Approval</p>
                  <div className="flex flex-wrap gap-1.5">
                    {readiness.categoryResults
                      .filter((item) => item.status === "pending")
                      .map((item) => (
                        <span
                          key={item.category}
                          className="inline-flex items-center gap-1 rounded-full bg-[#fca311]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#14213d]"
                        >
                          <Clock size={12} />
                          {item.category}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Missing items */}
              {readiness.missing > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-[11px] font-bold text-[#14213d]/60">Missing</p>
                  <div className="flex flex-wrap gap-1.5">
                    {readiness.categoryResults
                      .filter((item) => item.status === "missing")
                      .map((item) => (
                        <span
                          key={item.category}
                          className="inline-flex items-center gap-1 rounded-full bg-[#e5e5e5] px-2.5 py-0.5 text-[11px] font-bold text-[#14213d]/70"
                        >
                          {item.category}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Invalid items */}
              {readiness.invalid > 0 && (
                <div>
                  <p className="mb-1.5 text-[11px] font-bold text-rose-800">Invalid / Expired</p>
                  <div className="flex flex-wrap gap-1.5">
                    {readiness.categoryResults
                      .filter((item) => item.status === "invalid")
                      .map((item) => (
                        <span
                          key={item.category}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800"
                        >
                          <XCircle size={12} />
                          {item.category}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {isComplete && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={15} />
                  All required documents are ready!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}