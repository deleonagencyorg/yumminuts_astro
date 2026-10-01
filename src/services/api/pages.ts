// src/services/api/pages.ts
import { cmsClient } from './client';
import { withSiteFilter } from './config';
import { mediaUrl, videoPlaybackUrl, type CmsMultimedia } from './multimedia';

export type CmsPageRouteId =
  | 'home'
  | 'products'
  | 'health'
  | 'contact'
  | 'recipes'
  | 'about_us'
  | 'news';

export const CMS_PAGE_SLUGS: Record<CmsPageRouteId, Record<string, string>> = {
  home: { es: 'inicio', en: 'home' },
  products: { es: 'productos', en: 'products' },
  health: { es: 'salud', en: 'health' },
  contact: { es: 'contacto', en: 'contact' },
  recipes: { es: 'recetas', en: 'recipes' },
  about_us: { es: 'nosotros', en: 'about-us' },
  news: { es: 'blog', en: 'blog' },
};

export type BannerSlideType = 'image' | 'video' | 'html';

export interface BannerHtmlView {
  background: string;
  backgroundMobile: string;
  image: string;
  imageMobile: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface BannerSlide {
  id?: string;
  type: BannerSlideType;
  desktop: string;
  mobile: string;
  alt: string;
  title: string;
  subtitle: string;
  description?: string;
  link?: string;
  html?: BannerHtmlView;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  languageCode?: string;
  featuredImage?: {
    originalUrl?: string;
    seoUrl?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: {
    originalUrl?: string;
    seoUrl?: string;
  };
  banners: BannerSlide[];
}

interface CmsPageBannerHtml {
  backgroundImage?: CmsMultimedia | null;
  backgroundImageMobile?: CmsMultimedia | null;
  image?: CmsMultimedia | null;
  imageMobile?: CmsMultimedia | null;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
}

interface CmsPageBanner {
  id?: string;
  type?: BannerSlideType | string;
  desktop?: CmsMultimedia | null;
  mobile?: CmsMultimedia | null;
  alt?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  html?: CmsPageBannerHtml | null;
  order?: number;
}

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  languageCode?: string;
  isHomepage?: boolean;
  featuredImage?: CmsMultimedia | null;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: CmsMultimedia | null;
  banners?: CmsPageBanner[];
}

interface CMSPagesResponse {
  data: CmsPage[];
}

export function getCmsPageSlug(routeId: string, locale: string): string | null {
  const slugs = CMS_PAGE_SLUGS[routeId as CmsPageRouteId];
  if (!slugs) return null;
  return slugs[locale] || slugs.es || null;
}

function slugAliases(routeId: string, locale: string): string[] {
  const slugs = CMS_PAGE_SLUGS[routeId as CmsPageRouteId];
  const aliases = new Set<string>();

  if (slugs) {
    const preferred = slugs[locale] || slugs.es;
    if (preferred) aliases.add(preferred.toLowerCase());
    Object.values(slugs).forEach((value) => aliases.add(value.toLowerCase()));
  }

  if (routeId === 'home') {
    ['inicio', 'home', 'index'].forEach((value) => aliases.add(value));
  }

  return [...aliases];
}

function seoMedia(media?: CmsMultimedia | null) {
  if (!media) return undefined;
  return {
    originalUrl: media.originalUrl,
    seoUrl: media.seoUrl || media.optimizedUrl,
  };
}

function bannerType(value?: string): BannerSlideType {
  if (value === 'video' || value === 'html') return value;
  return 'image';
}

function mapHtmlBanner(html?: CmsPageBannerHtml | null): BannerHtmlView | null {
  if (!html) return null;

  const background = mediaUrl(html.backgroundImage);
  const backgroundMobile = mediaUrl(html.backgroundImageMobile) || background;
  const image = mediaUrl(html.image);
  const imageMobile = mediaUrl(html.imageMobile) || image;
  const hasContent = Boolean(
    background ||
      backgroundMobile ||
      image ||
      imageMobile ||
      html.title ||
      html.subtitle ||
      html.description ||
      html.buttonText
  );

  if (!hasContent) return null;

  return {
    background: background || backgroundMobile,
    backgroundMobile,
    image: image || imageMobile,
    imageMobile,
    title: html.title || '',
    subtitle: html.subtitle || '',
    description: html.description || '',
    buttonText: html.buttonText || '',
    buttonUrl: html.buttonUrl || '',
  };
}

function mapPageBanner(banner: CmsPageBanner): BannerSlide | null {
  const type = bannerType(banner.type);

  if (type === 'html') {
    const html = mapHtmlBanner(banner.html);
    if (!html) return null;

    return {
      id: banner.id,
      type,
      desktop: html.background,
      mobile: html.backgroundMobile || html.background,
      alt: banner.alt || html.title || '',
      title: html.title,
      subtitle: html.subtitle,
      description: html.description,
      link: html.buttonUrl || banner.link || '',
      html,
    };
  }

  const desktopVideo = videoPlaybackUrl(banner.desktop);
  const mobileVideo = videoPlaybackUrl(banner.mobile);
  const isPlayableVideo = type === 'video' && Boolean(desktopVideo || mobileVideo);

  if (isPlayableVideo) {
    return {
      id: banner.id,
      type: 'video',
      desktop: desktopVideo || mobileVideo,
      mobile: mobileVideo || desktopVideo,
      alt: banner.alt || banner.title || '',
      title: banner.title || '',
      subtitle: banner.subtitle || banner.description || '',
      description: banner.description || '',
      link: banner.link || '',
    };
  }

  const desktopImage = mediaUrl(banner.desktop);
  const mobileImage = mediaUrl(banner.mobile);
  const desktop = desktopImage || mobileImage;
  const mobile = mobileImage || desktopImage;

  if (!desktop && !mobile) return null;

  return {
    id: banner.id,
    type: 'image',
    desktop: desktop || mobile,
    mobile,
    alt: banner.alt || banner.title || '',
    title: banner.title || '',
    subtitle: banner.subtitle || banner.description || '',
    description: banner.description || '',
    link: banner.link || '',
  };
}

function mapPage(page: CmsPage): CMSPage {
  const banners = (page.banners ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(mapPageBanner)
    .filter((banner): banner is BannerSlide => banner !== null);

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    excerpt: page.excerpt,
    content: page.content,
    languageCode: page.languageCode,
    featuredImage: seoMedia(page.featuredImage),
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    metaKeywords: page.metaKeywords,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: seoMedia(page.ogImage),
    banners,
  };
}

function matchPage(pages: CmsPage[], routeId: string, locale: string, slug?: string): CmsPage | null {
  const aliases = new Set(slugAliases(routeId, locale));
  if (slug) aliases.add(slug.toLowerCase());

  const bySlug = pages.find((item) => aliases.has((item.slug || '').toLowerCase()));
  if (bySlug) return bySlug;

  if (routeId === 'home') {
    return pages.find((item) => item.isHomepage) ?? null;
  }

  return null;
}

async function fetchPages(locale: string): Promise<CmsPage[]> {
  const response = await cmsClient.get<CMSPagesResponse>(
    'v1/pages',
    withSiteFilter({
      page: 1,
      pageSize: 50,
      languageCode: locale,
    })
  );

  return response.data ?? [];
}

async function fetchPageBySlug(slug: string, locale: string): Promise<CMSPage | null> {
  try {
    const pages = await fetchPages(locale);
    const page = pages.find((item) => item.slug === slug) ?? null;
    console.log(
      `[CMS] Página "${slug}" (${locale}):`,
      page ? `sí, ${page.banners?.length ?? 0} banners` : 'no'
    );

    return page ? mapPage(page) : null;
  } catch (error) {
    console.error(`[CMS] Error al obtener página "${slug}":`, error);
    return null;
  }
}

export async function getPageBySlug(slug: string, locale: string = 'es'): Promise<CMSPage | null> {
  return fetchPageBySlug(slug, locale);
}

export async function getPageByRouteId(
  routeId: string,
  locale: string = 'es'
): Promise<CMSPage | null> {
  try {
    const pages = await fetchPages(locale);
    const page = matchPage(pages, routeId, locale);
    console.log(
      `[CMS] Página route="${routeId}" (${locale}):`,
      page
        ? `"${page.slug}", ${page.banners?.length ?? 0} banners crudos`
        : `no. slugs=[${pages.map((item) => item.slug).join(', ')}]`
    );

    if (!page) return null;

    const mapped = mapPage(page);
    console.log(
      `[CMS] Banners mapeados para "${mapped.slug}":`,
      mapped.banners.map((banner) => `${banner.type}:${banner.desktop || banner.mobile || '(sin media)'}`)
    );
    return mapped;
  } catch (error) {
    console.error(`[CMS] Error al obtener página route="${routeId}":`, error);
    return null;
  }
}

export async function getPageBanners(
  routeId: string,
  locale: string = 'es'
): Promise<BannerSlide[]> {
  try {
    const page = await getPageByRouteId(routeId, locale);
    return page?.banners ?? [];
  } catch (error) {
    console.error(`[CMS] Error al obtener banners de "${routeId}":`, error);
    return [];
  }
}
