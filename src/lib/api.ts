import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth-storage";

const base = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

/** JWT `exp` (sekund, UNIX) — brauzerda */
function parseJwtExp(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(pad)) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

/** Access token tugashiga ~2 daqiqa qolganda yangilash — tarmoqda 401 "red" kamayadi */
async function refreshAccessIfNearExpiry(): Promise<void> {
  const ref = getRefreshToken();
  const at = getAccessToken();
  if (!ref || !at) return;
  const exp = parseJwtExp(at);
  if (exp == null) return;
  const now = Date.now() / 1000;
  if (exp - now > 120) return;

  const r2 = await fetch(`${base()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: ref }),
    credentials: "omit",
  });
  if (!r2.ok) return;
  const t = (await r2.json()) as { accessToken: string; refreshToken: string };
  setTokens(t.accessToken, t.refreshToken);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Opt = RequestInit & { _retry?: boolean };

export async function api<T>(path: string, init?: Opt): Promise<T> {
  const publicAuth = path === "/auth/verify" || path === "/auth/phone";
  if (!publicAuth && !init?._retry) {
    await refreshAccessIfNearExpiry();
  }

  const h = new Headers(init?.headers);
  if (!h.has("Content-Type") && init?.body) {
    h.set("Content-Type", "application/json");
  }
  const at = getAccessToken();
  if (at) h.set("Authorization", `Bearer ${at}`);

  const r = await fetch(`${base()}${path}`, { ...init, headers: h });
  if (r.status === 401 && !init?._retry && !publicAuth) {
    const ref = getRefreshToken();
    if (ref) {
      const r2 = await fetch(`${base()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: ref }),
        credentials: "omit",
      });
      if (r2.ok) {
        const t = (await r2.json()) as { accessToken: string; refreshToken: string };
        setTokens(t.accessToken, t.refreshToken);
        return api<T>(path, { ...init, _retry: true });
      }
    }
    clearTokens();
  }

  if (!r.ok) {
    let msg = r.statusText;
    try {
      const j = (await r.json()) as { message?: string | string[] };
      if (j.message) {
        msg = Array.isArray(j.message) ? j.message.join(", ") : j.message;
      }
    } catch {
      /* empty */
    }
    throw new ApiError(r.status, msg);
  }
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${base()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let msg = r.statusText;
    try {
      const j = (await r.json()) as { message?: string | string[] };
      if (j.message) msg = Array.isArray(j.message) ? j.message.join(", ") : j.message;
    } catch {
      /* empty */
    }
    throw new ApiError(r.status, msg);
  }
  return r.json() as Promise<T>;
}
