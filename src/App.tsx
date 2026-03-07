// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WorkspaceProvider, useWorkspace } from "@/contexts/WorkspaceContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Financial from "./pages/Financial";
import AgentPerformance from "./pages/AgentPerformance";
import Analytics from "./pages/Analytics";
import LeadsCRM from "./pages/LeadsCRM";
import Properties from "./pages/Properties";
import Marketing from "./pages/Marketing";
import Workspace from "./pages/Workspace";
import UserManagement from "./pages/UserManagement";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { data } = useWorkspace();
  const { user, loading: authLoading } = useAuth();

  if (data.loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0f0f1a, #12131f)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#6366f1", borderTopColor: "transparent" }} />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute permission="view_dashboard"><Index /></ProtectedRoute>} />
      <Route path="/financial" element={<ProtectedRoute permission="view_financial"><Financial /></ProtectedRoute>} />
      <Route path="/agent-performance" element={<ProtectedRoute permission="view_agents"><AgentPerformance /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute permission="view_analytics"><Analytics /></ProtectedRoute>} />
      <Route path="/leads-crm" element={<ProtectedRoute permission="view_leads"><LeadsCRM /></ProtectedRoute>} />
      <Route path="/properties" element={<ProtectedRoute permission="view_properties"><Properties /></ProtectedRoute>} />
      <Route path="/marketing" element={<ProtectedRoute permission="view_marketing"><Marketing /></ProtectedRoute>} />
      <Route path="/workspace" element={<ProtectedRoute permission="view_workspace"><Workspace /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute permission="manage_users"><UserManagement /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Toaster /><Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </WorkspaceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;