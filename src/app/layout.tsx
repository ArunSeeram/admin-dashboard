import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/useAuth";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard & management portal",
};

// This is a Server Component (the default in the App Router) - it renders on
// the server with no client-side JS of its own. AuthProvider is a Client
// Component (it uses useState), so only that part ships JS to the browser.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
