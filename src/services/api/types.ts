import { any } from "astro:schema";

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

export interface Product {
  id: string;
  slug?: string;
  name: string;
  category?: string;
  image?: string | { url: string };
  description?: string;
  background_color?: string;
  header_color?: string;
  text_color?: string;
  color_button?: string;
  weight?: string[];
  nutrition?: {
    title?: string;
    serving?: string;
    rows?: { label: string; value: string }[];
    disclaimer?: string;
  };
}

export interface CMSProductRaw {
  id: string;
  slug?: string;
  name: string;
  category?: string;
  image?: string | { url: string };
  description?: string;
  background_color?: string;
  header_color?: string;
  text_color?: string;
  color_button?: string;
  weight?: string[];
  nutrition?: any;
}

export interface CMSProductsResponse {
  data: CMSProductRaw[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}