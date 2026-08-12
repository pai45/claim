/**
 * Inline style for staggered `.animate-rise-in` delays.
 *
 * `baseMs` offsets the whole run, for screens that animate in behind something else and
 * need their rows to wait for it.
 */
export function staggerStyle(index: number, stepMs = 45, maxMs = 400, baseMs = 0) {
  return {
    animationDelay: `${baseMs + Math.min(index * stepMs, maxMs)}ms`,
  } as const;
}
