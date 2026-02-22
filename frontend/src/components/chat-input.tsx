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
    <div className="fixed bottom-0 inset-x-0 mx-auto z-50 pb-5 px-4">
      <div className="mx-auto max-w-3xl">
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
          <div className="input-glow-wrapper">
            <div className="relative w-full rounded-[1.25rem] p-1 flex flex-col z-10">
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
                    "h-auto pl-5 pr-14 py-4 overflow-y-auto bg-transparent border-0 resize-none text-left focus:outline-none min-h-[3.5rem] max-h-52 w-full text-[15px] placeholder:text-[oklch(0.5_0.01_270)]",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>

              {/* Send button */}
              <div className="absolute right-3 bottom-3 z-20">
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "flex items-center justify-center size-10 rounded-xl transition-all duration-200 active:scale-90",
                    input.trim() && !isLoading
                      ? "send-btn-active"
                      : "bg-[oklch(0.25_0.01_270)] text-[oklch(0.5_0.01_270)]",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
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
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
        <p className="text-center text-[11px] text-[oklch(0.45_0.01_270)] mt-2.5">
          ClearPath Support may make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
