import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Filter, AlertCircle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Vulnerabilities() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // For demo purposes, we'll fetch vulnerabilities from the first project
  // In a real app, you'd have a global search endpoint
  const { data: projects } = trpc.projects.list.useQuery();
  const firstProjectId = projects?.[0]?.id;

  const { data: vulnerabilities, isLoading } = trpc.vulnerabilities.list.useQuery(
    firstProjectId || 0,
    { enabled: !!firstProjectId }
  );

  const filteredVulnerabilities = vulnerabilities?.filter((vuln) => {
    const matchesSeverity = !selectedSeverity || vuln.severity === selectedSeverity;
    const matchesType = !selectedType || vuln.type === selectedType;
    const matchesSearch =
      !searchTerm ||
      vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSeverity && matchesType && matchesSearch;
  });

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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      xss: "XSS",
      sql_injection: "SQL Injection",
      csrf: "CSRF",
      open_redirect: "Open Redirect",
      missing_security_headers: "Missing Headers",
      insecure_config: "Insecure Config",
      weak_ssl: "Weak SSL",
      exposed_service: "Exposed Service",
      cve: "CVE",
      other: "Otro",
    };
    return labels[type] || type;
  };

  const stats = {
    total: vulnerabilities?.length || 0,
    critical: vulnerabilities?.filter((v) => v.severity === "Critical").length || 0,
    high: vulnerabilities?.filter((v) => v.severity === "High").length || 0,
    medium: vulnerabilities?.filter((v) => v.severity === "Medium").length || 0,
    low: vulnerabilities?.filter((v) => v.severity === "Low").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vulnerabilidades</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Panel de búsqueda y filtrado de vulnerabilidades detectadas
          </p>
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
                {stats.total}
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
                {stats.critical}
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
                {stats.high}
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
                {stats.medium}
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
                {stats.low}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar vulnerabilidades..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Severidad
                </label>
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las severidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Critical">Crítica</SelectItem>
                    <SelectItem value="High">Alta</SelectItem>
                    <SelectItem value="Medium">Media</SelectItem>
                    <SelectItem value="Low">Baja</SelectItem>
                    <SelectItem value="Info">Información</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Tipo
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="xss">XSS</SelectItem>
                    <SelectItem value="sql_injection">SQL Injection</SelectItem>
                    <SelectItem value="csrf">CSRF</SelectItem>
                    <SelectItem value="open_redirect">Open Redirect</SelectItem>
                    <SelectItem value="missing_security_headers">Missing Headers</SelectItem>
                    <SelectItem value="insecure_config">Insecure Config</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              Mostrando {filteredVulnerabilities?.length || 0} vulnerabilidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredVulnerabilities && filteredVulnerabilities.length > 0 ? (
              <div className="space-y-4">
                {filteredVulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
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

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(vuln.type)}
                      </Badge>
                      {vuln.technology && (
                        <Badge variant="outline" className="text-xs">
                          {vuln.technology}
                        </Badge>
                      )}
                      {vuln.cveId && (
                        <Badge variant="outline" className="text-xs">
                          {vuln.cveId}
                        </Badge>
                      )}
                    </div>

                    {vuln.affectedUrl && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 truncate">
                        URL: {vuln.affectedUrl}
                      </p>
                    )}

                    {vuln.recommendation && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          Recomendación:
                        </p>
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          {vuln.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No hay vulnerabilidades que coincidan con los filtros
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
