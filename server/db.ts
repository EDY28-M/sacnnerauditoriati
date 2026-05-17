import { eq, and, desc, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  auditProjects,
  scans,
  vulnerabilities,
  cveDatabase,
  reports,
  scanLogs,
  reconnaissanceResults,
  scanQueue,
  AuditProject,
  Scan,
  Vulnerability,
  Report,
  ReconnaissanceResult,
  ScanQueueItem,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ AUDIT PROJECT OPERATIONS ============

export async function createAuditProject(
  userId: number,
  name: string,
  targetUrl: string,
  description?: string
): Promise<AuditProject> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(auditProjects).values({
    userId,
    name,
    targetUrl,
    description,
    status: "active",
  });

  const projectId = result[0].insertId;
  const projects = await db
    .select()
    .from(auditProjects)
    .where(eq(auditProjects.id, projectId as number));

  return projects[0];
}

export async function getAuditProjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditProjects)
    .where(eq(auditProjects.userId, userId))
    .orderBy(desc(auditProjects.createdAt));
}

export async function getAuditProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(auditProjects)
    .where(eq(auditProjects.id, projectId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateAuditProject(
  projectId: number,
  updates: Partial<AuditProject>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(auditProjects).set(updates).where(eq(auditProjects.id, projectId));
}

export async function deleteAuditProject(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(auditProjects).where(eq(auditProjects.id, projectId));
}

// ============ SCAN OPERATIONS ============

export async function createScan(
  projectId: number,
  userId: number,
  scanType: string
): Promise<Scan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scans).values({
    projectId,
    userId,
    scanType: scanType as any,
    status: "pending",
    progress: 0,
  });

  const scanId = result[0].insertId;
  const scanResults = await db.select().from(scans).where(eq(scans.id, scanId as number));

  return scanResults[0];
}

export async function getScanById(scanId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(scans).where(eq(scans.id, scanId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getScansByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(scans)
    .where(eq(scans.projectId, projectId))
    .orderBy(desc(scans.createdAt));
}

export async function updateScan(scanId: number, updates: Partial<Scan>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(scans).set(updates).where(eq(scans.id, scanId));
}

// ============ VULNERABILITY OPERATIONS ============

export async function createVulnerability(
  scanId: number,
  projectId: number,
  type: string,
  severity: string,
  title: string,
  description?: string,
  affectedUrl?: string,
  payload?: string,
  recommendation?: string,
  cveId?: string,
  technology?: string
): Promise<Vulnerability> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vulnerabilities).values({
    scanId,
    projectId,
    type: type as any,
    severity: severity as any,
    title,
    description,
    affectedUrl,
    payload,
    recommendation,
    cveId,
    technology,
  });

  const vulnId = result[0].insertId;
  const vulns = await db
    .select()
    .from(vulnerabilities)
    .where(eq(vulnerabilities.id, vulnId as number));

  return vulns[0];
}

export async function getVulnerabilitiesByScan(scanId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(vulnerabilities)
    .where(eq(vulnerabilities.scanId, scanId))
    .orderBy(desc(vulnerabilities.detectedAt));
}

export async function getVulnerabilitiesByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(vulnerabilities)
    .where(eq(vulnerabilities.projectId, projectId))
    .orderBy(desc(vulnerabilities.detectedAt));
}

export async function searchVulnerabilities(
  projectId: number,
  filters?: {
    severity?: string;
    type?: string;
    technology?: string;
  }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(vulnerabilities.projectId, projectId)];

  if (filters?.severity) {
    conditions.push(eq(vulnerabilities.severity, filters.severity as any));
  }
  if (filters?.type) {
    conditions.push(eq(vulnerabilities.type, filters.type as any));
  }
  if (filters?.technology) {
    conditions.push(like(vulnerabilities.technology, `%${filters.technology}%`));
  }

  return db
    .select()
    .from(vulnerabilities)
    .where(and(...conditions))
    .orderBy(desc(vulnerabilities.detectedAt));
}

// ============ REPORT OPERATIONS ============

export async function createReport(
  projectId: number,
  scanId: number | undefined,
  userId: number,
  title: string,
  summary?: string,
  vulnerabilityStats?: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  }
): Promise<Report> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reports).values({
    projectId,
    scanId: scanId || 0,
    userId,
    title,
    summary,
    totalVulnerabilities: vulnerabilityStats?.total || 0,
    criticalCount: vulnerabilityStats?.critical || 0,
    highCount: vulnerabilityStats?.high || 0,
    mediumCount: vulnerabilityStats?.medium || 0,
    lowCount: vulnerabilityStats?.low || 0,
    infoCount: vulnerabilityStats?.info || 0,
    reportFormat: "pdf",
  });

  const reportId = result[0].insertId;
  const reportResults = await db.select().from(reports).where(eq(reports.id, reportId as number));

  return reportResults[0];
}

export async function getReportsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(reports)
    .where(eq(reports.projectId, projectId))
    .orderBy(desc(reports.generatedAt));
}

export async function getReportById(reportId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============ RECONNAISSANCE OPERATIONS ============

export async function createReconnaissanceResult(
  scanId: number,
  projectId: number,
  resultType: string,
  target: string,
  data?: string,
  severity?: string
): Promise<ReconnaissanceResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reconnaissanceResults).values({
    scanId,
    projectId,
    resultType: resultType as any,
    target,
    data,
    severity: severity as any,
  });

  const reconId = result[0].insertId;
  const reconResults = await db
    .select()
    .from(reconnaissanceResults)
    .where(eq(reconnaissanceResults.id, reconId as number));

  return reconResults[0];
}

export async function getReconnaissanceResultsByScan(scanId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(reconnaissanceResults)
    .where(eq(reconnaissanceResults.scanId, scanId))
    .orderBy(desc(reconnaissanceResults.discoveredAt));
}

// ============ SCAN QUEUE OPERATIONS ============

export async function addToScanQueue(
  scanId: number,
  projectId: number,
  priority: number = 5
): Promise<ScanQueueItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scanQueue).values({
    scanId,
    projectId,
    priority,
    status: "queued",
  });

  const queueId = result[0].insertId;
  const queueResults = await db
    .select()
    .from(scanQueue)
    .where(eq(scanQueue.id, queueId as number));

  return queueResults[0];
}

export async function getQueuedScans() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(scanQueue)
    .where(eq(scanQueue.status, "queued"))
    .orderBy(desc(scanQueue.priority));
}

export async function updateQueueStatus(
  queueId: number,
  status: "queued" | "processing" | "completed" | "failed"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(scanQueue).set({ status }).where(eq(scanQueue.id, queueId));
}

// ============ SCAN LOG OPERATIONS ============

export async function addScanLog(
  scanId: number,
  level: "info" | "warning" | "error" | "debug",
  message: string,
  metadata?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(scanLogs).values({
    scanId,
    level,
    message,
    metadata,
  });
}

export async function getScanLogs(scanId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(scanLogs)
    .where(eq(scanLogs.scanId, scanId))
    .orderBy(desc(scanLogs.timestamp));
}

// ============ CVE DATABASE OPERATIONS ============

export async function searchCVEs(query: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(cveDatabase)
    .where(like(cveDatabase.cveId, `%${query}%`))
    .limit(20);
}

export async function getCVEById(cveId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(cveDatabase)
    .where(eq(cveDatabase.cveId, cveId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getCVEsBySeverity(severity: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(cveDatabase)
    .where(eq(cveDatabase.severity, severity as any))
    .orderBy(desc(cveDatabase.publishedDate));
}

// ============ STATISTICS OPERATIONS ============

export async function getProjectStatistics(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const vulns = await db
    .select()
    .from(vulnerabilities)
    .where(eq(vulnerabilities.projectId, projectId));

  const stats = {
    total: vulns.length,
    critical: vulns.filter((v) => v.severity === "Critical").length,
    high: vulns.filter((v) => v.severity === "High").length,
    medium: vulns.filter((v) => v.severity === "Medium").length,
    low: vulns.filter((v) => v.severity === "Low").length,
    info: vulns.filter((v) => v.severity === "Info").length,
  };

  return stats;
}

export async function getUserStatistics(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const projects = await db
    .select()
    .from(auditProjects)
    .where(eq(auditProjects.userId, userId));

  const scansCount = await db.select().from(scans).where(eq(scans.userId, userId));

  return {
    totalProjects: projects.length,
    totalScans: scansCount.length,
    activeProjects: projects.filter((p) => p.status === "active").length,
    completedProjects: projects.filter((p) => p.status === "completed").length,
  };
}
