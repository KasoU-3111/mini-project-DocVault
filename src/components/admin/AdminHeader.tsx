// src/components/admin/AdminHeader.tsx
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  RefreshCw,
  Bell,
  User,
  HardDrive,
  LogOut,
  ChevronDown,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void;
  handleRefresh: () => void;
  refreshing: boolean;
  pendingCount?: number;
}

export default function AdminHeader({
  setSidebarOpen,
  handleRefresh,
  refreshing,
  pendingCount = 0,
}: AdminHeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#14213d]/10 bg-white/90 backdrop-blur-md">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-[#14213d]/20 p-2 lg:hidden text-[#14213d] hover:bg-[#e5e5e5]/50 cursor-pointer"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#14213d]/50">
              DocVault / Admin
            </p>
            <h2 className="mt-0.5 truncate text-lg font-extrabold text-[#14213d] sm:text-xl">
              Admin Control Center
            </h2>
          </div>
        </div>

        <div ref={navRef} className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-[#14213d]/20 bg-white px-3 py-2 text-xs font-bold text-[#14213d] shadow-2xs transition hover:bg-[#14213d] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 cursor-pointer"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin text-[#fca311]" : ""}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>

          {/* Interactive Notification Bell */}
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
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#fca311] text-[10px] font-extrabold text-[#14213d] ring-2 ring-white">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#14213d]/15 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-[#14213d]/10 pb-3">
                  <h4 className="font-extrabold text-[#14213d] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Bell size={14} className="text-[#fca311]" /> Alerts & Updates
                  </h4>
                  <span className="rounded-full bg-[#fca311]/20 px-2 py-0.5 text-[10px] font-bold text-[#14213d]">
                    {pendingCount} pending
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {pendingCount > 0 ? (
                    <a
                      href="#documents"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-start gap-3 rounded-xl bg-[#fca311]/10 p-3 transition hover:bg-[#fca311]/20"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fca311] text-[#14213d]">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#14213d]">
                          Pending Submissions
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#14213d]/70 leading-snug">
                          {pendingCount} student document(s) awaiting verification.
                        </p>
                      </div>
                    </a>
                  ) : (
                    <div className="py-6 text-center text-xs font-semibold text-[#14213d]/50 flex flex-col items-center gap-1.5">
                      <CheckCircle2 size={20} className="text-emerald-600" />
                      All submissions verified!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Dropdown */}
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
                A
              </div>
              <span className="hidden text-xs font-bold text-[#14213d] sm:inline">
                Admin
              </span>
              <ChevronDown size={14} className="text-[#14213d]/50" />
            </button>

            {/* Profile Menu Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#14213d]/15 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="border-b border-[#14213d]/10 px-3 py-2.5">
                  <p className="text-xs font-extrabold text-[#14213d]">Administrator</p>
                  <p className="text-[11px] text-[#14213d]/50 font-medium">
                    admin@docvault.edu
                  </p>
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
                    href="#documents"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#14213d] transition hover:bg-[#e5e5e5]/50"
                  >
                    <HardDrive size={15} className="text-[#14213d]/60" /> Vault Storage
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
      </div>
    </header>
  );
}