import { cmsClient } from './client';
import { withSiteFilter } from './config';
import { mediaUrl, videoPlaybackUrl, type CmsMultimedia } from './multimedia';

interface CmsContentListItem {
  id: string;
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  description2: string;
  image?: CmsMultimedia | null;
  video?: CmsMultimedia | null;
  buttonText: string;
  buttonUrl: string;
  backgroundColor: string;
  order: number;
}

interface CmsContentList {
  id: string;
  key: string;
  title: string;
  description: string;
  items: CmsContentListItem[];
}

interface ContentListListResponse {
  data: CmsContentList[];
}

export interface ContentListItemView {
  id: string;
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  description2: string;
  imageUrl: string;
  videoUrl: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor: string;
}

export interface ContentListView {
  title: string;
  description: string;
  items: ContentListItemView[];
}

function mapItem(item: CmsContentListItem): ContentListItemView {
  return {
    id: item.id,
    badge: item.badge || '',
    title: item.title || '',
    titleHighlight: item.titleHighlight || '',
    description: item.description || '',
    description2: item.description2 || '',
    imageUrl: mediaUrl(item.image),
    videoUrl: videoPlaybackUrl(item.video),
    buttonText: item.buttonText || '',
    buttonUrl: item.buttonUrl || '',
    backgroundColor: item.backgroundColor || '',
  };
}

export async function getContentList(key: string, locale: string = 'es'): Promise<ContentListView | null> {
  try {
    const response = await cmsClient.get<ContentListListResponse>(
      'v1/content-lists',
      withSiteFilter({
        page: 1,
        pageSize: 1,
        languageCode: locale,
        key,
      })
    );

    const config = response.data?.[0];
    if (!config) {
      console.log(`[CMS] Sin content-list "${key}" para ${locale}`);
      return null;
    }

    const items = (config.items ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(mapItem);

    console.log(`[CMS] Content-list "${key}" recibida: ${items.length} items (${locale})`);

    return {
      title: config.title || '',
      description: config.description || '',
      items,
    };
  } catch (error) {
    console.error(`[CMS] Error al obtener content-list "${key}":`, error);
    return null;
  }
}
