import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { type Message } from "../types";
import { cn } from "../lib/utils";
import Icons from "./icons";
import { memo } from "react";
import { motion } from "framer-motion";

interface Props {
  message: Message;
  isLast?: boolean;
}

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

const ChatMessage = ({ message }: Props) => {
  const isUser = message.role === "user";
  const flags = message.evaluator_flags || [];
  const hasWarning = flags.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "flex w-full mt-4 space-x-3 mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 flex items-center justify-center size-8 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#16181C] mt-1">
          <Icons.bot className="size-4.5 text-foreground" />
        </div>
      )}

      <div
        className={cn(
          "relative flex flex-col max-w-[85%] md:max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed",
            isUser
              ? "bg-foreground text-background rounded-2xl rounded-tr-sm"
              : "glass-panel text-foreground rounded-2xl rounded-tl-sm"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
              <MemoizedReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="relative mt-4 mb-6 rounded-xl overflow-hidden shadow-glass-dark border border-white/10">
                        {/* macOS style traffic lights for code blocks */}
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#1E1E1E] border-b border-white/5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                          <span className="ml-2 text-xs font-mono text-white/40">
                            {match[1]}
                          </span>
                        </div>
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, borderRadius: 0 }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </MemoizedReactMarkdown>
            </div>
          )}
        </div>

        {/* Evaluator Warnings */}
        {hasWarning && !isUser && (
          <div className="flex flex-col gap-1.5 mt-4">
            {flags.includes("refusal") && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-orange-50/90 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-500/40 text-orange-800 dark:text-orange-300 text-[13px] font-semibold shadow-sm shadow-orange-500/5">
                <Icons.warning className="size-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <span>I couldn't find a direct answer in the ClearPath documentation.</span>
              </div>
            )}
            {flags.includes("no_context") && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-yellow-50/90 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-500/40 text-yellow-800 dark:text-yellow-300 text-[13px] font-semibold shadow-sm shadow-yellow-500/5">
                <Icons.warning className="size-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                <span>No relevant documentation was retrieved for this query.</span>
              </div>
            )}
            {flags.includes("conflicting_sources") && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-yellow-50/90 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-500/40 text-yellow-800 dark:text-yellow-300 text-[13px] font-semibold shadow-sm shadow-yellow-500/5">
                <Icons.warning className="size-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                <span>Information pulled from multiple distinct sources. May contain contradictions.</span>
              </div>
            )}
          </div>
        )}


      </div>

      {/* User Avatar */}
      {
        isUser && (
          <div className="flex-shrink-0 flex items-center justify-center size-8 rounded-full bg-muted shadow-sm mt-1">
            <Icons.user className="size-4.5 text-muted-foreground" />
          </div>
        )
      }
    </motion.div >
  );
};

export default memo(ChatMessage);
