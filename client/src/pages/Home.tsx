import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, BarChart3, Lock, ArrowRight, Github } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SecurityAudit</span>
          </div>
          <a href="#" className="text-slate-400 hover:text-slate-200 transition">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
            Plataforma de Auditoría de Seguridad Profesional
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Auditoría de Seguridad Web
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Elegante y Completa
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Plataforma profesional para equipos de seguridad. Gestiona proyectos, ejecuta escaneos de
            vulnerabilidades y genera reportes detallados con precisión.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
              onClick={() => navigate("/login")}
            >
              Comenzar Auditoría <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Ver Documentación
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">Escaneo Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Análisis de vulnerabilidades web en tiempo real. Detección de XSS, SQL Injection,
                CSRF y más.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">Reportes Detallados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Genera informes profesionales con severidades (Critical, High, Medium, Low, Info) y
                recomendaciones.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">Gestión Segura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Control de acceso basado en roles, historial de auditorías y seguimiento completo
                de cambios.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Funcionalidades Principales</h3>
            <ul className="space-y-4">
              {[
                "Dashboard con estadísticas en tiempo real",
                "Gestión de proyectos de auditoría",
                "Motor de escaneo de vulnerabilidades web",
                "Integración con base de datos CVE/NVD",
                "Módulo de reconocimiento (subdominios, SSL, fingerprinting)",
                "Sistema de reportes profesionales",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Características Avanzadas</h3>
            <ul className="space-y-4">
              {[
                "Escaneos concurrentes sin bloqueo de interfaz",
                "Historial de escaneos con logs detallados",
                "Comparativa entre auditorías anteriores",
                "Panel de búsqueda y filtrado avanzado",
                "Autenticación segura con roles de usuario",
                "API profesional para integraciones",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar tu auditoría?
          </h2>
          <p className="text-slate-400 mb-8">
            Accede a la plataforma y comienza a auditar webs de forma profesional.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
            onClick={() => navigate("/login")}
          >
            Inicia Sesión Ahora <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-400">© 2026 SecurityAudit Platform</span>
            </div>
            <p className="text-slate-500 text-sm">Auditoría de Seguridad Profesional</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
