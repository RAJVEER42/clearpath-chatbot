import Icons from "./icons";

interface Props {
  flags: string[];
}

const FLAG_LABELS: Record<string, string> = {
  no_context: "No relevant documents found",
  refusal: "Model unable to answer",
  conflicting_sources: "Multiple conflicting sources",
};

const WarningBanner = ({ flags }: Props) => {
  if (flags.length === 0) return null;

  return (
    <div className="flex items-start gap-2.5 px-4 py-3 mt-3 rounded-xl bg-[oklch(0.45_0.15_45_/_10%)] border border-[oklch(0.45_0.15_45_/_20%)] text-[oklch(0.8_0.12_45)]">
      <Icons.warning className="size-4 shrink-0 mt-0.5 text-[oklch(0.7_0.18_45)]" />
      <div>
        <p className="font-medium text-sm">Low confidence — please verify with support.</p>
        <ul className="mt-1 text-xs text-[oklch(0.65_0.1_45)] space-y-0.5">
          {flags.map((flag) => (
            <li key={flag}>• {FLAG_LABELS[flag] ?? flag}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WarningBanner;
