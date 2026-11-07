let refreshing;

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function http(path, { body, method, stream = false, retry = true, ...options } = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    method: method || (body === undefined ? "GET" : "POST"),
    headers: { rid: path.startsWith("/auth/") ? "emailpassword" : "session", "fdi-version": "4.1", "st-auth-mode": "cookie", ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...options.headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (response.status === 401 && retry && !path.startsWith("/auth/")) {
    refreshing ||= http("/auth/session/refresh", { method: "POST", retry: false, headers: { rid: "session" } }).finally(() => { refreshing = undefined; });
    try { await refreshing; } catch { window.dispatchEvent(new Event("civis:unauthenticated")); }
    return http(path, { body, method, stream, retry: false, ...options });
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 && !path.startsWith("/auth/")) window.dispatchEvent(new Event("civis:unauthenticated"));
    throw new ApiError(data.error?.code || "internal", data.error?.message || "Request failed.", response.status);
  }
  if (stream) return response;
  return response.status === 204 ? null : response.json();
}

export async function authenticate(mode, { email, pw, name }) {
  const data = await http(`/auth/${mode === "signup" ? "signup" : "signin"}`, {
    body: { formFields: [{ id: "email", value: email }, { id: "password", value: pw }] }, retry: false,
  });
  if (data.status !== "OK") {
    throw new Error(data.formFields?.[0]?.error || (data.status === "EMAIL_ALREADY_EXISTS_ERROR"
      ? "An account with this email already exists. Log in instead." : "Email or password is incorrect."));
  }
  if (mode === "signup") await http("/v1/me", { method: "PATCH", body: { name: name.trim() } });
  return http("/v1/me");
}
