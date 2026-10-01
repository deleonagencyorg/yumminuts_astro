import { cmsClient } from './client';
import { withSiteFilter } from './config';
import { mediaUrl, type CmsMultimedia } from './multimedia';

interface CmsSocialMediaLink {
  id: string;
  platform: string;
  name: string;
  url: string;
  alt: string;
  order: number;
  icon?: CmsMultimedia | null;
}

interface SocialMediaListResponse {
  data: CmsSocialMediaLink[];
}

export interface SocialMediaLink {
  platform: string;
  name: string;
  url: string;
  alt: string;
  iconUrl: string;
}

export async function getSocialMediaLinks(locale: string = 'es'): Promise<SocialMediaLink[]> {
  try {
    const response = await cmsClient.get<SocialMediaListResponse>(
      'v1/social-media',
      withSiteFilter({
        page: 1,
        pageSize: 50,
        languageCode: locale,
      })
    );

    const items = (response.data ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item) => ({
        platform: item.platform,
        name: item.name || item.platform,
        url: item.url || '',
        alt: item.alt || item.name || item.platform,
        iconUrl: mediaUrl(item.icon),
      }));

    console.log(`[CMS] Redes sociales recibidas: ${items.length} (${locale})`);
    return items;
  } catch (error) {
    console.error('[CMS] Error al obtener redes sociales:', error);
    return [];
  }
}
