// src/services/api/recipes.ts
import { cmsClient } from "./client";
import type { Recipe, CMSRecipesResponse, CMSRecipeDetailResponse } from "./types";

const BRAND_SLUG = import.meta.env.PUBLIC_BRAND_SLUG ?? 'yummi-nuts';

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

export async function getAllRecipes(locale: string = 'es'): Promise<Recipe[]> {
  try {
    const response = await cmsClient.get<CMSRecipesResponse>('v1/recipes', {
      page: 1,
      pageSize: 100,
      brandSlug: BRAND_SLUG,
      languageCode: locale,
    });

    return response.data.map((item): Recipe => ({
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
    }));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

export async function getRecipeBySlug(slug: string, locale: string = 'es'): Promise<Recipe | null> {
  try {
    const response = await cmsClient.get<CMSRecipeDetailResponse>(`v1/recipes/${slug}`, {
      languageCode: locale,
    });

    const item = response.data;

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
  } catch (error) {
    console.error(`Error fetching recipe ${slug}:`, error);
    return null;
  }
}