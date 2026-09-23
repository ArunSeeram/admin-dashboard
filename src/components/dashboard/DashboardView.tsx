"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { api } from "@/lib/api";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { DepartmentChart } from "@/components/dashboard/DepartmentChart";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import type { Employee, TrendPoint } from "@/lib/types";

export function DashboardView({
  initialEmployees,
  initialTrend,
}: {
  initialEmployees: Employee[];
  initialTrend: TrendPoint[];
}) {
  const searchParams = useSearchParams();
  const days = Number(searchParams.get("days") ?? 30);

  // SWR subscribes to employee updates across the whole app.
  // When an employee is created, deleted, or edited, SWR re-fetches and updates
  // Total Payroll and all dashboard KPIs immediately without requiring a full page refresh.
  const { data: employees = initialEmployees } = useSWR(
    ["employees", "dashboard"],
    () =>
      api
        .getEmployees({
          search: "",
          department: "",
          status: "",
          sortBy: "name",
          sortDir: "asc",
          page: 1,
          pageSize: 500,
        })
        .then((res) => res.data),
    {
      fallbackData: initialEmployees,
      revalidateOnMount: false, // Reuses server-prefetched data, avoids duplicate initial request
      revalidateOnFocus: true,
    }
  );

  const { data: trend = initialTrend } = useSWR(["trend"], () => api.getTrend(), {
    fallbackData: initialTrend,
  });

  const filteredTrend = trend.slice(-days);
  const activeCount = employees.filter((e) => e.status === "active").length;
  const onLeaveCount = employees.filter((e) => e.status === "on_leave").length;
  const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  const newHires = filteredTrend.reduce((sum, t) => sum + t.newHires, 0);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6 min-w-0 max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <DateRangeFilter />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active employees" value={String(activeCount)} />
        <KpiCard label="On leave" value={String(onLeaveCount)} />
        <KpiCard label={`New hires (${days}d)`} value={String(newHires)} />
        <KpiCard label="Total payroll" value={`$${totalPayroll.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-medium text-slate-700">Hiring trend</h2>
          <TrendChart data={filteredTrend} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-medium text-slate-700">Headcount by department</h2>
          <DepartmentChart employees={employees} />
        </div>
      </div>
    </main>
  );
}
