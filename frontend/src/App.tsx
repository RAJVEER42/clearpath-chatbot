import { useCallback, useState } from "react";
import ChatPanel from "./components/chat-panel";
import ChatInput from "./components/chat-input";
import DebugPanel from "./components/debug-panel";
import Icons from "./components/icons";
import type { Message, Metadata, Source, QueryResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastMetadata, setLastMetadata] = useState<Metadata | null>(null);
  const [lastSources, setLastSources] = useState<Source[]>([]);
  const [debugOpen, setDebugOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(
    undefined
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const res = await fetch(`${API_URL}/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: text,
            conversation_id: conversationId,
          }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data: QueryResponse = await res.json();

        setConversationId(data.conversation_id);
        setLastMetadata(data.metadata);
        setLastSources(data.sources);

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          metadata: data.metadata,
          sources: data.sources,
          evaluator_flags: data.metadata.evaluator_flags,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, isLoading]
  );

  const handleSelectPrompt = (prompt: string) => {
    setPendingPrompt(prompt);
    setTimeout(() => setPendingPrompt(undefined), 50);
    sendMessage(prompt);
  };

  return (
    <div className="flex items-center justify-center w-full relative h-dvh overflow-auto z-0">
      {/* Ambient background */}
      <div className="ambient-bg" />

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 w-full h-14 header-glass">
        <div className="flex items-center justify-between w-full h-full px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-x-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[oklch(0.2_0.02_270)] border border-[oklch(1_0_0_/_8%)]">
              <Icons.clearpath className="size-4 text-[oklch(0.75_0.15_270)]" />
            </div>
            <span className="font-semibold text-sm text-[oklch(0.85_0_0)]">ClearPath Support</span>
          </div>
          <div className="flex items-center gap-x-1">
            <button
              onClick={() => setDebugOpen(!debugOpen)}
              className="flex items-center justify-center size-9 rounded-lg text-[oklch(0.5_0.01_270)] hover:text-[oklch(0.8_0_0)] hover:bg-[oklch(1_0_0_/_5%)] transition-colors"
              title="Toggle debug panel"
            >
              <Icons.panel className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat wrapper */}
      <div className="relative flex-1 size-full">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSelectPrompt={handleSelectPrompt}
        />
        <ChatInput
          isLoading={isLoading}
          onSend={sendMessage}
          externalInput={pendingPrompt}
        />
      </div>

      {/* Debug panel overlay */}
      <DebugPanel
        metadata={lastMetadata}
        sources={lastSources}
        isOpen={debugOpen}
        onToggle={() => setDebugOpen(!debugOpen)}
      />
    </div>
  );
}

export default App;
