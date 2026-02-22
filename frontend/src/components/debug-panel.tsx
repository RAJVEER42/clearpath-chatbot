import { cn } from "../lib/utils";
import type { Metadata, Source } from "../types";

interface Props {
  metadata: Metadata | null;
  sources: Source[];
  isOpen: boolean;
  onToggle: () => void;
}

const DebugPanel = ({ metadata, sources, isOpen }: Props) => {
  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-full lg:w-[25%] bg-card/95 backdrop-blur-sm border-l border-border z-40 transition-transform duration-300 overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-4 pt-16">
        <h3 className="text-sm font-semibold text-foreground mb-4">Debug Info</h3>

        {!metadata ? (
          <p className="text-sm text-muted-foreground">
            Send a message to see debug info
          </p>
        ) : (
          <div className="space-y-4">
            {/* Model */}
            <DebugItem label="Model">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  metadata.model_used.includes("8b")
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                )}
              >
                {metadata.model_used.includes("8b") ? "Llama 8B" : "Llama 70B"}
              </span>
            </DebugItem>

            {/* Classification */}
            <DebugItem label="Classification">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  metadata.classification === "simple"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                )}
              >
                {metadata.classification}
              </span>
            </DebugItem>

            {/* Tokens */}
            <DebugItem label="Tokens">
              <div className="flex gap-3 font-mono text-xs">
                <span>
                  <span className="text-muted-foreground">in: </span>
                  {metadata.tokens.input.toLocaleString()}
                </span>
                <span>
                  <span className="text-muted-foreground">out: </span>
                  {metadata.tokens.output.toLocaleString()}
                </span>
              </div>
            </DebugItem>

            {/* Chunks */}
            <DebugItem label="Chunks Retrieved">
              <span className="font-mono text-xs">{metadata.chunks_retrieved}</span>
            </DebugItem>

            {/* Latency */}
            <DebugItem label="Latency">
              <span className="font-mono text-xs">{metadata.latency_ms}ms</span>
            </DebugItem>

            {/* Evaluator Flags */}
            <DebugItem label="Evaluator Flags">
              {metadata.evaluator_flags.length === 0 ? (
                <span className="text-xs text-muted-foreground">None</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {metadata.evaluator_flags.map((flag) => (
                    <span
                      key={flag}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </DebugItem>

            {/* Sources */}
            {sources.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Sources
                </p>
                <div className="space-y-1.5">
                  {sources.map((src, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50"
                    >
                      <span className="truncate mr-2 font-mono">{src.document}</span>
                      {src.relevance_score != null && (
                        <span className="text-muted-foreground shrink-0">
                          {(src.relevance_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function DebugItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {children}
    </div>
  );
}

export default DebugPanel;
