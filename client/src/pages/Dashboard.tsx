import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Clock, Plus, Shield, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function DashboardContent() {
  const [, navigate] = useLocation();
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "High":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "Low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "paused":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Bienvenido a tu plataforma de auditoría de seguridad
            </p>
          </div>
          <Button
            onClick={() => navigate("/projects/new")}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Proyectos Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {projectsLoading ? <Skeleton className="w-12 h-10" /> : projects?.filter((p) => p.status === "active").length || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                En progreso actualmente
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total de Proyectos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {projectsLoading ? <Skeleton className="w-12 h-10" /> : projects?.length || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Todos los proyectos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {projectsLoading ? <Skeleton className="w-12 h-10" /> : projects?.filter((p) => p.status === "completed").length || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Auditorías finalizadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Archivados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {projectsLoading ? <Skeleton className="w-12 h-10" /> : projects?.filter((p) => p.status === "archived").length || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Proyectos archivados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Proyectos Recientes</CardTitle>
            <CardDescription>Lista de todos tus proyectos de auditoría</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {project.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {project.targetUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {project.severity && (
                        <Badge className={`border ${getSeverityColor(project.severity)}`}>
                          {project.severity}
                        </Badge>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                          {project.status === "active"
                            ? "Activo"
                            : project.status === "completed"
                              ? "Completado"
                              : project.status === "paused"
                                ? "Pausado"
                                : "Archivado"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No tienes proyectos aún
                </p>
                <Button
                  onClick={() => navigate("/projects/new")}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Proyecto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-500" />
                Iniciar Escaneo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Comienza un nuevo escaneo de vulnerabilidades en uno de tus proyectos
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/projects")}
              >
                Ir a Proyectos
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Ver Vulnerabilidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Revisa todas las vulnerabilidades encontradas en tus auditorías
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/vulnerabilities")}
              >
                Ver Todas
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Generar Reportes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Crea informes profesionales de tus auditorías de seguridad
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/reports")}
              >
                Ver Reportes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
