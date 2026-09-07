// src/services/api/recipes.ts
import { cmsClient } from './client';
import { belongsToCurrentBrand, cmsConfig, withBrandFilter } from './config';
import type { Recipe, CMSRecipesResponse, CMSRecipeRaw } from './types';
import { cmsMediaSrc } from './multimedia';

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
    image: cmsMediaSrc(item.image),
    preparation_time: item.preparationTime ?? item.preparation_time,
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
  console.log(`URL: ${cmsConfig.url}`);
  console.log(`BRAND SLUG: ${cmsConfig.brandSlug}`);
  console.log(`LOCALE: ${locale}`);
  console.log(`PUBLIC_CMS_SITE_ID: ${cmsConfig.siteId}`);

  try {
    const response = await cmsClient.get<CMSRecipesResponse>(
      'v1/recipes',
      withBrandFilter({
        page: 1,
        pageSize: 100,
        languageCode: locale,
      })
    );
    const recipes = (response.data ?? [])
      .filter((item) => belongsToCurrentBrand(item.brands))
      .map(mapRecipe);
    console.log(`RECETAS CARGADAS - TOTAL: ${recipes.length} - IDIOMA: ${locale.toUpperCase()}`);
    console.log(`EXITO - RECETAS RECIBIDAS: ${response?.data?.length ?? 0}`);
    return recipes;
  } catch (error: any) {
    console.error('ERROR AL OBTENER RECETAS');
    console.error(`MENSAJE: ${error?.message || 'SIN MENSAJE'}`);
    console.error('ERROR COMPLETO:', error);
    return [];
  }
}

export async function getRecipeBySlug(slug: string, locale: string = 'es'): Promise<Recipe | null> {
  try {
    const response = await cmsClient.get<{ data: CMSRecipeRaw } | CMSRecipeRaw>(
      `v1/recipes/${slug}`,
      withBrandFilter({
        languageCode: locale,
      })
    );
    const item = 'data' in response && response.data ? response.data : (response as CMSRecipeRaw);
    if (!item?.id || !belongsToCurrentBrand(item.brands)) return null;
    return mapRecipe(item);
  } catch (error: any) {
    console.error(`ERROR AL OBTENER RECETA ${slug}`);
    console.error(`MENSAJE: ${error?.message || 'SIN MENSAJE'}`);
    return null;
  }
}