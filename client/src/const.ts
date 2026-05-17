export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Dominio de Manus autorizado para OAuth — actúa como proxy
const MANUS_PROXY_DOMAIN = "https://securaudit-r7nqp9qd.manus.space";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const currentOrigin = window.location.origin;

  // Si ya estamos en el dominio de Manus, usamos el callback directo
  // Si estamos en otro dominio (ej: audit.keraai.online), redirigimos a través del proxy
  const isManusDomain = currentOrigin.includes("manus.space") || currentOrigin.includes("manus.computer");

  let redirectUri: string;
  if (isManusDomain) {
    redirectUri = `${currentOrigin}/api/oauth/callback`;
  } else {
    // Usamos el proxy de Manus que SÍ está autorizado, pasamos nuestro origen para que nos devuelva aquí
    redirectUri = `${MANUS_PROXY_DOMAIN}/api/oauth/callback?returnTo=${encodeURIComponent(currentOrigin)}`;
  }

  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
