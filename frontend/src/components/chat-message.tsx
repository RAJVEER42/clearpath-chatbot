import { useState } from "react";
import type { Message } from "../types";
import { cn } from "../lib/utils";
import Markdown from "./markdown";
import WarningBanner from "./warning-banner";
import Icons from "./icons";

interface Props {
  message: Message;
  isLast: boolean;
}

const ChatMessage = ({ message, isLast }: Props) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const showLoading = message.is_loading && !isUser;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-x-2 p-2 group/message",
        isUser ? "text-start" : "items-start my-3",
        isLast ? "pb-80" : ""
      )}
    >
      <div className="relative flex-1 px-1 overflow-hidden">
        <div
          className={cn(
            "flex flex-col grow",
            isUser &&
            "user-message w-max max-w-[80%] ml-auto",
            !isUser && message.content.length <= 90 && "pt-1"
          )}
        >
          {showLoading ? (
            <div className="flex items-center pt-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.7_0.15_270)] animate-pump" />
            </div>
          ) : isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            <Markdown>{message.content}</Markdown>
          )}
        </div>

        {/* Copy button — appears on hover */}
        {!showLoading && message.content && (
          <div
            className={cn(
              "flex items-center opacity-0 group-hover/message:opacity-100 transition-opacity mt-1",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <button
              onClick={handleCopy}
              className="flex items-center justify-center size-8 rounded-lg text-[oklch(0.5_0.01_270)] hover:text-[oklch(0.8_0_0)] hover:bg-[oklch(1_0_0_/_5%)] transition-colors"
            >
              {copied ? (
                <Icons.check className="size-4" />
              ) : (
                <Icons.copy className="size-4" />
              )}
            </button>
          </div>
        )}

        {/* Warning banner for flagged responses */}
        {!isUser && message.evaluator_flags && message.evaluator_flags.length > 0 && (
          <WarningBanner flags={message.evaluator_flags} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
