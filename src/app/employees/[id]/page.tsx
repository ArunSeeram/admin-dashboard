"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { useEmployee, useActivities, useEmployeeMutations } from "@/hooks/useEmployees";
import { useAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import { DEPARTMENTS, ROLES, LOCATIONS, type Employee } from "@/lib/types";

// Dynamic route: Next.js reads the [id] segment from the URL and passes it
// via useParams(). Everything else on this page (edit / timeline / related)
// is driven by that single id.
export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { can } = useAuth();
  const { mutate: globalMutate } = useSWRConfig();

  const { employee, isLoading, error, mutate } = useEmployee(id);
  const { activities, isLoading: activitiesLoading } = useActivities(id);
  const { updateStatus } = useEmployeeMutations();

  // Related records: other people in the same department. Only fetched once
  // we know the department, hence the conditional SWR key.
  const { data: related } = useSWR(
    employee ? ["related", employee.department, id] : null,
    () =>
      api
        .getEmployees({
          search: "",
          department: employee!.department,
          status: "",
          sortBy: "name",
          sortDir: "asc",
          page: 1,
          pageSize: 5,
        })
        .then((r) => r.data.filter((e) => e.id !== id))
  );

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Employee>>({});
  const [saveError, setSaveError] = useState("");

  function startEditing() {
    if (!employee) return;
    setDraft({ department: employee.department, role: employee.role, salary: employee.salary });
    setEditing(true);
  }

  async function saveEdits() {
    if (!employee) return;
    setSaveError("");
    const previous = employee;
    // Optimistic update: show the new values immediately, roll back on error.
    mutate({ ...employee, ...draft }, false);
    try {
      const updated = await api.updateEmployee(employee.id, draft);
      mutate(updated);
      globalMutate((key) => Array.isArray(key) && key[0] === "employees");
      router.refresh();
      setEditing(false);
    } catch {
      mutate(previous);
      setSaveError("Could not save changes. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 w-full">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 min-w-0 max-w-full">
          <Link href="/employees" className="text-sm text-brand-600 hover:underline">
            ← Back to employees
          </Link>

          {isLoading && (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}

          {!isLoading && error && (
            <ErrorState message="We couldn't load this employee." />
          )}

          {!isLoading && employee && (
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main / editable section */}
              <section className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-semibold">{employee.name}</h1>
                    <p className="text-sm text-slate-500">{employee.email}</p>
                  </div>
                  <Badge status={employee.status} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <Field label="Department">
                    {editing ? (
                      <select
                        value={draft.department as string}
                        onChange={(e) => setDraft((d) => ({ ...d, department: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    ) : (
                      employee.department
                    )}
                  </Field>
                  <Field label="Role">
                    {editing ? (
                      <select
                        value={draft.role as string}
                        onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      employee.role
                    )}
                  </Field>
                  <Field label="Salary">
                    {editing ? (
                      <input
                        type="number"
                        value={draft.salary as number}
                        onChange={(e) => setDraft((d) => ({ ...d, salary: Number(e.target.value) }))}
                        className="w-full rounded-md border border-slate-300 px-2 py-1"
                      />
                    ) : (
                      `$${employee.salary.toLocaleString()}`
                    )}
                  </Field>
                  <Field label="Location">
                    {editing ? (
                      <select
                        value={draft.location as string}
                        onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      >
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    ) : (
                      employee.location
                    )}
                  </Field>
                  <Field label="Joined">{employee.joinedAt}</Field>
                </div>

                {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}

                {can("edit") && (
                  <div className="mt-5 flex gap-2">
                    {editing ? (
                      <>
                        <Button onClick={saveEdits}>Save changes</Button>
                        <Button variant="secondary" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button variant="secondary" onClick={startEditing}>
                        Edit details
                      </Button>
                    )}
                  </div>
                )}

                {can("edit") && !editing && (
                  <div className="mt-3 flex gap-2 text-sm">
                    <span className="text-slate-500">Quick status change:</span>
                    {(["active", "on_leave", "inactive"] as const)
                      .filter((s) => s !== employee.status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(employee, s)}
                          className="text-brand-600 hover:underline"
                        >
                          Mark {s.replace("_", " ")}
                        </button>
                      ))}
                  </div>
                )}
              </section>

              {/* Sidebar: activity timeline + related records */}
              <div className="flex flex-col gap-6">
                <section className="rounded-lg border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-medium text-slate-700">Activity</h2>
                  {activitiesLoading && <Skeleton className="mt-3 h-24 w-full" />}
                  {!activitiesLoading && activities.length === 0 && (
                    <p className="mt-3 text-sm text-slate-400">No activity recorded yet.</p>
                  )}
                  <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
                    {activities.map((a) => (
                      <li key={a.id} className="relative text-sm">
                        <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand-500" />
                        <p className="text-slate-800">{a.message}</p>
                        <p className="text-xs text-slate-400">{a.date}</p>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-medium text-slate-700">Also in {employee.department}</h2>
                  <ul className="mt-3 space-y-2">
                    {related?.map((r) => (
                      <li key={r.id}>
                        <Link href={`/employees/${r.id}`} className="text-sm text-brand-600 hover:underline">
                          {r.name}
                        </Link>
                      </li>
                    ))}
                    {related?.length === 0 && <p className="text-sm text-slate-400">No one else yet.</p>}
                  </ul>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{children}</dd>
    </div>
  );
}
