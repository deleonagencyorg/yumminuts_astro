// src/services/api/cms.ts
const CMS_URL = import.meta.env.PUBLIC_CMS_URL;
const CMS_TOKEN = import.meta.env.PUBLIC_CMS_TOKEN;
//const BRAND_SLUG '

if (!CMS_URL || !CMS_TOKEN) {
  console.warn('Faltan PUBLIC_CMS_URL o PUBLIC_CMS_TOKEN');
}

export const cmsClient = {
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${CMS_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`);

    Object.entries(params).forEach(([key, value]) => {
      if (value != null) url.searchParams.append(key, String(value));
    });

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${CMS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`CMS Error ${response.status}`);
    return response.json();
  },
};