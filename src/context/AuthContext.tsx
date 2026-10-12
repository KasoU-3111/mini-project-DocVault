// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, fetchAuthSession, signOut } from "aws-amplify/auth";

export interface AuthUser {
  username: string;
  userId: string;
  role: "admin" | "student";
  email?: string;
  groups?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  checkUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkUser = async (): Promise<AuthUser | null> => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      // Force refresh the session tokens to get the updated Cognito groups
      const session = await fetchAuthSession({ forceRefresh: true });

      const groups =
        (session.tokens?.idToken?.payload["cognito:groups"] as string[]) || [];
      const isAdmin = Array.isArray(groups) && groups.includes("Admins");
      const userRole: "admin" | "student" = isAdmin ? "admin" : "student";

      const formattedUser: AuthUser = {
        username: currentUser.username,
        userId: currentUser.userId,
        role: userRole,
        groups,
      };

      setUser(formattedUser);
      return formattedUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkUser();
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await signOut({ global: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}