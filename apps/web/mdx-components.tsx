import type { MDXComponents } from "mdx/types";

/**
 * Styling for MDX guide content (content/*.mdx). Content style guide
 * (AGENTS.md §8): plain language, answer-first, calm tone.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1 className="text-2xl font-bold tracking-tight text-slate-900" {...props} />
    ),
    h2: (props) => (
      <h2 className="mt-8 text-lg font-semibold text-slate-900" {...props} />
    ),
    h3: (props) => (
      <h3 className="mt-6 text-base font-semibold text-slate-900" {...props} />
    ),
    p: (props) => (
      <p className="mt-3 text-sm leading-relaxed text-slate-700" {...props} />
    ),
    ul: (props) => (
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700" {...props} />
    ),
    ol: (props) => (
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-700" {...props} />
    ),
    a: (props) => <a className="underline hover:text-slate-900" {...props} />,
    strong: (props) => <strong className="font-semibold text-slate-900" {...props} />,
    code: (props) => (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800" {...props} />
    ),
    pre: (props) => (
      <pre
        className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-slate-100"
        {...props}
      />
    ),
    blockquote: (props) => (
      <blockquote
        className="mt-4 rounded-r-xl border-l-4 border-blue-500 bg-blue-50 p-4 text-sm leading-relaxed text-slate-800 [&>p]:mt-0"
        {...props}
      />
    ),
    ...components,
  };
}
