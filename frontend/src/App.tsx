import { useCallback, useEffect, useState } from "react";
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
  const [darkMode, setDarkMode] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);
  }, []);

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
      {/* Gradient background glows */}
      <div className="fixed -z-10 top-0 left-1/2 -translate-x-1/2 bg-blue-500 rounded-full w-full h-1/6 blur-[10rem] hidden lg:block opacity-10" />
      <div className="fixed -z-10 top-0 left-1/2 -translate-x-1/2 bg-amber-500 rounded-full w-3/4 h-1/6 blur-[10rem] hidden lg:block opacity-10" />
      <div className="fixed -z-10 top-[12.5%] left-1/4 -translate-x-1/4 bg-orange-500 rounded-full w-1/3 h-1/6 blur-[10rem] hidden lg:block opacity-20" />
      <div className="fixed -z-10 top-[12.5%] right-1/4 translate-x-1/4 bg-sky-500 rounded-full w-1/3 h-1/6 blur-[10rem] hidden lg:block opacity-20" />

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 w-full h-14 bg-background/60 backdrop-blur-md">
        <div className="flex items-center justify-between w-full h-full px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-x-2">
            <Icons.clearpath className="size-5 text-foreground" />
            <span className="font-semibold text-sm">ClearPath Support</span>
          </div>
          <div className="flex items-center gap-x-1">
            <button
              onClick={() => setDebugOpen(!debugOpen)}
              className="flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Toggle debug panel"
            >
              <Icons.panel className="size-4" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {darkMode ? (
                <Icons.sun className="size-4" />
              ) : (
                <Icons.moon className="size-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Chat wrapper — matches Aether's ChatWrapper: relative flex-1 size-full */}
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
