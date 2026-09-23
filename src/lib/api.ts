// -----------------------------------------------------------------------------
// A small, hand-written API client.
//
// Why a wrapper instead of calling fetch() everywhere?
//  1. One place to add the base URL, headers, and error handling.
//  2. Easy to swap the mock API (json-server) for a real backend later -
//     you only change this file.
// -----------------------------------------------------------------------------

import type { Employee, EmployeeFilters, PaginatedResult, Activity, TrendPoint } from "./types";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  if (typeof window !== "undefined") {
    return "/api";
  }
  return "http://localhost:4000";
}

// A tiny custom error so calling code can show a friendly message and,
// separately, log the technical detail.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function readLocalDb() {
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const dbPath = path.join(process.cwd(), "db.json");
      const content = await fs.readFile(dbPath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchWithRetry(url: string, init?: RequestInit, retries = 2, delayMs = 150): Promise<Response> {
  let currentUrl = url;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(currentUrl, init);
      if (!res.ok && res.status >= 500 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      // If port 4000 is unreachable, fall back to internal Next.js API routes
      if (currentUrl.includes(":4000")) {
        const fallback = typeof window !== "undefined" ? "/api" : "http://localhost:3000/api";
        const altUrl = currentUrl.replace(/https?:\/\/[^/]+(?::4000)?/, fallback);
        try {
          const fallbackRes = await fetch(altUrl, init);
          if (fallbackRes.ok || fallbackRes.status < 500) {
            return fallbackRes;
          }
        } catch {
          // If fallback fails, continue loop
        }
      }

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Fetch failed after retries");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetchWithRetry(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      ...options,
    });

    if (!res.ok) {
      // Try to read a useful error message, but don't blow up if the body isn't JSON.
      const body = await res.json().catch(() => null);
      throw new ApiError(body?.message ?? `Request failed with status ${res.status}`, res.status);
    }

    // json-server returns 200 with an empty body for some DELETE requests.
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  } catch (err) {
    // Server-side direct DB fallback if mock API is down
    if (typeof window === "undefined") {
      const db = await readLocalDb();
      if (db) {
        if (path.startsWith("/trend")) return (db.trend || []) as T;
        if (path.startsWith("/activities")) return (db.activities || []) as T;
        if (path.startsWith("/employees/")) {
          const id = Number(path.replace("/employees/", ""));
          const emp = (db.employees || []).find((e: any) => e.id === id);
          if (emp) return emp as T;
        }
      }
    }
    throw err;
  }
}

// json-server exposes a special "X-Total-Count" header when you pass
// _page/_limit query params - that's how we implement server-side pagination
// and still know the total number of matching rows.
async function requestPaginated<T>(
  path: string,
  page: number,
  pageSize: number
): Promise<PaginatedResult<T>> {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetchWithRetry(`${baseUrl}${path}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new ApiError(`Request failed with status ${res.status}`, res.status);
    const data = (await res.json()) as T[];
    const total = Number(res.headers.get("X-Total-Count") ?? data.length);
    return { data, total, page, pageSize };
  } catch (err) {
    // Server-side direct DB fallback if mock API is down
    if (typeof window === "undefined") {
      const db = await readLocalDb();
      if (db && Array.isArray(db.employees)) {
        let list = [...db.employees];
        const urlObj = new URL(`http://dummy${path}`);
        const q = urlObj.searchParams.get("q")?.toLowerCase();
        if (q) list = list.filter((e) => e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q));
        const dep = urlObj.searchParams.get("department");
        if (dep) list = list.filter((e) => e.department?.toLowerCase() === dep.toLowerCase());
        const status = urlObj.searchParams.get("status");
        if (status) list = list.filter((e) => e.status === status);
        const total = list.length;
        const start = (page - 1) * pageSize;
        return { data: list.slice(start, start + pageSize) as T[], total, page, pageSize };
      }
    }
    throw err;
  }
}

export const api = {
  // ---- Employees -----------------------------------------------------------
  async getEmployees(filters: EmployeeFilters): Promise<PaginatedResult<Employee>> {
    const params = new URLSearchParams();
    if (filters.search) params.set("q", filters.search);
    if (filters.department) params.set("department", filters.department);
    if (filters.status) params.set("status", filters.status);
    params.set("_sort", filters.sortBy);
    params.set("_order", filters.sortDir);
    params.set("_page", String(filters.page));
    params.set("_limit", String(filters.pageSize));

    return requestPaginated<Employee>(`/employees?${params}`, filters.page, filters.pageSize);
  },

  getEmployee(id: number): Promise<Employee> {
    return request<Employee>(`/employees/${id}`);
  },

  createEmployee(payload: Omit<Employee, "id">): Promise<Employee> {
    return request<Employee>("/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateEmployee(id: number, payload: Partial<Employee>): Promise<Employee> {
    return request<Employee>(`/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteEmployee(id: number): Promise<void> {
    return request<void>(`/employees/${id}`, { method: "DELETE" });
  },

  // ---- Related data ----------------------------------------------------------
  getActivities(employeeId: number): Promise<Activity[]> {
    return request<Activity[]>(`/activities?employeeId=${employeeId}&_sort=date&_order=desc`);
  },

  getTrend(): Promise<TrendPoint[]> {
    return request<TrendPoint[]>("/trend");
  },
};
