"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Employee, EmployeeFilters as Filters } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const COLUMNS: Array<{ key: Filters["sortBy"]; label: string }> = [
  { key: "name", label: "Name" },
  { key: "department", label: "Department" },
  { key: "salary", label: "Salary" },
  { key: "joinedAt", label: "Joined" },
];

export function EmployeeTable({
  employees,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteOne,
  canDelete,
  sortBy,
  sortDir,
}: {
  employees: Employee[];
  selected: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onDeleteOne?: (id: number) => void;
  canDelete?: boolean;
  sortBy: string;
  sortDir: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function toggleSort(key: Filters["sortBy"]) {
    const next = new URLSearchParams(params.toString());
    if (sortBy === key) {
      next.set("sortDir", sortDir === "asc" ? "desc" : "asc");
    } else {
      next.set("sortBy", key);
      next.set("sortDir", "asc");
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  const allSelected = employees.length > 0 && employees.every((e) => selected.has(e.id));

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-slate-100 text-slate-500">
        <tr>
          <th scope="col" className="w-10 px-4 py-2">
            <input
              type="checkbox"
              aria-label="Select all rows on this page"
              checked={allSelected}
              onChange={onToggleSelectAll}
            />
          </th>
          {COLUMNS.map((col) => (
            <th key={col.key} scope="col" className="px-4 py-2 font-medium">
              <button
                onClick={() => toggleSort(col.key)}
                className="flex items-center gap-1 hover:text-slate-800"
                aria-sort={sortBy === col.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                {col.label}
                {sortBy === col.key && <span aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>}
              </button>
            </th>
          ))}
          <th scope="col" className="px-4 py-2 font-medium">
            Status
          </th>
          <th scope="col" className="px-4 py-2" />
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {employees.map((employee) => (
          <tr key={employee.id} className="hover:bg-slate-50">
            <td className="px-4 py-2.5">
              <input
                type="checkbox"
                aria-label={`Select ${employee.name}`}
                checked={selected.has(employee.id)}
                onChange={() => onToggleSelect(employee.id)}
              />
            </td>
            <td className="px-4 py-2.5">
              <p className="font-medium text-slate-900">{employee.name}</p>
              <p className="text-xs text-slate-500">{employee.email}</p>
            </td>
            <td className="px-4 py-2.5">{employee.department}</td>
            <td className="px-4 py-2.5">${employee.salary.toLocaleString()}</td>
            <td className="px-4 py-2.5">{employee.joinedAt}</td>
            <td className="px-4 py-2.5">
              <Badge status={employee.status} />
            </td>
            <td className="px-4 py-2.5 text-right">
              <div className="flex justify-end gap-3">
                <Link href={`/employees/${employee.id}`} className="font-medium text-brand-600 hover:underline">
                  View
                </Link>
                {canDelete && (
                  <button
                    onClick={() => onDeleteOne?.(employee.id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
