import type { ApiResponse, FilterParams, PaginatedResponse, UUID } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const API_TIMEOUT = 30000;

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  params?: FilterParams;
  timeout?: number;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, timeout = API_TIMEOUT, headers, ...fetchOptions } = options;

  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(key, String(v));
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  const token = getAuthToken();
  if (token) {
    (defaultHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers: defaultHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      const errorData = isJson ? await response.json() : await response.text();
      throw new ApiError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData?.code,
        errorData?.errors,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return isJson ? await response.json() : ((await response.text()) as T);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408, "TIMEOUT");
    }

    throw new ApiError(error instanceof Error ? error.message : "Network error", 0, "NETWORK_ERROR");
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
}

export function setAuthToken(token: string, remember = false): void {
  if (remember) {
    localStorage.setItem("auth_token", token);
  } else {
    sessionStorage.setItem("auth_token", token);
  }
}

export function clearAuthToken(): void {
  localStorage.removeItem("auth_token");
  sessionStorage.removeItem("auth_token");
}

export const api = {
  get: <T>(endpoint: string, params?: FilterParams) => request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, data: unknown, params?: FilterParams) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      params,
    }),

  put: <T>(endpoint: string, data: unknown, params?: FilterParams) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      params,
    }),

  patch: <T>(endpoint: string, data: unknown, params?: FilterParams) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      params,
    }),

  delete: <T>(endpoint: string, params?: FilterParams) => request<T>(endpoint, { method: "DELETE", params }),

  upload: <T>(endpoint: string, formData: FormData, params?: FilterParams) =>
    request<T>(endpoint, {
      method: "POST",
      body: formData,
      params,
      headers: {},
    }),
};

export function buildQueryString(params: FilterParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        for (const v of value) {
          searchParams.append(key, String(v));
        }
      } else {
        searchParams.set(key, String(value));
      }
    }
  }
  return searchParams.toString();
}

export function createPaginatedUrl(
  baseUrl: string,
  page: number,
  pageSize: number,
  additionalParams?: FilterParams,
): string {
  const params: FilterParams = { page, pageSize, ...additionalParams };
  const queryString = buildQueryString(params);
  return `${baseUrl}?${queryString}`;
}

export type { ApiResponse, FilterParams, PaginatedResponse, RequestOptions, UUID };
export { ApiError };
