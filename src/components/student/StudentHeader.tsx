// src/components/student/StudentHeader.tsx
import { useRef, useEffect, useState } from "react";
import {
  Menu,
  RefreshCw,
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  HardDrive,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface StudentHeaderProps {
  setMobileMenuOpen: (open: boolean) => void;
  loadDocuments: () => Promise<void>;
  loadingDocuments: boolean;
  pendingCount: number;
  expiringCount: number;
  handleLogout: () => void;
}

export default function StudentHeader({
  setMobileMenuOpen,
  loadDocuments,
  loadingDocuments,
  pendingCount,
  expiringCount,
  handleLogout,
}: StudentHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#14213d]/10 pb-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl border border-[#14213d]/20 bg-white p-2.5 text-[#14213d] shadow-2xs lg:hidden cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#14213d]/50">
            Student Workspace
          </p>
          <h1 className="mt-0.5 truncate text-xl font-extrabold text-[#14213d] sm:text-2xl">
            Welcome back, Student! 👋
          </h1>
        </div>
      </div>

      <div ref={navRef} className="flex items-center gap-2.5 sm:gap-3">
        {/* Refresh Button */}
        <button
          type="button"
          onClick={() => void loadDocuments()}
          title="Refresh documents"
          className="flex items-center gap-2 rounded-xl border border-[#14213d]/20 bg-white px-3.5 py-2 text-xs font-bold text-[#14213d] shadow-2xs transition hover:bg-[#14213d] hover:text-white cursor-pointer active:scale-95"
        >
          <RefreshCw
            size={15}
            className={loadingDocuments ? "animate-spin text-[#fca311]" : ""}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#14213d]/20 bg-white text-[#14213d] transition hover:bg-[#14213d] hover:text-white cursor-pointer active:scale-95"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {(pendingCount > 0 || expiringCount > 0) && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#fca311] text-[10px] font-extrabold text-[#14213d] ring-2 ring-white">
                {pendingCount + expiringCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#14213d]/15 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-[#14213d]/10 pb-3">
                <h4 className="font-extrabold text-[#14213d] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Bell size={14} className="text-[#fca311]" /> Document Alerts
                </h4>
              </div>

              <div className="mt-3 space-y-2">
                {pendingCount > 0 && (
                  <a
                    href="#documents"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-start gap-3 rounded-xl bg-[#fca311]/10 p-3 transition hover:bg-[#fca311]/20"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fca311] text-[#14213d]">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#14213d]">Pending Approvals</p>
                      <p className="mt-0.5 text-[11px] text-[#14213d]/70 leading-snug">
                        {pendingCount} document(s) awaiting admin review.
                      </p>
                    </div>
                  </a>
                )}

                {expiringCount > 0 && (
                  <a
                    href="#stats"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-start gap-3 rounded-xl bg-rose-50 p-3 transition hover:bg-rose-100"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-rose-800">Expiring Documents</p>
                      <p className="mt-0.5 text-[11px] text-rose-700 leading-snug">
                        {expiringCount} document(s) expiring soon or expired.
                      </p>
                    </div>
                  </a>
                )}

                {pendingCount === 0 && expiringCount === 0 && (
                  <div className="py-6 text-center text-xs font-semibold text-[#14213d]/50 flex flex-col items-center gap-1.5">
                    <CheckCircle size={20} className="text-emerald-600" />
                    All documents up to date!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#14213d]/20 bg-white p-1.5 pr-2.5 shadow-2xs transition hover:border-[#14213d] cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14213d] font-extrabold text-[#fca311] text-xs">
              S
            </div>
            <span className="hidden text-xs font-bold text-[#14213d] sm:inline">
              Student
            </span>
            <ChevronDown size={14} className="text-[#14213d]/50" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#14213d]/15 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="border-b border-[#14213d]/10 px-3 py-2.5">
                <p className="text-xs font-extrabold text-[#14213d]">Student User</p>
                <p className="text-[11px] text-[#14213d]/50 font-medium">Personal Workspace</p>
              </div>

              <div className="mt-1 space-y-0.5">
                <a
                  href="#overview"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#14213d] transition hover:bg-[#e5e5e5]/50"
                >
                  <User size={15} className="text-[#14213d]/60" /> Account Settings
                </a>
                <a
                  href="#stats"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#14213d] transition hover:bg-[#e5e5e5]/50"
                >
                  <HardDrive size={15} className="text-[#14213d]/60" /> Vault Usage
                </a>
              </div>

              <div className="mt-1 border-t border-[#14213d]/10 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}