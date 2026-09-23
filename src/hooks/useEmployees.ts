"use client";

// These hooks wrap SWR (a small data-fetching library) so components never
// call the API directly. SWR gives us, almost for free:
//   - caching (visiting the same page twice doesn't re-fetch instantly)
//   - revalidation (re-fetches automatically when you return to the tab)
//   - a simple mutate() function for optimistic updates
//
// If you're new to SWR: think of `useSWR(key, fetcher)` as
// "give me `data`, `isLoading`, and `error` for this key, and cache it".

import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Employee, EmployeeFilters, PaginatedResult } from "@/lib/types";

// The "key" for a list request encodes every filter, so changing any filter
// automatically fetches (and caches) a different result.
function employeesKey(filters: EmployeeFilters) {
  return ["employees", filters] as const;
}

export function useEmployees(filters: EmployeeFilters) {
  const { data, error, isLoading } = useSWR(employeesKey(filters), () => api.getEmployees(filters), {
    keepPreviousData: true, // avoids a flash of "empty" while the next page loads
  });

  return {
    employees: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  };
}

export function useEmployee(id: number) {
  const { data, error, isLoading, mutate } = useSWR(id ? ["employee", id] : null, () =>
    api.getEmployee(id)
  );
  return { employee: data, isLoading, error, mutate };
}

export function useActivities(employeeId: number) {
  const { data, isLoading } = useSWR(employeeId ? ["activities", employeeId] : null, () =>
    api.getActivities(employeeId)
  );
  return { activities: data ?? [], isLoading };
}

// Centralizes the "optimistic update" pattern: update the local cache
// immediately (so the UI feels instant), then send the real request, and roll
// back automatically if it fails.
export function useEmployeeMutations() {
  const { mutate } = useSWRConfig();
  const router = useRouter();

  async function updateStatus(employee: Employee, status: Employee["status"]) {
    const key = ["employee", employee.id];
    await mutate(key, { ...employee, status }, false); // optimistic write, no re-fetch yet
    try {
      const updated = await api.updateEmployee(employee.id, { status });
      mutate(key, updated); // confirm with the server's response
    } catch (err) {
      mutate(key, employee); // roll back on failure
      throw err;
    } finally {
      mutate((key) => Array.isArray(key) && key[0] === "employees"); // refresh any list views
      router.refresh();
    }
  }

  async function removeMany(ids: number[]) {
    if (ids.length === 0) return;
    const idSet = new Set(ids);

    // Optimistically update the cached list so the UI feels instant
    await mutate(
      (key) => Array.isArray(key) && key[0] === "employees",
      (cached: PaginatedResult<Employee> | undefined) => {
        if (!cached || !cached.data) return cached;
        const filtered = cached.data.filter((e) => !idSet.has(e.id));
        return {
          ...cached,
          data: filtered,
          total: Math.max(0, cached.total - ids.length),
        };
      },
      false
    );

    try {
      // Execute deletions sequentially to avoid json-server concurrency issues & file locking
      for (const id of ids) {
        await api.deleteEmployee(id);
      }
    } finally {
      // Revalidate list queries once after all deletions complete
      await mutate((key) => Array.isArray(key) && key[0] === "employees");
      router.refresh();
    }
  }

  async function remove(id: number) {
    await removeMany([id]);
  }

  return { updateStatus, remove, removeMany };
}
