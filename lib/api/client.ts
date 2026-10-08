import { ApiErrorResponse } from "@/types";

export class ApiClientError extends Error {
  public status: number;
  public data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://127.0.0.1:8000/api";

export interface RequestOptions extends RequestInit {
  token?: string | null;
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Extracts a human-friendly error message from Django REST Framework error responses.
 */
export function extractErrorMessage(
  errorData: unknown,
  status: number
): string {
  if (status === 401) {
    return "Your session has expired. Please login again.";
  }
  if (status === 403) {
    if (typeof errorData === "object" && errorData && "detail" in errorData) {
      return String((errorData as ApiErrorResponse).detail);
    }
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    if (typeof errorData === "object" && errorData && "detail" in errorData) {
      return String((errorData as ApiErrorResponse).detail);
    }
    return "Resource not found.";
  }
  if (status === 409) {
    if (typeof errorData === "object" && errorData && "detail" in errorData) {
      return String((errorData as ApiErrorResponse).detail);
    }
    return "Application was updated by another user. Please refresh and try again.";
  }
  if (status >= 500) {
    return "Something went wrong on the server. Please try again.";
  }

  if (typeof errorData === "object" && errorData !== null) {
    const errorObj = errorData as Record<string, unknown>;
    if (typeof errorObj.detail === "string") {
      return errorObj.detail;
    }
    if (Array.isArray(errorObj.non_field_errors) && errorObj.non_field_errors.length > 0) {
      return String(errorObj.non_field_errors[0]);
    }
    // Collect field validation error messages
    const fieldMessages: string[] = [];
    for (const [field, errors] of Object.entries(errorObj)) {
      if (Array.isArray(errors) && errors.length > 0) {
        fieldMessages.push(`${field}: ${errors.join(", ")}`);
      } else if (typeof errors === "string") {
        fieldMessages.push(`${field}: ${errors}`);
      }
    }
    if (fieldMessages.length > 0) {
      return fieldMessages.join(" | ");
    }
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Central HTTP client for dispatching API requests.
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, params, headers = {}, ...customConfig } = options;

  // Ensure endpoint starts with a slash and has trailing slash if needed for DRF
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${normalizedEndpoint}`;

  // Ensure trailing slash before query parameters if not present
  if (!url.includes("?") && !url.endsWith("/")) {
    url = `${url}/`;
  }

  // Attach query parameters
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // Retrieve token from options or localStorage (client-side)
  let authToken = token;
  if (!authToken && typeof window !== "undefined") {
    authToken = localStorage.getItem("semesteria_access_token");
  }

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (authToken) {
    requestHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: requestHeaders,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch {
    throw new ApiClientError(
      "Unable to connect to server. Please check your network connection.",
      0
    );
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  let data: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // If 401 unauthorized and in browser, clear invalid token and notify
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("semesteria_access_token");
      localStorage.removeItem("semesteria_refresh_token");
      localStorage.removeItem("semesteria_user");
      window.dispatchEvent(new Event("auth-change"));
    }

    const message = extractErrorMessage(data, response.status);
    throw new ApiClientError(message, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
