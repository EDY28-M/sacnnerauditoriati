import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  index,
  unique,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for security auditing.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "auditor", "viewer"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Audit projects table - represents security audit engagements
 */
export const auditProjects = mysqlTable(
  "audit_projects",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    targetUrl: varchar("target_url", { length: 2048 }).notNull(),
    status: mysqlEnum("status", ["active", "completed", "paused", "archived"]).default("active").notNull(),
    severity: mysqlEnum("severity", ["Critical", "High", "Medium", "Low", "Info"]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userIdIdx: index("idx_user_id").on(table.userId),
    statusIdx: index("idx_status").on(table.status),
  })
);

export type AuditProject = typeof auditProjects.$inferSelect;
export type InsertAuditProject = typeof auditProjects.$inferInsert;

/**
 * Scans table - represents individual security scans/audits
 */
export const scans = mysqlTable(
  "scans",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("project_id").notNull(),
    userId: int("user_id").notNull(),
    scanType: mysqlEnum("scan_type", [
      "web_vulnerability",
      "reconnaissance",
      "ssl_analysis",
      "technology_fingerprint",
      "port_scan",
      "full_audit",
    ]).notNull(),
    status: mysqlEnum("status", ["pending", "running", "completed", "failed", "cancelled"]).default("pending").notNull(),
    progress: int("progress").default(0),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    logs: text("logs"),
    errorMessage: text("error_message"),
  },
  (table) => ({
    projectIdIdx: index("idx_project_id").on(table.projectId),
    statusIdx: index("idx_scan_status").on(table.status),
    userIdIdx: index("idx_scan_user_id").on(table.userId),
  })
);

export type Scan = typeof scans.$inferSelect;
export type InsertScan = typeof scans.$inferInsert;

/**
 * Vulnerabilities table - stores detected vulnerabilities
 */
export const vulnerabilities = mysqlTable(
  "vulnerabilities",
  {
    id: int("id").autoincrement().primaryKey(),
    scanId: int("scan_id").notNull(),
    projectId: int("project_id").notNull(),
    type: mysqlEnum("type", [
      "xss",
      "sql_injection",
      "csrf",
      "open_redirect",
      "missing_security_headers",
      "insecure_config",
      "weak_ssl",
      "exposed_service",
      "cve",
      "other",
    ]).notNull(),
    severity: mysqlEnum("severity", ["Critical", "High", "Medium", "Low", "Info"]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    affectedUrl: varchar("affected_url", { length: 2048 }),
    payload: text("payload"),
    recommendation: text("recommendation"),
    cveId: varchar("cve_id", { length: 20 }),
    technology: varchar("technology", { length: 255 }),
    detectedAt: timestamp("detected_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    scanIdIdx: index("idx_vuln_scan_id").on(table.scanId),
    projectIdIdx: index("idx_vuln_project_id").on(table.projectId),
    severityIdx: index("idx_severity").on(table.severity),
    typeIdx: index("idx_vuln_type").on(table.type),
    cveIdIdx: index("idx_cve_id").on(table.cveId),
  })
);

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = typeof vulnerabilities.$inferInsert;

/**
 * CVE Database table - stores known CVE information
 */
export const cveDatabase = mysqlTable(
  "cve_database",
  {
    id: int("id").autoincrement().primaryKey(),
    cveId: varchar("cve_id", { length: 20 }).notNull().unique(),
    description: text("description"),
    baseScore: decimal("base_score", { precision: 3, scale: 1 }),
    severity: mysqlEnum("severity", ["Critical", "High", "Medium", "Low", "Info"]),
    affectedSoftware: text("affected_software"),
    publishedDate: datetime("published_date"),
    modifiedDate: datetime("modified_date"),
    references: text("references"),
    tags: text("tags"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    cveIdIdx: index("idx_cve_database_id").on(table.cveId),
    severityIdx: index("idx_cve_severity").on(table.severity),
  })
);

export type CveEntry = typeof cveDatabase.$inferSelect;
export type InsertCveEntry = typeof cveDatabase.$inferInsert;

/**
 * Reports table - stores generated audit reports
 */
export const reports = mysqlTable(
  "reports",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("project_id").notNull(),
    scanId: int("scan_id").notNull(),
    userId: int("user_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary"),
    totalVulnerabilities: int("total_vulnerabilities").default(0),
    criticalCount: int("critical_count").default(0),
    highCount: int("high_count").default(0),
    mediumCount: int("medium_count").default(0),
    lowCount: int("low_count").default(0),
    infoCount: int("info_count").default(0),
    reportFormat: mysqlEnum("report_format", ["pdf", "html", "json"]).default("pdf"),
    reportUrl: varchar("report_url", { length: 2048 }),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index("idx_report_project_id").on(table.projectId),
    scanIdIdx: index("idx_report_scan_id").on(table.scanId),
    userIdIdx: index("idx_report_user_id").on(table.userId),
  })
);

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Scan logs table - detailed logging for audit trails
 */
export const scanLogs = mysqlTable(
  "scan_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    scanId: int("scan_id").notNull(),
    level: mysqlEnum("level", ["info", "warning", "error", "debug"]).default("info"),
    message: text("message").notNull(),
    metadata: text("metadata"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    scanIdIdx: index("idx_log_scan_id").on(table.scanId),
    levelIdx: index("idx_log_level").on(table.level),
  })
);

export type ScanLog = typeof scanLogs.$inferSelect;
export type InsertScanLog = typeof scanLogs.$inferInsert;

/**
 * Reconnaissance results table - stores subdomain, SSL, and port scan data
 */
export const reconnaissanceResults = mysqlTable(
  "reconnaissance_results",
  {
    id: int("id").autoincrement().primaryKey(),
    scanId: int("scan_id").notNull(),
    projectId: int("project_id").notNull(),
    resultType: mysqlEnum("result_type", [
      "subdomain",
      "ssl_certificate",
      "technology",
      "port",
      "service",
    ]).notNull(),
    target: varchar("target", { length: 2048 }).notNull(),
    data: text("data"),
    severity: mysqlEnum("severity", ["Critical", "High", "Medium", "Low", "Info"]),
    discoveredAt: timestamp("discovered_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    scanIdIdx: index("idx_recon_scan_id").on(table.scanId),
    projectIdIdx: index("idx_recon_project_id").on(table.projectId),
    resultTypeIdx: index("idx_result_type").on(table.resultType),
  })
);

export type ReconnaissanceResult = typeof reconnaissanceResults.$inferSelect;
export type InsertReconnaissanceResult = typeof reconnaissanceResults.$inferInsert;

/**
 * Scan queue table - manages asynchronous scan task queue
 */
export const scanQueue = mysqlTable(
  "scan_queue",
  {
    id: int("id").autoincrement().primaryKey(),
    scanId: int("scan_id").notNull().unique(),
    projectId: int("project_id").notNull(),
    priority: int("priority").default(5),
    status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued"),
    attempts: int("attempts").default(0),
    maxAttempts: int("max_attempts").default(3),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
  },
  (table) => ({
    statusIdx: index("idx_queue_status").on(table.status),
    priorityIdx: index("idx_priority").on(table.priority),
  })
);

export type ScanQueueItem = typeof scanQueue.$inferSelect;
export type InsertScanQueueItem = typeof scanQueue.$inferInsert;
