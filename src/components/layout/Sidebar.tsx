"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
      <p className="px-2 text-lg font-semibold text-slate-900">Admin Portal</p>
      <ul className="mt-6 flex flex-col gap-1">
        {LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
