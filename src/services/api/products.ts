// src/services/api/products.ts
import { cmsClient } from './client';
import type { Product, CMSProductsResponse, CMSProductRaw } from './types';
console.log(`[CMS] URL completa: ${import.meta.env.PUBLIC_CMS_URL}v1/products`);
const BRAND_SLUG = import.meta.env.PUBLIC_CMS_BRAND_SLUG ?? 'yummi-nuts';

function mapProduct(item: CMSProductRaw): Product {
  console.log(`[raw completo] ${item.name}:`, JSON.stringify(item, null, 2));
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
  };
}

export async function getAllProducts(locale: string = 'es'): Promise<Product[]> {
  console.log(`Obteniendo productos para idioma: ${locale}`);
  try {
    const response = await cmsClient.get<CMSProductsResponse>('v1/products', {
      page: 1,
      pageSize: 100,
      brandSlug: BRAND_SLUG,
      languageCode: locale,
    });

    console.log(`Productos encontrados: ${response?.data?.length ?? 'undefined'}`);
    return response.data.map(mapProduct);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string, locale: string = 'es'): Promise<Product | null> {
  try {
    const response = await cmsClient.get<{ data: CMSProductRaw }>(`v1/products/${slug}`, {
      languageCode: locale,
    });
    return mapProduct(response.data);
  } catch (error) {
    console.error(`Error al obtener producto ${slug}:`, error);
    return null;
  }
}