import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Edit2, Play, Shield, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const projectSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  targetUrl: z.string().url("URL inválida"),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function Projects() {
  const [, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const createMutation = trpc.projects.create.useMutation();
  const updateMutation = trpc.projects.update.useMutation();
  const deleteMutation = trpc.projects.delete.useMutation();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      targetUrl: "",
      description: "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...data,
        });
        toast.success("Proyecto actualizado correctamente");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Proyecto creado correctamente");
      }
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
    } catch (error) {
      toast.error("Error al guardar el proyecto");
    }
  };

  const handleEdit = (project: any) => {
    form.reset({
      name: project.name,
      targetUrl: project.targetUrl,
      description: project.description || "",
    });
    setEditingId(project.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Proyecto eliminado correctamente");
      } catch (error) {
        toast.error("Error al eliminar el proyecto");
      }
    }
  };

  const getSeverityColor = (severity: string | null) => {
    if (!severity) return "bg-slate-500/10 text-slate-400 border-slate-500/30";
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Proyectos</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gestiona tus proyectos de auditoría de seguridad
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              form.reset();
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </>
          ) : projects && projects.length > 0 ? (
            projects.map((project) => (
              <Card
                key={project.id}
                className="border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="truncate text-xs mt-1">
                        {project.targetUrl}
                      </CardDescription>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {project.description || "Sin descripción"}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    {project.severity && (
                      <Badge className={`border ${getSeverityColor(project.severity)}`}>
                        {project.severity}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {getStatusIcon(project.status)}
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">
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

                  <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/scans`);
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Escanear
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(project);
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No tienes proyectos aún
              </p>
              <Button
                onClick={() => {
                  setEditingId(null);
                  form.reset();
                  setIsDialogOpen(true);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Proyecto
              </Button>
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Proyecto" : "Nuevo Proyecto"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Actualiza los detalles de tu proyecto de auditoría"
                  : "Crea un nuevo proyecto de auditoría de seguridad"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Proyecto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Auditoría API REST" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Objetivo</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        La URL del sitio web a auditar
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe el alcance y objetivos de esta auditoría..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingId ? "Actualizar" : "Crear"} Proyecto
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
