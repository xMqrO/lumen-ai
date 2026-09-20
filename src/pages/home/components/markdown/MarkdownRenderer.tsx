import { memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import CodeBlock from './CodeBlock';

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

function safeUrl(url: string): string {
  try {
    const parsed = new URL(url, 'https://lumen.app');
    if (SAFE_PROTOCOLS.includes(parsed.protocol)) return url;
    return '';
  } catch {
    return '';
  }
}

const components: Components = {
  pre: ({ children }) => <>{children}</>,

  code({ className, children }) {
    const match = /language-([\w-]+)/.exec(className ?? '');
    const text = String(children).replace(/\n$/, '');
    if (match || text.includes('\n')) {
      return <CodeBlock code={text} language={match?.[1]} />;
    }
    return (
      <code
        className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.84em] text-brand-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-brand-300"
      >
        {children}
      </code>
    );
  },

  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 font-display text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2.5 mt-6 font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 font-display text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mb-1.5 mt-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
      {children}
    </h6>
  ),

  p: ({ children }) => (
    <p className="my-3 text-[15px] leading-[1.7] text-zinc-800 dark:text-zinc-100">
      {children}
    </p>
  ),

  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-50">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-zinc-800 dark:text-zinc-100">{children}</em>,
  del: ({ children }) => (
    <del className="text-zinc-500 opacity-70 dark:text-zinc-400 line-through">{children}</del>
  ),

  a: ({ href, children }) =>
    href ? (
      <a
        href={safeUrl(href) || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="break-words font-medium text-brand-600 underline underline-offset-2 transition-colors hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
      >
        {children}
        <i className="ri-external-link-line ml-0.5 inline-block text-[0.72em] translate-y-[1px]" />
      </a>
    ) : (
      <span className="text-zinc-700 dark:text-zinc-200">{children}</span>
    ),

  ul: ({ children }) => (
    <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-brand-500 [&_ul]:my-1.5">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-6 marker:text-brand-500 [&_ol]:my-1.5">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-[1.75] text-zinc-800 dark:text-zinc-100">{children}</li>
  ),

  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-r-lg border-l-2 border-brand-500 bg-brand-500/5 px-4 py-2 text-[15px] leading-[1.7] text-zinc-700 dark:bg-brand-500/10 dark:text-zinc-300">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="my-6 border-zinc-200 dark:border-zinc-800" />,

  img: ({ src, alt }) =>
    src ? (
      <img
        src={safeUrl(src) || undefined}
        alt={alt || 'image'}
        loading="lazy"
        className="my-4 max-h-[420px] rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
      />
    ) : null,

  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-700">
      <table className="w-full min-w-[400px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-zinc-100 dark:bg-zinc-800/80">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700/70 dark:bg-zinc-900">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="transition-colors even:bg-zinc-50/60 hover:bg-brand-500/[0.04] dark:even:bg-zinc-800/30">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="whitespace-nowrap border-b border-zinc-200 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3.5 py-2.5 align-top leading-relaxed text-zinc-800 dark:text-zinc-100">
      {children}
    </td>
  ),
};

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = memo(function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="max-w-none overflow-x-hidden">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
});

export default MarkdownRenderer;