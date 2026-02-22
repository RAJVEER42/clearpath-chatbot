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
        "fixed top-0 right-0 h-full w-full lg:w-[25%] debug-panel z-40 transition-transform duration-300 overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-4 pt-16">
        <h3 className="text-sm font-semibold text-[oklch(0.85_0_0)] mb-4">Debug Info</h3>

        {!metadata ? (
          <p className="text-sm text-[oklch(0.5_0.01_270)]">
            Send a message to see debug info
          </p>
        ) : (
          <div className="space-y-4">
            {/* Model */}
            <DebugItem label="Model">
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium",
                  metadata.model_used.includes("8b")
                    ? "bg-[oklch(0.4_0.15_160_/_20%)] text-[oklch(0.75_0.15_160)] border border-[oklch(0.4_0.15_160_/_20%)]"
                    : "bg-[oklch(0.5_0.18_30_/_20%)] text-[oklch(0.8_0.15_30)] border border-[oklch(0.5_0.18_30_/_20%)]"
                )}
              >
                {metadata.model_used.includes("8b") ? "⚡ Llama 8B" : "🧠 Llama 70B"}
              </span>
            </DebugItem>

            {/* Classification */}
            <DebugItem label="Classification">
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium",
                  metadata.classification === "simple"
                    ? "bg-[oklch(0.5_0.15_250_/_20%)] text-[oklch(0.75_0.12_250)] border border-[oklch(0.5_0.15_250_/_20%)]"
                    : "bg-[oklch(0.5_0.18_300_/_20%)] text-[oklch(0.8_0.15_300)] border border-[oklch(0.5_0.18_300_/_20%)]"
                )}
              >
                {metadata.classification}
              </span>
            </DebugItem>

            {/* Tokens */}
            <DebugItem label="Tokens">
              <div className="flex gap-3 font-mono text-xs">
                <span className="px-2 py-1 rounded-md bg-[oklch(1_0_0_/_5%)]">
                  <span className="text-[oklch(0.5_0.01_270)]">in: </span>
                  <span className="text-[oklch(0.85_0_0)]">{metadata.tokens.input.toLocaleString()}</span>
                </span>
                <span className="px-2 py-1 rounded-md bg-[oklch(1_0_0_/_5%)]">
                  <span className="text-[oklch(0.5_0.01_270)]">out: </span>
                  <span className="text-[oklch(0.85_0_0)]">{metadata.tokens.output.toLocaleString()}</span>
                </span>
              </div>
            </DebugItem>

            {/* Chunks */}
            <DebugItem label="Chunks Retrieved">
              <span className="font-mono text-xs text-[oklch(0.85_0_0)]">{metadata.chunks_retrieved}</span>
            </DebugItem>

            {/* Latency */}
            <DebugItem label="Latency">
              <span className="font-mono text-xs text-[oklch(0.85_0_0)]">{metadata.latency_ms}ms</span>
            </DebugItem>

            {/* Evaluator Flags */}
            <DebugItem label="Evaluator Flags">
              {metadata.evaluator_flags.length === 0 ? (
                <span className="text-xs text-[oklch(0.5_0.01_270)]">✓ None</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {metadata.evaluator_flags.map((flag) => (
                    <span
                      key={flag}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[oklch(0.5_0.2_25_/_20%)] text-[oklch(0.8_0.15_25)] border border-[oklch(0.5_0.2_25_/_20%)]"
                    >
                      ⚠ {flag}
                    </span>
                  ))}
                </div>
              )}
            </DebugItem>

            {/* Sources */}
            {sources.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[oklch(0.5_0.01_270)] mb-2">
                  Sources
                </p>
                <div className="space-y-1.5">
                  {sources.map((src, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[oklch(1_0_0_/_3%)] border border-[oklch(1_0_0_/_5%)]"
                    >
                      <span className="truncate mr-2 font-mono text-[oklch(0.8_0_0)]">{src.document}</span>
                      {src.relevance_score != null && (
                        <span className="text-[oklch(0.5_0.01_270)] shrink-0">
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
      <p className="text-xs font-medium text-[oklch(0.5_0.01_270)] mb-1.5">{label}</p>
      {children}
    </div>
  );
}

export default DebugPanel;
