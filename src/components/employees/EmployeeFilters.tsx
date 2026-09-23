"use client";

// Search + department + status filters. Every change updates the URL, which
// is the "URL-synchronized filters" requirement: refreshing the page, or
// sharing the link, keeps the same filtered view.

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { DEPARTMENTS } from "@/lib/types";

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On leave" },
  { value: "inactive", label: "Inactive" },
];

export function EmployeeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Local state for the search box so typing feels instant; we only push to
  // the URL after a short debounce, avoiding a network request per keystroke.
  const [search, setSearch] = useState(params.get("search") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => updateParam("search", search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1"); // any filter change restarts pagination at page 1
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 p-4">
      <div className="w-56">
        <Input
          label="Search"
          placeholder="Name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="department" className="text-sm font-medium text-slate-700">
          Department
        </label>
        <select
          id="department"
          value={params.get("department") ?? ""}
          onChange={(e) => updateParam("department", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          value={params.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
