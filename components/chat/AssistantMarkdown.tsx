import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AssistantMarkdownProps = {
  content: string;
  className?: string;
};

/**
 * ChatGPT/Grok-style prose rendering for assistant replies.
 * Supports headings, lists, emphasis, code, and simple tables.
 */
export function AssistantMarkdown({
  content,
  className = "",
}: AssistantMarkdownProps) {
  return (
    <div
      className={`assistant-markdown text-body-sm leading-6 text-body ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 whitespace-pre-wrap">{children}</p>
          ),
          h1: ({ children }) => (
            <h1 className="type-section-title mb-2 mt-1 text-pine first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="type-section-title mb-2 mt-1 text-pine first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-1 text-body-sm font-bold leading-5 text-pine first:mt-0">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="mb-2.5 list-disc space-y-1.5 pl-5 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2.5 list-decimal space-y-1.5 pl-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-5 marker:text-mint">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-pine">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-bold text-pine-primary underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          code: ({ children, className: codeClassName }) => {
            const isBlock = Boolean(codeClassName);
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-control bg-surface-tint-strong px-3 py-2.5 font-mono text-caption leading-5 text-body ring-1 ring-border-soft">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-surface-tint px-1 py-0.5 font-mono text-caption text-pine ring-1 ring-border-soft/80">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-2.5 overflow-x-auto last:mb-0">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2.5 border-l-2 border-mint/50 pl-3 text-subtle last:mb-0">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-border-soft" />,
          table: ({ children }) => (
            <div className="mb-2.5 overflow-x-auto rounded-control ring-1 ring-border-soft last:mb-0">
              <table className="w-full border-collapse text-left text-body-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-tint text-pine">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-border-line px-2.5 py-1.5 font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-t border-border-soft px-2.5 py-1.5 align-top">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
