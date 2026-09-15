import { cmsClient } from './client';
import { withSiteFilter } from './config';

interface CmsSiteText {
  id: string;
  key: string;
  value: string;
}

interface SiteTextListResponse {
  data: CmsSiteText[];
}

export type SiteTextMap = Record<string, string>;

export async function getSiteTexts(locale: string = 'es'): Promise<SiteTextMap> {
  try {
    const response = await cmsClient.get<SiteTextListResponse>(
      'v1/site-texts',
      withSiteFilter({
        page: 1,
        pageSize: 200,
        languageCode: locale,
      })
    );

    const items = response.data ?? [];
    const map: SiteTextMap = {};
    for (const item of items) {
      if (item.key) map[item.key] = item.value ?? '';
    }

    console.log(`[CMS] Site texts recibidos: ${items.length} (${locale})`);
    return map;
  } catch (error) {
    console.error('[CMS] Error al obtener site texts:', error);
    return {};
  }
}

export function text(map: SiteTextMap, key: string, fallback: string = ''): string {
  return map[key] ?? fallback;
}
