// src/services/api/footer.ts
import { cmsClient } from './client';
import { cmsConfig, withSiteFilter } from './config';

export interface FooterLabels {
  mainText: string;
  description: string;
  choose: string;
  followUs: string;
  contactUs: string;
  instagramText: string;
  facebookText: string;
  email: string;
  copyright: string;
  privacyPolicyText: string;
  privacyPolicyUrl: string;
  newsletter: string;
  newsletterDescription: string;
  emailPlaceholder: string;
  home: string;
  products: string;
  health: string;
  latestNews: string;
  contact: string;
  support: string;
  privacyPolicy: string;
  cookiePolicy: string;
  termsConditions: string;
  complaintsBook: string;
  help: string;
}

interface CmsFooterConfig extends FooterLabels {
  id: string;
  siteId?: string;
  languageCode?: string;
}

interface FooterListResponse {
  data: CmsFooterConfig[];
}

function text(value?: string): string {
  return value?.trim() || '';
}

function mapFooter(config: CmsFooterConfig): FooterLabels {
  return {
    mainText: text(config.mainText),
    description: text(config.description),
    choose: text(config.choose),
    followUs: text(config.followUs),
    contactUs: text(config.contactUs),
    instagramText: text(config.instagramText),
    facebookText: text(config.facebookText),
    email: text(config.email),
    copyright: text(config.copyright),
    privacyPolicyText: text(config.privacyPolicyText),
    privacyPolicyUrl: text(config.privacyPolicyUrl),
    newsletter: text(config.newsletter),
    newsletterDescription: text(config.newsletterDescription),
    emailPlaceholder: text(config.emailPlaceholder),
    home: text(config.home),
    products: text(config.products),
    health: text(config.health),
    latestNews: text(config.latestNews),
    contact: text(config.contact),
    support: text(config.support),
    privacyPolicy: text(config.privacyPolicy),
    cookiePolicy: text(config.cookiePolicy),
    termsConditions: text(config.termsConditions),
    complaintsBook: text(config.complaintsBook),
    help: text(config.help),
  };
}

export async function getFooterConfig(locale: string = 'es'): Promise<CmsFooterConfig | null> {
  const response = await cmsClient.get<FooterListResponse>(
    'v1/footer',
    withSiteFilter({
      page: 1,
      pageSize: 20,
      languageCode: locale,
    })
  );

  const items = response.data ?? [];
  const item = items[0] ?? null;

  if (!item) {
    console.log(`[CMS] Sin footer para ${locale} (site=${cmsConfig.siteId}). Recibidos: ${items.length}`);
    return null;
  }

  console.log(`[CMS] Footer "${item.newsletter || item.id}" para ${locale}`);
  return item;
}

export async function getFooterLabels(locale: string): Promise<FooterLabels | null> {
  try {
    const config = await getFooterConfig(locale);
    if (!config) return null;

    return mapFooter(config);
  } catch (error) {
    console.error('[CMS] Error al obtener footer:', error);
    return null;
  }
}
