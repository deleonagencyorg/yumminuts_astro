// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { requestLocale } from './i18n/requestContext';
import { getSiteTexts } from './services/api/site-texts';
import { routesConfig, findRouteBySlug } from './config/routes';

// Mapeo de rutas que necesitan redirección
const routeMappings = {
  'products': { es: 'productos', en: 'products' },
  'news': { es: 'noticias', en: 'news' },
  'recipes': { es: 'recetas', en: 'recipes' },
  'yummiesone': { es: 'yummiesone', en: 'yummiesone' }
};

const handleRequest = defineMiddleware(async ({ request, redirect }, next) => {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  // Si no hay suficientes segmentos para verificar (necesitamos al menos [lang]/[section])
  if (pathSegments.length < 2) {
    return next();
  }

  const lang = pathSegments[0];
  const section = pathSegments[1];
  
  // Verificar si el idioma es válido
  if (lang !== 'es' && lang !== 'en') {
    return next();
  }

  // Verificar si la ruta existe en la configuración
  const routeExists = findRouteBySlug(lang, section);
  
  // Si la ruta no existe, dejar que el enrutador resuelva (404)
  if (!routeExists) {
    return next();
  }

  // Verificar si hay una discrepancia entre el idioma y la sección
  for (const [routeId, slugs] of Object.entries(routeMappings)) {
    // Si la sección actual no coincide con el slug correcto para el idioma
    if (section !== slugs[lang]) {
      // Buscar a qué ruta corresponde esta sección en cualquier idioma
      let matchedRoute = null;
      let matchedLang = null;
      
      for (const [l, s] of Object.entries(slugs)) {
        if (section === s) {
          matchedRoute = routeId;
          matchedLang = l;
          break;
        }
      }
      
      // Si encontramos una coincidencia pero en el idioma incorrecto
      if (matchedRoute && matchedLang && matchedLang !== lang) {
        // Construir la nueva URL con el slug correcto para el idioma actual
        const correctSlug = slugs[lang];
        const newPathSegments = [...pathSegments];
        newPathSegments[1] = correctSlug;
        const newPath = '/' + newPathSegments.join('/');
        
        // Redirigir a la URL correcta
        return redirect(newPath);
      }
    }
  }

  return next();
});

export const onRequest = defineMiddleware((context, next) => {
  const [firstSegment] = context.url.pathname.split('/').filter(Boolean);
  const locale = firstSegment === 'en' ? 'en' : 'es';
  const requestContext = { locale };
  return requestLocale.run(requestContext, () => handleRequest(context, async () => {
    if (firstSegment === 'api' || firstSegment?.includes('.')) return next();
    requestContext.commonTexts = await getSiteTexts(locale);
    return next();
  }));
});
