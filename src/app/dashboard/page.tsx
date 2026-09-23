import { Suspense } from "react";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// This page is a Server Component: it fetches initial data directly on the server
// (no client-side loading spinner for the initial view, fast first paint).
// DashboardView receives the initial server data as SWR fallback, ensuring that
// adding or deleting an employee updates Total Payroll and KPIs in real time.
export default async function DashboardPage() {
  const [trend, employeesResult] = await Promise.all([
    api.getTrend(),
    api.getEmployees({
      search: "",
      department: "",
      status: "",
      sortBy: "name",
      sortDir: "asc",
      page: 1,
      pageSize: 500,
    }),
  ]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <Suspense fallback={null}>
          <DashboardView
            initialEmployees={employeesResult.data}
            initialTrend={trend}
          />
        </Suspense>
      </div>
    </div>
  );
}
