// src/components/AdminRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface AdminRouteProps {
  children?: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAdmin = async () => {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.idToken?.payload["cognito:groups"];

        const isAdmin = Array.isArray(groups) && groups.includes("Admins");

        if (isMounted) {
          setAllowed(isAdmin);
        }
      } catch (error) {
        console.error("Admin authentication error:", error);
        if (isMounted) {
          setAllowed(false);
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    };

    void checkAdmin();
    return () => {
      isMounted = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#14213d] border-t-[#fca311]" />
          <p className="text-xs font-bold text-[#14213d]">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}