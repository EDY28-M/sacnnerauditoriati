import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router, TRPCError } from "./_core/trpc";
import {
  createAuditProject,
  getAuditProjectsByUser,
  getAuditProjectById,
  updateAuditProject,
  deleteAuditProject,
  createScan,
  getScansByProject,
  getScanById,
  updateScan,
  getVulnerabilitiesByProject,
  searchVulnerabilities,
  getProjectStatistics,
  getUserStatistics,
  getReportsByProject,
  createReport,
  getReportById,
  getReconnaissanceResultsByScan,
  getScanLogs,
  addScanLog,
  addToScanQueue,
} from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Auditor and above procedure
const auditorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "auditor") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Auditor access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ PROJECT MANAGEMENT ============
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getAuditProjectsByUser(ctx.user.id);
    }),

    create: auditorProcedure.input((data: any) => data).mutation(async ({ ctx, input }) => {
      if (!input.name || !input.targetUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name and target URL are required",
        });
      }

      try {
        new URL(input.targetUrl);
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid URL format",
        });
      }

      return createAuditProject(ctx.user.id, input.name, input.targetUrl, input.description);
    }),

    get: protectedProcedure.input((id: any) => id).query(async ({ input }) => {
      const project = await getAuditProjectById(input);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      return project;
    }),

    update: auditorProcedure.input((data: any) => data).mutation(async ({ ctx, input }) => {
      const project = await getAuditProjectById(input.id);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      await updateAuditProject(input.id, {
        name: input.name,
        description: input.description,
        targetUrl: input.targetUrl,
        status: input.status,
      });

      return getAuditProjectById(input.id);
    }),

    delete: auditorProcedure.input((id: any) => id).mutation(async ({ ctx, input }) => {
      const project = await getAuditProjectById(input);
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }
      if (project.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      await deleteAuditProject(input);
      return { success: true };
    }),

    statistics: protectedProcedure.input((id: any) => id).query(async ({ input }) => {
      return getProjectStatistics(input);
    }),
  }),

  // ============ SCAN MANAGEMENT ============
  scans: router({
    list: protectedProcedure.input((projectId: any) => projectId).query(async ({ input }) => {
      return getScansByProject(input);
    }),

    get: protectedProcedure.input((id: any) => id).query(async ({ input }) => {
      const scan = await getScanById(input);
      if (!scan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Scan not found" });
      }
      return scan;
    }),

    create: auditorProcedure
      .input((data: any) => data)
      .mutation(async ({ ctx, input }) => {
        const project = await getAuditProjectById(input.projectId);
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }

        const scan = await createScan(input.projectId, ctx.user.id, input.scanType);

        // Add to queue for asynchronous processing
        await addToScanQueue(scan.id, input.projectId, input.priority || 5);

        await addScanLog(scan.id, "info", `Scan queued: ${input.scanType}`);

        return scan;
      }),

    update: auditorProcedure
      .input((data: any) => data)
      .mutation(async ({ ctx, input }) => {
        const scan = await getScanById(input.id);
        if (!scan) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Scan not found" });
        }

        await updateScan(input.id, {
          status: input.status,
          progress: input.progress,
          completedAt: input.completedAt,
        });

        return getScanById(input.id);
      }),

    logs: protectedProcedure.input((scanId: any) => scanId).query(async ({ input }) => {
      return getScanLogs(input);
    }),
  }),

  // ============ VULNERABILITY MANAGEMENT ============
  vulnerabilities: router({
    list: protectedProcedure
      .input((projectId: any) => projectId)
      .query(async ({ input }) => {
        return getVulnerabilitiesByProject(input);
      }),

    search: protectedProcedure
      .input((data: any) => data)
      .query(async ({ input }) => {
        return searchVulnerabilities(input.projectId, {
          severity: input.severity,
          type: input.type,
          technology: input.technology,
        });
      }),
  }),

  // ============ REPORTS ============
  reports: router({
    list: protectedProcedure
      .input((projectId: any) => projectId)
      .query(async ({ input }) => {
        return getReportsByProject(input);
      }),

    get: protectedProcedure.input((id: any) => id).query(async ({ input }) => {
      const report = await getReportById(input);
      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }
      return report;
    }),

    create: auditorProcedure
      .input((data: any) => data)
      .mutation(async ({ ctx, input }) => {
        const project = await getAuditProjectById(input.projectId);
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }

        const vulns = await getVulnerabilitiesByProject(input.projectId);
        const stats = {
          total: vulns.length,
          critical: vulns.filter((v) => v.severity === "Critical").length,
          high: vulns.filter((v) => v.severity === "High").length,
          medium: vulns.filter((v) => v.severity === "Medium").length,
          low: vulns.filter((v) => v.severity === "Low").length,
          info: vulns.filter((v) => v.severity === "Info").length,
        };

        return createReport(
          input.projectId,
          input.scanId,
          ctx.user.id,
          input.title,
          input.summary,
          stats
        );
      }),
  }),

  // ============ RECONNAISSANCE ============
  reconnaissance: router({
    list: protectedProcedure
      .input((scanId: any) => scanId)
      .query(async ({ input }) => {
        return getReconnaissanceResultsByScan(input);
      }),
  }),

  // ============ USER MANAGEMENT (ADMIN ONLY) ============
  admin: router({
    userStatistics: adminProcedure
      .input((userId: any) => userId)
      .query(async ({ input }) => {
        return getUserStatistics(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
