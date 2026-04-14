import { Highlight, themes } from "prism-react-renderer";
import { useStore } from "../store/useStore";
import { Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

interface Props {
  code: string;
  language?: string;
}

export default function CodePanel({ code, language = "python" }: Props) {
  const { theme } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  return (
    <div className="relative group rounded-lg overflow-hidden border border-edge">
      <Highlight
        theme={theme === "dark" ? themes.nightOwl : themes.nightOwlLight}
        code={code.trim()}
        language={language as any}
      >
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="font-mono text-[13px] leading-relaxed px-4 py-3 overflow-x-auto"
            style={{ ...style, background: "var(--surface-1)", margin: 0 }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="inline-block w-6 text-right mr-4 text-txt-muted/40 select-none text-[11px]">
                  {i + 1}
                </span>
                {line.map((token, j) => (
                  <span key={j} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-md
                   bg-surface-2/80 text-txt-muted hover:text-txt-primary opacity-0 group-hover:opacity-100
                   transition-all duration-150"
      >
        {copied ? <Check size={13} className="text-accent-emerald" /> : <Copy size={13} />}
      </button>
    </div>
  );
}
