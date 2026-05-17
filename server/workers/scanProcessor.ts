import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import { scans, vulnerabilities } from "../../drizzle/schema";

/**
 * Procesa escaneos pendientes y ejecuta el análisis de vulnerabilidades
 */
export async function processPendingScans() {
  const db = await getDb();
  if (!db) {
    console.warn("[ScanProcessor] Database not available");
    return;
  }

  try {
    // Obtener escaneos pendientes
    const pendingScans = await db
      .select()
      .from(scans)
      .where(eq(scans.status, "pending"))
      .limit(5); // Procesar máximo 5 a la vez

    for (const scan of pendingScans) {
      console.log(`[ScanProcessor] Processing scan ${scan.id} (${scan.scanType})`);

      try {
        // Marcar como en progreso
        await db
          .update(scans)
          .set({ status: "running", startedAt: new Date() })
          .where(eq(scans.id, scan.id));

        // Simular análisis de vulnerabilidades
        const foundVulnerabilities = generateMockVulnerabilities(scan.scanType);

        // Guardar vulnerabilidades encontradas
        for (const vuln of foundVulnerabilities) {
          await db.insert(vulnerabilities).values({
            scanId: scan.id,
            projectId: scan.projectId,
            type: vuln.type,
            severity: vuln.severity,
            title: vuln.title,
            description: vuln.description,
            affectedUrl: vuln.affectedUrl,
            recommendation: vuln.recommendation,
            detectedAt: new Date(),
          });
        }

        // Marcar como completado
        await db
          .update(scans)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(scans.id, scan.id));

        console.log(
          `[ScanProcessor] Scan ${scan.id} completed. Found ${foundVulnerabilities.length} vulnerabilities`
        );
      } catch (error) {
        console.error(`[ScanProcessor] Error processing scan ${scan.id}:`, error);

        // Marcar como fallido
        await db
          .update(scans)
          .set({ status: "failed", completedAt: new Date() })
          .where(eq(scans.id, scan.id));
      }
    }
  } catch (error) {
    console.error("[ScanProcessor] Error:", error);
  }
}

/**
 * Genera vulnerabilidades mock basadas en el tipo de escaneo
 */
function generateMockVulnerabilities(scanType: string) {
  const vulnerabilities: any[] = [];

  if (scanType === "web_vulnerability_scan") {
    // XSS
    vulnerabilities.push({
      type: "xss",
      severity: "High",
      title: "Reflected XSS in search parameter",
      description:
        "The search parameter is vulnerable to reflected cross-site scripting (XSS). User input is not properly sanitized before being reflected in the response.",
      affectedUrl: "/search?q=",
      recommendation: "Implement input validation and output encoding for all user inputs.",
    });

    // SQL Injection
    vulnerabilities.push({
      type: "sql_injection",
      severity: "Critical",
      title: "SQL Injection in login form",
      description:
        "The login form is vulnerable to SQL injection. The application does not use parameterized queries.",
      affectedUrl: "/login",
      recommendation: "Use parameterized queries or prepared statements for all database operations.",
    });

    // CSRF
    vulnerabilities.push({
      type: "csrf",
      severity: "Medium",
      title: "Missing CSRF token",
      description:
        "The application does not implement CSRF protection tokens on state-changing operations.",
      affectedUrl: "/api/user/update",
      recommendation: "Implement CSRF tokens for all state-changing operations.",
    });

    // Missing Security Headers
    vulnerabilities.push({
      type: "missing_security_headers",
      severity: "Medium",
      title: "Missing Content-Security-Policy header",
      description:
        "The Content-Security-Policy header is not set, allowing potential XSS attacks.",
      affectedUrl: "/",
      recommendation: "Add Content-Security-Policy header to all responses.",
    });
  } else if (scanType === "reconnaissance") {
    // Subdomain enumeration
    vulnerabilities.push({
      type: "subdomain_discovered",
      severity: "Low",
      title: "Subdomain discovered: admin.example.com",
      description: "A subdomain was discovered during reconnaissance.",
      affectedUrl: "admin.example.com",
      recommendation: "Review subdomain security and access controls.",
    });

    // SSL/TLS issues
    vulnerabilities.push({
      type: "ssl_tls_issue",
      severity: "High",
      title: "Weak SSL/TLS configuration",
      description: "The server uses outdated SSL/TLS protocols or weak cipher suites.",
      affectedUrl: "https://example.com",
      recommendation: "Update to TLS 1.2+ and use strong cipher suites.",
    });
  }

  return vulnerabilities;
}

/**
 * Inicia el procesador de escaneos con intervalo
 */
export function startScanProcessor(intervalMs: number = 5000) {
  console.log(`[ScanProcessor] Starting scan processor with ${intervalMs}ms interval`);

  // Procesar inmediatamente
  processPendingScans();

  // Procesar cada X milisegundos
  const interval = setInterval(() => {
    processPendingScans();
  }, intervalMs);

  return interval;
}
