import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import config from '../i18n/config';
import { t } from '../i18n/i18n';

const staticPages = ['/', '/menu', '/nosotros', '/contacto'];

// Menu URLs from both languages
const menuUrls = [
  '/marcas', '/brands',
  '/blog',
  '/contacto', '/contact',
  '/encontranos', '/find-us'
];

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  
  // Generate language versions of static pages
  const staticPagesWithLang = staticPages.flatMap(page => 
    config.supportedLocales.map(lang => `/${lang}${page}`)
  );

  // Generate language versions of menu URLs
  const menuUrlsWithLang = menuUrls.flatMap(url => {
    const lang = url.startsWith('/en') ? 'en' : 'es';
    return config.supportedLocales.includes(lang) 
      ? [`/${lang}${url.replace(`/${lang}`, '')}`]
      : [url];
  });

  // Blog posts with language prefixes
  const blogPosts = posts.map(post => 
    `/${post.slug.split('/')[0]}/blog/${post.slug.split('/')[1]}`
  );

  // Build product URLs for each supported locale
  const productUrls: string[] = [];
  for (const lang of config.supportedLocales) {
    const items = (t('items', { namespace: 'products', locale: lang as any }) as any[]) || [];
    const seg = lang === 'es' ? 'productos' : 'products';
    for (const p of items) {
      const id = p?.id || '';
      if (!id) continue;
      productUrls.push(`/${lang}/${seg}/${id}`);
    }
  }

  const allUrls = [...staticPagesWithLang, ...menuUrlsWithLang, ...blogPosts, ...productUrls];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allUrls.map(url => `
        <url>
          <loc>https://snacksyummies.com${url}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`.trim(),
    {
      headers: {
        'Content-Type': 'application/xml',
      },
    }
  );
};
