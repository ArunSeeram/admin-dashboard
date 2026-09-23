import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MultiStepForm } from "@/components/employees/MultiStepForm";

export default function NewEmployeePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 w-full">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 min-w-0 max-w-full">
          <Link href="/employees" className="text-sm text-brand-600 hover:underline">
            ← Back to employees
          </Link>
          <h1 className="mb-6 mt-2 text-xl font-semibold">Add employee</h1>
          <MultiStepForm />
        </main>
      </div>
    </div>
  );
}
