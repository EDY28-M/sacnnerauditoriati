import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  Play,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  ArrowLeft,
  Zap,
  Database,
  Network,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ProjectDetail() {
  const [, navigate] = useLocation();
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const id = parseInt(path.split("/")[2]);
    if (!isNaN(id)) {
      setProjectId(id);
    }
  }, []);

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(projectId!, {
    enabled: projectId !== null,
  });

  const { data: scans, isLoading: scansLoading } = trpc.scans.list.useQuery(projectId!, {
    enabled: projectId !== null,
  });

  const { data: vulnerabilities, isLoading: vulnsLoading } = trpc.vulnerabilities.list.useQuery(
    projectId!,
    { enabled: projectId !== null }
  );

  const { data: stats } = trpc.projects.statistics.useQuery(projectId!, {
    enabled: projectId !== null,
  });

  const createScanMutation = trpc.scans.create.useMutation({
    onSuccess: () => {
      toast.success("Escaneo iniciado correctamente");
    },
    onError: () => {
      toast.error("Error al iniciar el escaneo");
    },
  });

  const handleStartScan = (scanType: string) => {
    if (projectId) {
      createScanMutation.mutate({
        projectId,
        scanType,
        priority: 5,
      });
    }
  };

  if (!projectId) return null;

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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "High":
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case "Medium":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "Low":
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/projects")}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {projectLoading ? <Skeleton className="w-64 h-10" /> : project?.name}
            </h1>
            <div className="text-slate-600 dark:text-slate-400 mt-2">
              {projectLoading ? <Skeleton className="w-96 h-5" /> : project?.targetUrl}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.total || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                Críticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats?.critical || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Altas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats?.high || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Medias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats?.medium || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Bajas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.low || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="scans" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scans">Escaneos</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* Scans Tab */}
          <TabsContent value="scans" className="space-y-4">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Iniciar Nuevo Escaneo</CardTitle>
                <CardDescription>Selecciona el tipo de escaneo que deseas ejecutar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4 hover:border-cyan-500/50"
                    onClick={() => handleStartScan("web_vulnerability")}
                    disabled={createScanMutation.isPending}
                  >
                    <Zap className="w-5 h-5 mb-2 text-cyan-500" />
                    <span className="font-semibold">Vulnerabilidades Web</span>
                    <span className="text-xs text-slate-500 mt-1">XSS, SQLi, CSRF, etc.</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4 hover:border-cyan-500/50"
                    onClick={() => handleStartScan("reconnaissance")}
                    disabled={createScanMutation.isPending}
                  >
                    <Network className="w-5 h-5 mb-2 text-cyan-500" />
                    <span className="font-semibold">Reconocimiento</span>
                    <span className="text-xs text-slate-500 mt-1">Subdominios, puertos, etc.</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4 hover:border-cyan-500/50"
                    onClick={() => handleStartScan("full_audit")}
                    disabled={createScanMutation.isPending}
                  >
                    <Shield className="w-5 h-5 mb-2 text-cyan-500" />
                    <span className="font-semibold">Auditoría Completa</span>
                    <span className="text-xs text-slate-500 mt-1">Todos los escaneos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scans List */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Historial de Escaneos</CardTitle>
              </CardHeader>
              <CardContent>
                {scansLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : scans && scans.length > 0 ? (
                  <div className="space-y-3">
                    {scans.map((scan) => (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            {scan.status === "completed" && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {scan.status === "running" && (
                              <Clock className="w-5 h-5 text-blue-500 animate-spin" />
                            )}
                            {scan.status === "failed" && (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            {scan.status === "pending" && (
                              <Clock className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white capitalize">
                              {scan.scanType.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(scan.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`capitalize ${
                            scan.status === "completed"
                              ? "bg-green-500/10 text-green-400 border-green-500/30"
                              : scan.status === "running"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                          }`}
                        >
                          {scan.status === "running" ? "En progreso" : scan.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No hay escaneos aún
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities" className="space-y-4">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Vulnerabilidades Detectadas</CardTitle>
                <CardDescription>
                  {vulnerabilities?.length || 0} vulnerabilidades encontradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vulnsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : vulnerabilities && vulnerabilities.length > 0 ? (
                  <div className="space-y-3">
                    {vulnerabilities.map((vuln) => (
                      <div
                        key={vuln.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            {getSeverityIcon(vuln.severity)}
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {vuln.title}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {vuln.description}
                              </p>
                            </div>
                          </div>
                          <Badge className={`border ${getSeverityColor(vuln.severity)}`}>
                            {vuln.severity}
                          </Badge>
                        </div>
                        {vuln.affectedUrl && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
                            URL: {vuln.affectedUrl}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No hay vulnerabilidades detectadas
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Reportes Generados</CardTitle>
                <CardDescription>Descarga tus informes de auditoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    No hay reportes generados aún
                  </p>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0">
                    <Download className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
