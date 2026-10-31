export const cmsConfig = {
  url: (import.meta.env.PUBLIC_CMS_URL as string | undefined) || 'https://api-cms-yummies.onrender.com',
  token: import.meta.env.PUBLIC_CMS_TOKEN as string | undefined,
  siteId: import.meta.env.PUBLIC_CMS_SITE_ID as string | undefined,
  brandSlug: (import.meta.env.PUBLIC_CMS_BRAND_SLUG as string | undefined) || '',
};

export type CmsQueryParams = Record<string, string | number | boolean | undefined>;

export function withBrandFilter<T extends CmsQueryParams>(params: T = {} as T) {
  return {
    ...params,
    brandSlug: cmsConfig.brandSlug,
  };
}

export function withSiteFilter<T extends CmsQueryParams>(params: T = {} as T) {
  if (!cmsConfig.siteId) {
    throw new Error('PUBLIC_CMS_SITE_ID is required for site-scoped CMS requests');
  }

  return { ...params, siteId: cmsConfig.siteId };
}

export function belongsToCurrentBrand(
  brands?: Array<{ slug?: string } | string> | null
): boolean {
  const current = cmsConfig.brandSlug.toLowerCase();
  if (!current || !brands?.length) return false;

  return brands.some((brand) => {
    const slug = typeof brand === 'string' ? brand : brand.slug || '';
    return slug.toLowerCase() === current;
  });
}

export function cmsLocale(locale: string): string {
  return locale === 'us' ? 'en' : locale;
}
