const A = "weblinker_access";
const R = "weblinker_refresh";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(A);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(R);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(A, accessToken);
  localStorage.setItem(R, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(A);
  localStorage.removeItem(R);
}
