// src/services/api/client.ts
const CMS_URL = import.meta.env.PUBLIC_CMS_URL;
const CMS_TOKEN = import.meta.env.PUBLIC_CMS_TOKEN;

if (!CMS_URL || !CMS_TOKEN) {
  console.warn('Faltan PUBLIC_CMS_URL o PUBLIC_CMS_TOKEN');
}

export const cmsClient = {
  async get<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
    // === CENTRALIZAMOS LA LÓGICA AQUÍ (robusta) ===
    const baseUrl = CMS_URL.endsWith('/') ? CMS_URL : `${CMS_URL}/`;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    const fullBase = `${baseUrl}${cleanEndpoint}`;

    console.log('🔧 CMS URL final:', fullBase);           // ← útil para debug
    console.log('🔧 Endpoint recibido:', endpoint);

    const url = new URL(fullBase);

    // Añadimos parámetros
    const searchParams = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value != null)
        .map(([key, value]) => [key, String(value)])
    );

    url.search = searchParams.toString();

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${CMS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMS Error ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  },
};