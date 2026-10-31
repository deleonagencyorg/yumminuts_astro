import { cmsClient } from './client';
import { cmsConfig, withSiteFilter } from './config';

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
  if (!cmsConfig.siteId) throw new Error('PUBLIC_CMS_SITE_ID must be configured to load CMS common texts');
  const cmsLocale = locale === 'us' ? 'en' : locale;
  const items: CmsSiteText[] = [];
  for (let page = 1; page <= 50; page++) {
    const response = await cmsClient.get<SiteTextListResponse>(
      'v1/site-texts',
      withSiteFilter({
        page,
        pageSize: 100,
        languageCode: cmsLocale,
      })
    );
    if (!Array.isArray(response.data)) {
      throw new Error(`CMS returned an invalid site-texts response for locale '${cmsLocale}'`);
    }
    items.push(...response.data);
    if (!response.data.length || items.length >= (response.pagination?.total ?? items.length)) break;
  }

  if (items.length === 5000) {
    throw new Error(`CMS returned more than 5000 site texts for locale '${cmsLocale}'`);
  }
  console.log(`[CMS] Site texts recibidos: ${items.length} (${cmsLocale})`);
  return Object.fromEntries(items.filter((item) => item.key).map((item) => [item.key, item.value ?? '']));
}

export function text(map: SiteTextMap, key: string, fallback: string = ''): string {
  return map[key] ?? fallback;
}
