const mdModules = import.meta.glob('../locales/*/blog/*.md');

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string;
  banner?: string;
  preview?: string;
  content: string;
  author: string;
  published_date: string;
  category?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  schema_json_ld?: Record<string, unknown>;
}

const FALLBACK_IMAGE = 'https://snack.yummiespromociones.com/yumminuts/bgrecipes.png';

function parseLocaleFromPath(path: string): string {
  const match = path.match(/locales\/([^/]+)\/blog\//);
  return match?.[1] ?? '';
}

function toDate(value: string | undefined): number {
  if (!value) return 0;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/').map(Number);
    return new Date(year, (month || 1) - 1, day || 1).getTime();
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function loadPostFromPath(path: string, includeContent: boolean): Promise<BlogPost | null> {
  const mod = (await mdModules[path]()) as {
    frontmatter?: Record<string, unknown>;
    compiledContent?: () => Promise<string>;
  };
  const fm = mod.frontmatter ?? {};

  if (!fm.id || !fm.slug || !fm.title) return null;

  let content = '';
  if (includeContent && typeof mod.compiledContent === 'function') {
    const raw = await mod.compiledContent();
    content = typeof raw === 'string' ? raw.trim() : '';
  }

  const preview = fm.preview ? String(fm.preview) : '';
  const banner = fm.banner ? String(fm.banner) : '';

  return {
    id: String(fm.id),
    slug: String(fm.slug),
    title: String(fm.title),
    summary: fm.summary
      ? String(fm.summary)
      : fm.meta_description
        ? String(fm.meta_description)
        : '',
    image: preview || banner || (fm.image ? String(fm.image) : FALLBACK_IMAGE),
    banner: banner || preview || undefined,
    preview: preview || undefined,
    content,
    author: fm.author ? String(fm.author) : 'Yummi Nuts',
    published_date: fm.published_date ? String(fm.published_date) : '',
    category: fm.category ? String(fm.category) : undefined,
    meta_title: fm.meta_title ? String(fm.meta_title) : undefined,
    meta_description: fm.meta_description ? String(fm.meta_description) : undefined,
    keywords: Array.isArray(fm.keywords) ? fm.keywords.map(String) : undefined,
    schema_json_ld: fm.schema_json_ld as Record<string, unknown> | undefined,
  };
}

export async function getBlogPostsForLocale(
  locale: string,
  includeContent = false
): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];

  for (const path in mdModules) {
    if (parseLocaleFromPath(path) !== locale) continue;
    const post = await loadPostFromPath(path, includeContent);
    if (post) posts.push(post);
  }

  return posts.sort((a, b) => toDate(b.published_date) - toDate(a.published_date));
}
