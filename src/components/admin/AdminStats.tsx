// src/components/admin/AdminStats.tsx
import { FileText, Clock3, CheckCircle2, XCircle } from "lucide-react";

interface Counts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface AdminStatsProps {
  counts: Counts;
  loading: boolean;
}

export default function AdminStats({ counts, loading }: AdminStatsProps) {
  const statCards = [
    {
      label: "Total Documents",
      value: counts.total,
      description: "All submitted documents",
      icon: FileText,
      color: "text-[#14213d]",
      background: "bg-[#14213d]/10",
      border: "border-[#14213d]/15",
      barColor: "bg-[#14213d]",
    },
    {
      label: "Pending Review",
      value: counts.pending,
      description: "Awaiting verification",
      icon: Clock3,
      color: "text-[#fca311]",
      background: "bg-[#fca311]/15",
      border: "border-[#fca311]/30",
      barColor: "bg-[#fca311]",
    },
    {
      label: "Approved",
      value: counts.approved,
      description: "Successfully verified",
      icon: CheckCircle2,
      color: "text-emerald-700",
      background: "bg-emerald-100",
      border: "border-emerald-200",
      barColor: "bg-emerald-600",
    },
    {
      label: "Rejected",
      value: counts.rejected,
      description: "Requires attention",
      icon: XCircle,
      color: "text-rose-700",
      background: "bg-rose-100",
      border: "border-rose-200",
      barColor: "bg-rose-600",
    },
  ];

  return (
    <section className="mt-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#14213d]">Document Overview</h2>
          <p className="mt-0.5 text-xs text-[#14213d]/60 font-medium">
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
              className={`rounded-2xl border ${card.border} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#14213d]/60">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#14213d]">
                    {loading ? "—" : card.value}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.background} ${card.color} font-bold`}
                >
                  <Icon size={22} />
                </div>
              </div>

              <p className="mt-3 text-xs text-[#14213d]/60 font-medium">{card.description}</p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e5e5e5]">
                <div
                  className={`h-full rounded-full ${card.barColor}`}
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
  );
}