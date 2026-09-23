"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { EmployeeFilters } from "@/components/employees/EmployeeFilters";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { Pagination } from "@/components/employees/Pagination";
import { ConfirmModal } from "@/components/employees/ConfirmModal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useEmployees, useEmployeeMutations } from "@/hooks/useEmployees";
import { useAuth } from "@/lib/useAuth";
import type { EmployeeFilters as Filters } from "@/lib/types";

const PAGE_SIZE = 8;

// This page is a Client Component: the table needs interactive state
// (selection, sorting, pagination) that reacts instantly to clicks, and it
// reads/writes the URL on every filter change - both are browser concerns.
// See the comment in src/app/login/page.tsx about why useSearchParams()
// needs this Suspense wrapper.
export default function EmployeesPage() {
  return (
    <Suspense fallback={null}>
      <EmployeesPageInner />
    </Suspense>
  );
}

function EmployeesPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { can } = useAuth();
  const { remove, removeMany } = useEmployeeMutations();

  const filters: Filters = {
    search: params.get("search") ?? "",
    department: params.get("department") ?? "",
    status: params.get("status") ?? "",
    sortBy: (params.get("sortBy") as Filters["sortBy"]) ?? "name",
    sortDir: (params.get("sortDir") as Filters["sortDir"]) ?? "asc",
    page: Number(params.get("page") ?? 1),
    pageSize: PAGE_SIZE,
  };

  const { employees, total, isLoading, error } = useEmployees(filters);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmTarget, setConfirmTarget] = useState<"bulk" | number | null>(null);

  function setPage(page: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(page));
    router.push(`/employees?${next.toString()}`);
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const allSelected = employees.every((e) => prev.has(e.id));
      return allSelected ? new Set() : new Set(employees.map((e) => e.id));
    });
  }

  async function handleConfirmDelete() {
    try {
      if (confirmTarget === "bulk") {
        const ids = Array.from(selected);
        setSelected(new Set());
        await removeMany(ids);
      } else if (typeof confirmTarget === "number") {
        await remove(confirmTarget);
      }
    } finally {
      setConfirmTarget(null);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Employees</h1>
            {can("edit") && (
              <Link href="/employees/new">
                <Button>Add employee</Button>
              </Link>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            <EmployeeFilters />

            {selected.size > 0 && can("bulk") && (
              <div className="flex items-center justify-between bg-brand-50 px-4 py-2 text-sm">
                <span>{selected.size} selected</span>
                <Button variant="danger" onClick={() => setConfirmTarget("bulk")}>
                  Delete selected
                </Button>
              </div>
            )}

            {isLoading && <TableSkeleton rows={PAGE_SIZE} cols={5} />}

            {!isLoading && error && (
              <ErrorState message="We couldn't load employees. Check that the mock API server is running." />
            )}

            {!isLoading && !error && employees.length === 0 && (
              <EmptyState
                title="No employees match these filters"
                description="Try clearing the search or filters above."
              />
            )}

            {!isLoading && !error && employees.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <EmployeeTable
                    employees={employees}
                    selected={selected}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                    onDeleteOne={(id) => setConfirmTarget(id)}
                    canDelete={can("delete")}
                    sortBy={filters.sortBy}
                    sortDir={filters.sortDir}
                  />
                </div>
                <Pagination page={filters.page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
              </>
            )}
          </div>
        </main>
      </div>

      <ConfirmModal
        open={confirmTarget !== null}
        title="Delete employee"
        description={
          confirmTarget === "bulk"
            ? `This will permanently delete ${selected.size} employee(s). This can't be undone.`
            : "This will permanently delete this employee. This can't be undone."
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
