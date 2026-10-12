// src/components/admin/AdminSidebar.tsx
import {
  FolderOpen,
  LayoutDashboard,
  FileText,
  Clock3,
  Users,
  BarChart3,
  Sparkles,
  Settings,
  ShieldCheck,
  GraduationCap,
  LogOut,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "documents"
  | "pending"
  | "students"
  | "analytics"
  | "config";

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  totalCounts: number;
  pendingCounts: number;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  setStatusFilter: (status: string) => void;
  handleLogout: () => void;
}

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  totalCounts,
  pendingCounts,
  activeTab,
  setActiveTab,
  setStatusFilter,
  handleLogout,
}: AdminSidebarProps) {
  const getNavItemClass = (tab: AdminTab) =>
    `w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition cursor-pointer ${
      activeTab === tab
        ? "bg-[#fca311] text-[#14213d] shadow-md"
        : "text-[#e5e5e5]/80 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Deep Prussian Blue */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#14213d] text-white transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fca311] text-[#14213d] shadow-md font-bold">
            <FolderOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">DocVault</h1>
            <p className="mt-0.5 text-xs text-[#e5e5e5]/60 font-medium">
              Admin Console
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-4 pt-6 space-y-6 overflow-y-auto">
          {/* Section 1: Workspace */}
          <div>
            <p className="mb-2.5 px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#fca311]">
              Workspace
            </p>

            <nav className="space-y-1.5">
              {/* 1. Overview */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("overview");
                  setStatusFilter("All");
                  setSidebarOpen(false);
                }}
                className={getNavItemClass("overview")}
              >
                <LayoutDashboard size={17} />
                Dashboard Overview
              </button>

              {/* 2. Student Documents */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("documents");
                  setStatusFilter("All");
                  setSidebarOpen(false);
                }}
                className={getNavItemClass("documents")}
              >
                <FileText size={17} />
                Student Documents
                <span
                  className={`ml-auto rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
                    activeTab === "documents"
                      ? "bg-[#14213d] text-white"
                      : "bg-[#fca311] text-[#14213d]"
                  }`}
                >
                  {totalCounts}
                </span>
              </button>

              {/* 3. Pending Reviews */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("pending");
                  setStatusFilter("Pending");
                  setSidebarOpen(false);
                }}
                className={getNavItemClass("pending")}
              >
                <Clock3 size={17} />
                Pending Reviews
                <span
                  className={`ml-auto rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
                    activeTab === "pending"
                      ? "bg-[#14213d] text-[#fca311]"
                      : "bg-white/15 text-[#fca311]"
                  }`}
                >
                  {pendingCounts}
                </span>
              </button>

              {/* 4. Student Directory */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("students");
                  setSidebarOpen(false);
                }}
                className={getNavItemClass("students")}
              >
                <Users size={17} />
                Student Directory
              </button>

              {/* 5. Verification Analytics */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("analytics");
                  setSidebarOpen(false);
                }}
                className={getNavItemClass("analytics")}
              >
                <BarChart3 size={17} />
                Verification Analytics
                <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-extrabold text-emerald-400 border border-emerald-500/30">
                  HOT
                </span>
              </button>
            </nav>
          </div>

          {/* Section 2: System & AI */}
          <div>
            <p className="mb-2.5 px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#fca311]">
              System & AI
            </p>

            <nav className="space-y-1.5">
              {/* 6. Auto-OCR Verification AI */}
              <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#e5e5e5]/40 cursor-not-allowed">
                <Sparkles size={17} className="text-[#fca311]/60" />
                Auto-OCR Verification
                <span className="ml-auto rounded-full bg-[#fca311]/20 px-2 py-0.5 text-[9px] font-extrabold text-[#fca311] border border-[#fca311]/30">
                  AI SOON
                </span>
              </div>

              {/* 7. Vault Configuration */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("config");
                  setSidebarOpen(false);
                }}
                className={getNavItemClass("config")}
              >
                <Settings size={17} />
                Vault Configuration
              </button>
            </nav>
          </div>

          {/* Secure Review Badge */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#fca311]/20 text-[#fca311]">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-xs font-extrabold text-white">Secure Review Active</h3>
            <p className="mt-0.5 text-[10px] leading-relaxed text-[#e5e5e5]/60 font-medium">
              Audit student documents with real-time verification status updates.
            </p>
          </div>
        </div>

        {/* Footer Admin Profile & Logout */}
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="mb-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fca311] text-[#14213d] font-bold">
              <GraduationCap size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold text-white">Administrator</p>
              <p className="text-[10px] font-medium text-[#e5e5e5]/60">Admin Portal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-500/20 hover:border-rose-400 hover:text-rose-300 cursor-pointer"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}