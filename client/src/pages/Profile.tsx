import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    toast.success("Perfil actualizado correctamente");
    setIsEditing(false);
  };

  const handleLogout = async () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      await logout();
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "auditor":
        return "Auditor";
      case "viewer":
        return "Espectador";
      default:
        return "Usuario";
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "auditor":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
      case "viewer":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mi Perfil</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Tus datos de usuario en la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {user?.name || "Usuario sin nombre"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {user?.email || "Sin email registrado"}
                </p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Rol
              </Label>
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getRoleColor(user?.role)}`}>
                <Shield className="w-4 h-4" />
                <span className="font-medium">{getRoleLabel(user?.role)}</span>
              </div>
            </div>

            {/* User Details */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre
                  </div>
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-slate-300 dark:border-slate-600"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium">
                    {user?.name || "No especificado"}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-slate-300 dark:border-slate-600"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium">
                    {user?.email || "No especificado"}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Miembro desde
                  </div>
                </Label>
                <p className="text-slate-900 dark:text-white font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No especificado"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Último acceso
                  </div>
                </Label>
                <p className="text-slate-900 dark:text-white font-medium">
                  {user?.lastSignedIn
                    ? new Date(user.lastSignedIn).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No especificado"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
                  >
                    Guardar Cambios
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Gestiona tu acceso a la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Sesión Activa</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Tu sesión está activa y segura
                </p>
              </div>
              <Button
                variant="outline"
                className="text-red-500 hover:text-red-600 border-red-200 dark:border-red-800"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
