// src/services/api/products.ts
import { cmsClient } from './client';
import { cmsConfig, withBrandFilter } from './config';
import type { Product, CMSProductsResponse, CMSProductRaw } from './types';
import { cmsMediaSrc } from './multimedia';

console.log(`URL COMPLETA BASE: ${cmsConfig.url}`);

function mapProduct(item: CMSProductRaw): Product {
  return {
    id: item.id,
    slug: item.slug || item.id,
    name: item.name,
    category: item.category,
    image: cmsMediaSrc(item.image),
    description: item.description,
    backgroundColor: item.backgroundColor,
    headerTextColor: item.headerTextColor,
    textColor: item.textColor,
    colorButton: item.colorButton,
    weight: item.weight,
    nutrition: item.nutrition,
    metaTitle: item.metaTitle,
    metaDescription: item.metaDescription,
    metaKeywords: item.metaKeywords,
    ogTitle: item.ogTitle,
    ogDescription: item.ogDescription,
    ogImage: cmsMediaSrc(item.ogImage),
  };
}

export async function getAllProducts(locale: string = 'es'): Promise<Product[]> {
  console.log('INICIO GETALLPRODUCTS');
  console.log(`URL: ${cmsConfig.url}`);
  console.log(`BRAND SLUG: ${cmsConfig.brandSlug}`);
  console.log(`LOCALE: ${locale}`);
  console.log(`PUBLIC_CMS_SITE_ID: ${cmsConfig.siteId}`);

  try {
    const response = await cmsClient.get<CMSProductsResponse>(
      'v1/products',
      withBrandFilter({
        page: 1,
        pageSize: 100,
        languageCode: locale,
      })
    );

    console.log(` EXITO  PRODUCTOS RECIBIDOS: ${response?.data?.length ?? 0}`);
    return (response.data ?? []).map(mapProduct);
  } catch (error: any) {
    console.error('ERROR AL OBTENER PRODUCTOS');
    console.error(`MENSAJE: ${error?.message || 'SIN MENSAJE'}`);
    console.error('ERROR COMPLETO:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string, locale: string = 'es'): Promise<Product | null> {
  try {
    const response = await cmsClient.get<{ data: CMSProductRaw }>(`v1/products/${slug}`, {
      languageCode: locale,
    });
    return mapProduct(response.data);
  } catch (error: any) {
    console.error(`ERROR AL OBTENER PRODUCTO ${slug}`);
    console.error(`MENSAJE: ${error?.message || 'SIN MENSAJE'}`);
    return null;
  }
}