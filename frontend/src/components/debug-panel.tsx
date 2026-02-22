import { type Metadata, type Source } from "../types";
import Icons from "./icons";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  metadata: Metadata | null;
  sources: Source[];
  isOpen: boolean;
  onToggle: () => void;
}

const DebugPanel = ({ metadata, sources, isOpen, onToggle }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dismiss background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={onToggle}
          />

          {/* Right-Side Sliding Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-[#16181C] shadow-2xl border-l border-black/5 dark:border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20">
                  <Icons.panel className="size-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    System Telemetry
                  </h2>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="flex items-center justify-center size-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground transition-colors"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Routing Logic Card */}
              <div className="bg-muted/50 rounded-3xl p-5 border border-black/5 dark:border-white/10">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Routing Logic
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/10 border-dashed">
                    <span className="text-[13px] text-foreground/80">Strategy Name</span>
                    <span className="text-[13px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                      {"Vector + LLM"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/10 border-dashed">
                    <span className="text-[13px] text-foreground/80">LLM Model</span>
                    <span className="text-[13px] font-mono text-foreground font-medium">
                      {metadata?.model_used || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-foreground/80">Total Latency</span>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[13px] font-mono text-foreground font-medium">
                        {metadata?.latency_ms ? `${metadata.latency_ms.toFixed(0)} ms` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retrieval Stats Card */}
              <div className="bg-muted/50 rounded-3xl p-5 border border-black/5 dark:border-white/10">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Vector Retrieval
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/10 border-dashed">
                    <span className="text-[13px] text-foreground/80">Chunks Searched</span>
                    <span className="text-[13px] font-mono text-foreground font-medium">
                      {metadata?.chunks_retrieved ?? "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/10 border-dashed">
                    <span className="text-[13px] text-foreground/80">Query Type</span>
                    <span className="text-[13px] font-mono text-foreground font-medium">
                      {metadata?.classification ?? "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-foreground/80">Sources Used</span>
                    <span className="text-[13px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {sources?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-documents / Sources */}
              {sources && sources.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pl-1">
                    Reference Context ({sources.length})
                  </h3>
                  <div className="space-y-3">
                    {sources.map((src, i) => (
                      <div
                        key={i}
                        className="group relative overflow-hidden bg-muted/40 rounded-2xl p-4 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20 transition-colors"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20 dark:bg-white/20" />
                        <div className="flex flex-col gap-2 pl-2">
                          <div className="flex items-center gap-2">
                            <Icons.document className="size-4 text-foreground shrink-0" />
                            <span className="text-[11px] font-mono font-medium text-foreground truncate">
                              {src.document?.split("/").pop() || "Unknown Source"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-1.5 py-0.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 text-[9px] font-mono text-muted-foreground">
                              Page {src.page ?? 1}
                            </span>
                            <span className="px-1.5 py-0.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 text-[9px] font-mono text-muted-foreground">
                              Score {src.relevance_score ? src.relevance_score.toFixed(3) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DebugPanel;
