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

const DEFAULT_USER: User = {
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);

  // Restore the session from localStorage on load, or default to Admin so all capabilities are available.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(DEFAULT_USER);
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      document.cookie = "session=true; path=/";
    }
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
