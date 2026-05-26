import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // ─── Manus OAuth callback (por si se necesita en el futuro) ───────────────
  app.get(["/api/oauth/callback", "/api/oauth/multi-callback"], async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // ─── LOGIN LOCAL (sin Manus) ──────────────────────────────────────────────
  // POST /api/auth/local-login  { email, password }
  app.post("/api/auth/local-login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "email y password son requeridos" });
      return;
    }

    // Contraseña maestra: usa JWT_SECRET como clave de admin
    // O permite acceso solo al owner configurado
    const ADMIN_PASSWORD = ENV.cookieSecret; // Usa el JWT_SECRET como contraseña de admin
    const isValidPassword = password === ADMIN_PASSWORD;

    if (!isValidPassword) {
      res.status(401).json({ error: "Credenciales incorrectas" });
      return;
    }

    try {
      // Crear o recuperar usuario por email
      const openId = `local_${Buffer.from(email).toString("base64").slice(0, 16)}`;
      const isOwner = email.toLowerCase() === (ENV.ownerOpenId || "").toLowerCase() || 
                      openId === ENV.ownerOpenId;

      // Hacer admin si el correo es de administración (como admin@keraai.online)
      const isAdmin = email.toLowerCase() === "admin@keraai.online" || 
                      email.toLowerCase().startsWith("admin@");

      await db.upsertUser({
        openId,
        name: email.split("@")[0],
        email,
        loginMethod: "local",
        lastSignedIn: new Date(),
        role: isAdmin ? "admin" : "viewer",
      });

      // Recuperar usuario
      const user = await db.getUserByOpenId(openId);

      const sessionToken = await sdk.createSessionToken(openId, {
        name: email.split("@")[0],
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log(`[Auth] Local login: ${email} (openId: ${openId})`);
      res.json({ success: true, redirect: "/dashboard" });
    } catch (error) {
      console.error("[Auth] Local login failed", error);
      res.status(500).json({ error: "Error interno al iniciar sesión" });
    }
  });
}
