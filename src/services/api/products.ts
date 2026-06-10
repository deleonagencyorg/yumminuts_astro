// src/services/api/products.ts
import { cmsClient } from './client';
import type { Product, CMSProductsResponse, CMSProductRaw } from './types';

console.log(`URL COMPLETA BASE: ${import.meta.env.PUBLIC_CMS_URL}`);

const BRAND_SLUG = import.meta.env.PUBLIC_CMS_BRAND_SLUG ?? 'yummi-nuts';

function mapProduct(item: CMSProductRaw): Product {
  //console.log(`[raw completo] ${item.name}:`, JSON.stringify(item, null, 2));
  return {
    id: item.id,
    slug: item.slug || item.id,
    name: item.name,
    category: item.category,
    image: item.image,
    description: item.description,
    background_color: item.backgroundColor,
    header_color: item.headerTextColor,
    text_color: item.textColor,
    color_button: item.colorButton,
    weight: item.weight,
    nutrition: item.nutrition,
    metaTitle: item.metaTitle,
    metaDescription: item.metaDescription,
    metaKeywords: item.metaKeywords,
    ogTitle: item.ogTitle,
    ogDescription: item.ogDescription,
    ogImage: item.ogImage,
  };
}

export async function getAllProducts(locale: string = 'es'): Promise<Product[]> {
  console.log('INICIO GETALLPRODUCTS');
  console.log(`URL: ${import.meta.env.PUBLIC_CMS_URL}`);
  console.log(`BRAND SLUG: ${BRAND_SLUG}`);
  console.log(`LOCALE: ${locale}`);
  console.log(`PUBLIC_CMS_SITE_ID: ${import.meta.env.PUBLIC_CMS_SITE_ID}`);

  try {
    const response = await cmsClient.get<CMSProductsResponse>('v1/products', {
      page: 1,
      pageSize: 100,
      brandSlug: BRAND_SLUG,
      languageCode: locale,
    });

    console.log(` EXITO  PRODUCTOS RECIBIDOS: ${response?.data?.length ?? 0}`);
    return response.data.map(mapProduct);
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