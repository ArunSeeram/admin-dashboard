import { Skeleton } from "@/components/ui/Skeleton";

export function KpiCard({
  label,
  value,
  sublabel,
  isLoading,
}: {
  label: string;
  value: string;
  sublabel?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-7 w-20" />
      ) : (
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      )}
      {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
    </div>
  );
}
