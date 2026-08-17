import "server-only";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiFetchOptions {
  headers?: Record<string, string>;
  auth?: boolean;
  method?: string;
  revalidate?: number;
  cache?: RequestCache;
  body?: BodyInit | null;
  tags?: string[];
}

export function getApiUrl(path: string): string {
  const base = (process.env.API_URL || "").replace(/\/$/, "");

  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${base}${normalizedPath}`;
}

export async function apiFetch(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...opts.headers,
  };

  if (opts.auth) {
    const { cookies } = await import("next/headers");

    const token = (await cookies()).get("auth_token")?.value;

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers,
    body: opts.body,
  };

  if (opts.cache) {
    init.cache = opts.cache;
  } else {
    init.next = {
      revalidate: opts.revalidate ?? 3600,
      ...(opts.tags ? { tags: opts.tags } : {}),
    };
  }

  const response = await fetch(
    getApiUrl(path),
    init,
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new ApiError(
      errorText ||
        `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return response;
}


export async function apiGet<T>(
  path: string,
  opts?: ApiFetchOptions,
): Promise<T> {
  const response = await apiFetch(path, {
    ...opts,
    method: "GET",
  });

  return response.json() as Promise<T>;
}