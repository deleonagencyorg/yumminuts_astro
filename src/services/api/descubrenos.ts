// src/services/api/descubrenos.ts
import { cmsClient } from './client';
import { cmsConfig, withSiteFilter } from './config';

export type DescubrenosPage = 'home' | 'products' | 'health';

export interface InstagramPost {
  id: string;
  postUrl: string;
  embedUrl: string;
  imageUrl: string;
  fallbackImage: string;
  alt: string;
  position: number;
}

export interface Descubrenos {
  id: string;
  title: string;
  languageCode?: string;
  showOnHome?: boolean;
  showOnProducts?: boolean;
  showOnHealth?: boolean;
  posts: InstagramPost[];
}

export interface DiscoverSection {
  title: string;
  posts: InstagramPost[];
}

interface DescubrenosListResponse {
  data: Descubrenos[];
}

export function toInstagramEmbedUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('instagram.com')) {
      return url;
    }

    parsed.search = '';
    parsed.hash = '';
    const path = parsed.pathname.replace(/\/+$/, '');
    if (path.endsWith('/embed')) {
      return `${parsed.origin}${path}/`;
    }

    return `${parsed.origin}${path}/embed/`;
  } catch {
    return url;
  }
}

function mapPost(post: Partial<InstagramPost>, index: number): InstagramPost | null {
  const embedUrl = toInstagramEmbedUrl(post.embedUrl || post.postUrl || '');
  if (!embedUrl) return null;

  return {
    id: post.id || `post-${index}`,
    postUrl: post.postUrl || '',
    embedUrl,
    imageUrl: post.imageUrl || '',
    fallbackImage: post.fallbackImage || '',
    alt: post.alt || '',
    position: post.position ?? index,
  };
}

function mapDescubrenos(item: Descubrenos): Descubrenos | null {
  const posts = (item.posts ?? [])
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map(mapPost)
    .filter((post): post is InstagramPost => post !== null);

  if (!posts.length) return null;

  return {
    ...item,
    posts,
  };
}

function matchesPage(item: Descubrenos, page: DescubrenosPage): boolean {
  if (page === 'home') return item.showOnHome !== false;
  if (page === 'products') return item.showOnProducts === true;
  return item.showOnHealth === true;
}

export async function getDescubrenos(
  locale: string = 'es',
  page: DescubrenosPage = 'home'
): Promise<Descubrenos | null> {
  const response = await cmsClient.get<DescubrenosListResponse>(
    'v1/descubrenos',
    withSiteFilter({
      page: 1,
      pageSize: 20,
      languageCode: locale,
    })
  );

  const items = response.data ?? [];
  const item = items.find((entry) => matchesPage(entry, page)) ?? null;
  if (!item) {
    console.log(
      `[CMS] Sin descubrenos para ${page} (${locale}, site=${cmsConfig.siteId}). Recibidos: ${items.length}`
    );
    return null;
  }

  const mapped = mapDescubrenos(item);
  console.log(`[CMS] Descubrenos "${mapped?.title ?? item.title}" con ${mapped?.posts.length ?? 0} posts para ${page}`);
  return mapped;
}

export async function getDiscoverSection(
  locale: string,
  page: DescubrenosPage
): Promise<DiscoverSection | null> {
  try {
    const item = await getDescubrenos(locale, page);
    if (!item) return null;

    return {
      title: item.title || '',
      posts: item.posts,
    };
  } catch (error) {
    console.error('[CMS] Error al obtener descubrenos:', error);
    return null;
  }
}