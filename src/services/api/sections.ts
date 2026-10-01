import { cmsClient } from './client';
import { withSiteFilter } from './config';
import { mediaUrl, type CmsMultimedia } from './multimedia';

interface SectionResponse<T> {
  data: T[];
}

interface CmsFooterPhone {
  country: string;
  flag: string;
  number: string;
  flagImage?: CmsMultimedia | null;
}

interface CmsHealthIcon {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  image?: CmsMultimedia | null;
}

export interface FooterPhoneView {
  country: string;
  flag: string;
  flagImageUrl: string;
  number: string;
  telHref: string;
}

export interface HealthIconView {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

async function loadSection<T, R>(endpoint: string, locale: string, map: (item: T) => R): Promise<R[]> {
  try {
    const response = await cmsClient.get<SectionResponse<T>>(endpoint, withSiteFilter({ languageCode: locale }));
    return (response.data ?? []).map(map);
  } catch (error) {
    console.error(`[CMS] Error al obtener ${endpoint}:`, error);
    return [];
  }
}

export function getFooterPhones(locale: string = 'es'): Promise<FooterPhoneView[]> {
  return loadSection<CmsFooterPhone, FooterPhoneView>('v1/footer-phones', locale, (item) => ({
    country: item.country || '',
    flag: item.flag || '',
    flagImageUrl: mediaUrl(item.flagImage),
    number: item.number || '',
    telHref: `tel:+${(item.number || '').replace(/\D/g, '').replace(/^00?1(?=809)/, '1')}`,
  }));
}

export function getHealthIcons(locale: string = 'es'): Promise<HealthIconView[]> {
  return loadSection<CmsHealthIcon, HealthIconView>('v1/health-icons', locale, (item) => ({
    id: item.id,
    title: item.title || '',
    description: item.description || '',
    imageUrl: mediaUrl(item.image),
    linkUrl: item.linkUrl || '',
  }));
}
