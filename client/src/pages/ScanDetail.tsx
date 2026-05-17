import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Clock, Download, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ScanDetail() {
  const [, params] = useRoute("/projects/:projectId/scans/:scanId");
  const projectId = params?.projectId ? parseInt(params.projectId) : 0;
  const scanId = params?.scanId ? parseInt(params.scanId) : 0;

  const { data: scan, isLoading } = trpc.scans.get.useQuery(scanId, {
    enabled: scanId > 0,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30";
      case "High":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      case "Low":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Info":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "running":
        return <Clock className="w-5 h-5 text-cyan-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "running":
        return "En Progreso";
      case "failed":
        return "Fallido";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!scan) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Escaneo no encontrado
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            No pudimos encontrar el escaneo que buscas
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Detalles del Escaneo
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {new Date(scan.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Estado del Escaneo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(scan.status)}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {getStatusLabel(scan.status)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Escaneo iniciado hace{" "}
                    {Math.floor(
                      (new Date().getTime() - new Date(scan.createdAt).getTime()) / 60000
                    )}{" "}
                    minutos
                  </p>
                </div>
              </div>
              <Badge
                className={`border ${
                  scan.status === "completed"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
                    : scan.status === "running"
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                }`}
              >
                {Math.floor(Math.random() * 20)} vulnerabilidades
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vulnerabilities Summary */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Resumen de Vulnerabilidades</CardTitle>
            <CardDescription>Distribución por severidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["Critical", "High", "Medium", "Low", "Info"].map((severity) => (
                <div
                  key={severity}
                  className={`p-4 rounded-lg border ${getSeverityColor(severity)}`}
                >
                  <div className="text-2xl font-bold">
                    {Math.floor(Math.random() * 10)}
                  </div>
                  <div className="text-sm font-medium mt-1">{severity}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="vulnerabilities" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
            <TabsTrigger value="logs">Logs Detallados</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="vulnerabilities">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Vulnerabilidades Detectadas</CardTitle>
              <CardDescription>
                {Math.floor(Math.random() * 20)} vulnerabilidades encontradas
              </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      type: "XSS Reflejado",
                      severity: "High",
                      endpoint: "/search?q=",
                      description: "Parámetro vulnerable a inyección de scripts",
                    },
                    {
                      type: "SQL Injection",
                      severity: "Critical",
                      endpoint: "/api/users",
                      description: "Entrada de usuario no sanitizada en consulta SQL",
                    },
                    {
                      type: "Cabecera CSP Faltante",
                      severity: "Medium",
                      endpoint: "/*",
                      description: "Content-Security-Policy no configurada",
                    },
                  ].map((vuln, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {vuln.type}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {vuln.endpoint}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {vuln.description}
                          </p>
                        </div>
                        <Badge
                          className={`border ${getSeverityColor(vuln.severity)}`}
                        >
                          {vuln.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Logs del Escaneo</CardTitle>
                <CardDescription>Registro detallado de operaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto max-h-96 overflow-y-auto space-y-1">
                  <div className="text-cyan-400">[17:19:23] Iniciando escaneo de seguridad...</div>
                  <div className="text-cyan-400">[17:19:24] Conectando a objetivo: example.com</div>
                  <div className="text-cyan-400">[17:19:25] Analizando estructura del sitio</div>
                  <div className="text-yellow-400">[17:19:26] ⚠ Parámetro vulnerable detectado: /search?q=</div>
                  <div className="text-red-400">[17:19:27] ✗ SQL Injection detectada en /api/users</div>
                  <div className="text-cyan-400">[17:19:28] Analizando cabeceras HTTP</div>
                  <div className="text-yellow-400">[17:19:29] ⚠ CSP no configurada</div>
                  <div className="text-cyan-400">[17:19:30] Completando análisis...</div>
                  <div className="text-green-400">[17:19:31] ✓ Escaneo completado exitosamente</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Timeline del Escaneo</CardTitle>
                <CardDescription>Cronología de eventos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "17:19:23", event: "Escaneo iniciado", status: "completed" },
                    { time: "17:19:25", event: "Análisis de estructura", status: "completed" },
                    { time: "17:19:27", event: "Detección de XSS", status: "completed" },
                    { time: "17:19:29", event: "Análisis de cabeceras", status: "completed" },
                    { time: "17:19:31", event: "Escaneo completado", status: "completed" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                        {idx < 4 && <div className="w-0.5 h-12 bg-slate-300 dark:bg-slate-700 mt-2" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {item.event}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
