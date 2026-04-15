// src/services/api/types.ts
export interface Recipe {
  id: string;
  slug?: string;
  title: string;
  image?: string | { url: string };
  preparation_time?: number;
  people?: string | number;
  difficulty?: string;
  ingredients?: string[];
  instructions?: string[];
  category?: string;
  gallery?: string[];
  brand?: string[];
  description?: string;
  tags?: string[];
}

export interface CMSRecipeRaw {
  id: string;
  slug?: string;
  title: string;
  image?: string | { url: string };
  preparation_time?: number;
  category?: string;
  description?: string;

  ingredients?: string[];
  instructions?: string[];
  people?: string | number;
  difficulty?: string;
  tags?: string[];
}

export interface CMSRecipesResponse {
  data: CMSRecipeRaw[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface CMSRecipeDetailResponse {
  data: CMSRecipeRaw;
}