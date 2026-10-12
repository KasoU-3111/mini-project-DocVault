// src/components/layout/StudentLayout.tsx
import { useState } from "react";
import { LogOut, FileText, LayoutDashboard, FolderOpen, CloudUpload, Files, ShieldCheck, Sparkles, Menu, X, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface StudentLayoutProps {
  children: React.ReactNode;
  onRefresh: () => void;
}

export default function StudentLayout({ children, onRefresh }: StudentLayoutProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
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

      <div className="px-4 pt-7 overflow-y-auto flex-1">
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

      <div className="mt-auto p-4 border-t border-white/10">
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
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Sidebar */}
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

        {/* Main Content Area */}
        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-9 lg:py-8 flex flex-col h-full">
          {/* Header */}
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
              <button onClick={onRefresh} title="Refresh documents" className="rounded-xl border border-violet-100 bg-white p-3 text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <RefreshCw size={18} />
              </button>
            </div>
          </header>

          {/* Page Content Goes Here */}
          <div className="flex-1">
            {children}
          </div>

          <footer className="py-7 text-center text-xs text-slate-400 mt-auto">
            <p className="font-semibold text-slate-500">DocVault · College Digital Document Vault</p>
            <p className="mt-1">Organized documents. Clearer next steps.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}