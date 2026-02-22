import { useEffect, useRef, useState } from "react";
import useEnterSubmit from "../hooks/use-enter-submit";
import { cn } from "../lib/utils";
import Icons from "./icons";

interface Props {
  isLoading: boolean;
  onSend: (message: string) => void;
  onInputChange?: (value: string) => void;
  externalInput?: string;
}

const ChatInput = ({
  isLoading,
  onSend,
  onInputChange,
  externalInput,
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { formRef, onKeyDown } = useEnterSubmit();
  const [input, setInput] = useState("");

  useEffect(() => {
    if (externalInput !== undefined && externalInput !== input) {
      setInput(externalInput);
    }
  }, [externalInput]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleChange = (value: string) => {
    setInput(value);
    onInputChange?.(value);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 mx-auto transition-all duration-300 bg-background z-50">
      <div className="px-3 text-base pb-4 md:px-5 lg:px-1 xl:px-5">
        <div className="flex flex-1 gap-4 mx-auto text-base md:gap-5 lg:gap-6 md:max-w-3xl">
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              if (isLoading) return;
              const trimmed = input.trim();
              if (!trimmed) return;
              onSend(trimmed);
              setInput("");
            }}
            className="relative w-full"
          >
            <div className="relative w-full gap-x-1.5 rounded-xl p-1 transition-colors bg-background border border-border/60 overflow-y-auto flex flex-col z-0">
              <div className="relative flex flex-col justify-center flex-1 min-w-0">
                <textarea
                  rows={1}
                  tabIndex={0}
                  value={input}
                  autoFocus
                  ref={textareaRef}
                  disabled={isLoading}
                  onKeyDown={onKeyDown}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Ask about ClearPath..."
                  className={cn(
                    "h-auto pl-4 overflow-y-auto bg-transparent border-0 resize-none text-left focus:outline-none min-h-20 max-h-52 w-full",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>

              {/* Send button */}
              <div className="absolute right-2 bottom-2 z-20">
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "flex items-center justify-center size-9 rounded-lg transition-all active:scale-90",
                    input.trim() && !isLoading
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <Icons.loader className="size-4 animate-spin" />
                  ) : (
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 19V5M12 5L5 12M12 5L19 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
