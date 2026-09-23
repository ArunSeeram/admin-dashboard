"use client";

// A simple date-range control. It reads/writes the URL (?from=&to=) so the
// selected range survives a refresh and can be shared/bookmarked - the same
// "URL is the source of truth" pattern used by the employee table's filters.

import { useRouter, useSearchParams } from "next/navigation";

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export function DateRangeFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const activeDays = params.get("days") ?? "30";

  function selectPreset(days: number) {
    const next = new URLSearchParams(params.toString());
    next.set("days", String(days));
    router.push(`/dashboard?${next.toString()}`);
  }

  return (
    <div className="flex gap-2" role="group" aria-label="Date range">
      {PRESETS.map((preset) => (
        <button
          key={preset.days}
          onClick={() => selectPreset(preset.days)}
          aria-pressed={activeDays === String(preset.days)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeDays === String(preset.days)
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
