import { Navigate, Outlet } from "react-router-dom";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";

function AdminRoute() {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const session = await fetchAuthSession();

        const groups =
          session.tokens?.idToken?.payload["cognito:groups"];

        console.log("AdminRoute groups:", groups);

        const isAdmin =
          Array.isArray(groups) &&
          groups.includes("Admins");

        setAllowed(isAdmin);
      } catch (error) {
        console.error("Admin authentication error:", error);
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdmin();
  }, []);

  if (checking) {
    return <div>Checking access...</div>;
  }

  if (!allowed) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;