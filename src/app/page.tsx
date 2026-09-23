import { redirect } from "next/navigation";

// The root URL has nothing to show by itself - send visitors straight to the
// dashboard (middleware.ts will bounce them to /login first if needed).
export default function Home() {
  redirect("/dashboard");
}
