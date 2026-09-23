"use client";

// A 3-step "Add employee" form demonstrating:
//  - multi-step navigation with a progress indicator
//  - client-side validation per step (so users get instant feedback)
//  - a conditional field (an "end date" field only appears for on-leave status)
//  - autosave: the draft is written to localStorage as the user types, and
//    restored if they reload or navigate away and come back
//  - loading / success / error states around the final submit

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { api, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DEPARTMENTS, ROLES, LOCATIONS } from "@/lib/types";

const DRAFT_KEY = "employee-form-draft";

interface FormData {
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "on_leave" | "inactive";
  leaveEndDate: string; // only used when status === "on_leave"
  salary: string;
  location: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  department: "",
  role: "",
  status: "active",
  leaveEndDate: "",
  salary: "",
  location: "In Office",
};

const STEPS = ["Basic info", "Role & status", "Review"];

function validateStep(step: number, data: FormData): Partial<Record<keyof FormData, string>> {
  const errors: Partial<Record<keyof FormData, string>> = {};

  if (step === 0) {
    if (!data.name.trim()) errors.name = "Name is required.";
    if (!data.email.trim()) errors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Enter a valid email address.";
  }

  if (step === 1) {
    if (!data.department) errors.department = "Department is required.";
    if (!data.role) errors.role = "Role is required.";
    if (!data.location) errors.location = "Location is required.";
    if (!data.salary) errors.salary = "Salary is required.";
    else if (Number(data.salary) <= 0) errors.salary = "Salary must be a positive number.";
    if (data.status === "on_leave" && !data.leaveEndDate) {
      errors.leaveEndDate = "Enter when the leave ends.";
    }
  }

  return errors;
}

export function MultiStepForm() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  // Restore an autosaved draft once, on first render.
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  // Autosave on every change. In a real app you might debounce this, but
  // writing to localStorage is cheap enough to do on every keystroke.
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }, [data]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    const stepErrors = validateStep(step, data);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setSubmitState("loading");
    setSubmitError("");
    try {
      await api.createEmployee({
        name: data.name,
        email: data.email,
        department: data.department,
        role: data.role,
        status: data.status,
        salary: Number(data.salary),
        location: data.location,
        joinedAt: new Date().toISOString().slice(0, 10),
      });
      localStorage.removeItem(DRAFT_KEY);
      // Invalidate all SWR caches for employees so employee list & dashboard update instantly
      await mutate((key) => Array.isArray(key) && key[0] === "employees");
      router.refresh();
      setSubmitState("success");
      setTimeout(() => router.push("/employees"), 800);
    } catch (err) {
      setSubmitState("error");
      setSubmitError(err instanceof ApiError ? err.message : "Could not save the employee. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      {/* Step indicator */}
      <ol className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${i <= step ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
            >
              {i + 1}
            </span>
            <span className={i === step ? "text-slate-900" : ""}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-200" aria-hidden />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Input label="Full name" value={data.name} onChange={(e) => update("name", e.target.value)} error={errors.name} />
          <Input
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
          />
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Select
            label="Department"
            id="department"
            value={data.department}
            onChange={(e) => update("department", e.target.value)}
            options={DEPARTMENTS}
            placeholder="Select department"
            error={errors.department}
          />

          <Select
            label="Role"
            id="role"
            value={data.role}
            onChange={(e) => update("role", e.target.value)}
            options={ROLES}
            placeholder="Select role"
            error={errors.role}
          />

          <Select
            label="Location"
            id="location"
            value={data.location}
            onChange={(e) => update("location", e.target.value)}
            options={LOCATIONS}
            placeholder="Select location"
            error={errors.location}
          />

          <Select
            label="Status"
            id="status"
            value={data.status}
            onChange={(e) => update("status", e.target.value as FormData["status"])}
          >
            <option value="active">Active</option>
            <option value="on_leave">On leave</option>
            <option value="inactive">Inactive</option>
          </Select>

          {/* Conditional field: only shown when it's relevant */}
          {data.status === "on_leave" && (
            <Input
              label="Leave end date"
              type="date"
              value={data.leaveEndDate}
              onChange={(e) => update("leaveEndDate", e.target.value)}
              error={errors.leaveEndDate}
            />
          )}

          <Input
            label="Salary (USD)"
            type="number"
            value={data.salary}
            onChange={(e) => update("salary", e.target.value)}
            error={errors.salary}
          />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium text-slate-900">Review before saving</p>
          <dl className="grid grid-cols-2 gap-y-1 text-slate-600">
            <dt>Name</dt>
            <dd>{data.name}</dd>
            <dt>Email</dt>
            <dd>{data.email}</dd>
            <dt>Department</dt>
            <dd>{data.department}</dd>
            <dt>Role</dt>
            <dd>{data.role}</dd>
            <dt>Location</dt>
            <dd>{data.location}</dd>
            <dt>Status</dt>
            <dd className="capitalize">{data.status.replace("_", " ")}</dd>
            {data.status === "on_leave" && data.leaveEndDate && (
              <>
                <dt>Leave end date</dt>
                <dd>{data.leaveEndDate}</dd>
              </>
            )}
            <dt>Salary</dt>
            <dd>${Number(data.salary || 0).toLocaleString()}</dd>
          </dl>
          {submitState === "error" && <p className="text-sm text-red-600">{submitError}</p>}
          {submitState === "success" && <p className="text-sm text-green-600">Saved! Redirecting…</p>}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={goBack} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={submitState === "loading"}>
            Save employee
          </Button>
        )}
      </div>
    </div>
  );
}
