import clsx from "clsx";
import { forwardRef, type SelectHTMLAttributes } from "react";

export interface OptionItem {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: readonly (string | OptionItem)[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className, options, placeholder, children, ...rest },
  ref
) {
  const selectId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={clsx(
          "rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors",
          "focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
          error ? "border-red-400" : "border-slate-300",
          className
        )}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options
          ? options.map((opt) => {
              const val = typeof opt === "string" ? opt : opt.value;
              const lbl = typeof opt === "string" ? opt : opt.label;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })
          : children}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});
