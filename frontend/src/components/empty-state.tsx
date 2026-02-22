import { motion } from "framer-motion";
import Icons from "./icons";

interface Props {
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS = [
  {
    icon: "document" as const,
    title: "Company Policies",
    description: "Read the employee handbook",
  },
  {
    icon: "rocket" as const,
    title: "IT Support & Onboarding",
    description: "Get help with technical setup",
  },
  {
    icon: "sparkles" as const,
    title: "Benefits Overview",
    description: "What perks are provided?",
  },
  {
    icon: "link" as const,
    title: "Who's who in the office?",
    description: "Find an employee contact",
  },
];

const ICON_MAP = {
  document: Icons.document,
  sparkles: Icons.clearpath,
  rocket: Icons.rocket,
  link: Icons.link,
};

const EmptyState = ({ onSelectPrompt }: Props) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[80%] max-h-[800px]">
      <div className="flex flex-col items-center justify-center size-full z-10 px-6">

        {/* Animated Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full flex flex-col items-center justify-center text-center space-y-4 mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-slate-800 to-sky-600 dark:from-sky-100 dark:to-sky-400 bg-clip-text text-transparent pb-1">
            How can I help?
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-300 font-medium max-w-sm">
            I'm ready to answer any questions about ClearPath.
          </p>
        </motion.div>

        {/* Premium Floating Prompt Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid w-full max-w-2xl grid-cols-1 md:grid-cols-2 gap-3"
        >
          {PROMPTS.map((prompt) => {
            const IconComponent = ICON_MAP[prompt.icon];
            return (
              <motion.button
                key={prompt.title}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectPrompt(prompt.title)}
                className="group relative overflow-hidden flex items-start gap-4 w-full select-none text-left p-4 rounded-3xl glass-panel hover:glass-panel-heavy transition-all duration-300"
              >
                {/* Hover Spotlight Effect (CSS only fake) */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-muted to-muted/50 border border-border shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300">
                  <IconComponent className="size-4.5 text-foreground/80 group-hover:text-foreground transition-colors" />
                </div>

                <div className="flex flex-col items-start pt-0.5">
                  <span className="text-[15px] font-medium text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {prompt.title}
                  </span>
                  <span className="text-[13px] text-muted-foreground mt-1 line-clamp-1">
                    {prompt.description}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default EmptyState;
