// src/services/api/pages.ts
import { cmsClient } from './client';

const SITE_ID = import.meta.env.PUBLIC_CMS_SITE_ID;

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  languageCode?: string;
  featuredImage?: {
    originalUrl?: string;
    seoUrl?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: {
    originalUrl?: string;
    seoUrl?: string;
  };
}

interface CMSPagesResponse {
  data: CMSPage[];
}

export async function getPageBySlug(slug: string, locale: string = 'es'): Promise<CMSPage | null> {
  try {
    const response = await cmsClient.get<CMSPagesResponse>('v1/pages', {
      page: 1,
      pageSize: 50,
      siteId: SITE_ID,
      languageCode: locale,
    });
    const page = response.data.find(p => p.slug === slug) ?? null;
    console.log(`[CMS] Página encontrada para slug "${slug}":`, page ? 'sí' : 'no');
    return page;
  } catch (error) {
    console.error(`[CMS] Error al obtener páginas:`, error);
    return null;
  }
}