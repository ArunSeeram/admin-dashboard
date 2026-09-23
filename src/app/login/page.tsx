"use client";

// A mock login screen. Real apps validate credentials against a server;
// here we just pick a role so you can see role-based UI in action.

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, type Role } from "@/lib/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// useSearchParams() opts a component out of static rendering, so Next.js
// requires it to sit inside a <Suspense> boundary - this wrapper is that
// boundary, and the real page lives in LoginForm below.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("admin@example.com");
  const [role, setRole] = useState<Role>("admin");
  const [isLoading, setIsLoading] = useState(false);

  function handleRoleChange(newRole: Role) {
    setRole(newRole);
    // Auto-update email to match selected role if using default format
    if (!email || email.endsWith("@example.com")) {
      setEmail(`${newRole}@example.com`);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const activeEmail = email.trim() || `${role}@example.com`;
    login(activeEmail, role);
    // The middleware only checks for the PRESENCE of this cookie, not its
    // contents - a real backend would issue a signed, HttpOnly cookie instead.
    document.cookie = "session=mock-session; path=/";
    router.push(params.get("next") ?? "/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Select a role below or enter any email for the demo.</p>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="admin">Admin (full access - view, add, edit, delete)</option>
              <option value="editor">Editor (view, add, edit - no delete)</option>
              <option value="viewer">Viewer (read-only)</option>
            </select>
          </div>

          <Input
            label="Email"
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="mt-6 w-full">
          Sign in
        </Button>
      </form>
    </main>
  );
}
