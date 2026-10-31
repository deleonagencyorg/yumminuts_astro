// Sistema de internacionalización simple
import type { RequestLocaleContext } from './requestContext';
import { buildCommonTranslations } from './commonTranslations';
import esBrands from '../locales/es/brands.json';
import enBrands from '../locales/en/brands.json';

// Tipos para las traducciones
export type Locale = 'es' | 'en';
export type TranslationKey = string;

declare global {
  interface Window {
    __cmsCommonTexts?: Partial<Record<Locale, Record<string, string>>>;
    __cmsCommonLocale?: Locale;
  }
}

// Estructura de traducciones
const translations = {
  es: {
    brands: esBrands,
  },
  en: {
    brands: enBrands,
  },
};

// Almacena el idioma actual (por defecto español)
let currentLocale: Locale = 'es';

// Inicializa el idioma desde localStorage, navegador o por defecto 'es'
function detectInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && savedLocale in translations) {
      return savedLocale;
    }
    const browserLang = navigator.language.split('-')[0] as Locale;
    if (browserLang in translations) {
      return browserLang;
    }
  }
  // SSR: aquí se podría leer de cookie/URL en el futuro
  return 'es';
}
currentLocale = detectInitialLocale();

/**
 * Obtiene una traducción
 * @param key Clave de traducción (puede incluir puntos para acceder a objetos anidados)
 * @param options Opciones adicionales
 * @returns Texto traducido
 */
export function t(key: TranslationKey, options?: { locale?: Locale, namespace?: string }): any {
  const locale = options?.locale || getLocale();
  const namespace = options?.namespace || 'common';
  
  try {
    let result: unknown = namespace === 'common'
      ? buildCommonTranslations(getCurrentCommonTexts(locale))
      : (translations[locale] as Record<string, unknown>)[namespace];
    
    // Si la clave está vacía, devolver todo el namespace
    if (!key || key === '') {
      return result;
    }
    
    // Dividir la clave por puntos para acceder a objetos anidados
    const keys = key.split('.');
    
    // Navegar por el objeto de traducciones siguiendo las claves
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = Reflect.get(result, k);
      } else {
        if (namespace === 'common') {
          throw new Error(`CMS common text is missing key '${key}' for locale '${locale}'`);
        }
        return key;
      }
    }
    
    // Si el resultado es un string, número o booleano, devolverlo como string.
    // Si es un objeto o array, devolverlo tal cual.
    if (typeof result === 'string' || typeof result === 'number' || typeof result === 'boolean') {
      return String(result);
    } else if (result !== undefined && result !== null) {
      return result; // Devuelve el objeto/array directamente
    }
    
    if (namespace === 'common') {
      throw new Error(`CMS common text resolved to an empty value for key '${key}'`);
    }
    return key;
  } catch (error) {
    console.error(`Translation error for key: '${key}' in namespace '${namespace}' for locale '${locale}'`, error);
    if (namespace === 'common') throw error;
    return key;
  }
}

export function getCurrentCommonTexts(locale: Locale = getLocale()): Record<string, string> {
  if (typeof window !== 'undefined') {
    const texts = window.__cmsCommonTexts?.[locale];
    if (!texts) throw new Error(`CMS common texts were not loaded for locale '${locale}'`);
    return texts;
  }
  const store = globalThis.__requestLocale?.getStore();
  if (!store?.commonTexts || store.locale !== locale) {
    throw new Error(`CMS common texts were not loaded for locale '${locale}'`);
  }
  return store.commonTexts;
}

/**
 * Cambia el idioma actual
 * @param locale Nuevo idioma
 */
export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') window.__cmsCommonLocale = locale;
  const store = requestLocaleStore();
  if (store) {
    if (locale in translations) store.locale = locale;
    return;
  }
  if (locale in translations) {
    if (locale !== currentLocale) {
      currentLocale = locale;
      // Guardar preferencia en localStorage si estamos en el navegador
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', locale);
        // Disparar un evento personalizado para notificar el cambio de idioma
        window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
      }
    }
  }
}

/**
 * Obtiene el idioma actual
 * @returns Código de idioma actual
 */
export function getLocale(): Locale {
  return requestLocaleStore()?.locale
    ?? (typeof window !== 'undefined' ? window.__cmsCommonLocale : undefined)
    ?? currentLocale;
}

function requestLocaleStore(): RequestLocaleContext | undefined {
  return globalThis.__requestLocale?.getStore();
}

// Sincronizar entre pestañas
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'locale') {
      const newLocale = event.newValue as Locale;
      if (newLocale && newLocale in translations && newLocale !== currentLocale) {
        currentLocale = newLocale;
        window.location.reload();
      }
    }
  });
}

export default {
  t,
  setLocale,
  getLocale
};