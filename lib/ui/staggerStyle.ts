/** Inline style for staggered `.animate-rise-in` delays. */
export function staggerStyle(index: number, stepMs = 45, maxMs = 400) {
  return {
    animationDelay: `${Math.min(index * stepMs, maxMs)}ms`,
  } as const;
}
