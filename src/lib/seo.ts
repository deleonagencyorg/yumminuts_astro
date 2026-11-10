export const SITE_ORIGIN = 'https://www.yumminuts.com';

const SECTION_ES_TO_EN: Record<string, string> = {
  productos: 'products',
  recetas: 'recipes',
  contacto: 'contact',
  marcas: 'brands',
  salud: 'health',
  nosotros: 'about-us',
  blog: 'blog',
  noticias: 'news',
};

const SECTION_EN_TO_ES: Record<string, string> = Object.fromEntries(
  Object.entries(SECTION_ES_TO_EN).map(([es, en]) => [en, es]),
);

export function withTrailingSlash(pathname: string): string {
  if (!pathname) return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function absoluteUrl(pathname: string): string {
  return new URL(withTrailingSlash(pathname), SITE_ORIGIN).href;
}

export function formatDocumentTitle(raw: string | undefined, pathname: string, lang: 'es' | 'en'): string {
  const isHome = /^\/(es|en)\/?$/.test(pathname);
  if (isHome) {
    return lang === 'en'
      ? 'Yummi Nuts | Peanuts and nuts for every moment'
      : 'Yummi Nuts | Maní y frutos secos para cada momento';
  }

  const value = (raw ?? '').replace(/\s+/g, ' ').trim();
  if (!value) return 'Yummi Nuts';
  if (/\|\s*Yummi Nuts$/i.test(value)) return value;

  const cleaned = value
    .replace(/^Yummi Nuts\s*[-–|]?\s*/i, '')
    .replace(/\s*[-–|]\s*Yummi Nuts$/i, '')
    .replace(/\s+con Yummi Nuts$/i, '')
    .replace(/\s+with Yummi Nuts$/i, '')
    .trim();

  return `${cleaned || 'Yummi Nuts'} | Yummi Nuts`;
}

export function alternatePaths(pathname: string): { lang: string; path: string }[] {
  const parts = pathname.split('/').filter(Boolean);
  const locale = parts[0] === 'en' ? 'en' : 'es';
  const rest = parts.slice(1);

  if (rest.length === 0) {
    return [
      { lang: 'es', path: '/es/' },
      { lang: 'en', path: '/en/' },
    ];
  }

  const section = rest[0];
  const esSection = locale === 'es' ? section : (SECTION_EN_TO_ES[section] ?? section);
  const enSection = SECTION_ES_TO_EN[esSection] ?? esSection;
  const known = esSection in SECTION_ES_TO_EN;

  if (!known) {
    return [{ lang: locale, path: withTrailingSlash(pathname) }];
  }

  if (rest.length === 1) {
    return [
      { lang: 'es', path: `/es/${esSection}/` },
      { lang: 'en', path: `/en/${enSection}/` },
    ];
  }

  if (esSection === 'productos') {
    const id = rest[1];
    return [
      { lang: 'es', path: `/es/productos/${id}/` },
      { lang: 'en', path: `/en/products/${id}/` },
    ];
  }

  return [{ lang: locale, path: withTrailingSlash(`/${locale}/${rest.join('/')}`) }];
}

export function recipeExcerpt(recipe: { title?: string; instructions?: string[] }): string {
  const title = (recipe.title ?? '').trim();
  const step = (recipe.instructions ?? []).find((item) => item && !item.trim().endsWith(':'));
  const text = [title, step].filter(Boolean).join('. ').replace(/\s+/g, ' ').trim();
  if (text.length <= 155) return text;
  return `${text.slice(0, 152).trimEnd()}…`;
}

export function productJsonLd(product: {
  name?: string;
  description?: string;
  image?: string;
  sizes?: { image?: string }[];
}, pathname: string) {
  const image = product.image || product.sizes?.[0]?.image;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: 'Yummi Nuts' },
    manufacturer: {
      '@type': 'Organization',
      name: 'Snacks Yummies',
      url: 'https://www.snacksyummies.com/',
    },
    image: image ? [image] : undefined,
    url: absoluteUrl(pathname),
  };
}
