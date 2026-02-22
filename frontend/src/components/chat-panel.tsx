import { useEffect, useRef } from "react";
import type { Message } from "../types";
import ChatMessage from "./chat-message";
import EmptyState from "./empty-state";
import Icons from "./icons";

interface Props {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSelectPrompt: (prompt: string) => void;
}

const ChatPanel = ({ messages, isLoading, error, onSelectPrompt }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const displayMessages = isLoading
    ? [
      ...messages,
      {
        id: "loading-ai",
        content: "",
        role: "assistant" as const,
        is_loading: true,
      },
    ]
    : messages;

  return (
    <div className="relative flex flex-col w-full max-w-3xl pt-16 pb-24 mx-auto min-h-full">
      {messages.length === 0 && !isLoading && (
        <EmptyState onSelectPrompt={onSelectPrompt} />
      )}

      {displayMessages.map((msg, index) => (
        <ChatMessage
          key={`${msg.id}-${index}`}
          message={msg}
          isLast={index === displayMessages.length - 1}
        />
      ))}

      {error && (
        <div className="py-4 flex items-center justify-center w-full">
          <div className="flex items-center bg-destructive/10 text-destructive px-4 py-1.5 rounded-lg text-sm">
            <Icons.warning className="w-5 h-5" />
            <p className="ml-2 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="w-full h-px" />
    </div>
  );
};

export default ChatPanel;
