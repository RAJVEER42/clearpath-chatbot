import { memo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import Icons from "./icons";

interface Props {
  language: string;
  value: string;
}

const CodeBlock = memo(({ language, value }: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative w-full mt-2 mb-4 font-sans rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-border overflow-hidden">
      <div className="flex items-center justify-between w-full px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-muted-foreground select-none">
        <span className="text-xs lowercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isCopied ? (
            <Icons.check className="w-3.5 h-3.5" />
          ) : (
            <Icons.copy className="w-3.5 h-3.5" />
          )}
          <span>{isCopied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={materialLight}
        PreTag="div"
        showLineNumbers={false}
        customStyle={{
          margin: 0,
          width: "100%",
          background: "transparent",
          padding: "1.5rem 1rem",
          scrollbarWidth: "none",
          fontFamily: "JetBrains Mono, monospace",
        }}
        codeTagProps={{
          style: {
            fontSize: "0.9rem",
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
          },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";

export default CodeBlock;
