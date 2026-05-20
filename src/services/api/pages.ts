// src/services/api/pages.ts
import { cmsClient } from './client';

const BRAND_SLUG = import.meta.env.PUBLIC_CMS_BRAND_SLUG ?? 'yummi-nuts';

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string | { url: string };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | { url: string };
  languageCode?: string;
}

export async function getPageBySlug(slug: string, locale: string = 'es'): Promise<CMSPage | null> {
  try {
    console.log(`[CMS] Obteniendo página: ${slug} | locale: ${locale}`);

    const response = await cmsClient.get<{ data: CMSPage[] }>(`v1/pages`, {
  slug: slug,
  languageCode: locale,
  brandSlug: BRAND_SLUG,
});
return response.data?.[0] ?? null;

    const page = response.data?.[0] ?? null;

    if (page) {
      console.log(`[CMS] página "${slug}" cargada correctamente`);
    } else {
      console.warn(`[CMS] página "${slug}" no encontrada`);
    }

    return page;

  } catch (error) {
    console.error(`[CMS] Error al obtener página ${slug}:`, error);
    return null;
  }
}