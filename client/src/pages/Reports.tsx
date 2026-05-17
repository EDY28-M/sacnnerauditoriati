import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Download, FileText, Plus, Trash2, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Reports() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const { data: projects } = trpc.projects.list.useQuery();
  const { data: reports, isLoading } = trpc.reports.list.useQuery(selectedProjectId || 0, {
    enabled: selectedProjectId !== null,
  });

  const createReportMutation = trpc.reports.create.useMutation({
    onSuccess: () => {
      toast.success("Reporte generado correctamente");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Error al generar el reporte");
    },
  });

  // const deleteReportMutation = trpc.reports.delete.useMutation({
  //   onSuccess: () => {
  //     toast.success("Reporte eliminado correctamente");
  //   },
  //   onError: () => {
  //     toast.error("Error al eliminar el reporte");
  //   },
  // });

  const handleCreateReport = (projectId: number) => {
    createReportMutation.mutate({
      projectId,
      title: `Reporte de Auditoría - ${new Date().toLocaleDateString()}`,
      format: "pdf",
    });
  };

  const handleDeleteReport = (reportId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este reporte?")) {
      // deleteReportMutation.mutate(reportId);
      toast.info("Función de eliminación en desarrollo");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reportes</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Genera y gestiona informes detallados de tus auditorías de seguridad
          </p>
        </div>

        {/* Select Project */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Seleccionar Proyecto</CardTitle>
            <CardDescription>Elige un proyecto para ver o generar reportes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`p-4 border rounded-lg text-left transition ${
                      selectedProjectId === project.id
                        ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-cyan-500/50"
                    }`}
                  >
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {project.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate">
                      {project.targetUrl}
                    </p>
                  </button>
                ))
              ) : (
                <p className="col-span-full text-center text-slate-500 dark:text-slate-400 py-8">
                  No hay proyectos disponibles
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {selectedProjectId && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Reportes Generados</CardTitle>
                <CardDescription>
                  {reports?.length || 0} reportes disponibles
                </CardDescription>
              </div>
              <Button
                onClick={() => handleCreateReport(selectedProjectId)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
                disabled={createReportMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : reports && reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {report.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Generado: {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                      <Badge
                        className={`bg-red-500/10 text-red-400 border-red-500/30`}
                      >
                        PDF
                      </Badge>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.open(`/api/reports/${report.id}/download`, "_blank");
                          }}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Descargar
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.open(`/api/reports/${report.id}/preview`, "_blank");
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={false}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    No hay reportes generados para este proyecto
                  </p>
                  <Button
                    onClick={() => handleCreateReport(selectedProjectId)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generar Primer Reporte
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
