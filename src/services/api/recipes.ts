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
  console.log(`[mapRecipe] id=${item.id} slug=${item.slug} title=${item.title}`);
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
  };
}

export async function getAllRecipes(locale: string = 'es'): Promise<Recipe[]> {
  console.log(`[CMS] URL: ${import.meta.env.PUBLIC_CMS_URL}`);
  console.log(`[CMS] Brand: ${import.meta.env.PUBLIC_CMS_BRAND_SLUG}`);
  console.log(`[CMS] Locale: ${locale}`);
  
  try {
    const response = await cmsClient.get<CMSRecipesResponse>('v1/recipes', {
      page: 1,
      pageSize: 100,
      brandSlug: BRAND_SLUG,
      languageCode: locale,
    });

    //console.log(`[CMS] Respuesta completa:`, JSON.stringify(response, null, 2));
    //console.log(`[CMS] Recetas encontradas: ${response?.data?.length ?? 'undefined'}`);
    
    return response.data.map(mapRecipe);
  } catch (error) {
    console.error('[CMS] Error completo:', error);
    return [];
  }
}

export async function getRecipeBySlug(slug: string, locale: string = 'es'): Promise<Recipe | null> {
  try {
    const response = await cmsClient.get<{ data: CMSRecipeRaw }>(`v1/recipes/${slug}`, {
      languageCode: locale,
    });
    return mapRecipe(response.data);
  } catch (error) {
    console.error(`Error al obtener receta ${slug}:`, error);
    return null;
  }
}