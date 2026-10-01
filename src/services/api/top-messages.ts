// src/services/api/top-messages.ts
import { cmsClient } from './client';
import { cmsConfig } from './config';

export interface TopMessage {
  id: string;
  title: string;
  link?: string;
  order?: number;
  languageCode?: string;
  brandId?: string;
}

interface TopMessageListResponse {
  data: TopMessage[];
}

interface BrandListResponse {
  data: Array<{
    id: string;
    slug: string;
  }>;
}

async function getBrandIdBySlug(slug: string): Promise<string | null> {
  const response = await cmsClient.get<BrandListResponse>('v1/brands', {
    page: 1,
    pageSize: 50,
    slug,
  });

  const brands = response.data ?? [];
  const brand = brands.find((item) => item.slug === slug) ?? brands[0];
  return brand?.id ?? null;
}

function mapMessage(item: Partial<TopMessage>, index: number): TopMessage | null {
  const title = item.title?.trim();
  if (!title) return null;

  return {
    id: item.id || `message-${index}`,
    title,
    link: item.link?.trim() || '',
    order: item.order ?? index,
    languageCode: item.languageCode,
    brandId: item.brandId,
  };
}

export async function getTopMessages(locale: string = 'es'): Promise<TopMessage[]> {
  try {
    const brandId = await getBrandIdBySlug(cmsConfig.brandSlug);
    if (!brandId) {
      console.log(`[CMS] Marca no encontrada para cintillos: ${cmsConfig.brandSlug}`);
      return [];
    }

    const response = await cmsClient.get<TopMessageListResponse>('v1/top-messages', {
      languageCode: locale,
      brandId,
    });
    const messages = (response.data ?? [])
      .map(mapMessage)
      .filter((item): item is TopMessage => item !== null)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    console.log(`[CMS] Cintillos recibidos: ${messages.length} (${locale}, brand=${cmsConfig.brandSlug})`);

    return messages;
  } catch (error) {
    console.error('[CMS] Error al obtener cintillos:', error);
    return [];
  }
}
