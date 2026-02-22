import Icons from "./icons";

interface Props {
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS = [
  {
    icon: "💰",
    title: "What plans does ClearPath offer?",
    description: "Pricing and feature comparison",
  },
  {
    icon: "🚀",
    title: "How do I get started?",
    description: "Quick setup guide",
  },
  {
    icon: "🔗",
    title: "What integrations are available?",
    description: "Third-party tool connections",
  },
  {
    icon: "📤",
    title: "How do I export my data?",
    description: "Data export options",
  },
];

const EmptyState = ({ onSelectPrompt }: Props) => {
  return (
    <div className="relative flex flex-col items-center justify-end w-full h-full animate-blur-in">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="relative w-full flex flex-col items-center justify-center">
          {/* Animated logo */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-20 h-20 rounded-full bg-[oklch(0.55_0.2_270_/_15%)] blur-xl animate-pulse-slow" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[oklch(0.2_0.02_270)] border border-[oklch(1_0_0_/_8%)]">
              <Icons.clearpath className="size-8 text-[oklch(0.75_0.15_270)]" />
            </div>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight bg-gradient-to-b from-white to-[oklch(0.7_0_0)] bg-clip-text text-transparent">
            How can I help you today?
          </h2>
          <p className="text-[oklch(0.5_0.01_270)] mt-2 text-[15px]">
            Ask anything about ClearPath
          </p>
        </div>

        {/* Prompt cards */}
        <div className="grid w-full max-w-xl grid-cols-1 gap-2.5 mt-10 mb-6 md:grid-cols-2 px-4">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt.title}
              onClick={() => onSelectPrompt(prompt.title)}
              className="prompt-card flex flex-col items-start w-full select-none"
            >
              <span className="text-lg mb-1.5">{prompt.icon}</span>
              <span className="text-[14px] font-medium text-[oklch(0.9_0_0)]">{prompt.title}</span>
              <span className="text-[12px] text-[oklch(0.5_0.01_270)] mt-0.5">
                {prompt.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
