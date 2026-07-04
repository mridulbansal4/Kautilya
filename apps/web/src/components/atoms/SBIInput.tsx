/**
 * <SBIInput> — DESIGN.md §5.1. M3 outlined field, label ABOVE input (skill Rule 6), helper +
 * error slots in markup, focus/error states. 56dp height, 48dp+ touch.
 */
import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

export function SBIInput({
  label,
  helper,
  error,
  prefix,
  suffix,
  className = "",
  ...rest
}: {
  label: string;
  helper?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={"flex flex-col gap-2 " + className}>
      <label htmlFor={id} className="t-label-sm text-content-secondary">
        {label}
      </label>
      <div
        className={[
          "flex items-center gap-2 rounded-sm border bg-bg-surface px-4 min-h-[56px]",
          "transition-colors duration-150",
          error
            ? "border-debit border-2"
            : "border-line focus-within:border-brand focus-within:border-2",
        ].join(" ")}
      >
        {prefix && <span className="text-content-secondary t-body-lg">{prefix}</span>}
        <input
          id={id}
          aria-invalid={!!error}
          className="flex-1 bg-transparent outline-none t-body-lg text-content-primary placeholder:text-content-tertiary"
          {...rest}
        />
        {suffix}
      </div>
      {error ? (
        <span role="alert" className="t-body-sm text-debit">
          {error}
        </span>
      ) : helper ? (
        <span className="t-body-sm text-content-tertiary">{helper}</span>
      ) : null}
    </div>
  );
}
