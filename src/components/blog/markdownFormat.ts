export type MarkdownTag =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'a' | 'strong' | 'em' | 'blockquote' | 'hr'
  | 'ul' | 'ol' | 'li'
  | 'img' | 'figure' | 'figcaption'
  | 'pre' | 'code'
  | 'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td';

export type MarkdownClassMap = Partial<Record<MarkdownTag, string>> & {
  root?: string;
};

export const defaultBlogMarkdownClasses: MarkdownClassMap = {
  h2: 'font-heading text-2xl md:text-3xl font-bold text-black mt-10 mb-4',
  h3: 'font-heading text-xl md:text-2xl font-semibold text-black mt-8 mb-3',
  p: 'text-gray-700 mb-4 leading-relaxed',
  a: 'text-primary underline underline-offset-4 hover:opacity-80 transition-colors',
  strong: 'font-bold text-black',
  em: 'italic',
  blockquote: 'border-l-4 border-primary/40 pl-4 italic my-6 text-gray-600',
  hr: 'my-8 border-gray-200',
  ul: 'list-disc pl-6 my-4 space-y-2 text-gray-700',
  ol: 'list-decimal pl-6 my-4 space-y-2 text-gray-700',
  li: 'leading-relaxed',
  img: 'rounded-xl shadow-md my-6 mx-auto',
};

export function normalizeBlogHtmlContent(content: unknown): string {
  if (!content || typeof content !== 'string') return '';
  const trimmed = content.trim();
  if (!trimmed || trimmed === '[object Promise]') return '';
  return trimmed;
}

export function hasVisibleBlogContent(html: string): boolean {
  const normalized = normalizeBlogHtmlContent(html);
  if (!normalized) return false;

  return normalized
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim().length > 0;
}

export function formatMarkdownHtml(
  html: string,
  classes: MarkdownClassMap = defaultBlogMarkdownClasses
): string {
  if (!html) return '';
  let out = html;

  const addClasses = (tag: MarkdownTag, className: string) => {
    if (!className) return;
    const openTag = new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi');
    out = out.replace(openTag, (match) => {
      const hasClass =
        /\sclass\s*=\s*"[^"]*"/i.test(match) ||
        /\sclass\s*=\s*'[^']*'/i.test(match);

      if (hasClass) {
        return match.replace(/class\s*=\s*(["'])([^"']*)(["'])/i, (_m, q1, existing, q2) => {
          const merged = mergeClassNames(existing, className);
          return `class=${q1}${merged}${q2}`;
        });
      }

      return match.replace(/>$/, ` class="${className}">`);
    });
  };

  const tags: MarkdownTag[] = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'strong', 'em', 'blockquote', 'hr',
    'ul', 'ol', 'li',
    'img', 'figure', 'figcaption',
    'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ];

  for (const tag of tags) {
    const cls = classes[tag];
    if (cls) addClasses(tag, cls);
  }

  return out;
}

export function promoteBlogQuestionsToH2(html: string): string {
  if (!html) return '';

  return html.replace(/<p>\s*(¿[^<]+?\?)\s*<\/p>/gi, (_match, question: string) => {
    return `<h2>${question.trim()}</h2>`;
  });
}

function mergeClassNames(existing: string, extra: string): string {
  const set = new Set(existing.split(/\s+/).filter(Boolean));
  for (const cls of extra.split(/\s+/)) {
    if (cls) set.add(cls);
  }
  return Array.from(set).join(' ');
}
