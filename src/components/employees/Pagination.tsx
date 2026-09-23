"use client";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
      <p className="text-center sm:text-left">
        Showing <span className="font-medium">{from}</span>-<span className="font-medium">{to}</span> of{" "}
        <span className="font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md px-2.5 py-1.5 font-medium hover:bg-slate-100 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="px-2 py-1.5 whitespace-nowrap">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md px-2.5 py-1.5 font-medium hover:bg-slate-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
