import Icons from "./icons";

interface Props {
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS = [
  {
    title: "What plans does ClearPath offer?",
    description: "Pricing and feature comparison",
  },
  {
    title: "How do I get started?",
    description: "Quick setup guide",
  },
  {
    title: "What integrations are available?",
    description: "Third-party tool connections",
  },
  {
    title: "How do I export my data?",
    description: "Data export options",
  },
];

const EmptyState = ({ onSelectPrompt }: Props) => {
  return (
    <div className="relative flex flex-col items-center justify-end w-full h-full animate-blur-in">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="relative w-full flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <Icons.clearpath className="size-16 text-foreground" />
            <div className="absolute bottom-0 bg-orange-500 w-10 h-[2px] blur-sm rounded-full mx-auto" />
          </div>
          <h2 className="text-2xl font-medium mt-4">Hello!</h2>
          <p className="text-muted-foreground mt-1">
            Ask anything about ClearPath
          </p>
        </div>
        <div className="grid w-full max-w-lg grid-cols-1 gap-2 mt-10 mb-6 md:grid-cols-2">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt.title}
              onClick={() => onSelectPrompt(prompt.title)}
              className="flex flex-col items-start w-full px-4 py-4 bg-transparent border cursor-pointer rounded-2xl border-border hover:bg-muted select-none active:scale-95 transition transform text-left"
            >
              <span className="text-base font-medium">{prompt.title}</span>
              <span className="text-sm text-muted-foreground">
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
