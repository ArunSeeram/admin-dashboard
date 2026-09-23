import clsx from "clsx";

const STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  on_leave: "bg-amber-100 text-amber-700",
  inactive: "bg-slate-100 text-slate-600",
};

const LABELS: Record<string, string> = {
  active: "Active",
  on_leave: "On leave",
  inactive: "Inactive",
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium", STYLES[status])}>
      {LABELS[status] ?? status}
    </span>
  );
}
