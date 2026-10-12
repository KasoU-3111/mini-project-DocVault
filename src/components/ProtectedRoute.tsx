// src/components/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export interface ProtectedRouteProps {
  allowedRole?: "student" | "admin";
  children?: ReactNode;
}

export default function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#14213d] border-t-[#fca311]" />
          <p className="text-xs font-bold text-[#14213d]">Authenticating session...</p>
        </div>
      </div>
    );
  }

  // 1. Not logged in -> Send strictly to /login (NOT '/')
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check role redirection
  const userRole = (user.role || "").toLowerCase();

  if (allowedRole && userRole !== allowedRole.toLowerCase()) {
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}