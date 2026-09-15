import { cmsClient } from './client';
import { withSiteFilter } from './config';

interface CmsMenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
  parentId: string | null;
  isExternal: boolean;
}

interface CmsNavigationConfig {
  id: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  items: CmsMenuItem[];
}

interface NavigationListResponse {
  data: CmsNavigationConfig[];
}

export interface MenuItem {
  id: string;
  text: string;
  href: string;
  isExternal: boolean;
  submenu?: MenuItem[];
}

export interface NavigationData {
  openMenuLabel: string;
  closeMenuLabel: string;
  items: MenuItem[];
}

function buildTree(items: CmsMenuItem[], parentId: string | null = null): MenuItem[] {
  return items
    .filter((item) => (item.parentId ?? null) === parentId)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => {
      const children = buildTree(items, item.id);
      const menuItem: MenuItem = {
        id: item.id,
        text: item.label,
        href: item.href || '#',
        isExternal: item.isExternal,
      };
      if (children.length) menuItem.submenu = children;
      return menuItem;
    });
}

export async function getNavigation(locale: string = 'es'): Promise<NavigationData | null> {
  try {
    const response = await cmsClient.get<NavigationListResponse>(
      'v1/navigation',
      withSiteFilter({
        page: 1,
        pageSize: 1,
        languageCode: locale,
      })
    );

    const config = response.data?.[0];
    if (!config) {
      console.log(`[CMS] Sin navegación para ${locale}`);
      return null;
    }

    console.log(`[CMS] Navegación recibida: ${config.items?.length ?? 0} items (${locale})`);

    return {
      openMenuLabel: config.openMenuLabel || '',
      closeMenuLabel: config.closeMenuLabel || '',
      items: buildTree(config.items ?? []),
    };
  } catch (error) {
    console.error('[CMS] Error al obtener navegación:', error);
    return null;
  }
}
