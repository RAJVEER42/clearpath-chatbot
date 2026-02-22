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
    <div className="flex items-start gap-2 px-3 py-2 mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
      <Icons.warning className="size-4 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">Low confidence — please verify with support.</p>
        <ul className="mt-1 text-xs text-amber-700 dark:text-amber-300">
          {flags.map((flag) => (
            <li key={flag}>{FLAG_LABELS[flag] ?? flag}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WarningBanner;
