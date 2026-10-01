import { cmsClient } from './client';
import { belongsToCurrentBrand, withBrandFilter } from './config';

interface CmsNewsBrand {
  id: string;
  name: string;
  slug: string;
}

interface CmsNewsRaw {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  image?: string;
  imageMobile?: string;
  gallery?: string[];
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  author?: string;
  publishedAt?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  languageCode: string;
  brands?: CmsNewsBrand[];
  createdAt: string;
}

interface NewsListResponse {
  data: CmsNewsRaw[];
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  published_date: string;
  isFeatured: boolean;
}

function mapNews(item: CmsNewsRaw): NewsItem {
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.title,
    content: item.content || '',
    excerpt: item.excerpt || '',
    image: item.image || '',
    author: item.author || '',
    published_date: item.publishedAt || item.createdAt,
    isFeatured: item.isFeatured,
  };
}

export async function getAllNews(locale: string = 'es'): Promise<NewsItem[]> {
  try {
    const response = await cmsClient.get<NewsListResponse>(
      'v1/news',
      withBrandFilter({
        page: 1,
        pageSize: 100,
        languageCode: locale,
        isPublished: true,
      })
    );

    const news = (response.data ?? [])
      .filter((item) => belongsToCurrentBrand(item.brands))
      .map(mapNews);

    console.log(`[CMS] Noticias recibidas: ${news.length} (${locale})`);
    return news;
  } catch (error) {
    console.error('[CMS] Error al obtener noticias:', error);
    return [];
  }
}

export async function getNewsBySlug(slug: string, locale: string = 'es'): Promise<NewsItem | null> {
  const news = await getAllNews(locale);
  return news.find((item) => item.slug === slug) ?? null;
}
