export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string;
  banner?: string;
  preview?: string;
  content: string;
  author: string;
  published_date: string;
  category?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  schema_json_ld?: Record<string, unknown>;
}
