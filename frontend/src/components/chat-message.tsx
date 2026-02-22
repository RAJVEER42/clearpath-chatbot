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
}

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

const ChatMessage = ({ message }: Props) => {
  const isUser = message.role === "user";

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

        {/* Source Citations with glowing pills */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mt-3 ml-2"
          >
            {message.sources.map((source, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-muted-foreground hover:text-foreground transition-colors cursor-default"
                title={`Score: ${source.relevance_score?.toFixed(3) ?? "N/A"}\nPage: ${source.page ?? "N/A"
                  }\nPath: ${source.document || "Unknown"}`}
              >
                <Icons.document className="size-3" />
                <span>Doc {idx + 1}</span>
              </div>
            ))}
          </motion.div>
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
