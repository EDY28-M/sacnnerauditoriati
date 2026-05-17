import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Users, Shield, Eye, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Admin() {
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Mock data for users - in a real app, this would come from trpc.admin.listUsers
  const { data: users, isLoading } = { data: [], isLoading: false };
  
  // Mock mutations - in a real app, these would be actual tRPC mutations
  const updateRoleMutation = {
    mutate: (data: any) => {
      toast.success("Rol actualizado correctamente");
    },
    isPending: false,
  };

  const deleteUserMutation = {
    mutate: (userId: number) => {
      toast.success("Usuario eliminado correctamente");
    },
    isPending: false,
  };

  const filteredUsers = users?.filter((user: any) => {
    return !selectedRole || user.role === selectedRole;
  });

  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u: any) => u.role === "admin").length || 0,
    auditors: users?.filter((u: any) => u.role === "auditor").length || 0,
    viewers: users?.filter((u: any) => u.role === "viewer").length || 0,
  };

  const handleUpdateRole = (userId: number, newRole: string) => {
    // updateRoleMutation.mutate({ userId, role: newRole as any });
    toast.info("Función de actualización de rol en desarrollo");
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "auditor":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "viewer":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4 text-red-400" />;
      case "auditor":
        return <Shield className="w-4 h-4 text-cyan-400" />;
      case "viewer":
        return <Eye className="w-4 h-4 text-blue-400" />;
      default:
        return <Users className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Administración</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Gestiona usuarios, roles y permisos de la plataforma
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                Administradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.admins}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                Auditores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {stats.auditors}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Espectadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.viewers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usuarios del Sistema</CardTitle>
                <CardDescription>
                  {filteredUsers?.length || 0} usuarios encontrados
                </CardDescription>
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="viewer">Espectador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers?.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {user.name || "Usuario sin nombre"}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {user.email || "Sin email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => handleUpdateRole(user.id, newRole)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="auditor">Auditor</SelectItem>
                          <SelectItem value="viewer">Espectador</SelectItem>
                        </SelectContent>
                      </Select>

                      <Badge className={`border ${getRoleColor(user.role)} flex items-center gap-1`}>
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </Badge>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No hay usuarios que coincidan con los filtros
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
