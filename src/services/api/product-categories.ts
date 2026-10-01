import { cmsClient } from './client';
import { withSiteFilter } from './config';
import { mediaUrl, type CmsMultimedia } from './multimedia';

interface CmsProductCategory {
  id: string;
  key: string;
  label: string;
  slug: string;
  backgroundColor: string;
  order: number;
  icon?: CmsMultimedia | null;
}

interface ProductCategoryListResponse {
  data: CmsProductCategory[];
}

export interface ProductCategory {
  key: string;
  label: string;
  slug: string;
  backgroundColor: string;
  iconUrl: string;
}

export async function getProductCategories(locale: string = 'es'): Promise<ProductCategory[]> {
  try {
    const response = await cmsClient.get<ProductCategoryListResponse>(
      'v1/product-categories',
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
        key: item.key,
        label: item.label || item.key,
        slug: item.slug || item.key,
        backgroundColor: item.backgroundColor || '',
        iconUrl: mediaUrl(item.icon),
      }));

    console.log(`[CMS] Categorías de producto recibidas: ${items.length} (${locale})`);
    return items;
  } catch (error) {
    console.error('[CMS] Error al obtener categorías de producto:', error);
    return [];
  }
}
