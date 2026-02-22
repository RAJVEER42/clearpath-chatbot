import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../lib/utils";
import CodeBlock from "./code-block";

const components: Partial<Components> = {
  code({ className, children, ...props }) {
    const childArray = React.Children.toArray(children);
    const firstChild = childArray[0];
    const firstChildAsString =
      typeof firstChild === "string" ? firstChild : String(firstChild ?? "");

    if (firstChildAsString === "\u25CD") {
      return <span className="mt-1 cursor-default animate-pulse">{"\u25CD"}</span>;
    }

    const match = /language-(\w+)/.exec(className || "");

    if (typeof firstChildAsString === "string" && !firstChildAsString.includes("\n")) {
      return (
        <code className={cn(className, "px-1 py-0.5 rounded bg-muted text-sm")} {...props}>
          {childArray}
        </code>
      );
    }

    return (
      <CodeBlock
        key={Math.random()}
        language={(match && match[1]) || ""}
        value={String(childArray).replace(/\n$/, "")}
      />
    );
  },
  pre: ({ children }) => <>{children}</>,
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-outside ml-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="py-1" {...props}>
      {children}
    </li>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-outside ml-4" {...props}>
      {children}
    </ul>
  ),
  strong: ({ children, ...props }) => (
    <span className="font-semibold" {...props}>
      {children}
    </span>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-border pl-4 py-1 my-4 bg-muted/20 rounded-r-lg"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }) => (
    <a className="text-blue-500 hover:underline" target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-2 last:mb-0" {...props}>
      {children}
    </p>
  ),
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>{children}</h4>
  ),
  table: ({ children, ...props }) => (
    <div className="my-6 rounded-md border border-border overflow-hidden">
      <table className="w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted/50" {...props}>{children}</thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-border" {...props}>{children}</tr>
  ),
  td: ({ children, ...props }) => (
    <td className="p-3 border-t border-border" {...props}>{children}</td>
  ),
  th: ({ children, ...props }) => (
    <th className="p-3 text-left font-medium" {...props}>{children}</th>
  ),
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

export default Markdown;
