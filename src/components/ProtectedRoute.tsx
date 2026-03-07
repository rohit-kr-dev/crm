// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  permission?: string;
}

const ProtectedRoute = ({ children, permission }: Props) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#6366f1", borderTopColor: "transparent" }} />
          <p className="text-sm text-slate-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile.isActive) {
    return <Navigate to="/login" state={{ error: "Account deactivated." }} replace />;
  }

  if (permission && !PERMISSIONS[profile.role]?.includes(permission)) {
    return (
      <div className="flex min-h-screen items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f)" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-4">Your role <span className="text-indigo-400 font-semibold">{profile.role}</span> doesn't have permission to view this page.</p>
          <a href="/" className="text-indigo-400 text-sm hover:underline">← Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

import { PERMISSIONS } from "@/contexts/AuthContext";
export default ProtectedRoute;