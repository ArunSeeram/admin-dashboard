import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

// A single reusable Button covers every button in the app.
// Why bother? If the "danger" style ever changes, you edit it in ONE place
// instead of hunting through every page.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
}

export function Button({ variant = "primary", isLoading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      // Keyboard users need a visible focus ring - never remove this with outline-none alone.
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-brand-600 text-white hover:bg-brand-700",
        variant === "secondary" && "bg-slate-100 text-slate-800 hover:bg-slate-200",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100",
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
