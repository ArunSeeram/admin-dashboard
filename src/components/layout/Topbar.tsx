"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
];

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    document.cookie = "session=; Max-Age=0; path=/";
    logout();
    router.push("/login");
  }

  return (
    <header className="relative border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <p className="text-sm text-slate-500">
            Signed in as <span className="font-medium text-slate-800">{user?.email ?? "guest"}</span>
            {user && <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs uppercase">{user.role}</span>}
          </p>
        </div>

        <div className="hidden sm:block">
          <Button variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-3 md:hidden">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-slate-100 pt-2 sm:hidden">
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-left">
                Log out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
