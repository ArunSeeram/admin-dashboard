"use client";

// A deliberately simple, mock authentication layer.
//
// In a real production app you'd use a proper auth provider (NextAuth, Clerk,
// Auth0, your own backend session, etc). The important PATTERN to notice here
// is the same regardless of provider:
//   1. Store "who is logged in" in one place (React Context).
//   2. Read the user's role wherever you need to show/hide UI.
//   3. Never trust the client alone - the API must also check permissions
//      (see the comment in api.ts / your real backend).

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "editor" | "viewer";

export interface User {
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
  can: (action: "edit" | "delete" | "bulk") => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "admin-dashboard:user";

// Very small role -> permissions table. Real apps usually fetch this from the
// backend, but keeping it explicit here makes the rule easy to read.
const PERMISSIONS: Record<Role, Array<"edit" | "delete" | "bulk">> = {
  admin: ["edit", "delete", "bulk"],
  editor: ["edit"],
  viewer: [],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore the "session" from localStorage on load, so refreshing the page
  // doesn't log you out. A real app would validate a token with the server
  // instead of trusting localStorage.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function login(email: string, role: Role) {
    const nextUser: User = { name: email.split("@")[0], email, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  function can(action: "edit" | "delete" | "bulk") {
    if (!user) return false;
    return PERMISSIONS[user.role].includes(action);
  }

  return <AuthContext.Provider value={{ user, login, logout, can }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
