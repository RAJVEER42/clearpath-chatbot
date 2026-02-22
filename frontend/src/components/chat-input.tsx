import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import Icons from "./icons";
import { motion } from "framer-motion";

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
  externalInput?: string;
}

const ChatInput = ({ onSend, isLoading, externalInput }: Props) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (externalInput) {
      setInput(externalInput);
    }
  }, [externalInput]);

  const handleChange = (val: string) => {
    setInput(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        250
      )}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="absolute bottom-0 inset-x-0 w-full bg-gradient-to-t from-background via-background/80 to-transparent pt-10 pb-8 z-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full relative">
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="relative w-full"
        >
          {/* Animated RGB edge lighting wrapper */}
          <div className="rgb-edge p-[1px] shadow-glass-dark dark:shadow-[0_0_40px_-15px_rgba(255,255,255,0.1)]">
            <div className="rgb-core relative flex items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onKeyDown={onKeyDown}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Ask about ClearPath..."
                className={cn(
                  "w-full bg-transparent resize-none outline-none border-0 m-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                  "pl-6 pr-14 py-[1.125rem] min-h-[56px] max-h-52 overflow-y-auto rounded-full font-medium text-[15.5px]",
                  "text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                rows={1}
                disabled={isLoading}
              />

              {/* Minimal Send Button */}
              <div className="absolute right-3 bottom-2.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "flex items-center justify-center size-9 rounded-full transition-colors z-10",
                    input.trim() && !isLoading
                      ? "text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white"
                      : "text-slate-400 dark:text-slate-600",
                    "disabled:cursor-not-allowed bg-transparent"
                  )}
                >
                  {isLoading ? (
                    <Icons.loader className="size-4 animate-spin text-slate-400" />
                  ) : (
                    <svg
                      className="size-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5V19M12 5L6 11M12 5L18 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Helper footer text */}
        <div className="text-center mt-3">
          <p className="text-[12px] text-muted-foreground font-medium tracking-tight">
            ClearPath Assistant can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
