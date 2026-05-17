import { useAuth } from "@/_core/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "auditor" | "viewer";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [localUser, setLocalUser] = useState<any>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Intentar obtener usuario del localStorage como fallback
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setLocalUser(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing stored user", e);
      }
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (loading) return;

    const hasAuth = isAuthenticated || localUser;

    if (!hasAuth) {
      navigate("/login");
      return;
    }

    const currentUser = user || localUser;
    if (requiredRole && currentUser?.role !== requiredRole && currentUser?.role !== "admin") {
      navigate("/");
      return;
    }
  }, [checked, loading, isAuthenticated, user, localUser, requiredRole, navigate]);

  if (!checked || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const hasAuth = isAuthenticated || localUser;
  if (!hasAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Redirigiendo...</h1>
          <p className="text-slate-400">Por favor espera mientras te redirigimos al login.</p>
        </div>
      </div>
    );
  }

  const currentUser = user || localUser;
  if (requiredRole && currentUser?.role !== requiredRole && currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Denegado</h1>
          <p className="text-slate-400">No tienes permiso para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
