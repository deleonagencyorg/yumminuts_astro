import { cmsConfig } from './config';

const CMS_URL = cmsConfig.url;
const CMS_TOKEN = cmsConfig.token;

export const cmsClient = {
  async get<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
    if (!CMS_URL || !CMS_TOKEN) {
      throw new Error('PUBLIC_CMS_URL and PUBLIC_CMS_TOKEN are required');
    }

    const baseUrl = CMS_URL.endsWith('/') ? CMS_URL : `${CMS_URL}/`;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(`${baseUrl}${cleanEndpoint}`);

    url.search = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value != null)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${CMS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMS Error ${response.status}: ${response.statusText} (${cleanEndpoint})`);
    }

    return response.json() as Promise<T>;
  },
};

export function responseItems<T>(response: { data?: T[] } | T[] | null | undefined): T[] {
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.data) ? response.data : [];
}
