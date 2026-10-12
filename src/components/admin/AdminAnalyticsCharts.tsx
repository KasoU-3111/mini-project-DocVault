// src/components/admin/AdminAnalyticsCharts.tsx
import { useMemo } from "react";
import { BarChart3, PieChart } from "lucide-react";
import type { DocumentItem } from "../../types/admin";

interface AdminAnalyticsChartsProps {
  documents: DocumentItem[];
}

export default function AdminAnalyticsCharts({ documents }: AdminAnalyticsChartsProps) {
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    documents.forEach((doc) => {
      const cat = doc.category || "Others";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [documents]);

  const statusStats = useMemo(() => {
    const total = documents.length || 1;
    const approved = documents.filter((d) => d.status === "Approved").length;
    const pending = documents.filter((d) => d.status === "Pending").length;
    const rejected = documents.filter((d) => d.status === "Rejected").length;

    return {
      approvedPct: Math.round((approved / total) * 100),
      pendingPct: Math.round((pending / total) * 100),
      rejectedPct: Math.round((rejected / total) * 100),
      approved,
      pending,
      rejected,
      total: documents.length,
    };
  }, [documents]);

  const maxCategoryCount = useMemo(() => {
    return Math.max(...categoryStats.map((c) => c.count), 1);
  }, [categoryStats]);

  return (
    <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <div className="rounded-2xl border border-[#14213d]/10 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213d] text-[#fca311] font-bold">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-[#14213d]">Category Distribution</h3>
            <p className="text-xs text-[#14213d]/60 font-medium">Submissions categorized by type</p>
          </div>
        </div>

        {categoryStats.length === 0 ? (
          <p className="text-xs font-semibold text-[#14213d]/40 text-center py-8">No document data available.</p>
        ) : (
          <div className="space-y-4">
            {categoryStats.map((item) => {
              const percentage = Math.round((item.count / maxCategoryCount) * 100);
              return (
                <div key={item.name}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#14213d]">{item.name}</span>
                    <span className="text-[#fca311]">{item.count} docs</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#e5e5e5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#14213d] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verification Rate */}
      <div className="rounded-2xl border border-[#14213d]/10 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
            <PieChart size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-[#14213d]">Verification Rate</h3>
            <p className="text-xs text-[#14213d]/60 font-medium">Approval vs Pending status overview</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-emerald-700">Approved</span>
              <span className="text-emerald-700">{statusStats.approved} ({statusStats.approvedPct}%)</span>
            </div>
            <div className="h-2.5 w-full bg-[#e5e5e5] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${statusStats.approvedPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#fca311]">Pending Review</span>
              <span className="text-[#fca311]">{statusStats.pending} ({statusStats.pendingPct}%)</span>
            </div>
            <div className="h-2.5 w-full bg-[#e5e5e5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#fca311] rounded-full transition-all duration-500"
                style={{ width: `${statusStats.pendingPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-rose-700">Rejected</span>
              <span className="text-rose-700">{statusStats.rejected} ({statusStats.rejectedPct}%)</span>
            </div>
            <div className="h-2.5 w-full bg-[#e5e5e5] rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-600 rounded-full transition-all duration-500"
                style={{ width: `${statusStats.rejectedPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}