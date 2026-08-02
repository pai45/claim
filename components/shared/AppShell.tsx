import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  /** Page surface. Default `surface` for most screens; use `chat` for the assistant. */
  variant?: "surface" | "chat" | "bg";
  className?: string;
};

const variantClass = {
  surface: "bg-surface",
  chat: "bg-surface-chat",
  bg: "bg-bg",
} as const;

export function AppShell({
  children,
  variant = "surface",
  className = "",
}: AppShellProps) {
  return (
    <div
      className={`mx-auto flex h-dvh w-full max-w-phone flex-col shadow-phone ${variantClass[variant]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
