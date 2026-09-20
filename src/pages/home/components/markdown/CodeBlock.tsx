import { memo, useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.min.css';

interface CodeBlockProps {
  code: string;
  language?: string;
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text);
  }
}

const CodeBlock = memo(function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(() => {
    const lang = language && hljs.getLanguage(language) ? language : '';
    if (!lang) return { html: '', plain: true };
    if (code.length > 20000) return { html: '', plain: true };
    try {
      const { value } = hljs.highlight(code, { language: lang, ignoreIllegals: true });
      return { html: value, plain: false };
    } catch {
      return { html: '', plain: true };
    }
  }, [code, language]);

  const handleCopy = () => {
    copyText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group/code my-4 overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117] shadow-sm dark:border-zinc-700/60">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-900/70 px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </span>
          {language && (
            <span className="ml-1 truncate font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-zinc-400 transition-all duration-150 hover:bg-zinc-800 hover:text-zinc-100 active:scale-95"
        >
          <i className={copied ? 'ri-check-line text-xs text-emerald-400' : 'ri-file-copy-line text-xs'} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-[560px] overflow-x-auto overflow-y-auto bg-transparent p-4">
        {highlighted.plain ? (
          <code className="font-mono text-[13px] leading-relaxed whitespace-pre text-zinc-100">
            {code}
          </code>
        ) : (
          <code
            className="font-mono text-[13px] leading-relaxed whitespace-pre text-zinc-100"
            dangerouslySetInnerHTML={{ __html: highlighted.html }}
          />
        )}
      </pre>
    </div>
  );
});

export default CodeBlock;