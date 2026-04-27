// src/services/api/products.ts
import { cmsClient } from './client';
import type { Product, CMSProductsResponse, CMSProductRaw } from './types';
console.log(`[CMS] URL completa: ${import.meta.env.PUBLIC_CMS_URL}v1/products`);
const BRAND_SLUG = import.meta.env.PUBLIC_CMS_BRAND_SLUG ?? 'yummi-nuts';

function slugify(text: string): string {
  return text
    .toString()
    .replace(/[""'']/g, '')
    .toLocaleLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapProduct(item: CMSProductRaw): Product {
  console.log(`[mapProduct] id=${item.id} slug=${item.slug} name=${item.name}`);
  return {
    id: item.id,
    slug: item.slug || slugify(item.name),
    name: item.name,
    category: item.category,
    image: item.image,
    description: item.description,
    background_color: item.background_color,
    header_color: item.header_color,
    text_color: item.text_color,
    color_button: item.color_button,
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