import type { CSSProperties, ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  /** Page surface. Default `surface` for most screens; use `chat` for the assistant. */
  variant?: "surface" | "chat" | "bg" | "login";
  className?: string;
  /** Escape hatch for per-screen custom properties that header and footer both read. */
  style?: CSSProperties;
};

const variantClass = {
  surface: "bg-surface",
  chat: "bg-surface-chat",
  bg: "bg-bg",
  login: "bg-login-canvas",
} as const;

export function AppShell({
  children,
  variant = "surface",
  className = "",
  style,
}: AppShellProps) {
  return (
    <div
      className={`app-shell mx-auto flex h-dvh w-full max-w-phone flex-col shadow-phone ${variantClass[variant]} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
