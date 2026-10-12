// src/components/student/StudentSidebar.tsx
import {
  FileText,
  LayoutDashboard,
  FolderOpen,
  CloudUpload,
  BarChart2,
  ShieldCheck,
  Sparkles,
  LogOut,
} from "lucide-react";

export type StudentTab = "overview" | "documents" | "upload" | "stats" | "readiness";

interface StudentSidebarProps {
  activeTab: StudentTab;
  setActiveTab: (tab: StudentTab) => void;
  handleLogout: () => void;
}

export default function StudentSidebar({
  activeTab,
  setActiveTab,
  handleLogout,
}: StudentSidebarProps) {
  const getNavItemClass = (tab: StudentTab) =>
    `w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold transition cursor-pointer ${
      activeTab === tab
        ? "bg-[#fca311] text-[#14213d] shadow-md"
        : "text-[#e5e5e5]/80 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="flex h-full flex-col bg-[#14213d] text-white">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fca311] text-[#14213d] shadow-md font-bold">
          <FileText size={24} />
        </div>
        <div>
          <p className="text-xl font-extrabold tracking-tight text-white">DocVault</p>
          <p className="text-xs text-[#e5e5e5]/60 font-medium">Student Workspace</p>
        </div>
      </div>

      {/* Workspace Navigation */}
      <div className="px-4 pt-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-[#fca311]">
          Workspace
        </p>
        <nav className="space-y-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={getNavItemClass("overview")}
          >
            <LayoutDashboard size={18} />
            Dashboard Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={getNavItemClass("documents")}
          >
            <FolderOpen size={18} />
            My Documents
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={getNavItemClass("upload")}
          >
            <CloudUpload size={18} />
            Upload Hub
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={getNavItemClass("stats")}
          >
            <BarChart2 size={18} />
            Vault Analytics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("readiness")}
            className={getNavItemClass("readiness")}
          >
            <ShieldCheck size={18} />
            Readiness Tracker
          </button>
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="mt-auto p-4 border-t border-white/10">
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white">
            <Sparkles size={16} className="text-[#fca311]" /> Vault Secure
          </div>
          <p className="text-[11px] leading-relaxed text-[#e5e5e5]/60">
            Keep your academic documents verified and ready for college portals.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-500/20 hover:border-rose-400 hover:text-rose-300 cursor-pointer"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}