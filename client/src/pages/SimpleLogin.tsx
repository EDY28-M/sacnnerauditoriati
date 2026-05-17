import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/local-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas");
        return;
      }

      // Refrescar contexto de auth y redirigir
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SecurityAudit</h1>
          <p className="text-slate-400 mt-1">Plataforma de Auditoría de Seguridad</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Iniciar Sesión</CardTitle>
            <CardDescription className="text-slate-400">
              Accede con tus credenciales de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="admin@tudominio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 block">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 h-11 font-medium shadow-lg shadow-cyan-500/25 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-5 border-t border-slate-700/50">
              <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 space-y-1">
                <p className="font-medium text-slate-300">💡 Credenciales de acceso:</p>
                <p>• <span className="text-slate-300">Email:</span> cualquier correo válido</p>
                <p>• <span className="text-slate-300">Contraseña:</span> tu <code className="text-cyan-400 bg-slate-900/50 px-1 rounded">JWT_SECRET</code> del servidor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
