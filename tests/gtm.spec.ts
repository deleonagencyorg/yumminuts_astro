import { expect, test } from '@playwright/test';

const GTM_ID = 'GTM-T82M4TL';

type DataLayerEvent = {
  event?: string;
  page_path?: string;
};

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    google_tag_manager?: Record<string, unknown>;
  }
}

test('Google Tag Manager se dispara al cargar y al navegar', async ({ page }) => {
  const gtmRequests: string[] = [];
  const pageErrors: string[] = [];
  const gtmWarnings: string[] = [];

  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('googletagmanager.com/gtm.js')) gtmRequests.push(url);
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    if (text.includes('GTM no') || text.includes('ID no válido') || text.includes('no está configurado')) {
      gtmWarnings.push(text);
    }
  });

  const gtmResponse = page.waitForResponse(
    (response) => response.url().includes(`googletagmanager.com/gtm.js?id=${GTM_ID}`) && response.ok(),
  );

  await page.goto('/es/', { waitUntil: 'domcontentloaded' });
  expect((await gtmResponse).ok()).toBe(true);
  expect(gtmRequests.filter((url) => url.includes(`id=${GTM_ID}`))).toHaveLength(1);

  await expect.poll(() => page.evaluate((gtmId) => {
    const layer = window.dataLayer ?? [];
    const primary = document.querySelectorAll(`script[data-gtm-id="${gtmId}"]`).length;
    const container = Boolean(window.google_tag_manager?.[gtmId]);
    const started = layer.filter((entry) => entry?.event === 'gtm.js').length === 1;
    return started && primary === 1 && container;
  }, GTM_ID)).toBe(true);

  const html = await page.content();
  expect(html).toContain(`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`);

  await page.locator('#desktop-menu-items a[href="/es/productos"]').click();
  await page.waitForURL('**/es/productos**');

  await expect.poll(() => page.evaluate(() => {
    const layer = window.dataLayer ?? [];
    return layer.some((entry) => entry?.event === 'page_view' && (entry.page_path ?? '').includes('/es/productos'));
  })).toBe(true);

  expect(await page.evaluate(() => (window.dataLayer ?? []).filter((entry) => entry?.event === 'gtm.js').length)).toBe(1);
  expect(gtmRequests.filter((url) => url.includes(`id=${GTM_ID}`))).toHaveLength(1);
  expect(pageErrors).toEqual([]);
  expect(gtmWarnings).toEqual([]);
});

test('Google Tag Manager se dispara en una ruta directa', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const gtmResponse = page.waitForResponse(
    (response) => response.url().includes(`googletagmanager.com/gtm.js?id=${GTM_ID}`) && response.ok(),
  );

  await page.goto('/es/recetas', { waitUntil: 'domcontentloaded' });
  expect((await gtmResponse).ok()).toBe(true);

  await expect.poll(() => page.evaluate((gtmId) => {
    const layer = window.dataLayer ?? [];
    const primary = document.querySelectorAll(`script[data-gtm-id="${gtmId}"]`).length;
    const container = Boolean(window.google_tag_manager?.[gtmId]);
    const started = layer.filter((entry) => entry?.event === 'gtm.js').length === 1;
    return started && primary === 1 && container;
  }, GTM_ID)).toBe(true);

  expect(pageErrors).toEqual([]);
});
