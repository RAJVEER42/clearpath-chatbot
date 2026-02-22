import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatPanel from "./components/chat-panel";
import ChatInput from "./components/chat-input";
import DebugPanel from "./components/debug-panel";
import Icons from "./components/icons";
import { MeshBackground } from "./components/mesh-background";
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
  const [isDark, setIsDark] = useState(true);
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

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
    <div className="flex flex-col items-center w-full relative h-dvh overflow-hidden z-0">
      {/* Immersive mesh gradient background */}
      <MeshBackground />

      {/* Floating Glass Navbar */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
        className="fixed top-6 left-0 right-0 mx-auto z-50 w-[calc(100%-2rem)] sm:w-[90%] max-w-4xl h-14 glass-panel-heavy rounded-full px-5 flex items-center justify-between shadow-glass"
      >
        <div className="flex items-center gap-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 border border-white/10 dark:border-white/5">
            <Icons.clearpath className="size-4 text-primary" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">
            ClearPath Assistant
          </span>
        </div>

        <div className="flex items-center gap-x-3">
          {/* Online Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Online</span>
          </div>

          <div className="w-px h-4 bg-border mx-1 hidden sm:block" />

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center justify-center size-9 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors relative"
            title="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "dark" : "light"}
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                {isDark ? <Icons.sun className="size-4" /> : <Icons.moon className="size-4" />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setDebugOpen(true)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icons.panel className="size-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider hidden sm:block">Sidebar</span>
          </button>
        </div>
      </motion.header>

      {/* Main content wrapper */}
      <div className="relative flex-1 w-full h-full overflow-y-auto no-scrollbar scroll-smooth pt-20 pb-40">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSelectPrompt={handleSelectPrompt}
        />
      </div>

      {/* Sticky Bottom Input */}
      <ChatInput
        isLoading={isLoading}
        onSend={sendMessage}
        externalInput={pendingPrompt}
      />

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
