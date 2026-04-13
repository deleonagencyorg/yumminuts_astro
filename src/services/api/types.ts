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
}

export interface CMSRecipesResponse {
  data: any[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}