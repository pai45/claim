import type { ButtonHTMLAttributes } from "react";

type ChatOptionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  featured?: boolean;
};

const baseClassName =
  "inline-flex min-h-11 items-center justify-center rounded-tl rounded-tr-bubble rounded-br-bubble rounded-bl-bubble border border-input-border bg-white px-4 py-2.5 text-body-sm font-bold text-pine disabled:opacity-60";

export function ChatOptionButton({
  featured = false,
  className = "",
  children,
  type = "button",
  ...props
}: ChatOptionButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClassName} ${
        featured ? "relative overflow-hidden" : ""
      } ${className}`}
      {...props}
    >
      {featured ? (
        <>
          <span
            aria-hidden="true"
            className="quick-action-featured-border absolute inset-0"
          />
          <span
            aria-hidden="true"
            className="absolute inset-[1.5px] rounded-tl rounded-tr-bubble rounded-br-bubble rounded-bl-bubble bg-white"
          />
          <span className="relative">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
