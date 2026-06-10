// src/services/api/recipes.ts
import { cmsClient } from './client';
import type { Recipe, CMSRecipesResponse, CMSRecipeRaw } from './types';

const BRAND_SLUG = import.meta.env.PUBLIC_CMS_BRAND_SLUG ?? 'yummi-nuts';

function slugify(text: string): string {
  return text
    .toString()
    .toLocaleLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapRecipe(item: CMSRecipeRaw): Recipe {
  //console.log(`[mapRecipe] id=${item.id} slug=${item.slug} title=${item.title}`);
  return {
    id: item.id,
    slug: item.slug || slugify(item.title),
    title: item.title,
    image: item.image,
    preparation_time: item.preparation_time,
    category: item.category,
    description: item.description,
    ingredients: item.ingredients ?? [],
    instructions: item.instructions ?? [],
    people: item.people,
    difficulty: item.difficulty,
    tags: item.tags,
    //
    metaTitle: item.metaTitle,
    metaDescription: item.metaDescription,
    metaKeywords: item.metaKeywords,
    ogTitle: item.ogTitle,
    ogDescription: item.ogDescription,
    ogImage: item.ogImage,
  };
}

export async function getAllRecipes(locale: string = 'es'): Promise<Recipe[]> {
  console.log('INICIO GETALLRECIPES');
  console.log(`URL: ${import.meta.env.PUBLIC_CMS_URL}`);
  console.log(`BRAND SLUG: ${BRAND_SLUG}`);
  console.log(`LOCALE: ${locale}`);
  console.log(`PUBLIC_CMS_SITE_ID: ${import.meta.env.PUBLIC_CMS_SITE_ID}`);

  try {
    const response = await cmsClient.get<CMSRecipesResponse>('v1/recipes', {
      page: 1,
      pageSize: 100,
      brandSlug: BRAND_SLUG,
      languageCode: locale,
    });
    const recipes = response.data.map(mapRecipe);
    console.log(`RECETAS CARGADAS - TOTAL: ${recipes.length} - IDIOMA: ${locale.toUpperCase()}`);
    console.log(`EXITO - RECETAS RECIBIDAS: ${response?.data?.length ?? 0}`);
    return response.data.map(mapRecipe);
  } catch (error: any) {
    console.error('ERROR AL OBTENER RECETAS');
    console.error(`MENSAJE: ${error?.message || 'SIN MENSAJE'}`);
    console.error('ERROR COMPLETO:', error);
    return [];
  }
}

export async function getRecipeBySlug(slug: string, locale: string = 'es'): Promise<Recipe | null> {
  try {
    const response = await cmsClient.get<{ data: CMSRecipeRaw }>(`v1/recipes/${slug}`, {
      languageCode: locale,
    });
    return mapRecipe(response.data);
  } catch (error: any) {
    console.error(`ERROR AL OBTENER RECETA ${slug}`);
    console.error(`MENSAJE: ${error?.message || 'SIN MENSAJE'}`);
    return null;
  }
}