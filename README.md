# Yummi Nuts Astro

Sitio web multilingüe para Yummi Nuts, construido con Astro y Tailwind CSS. Incluye sistema de internacionalización, efectos parallax, animaciones, y más.

![Versión](https://img.shields.io/badge/versión-1.0.0-brightgreen)
![Astro](https://img.shields.io/badge/Astro-5.8.0-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)

## 🇹🇷 Sistema de Internacionalización (i18n)

El proyecto incluye un sistema completo de internacionalización con soporte para español (Honduras) e inglés.

### Estructura de archivos i18n

```text
/
├── public/
│   └── locales/
│       ├── es/
│       │   └── common.json
│       └── en/
│           └── common.json
├── src/
│   ├── i18n/
│   │   └── i18n.ts
│   ├── components/
│   │   └── i18n/
│   │       ├── LanguageSwitcher.astro
│   │       └── I18nProvider.astro
│   ├── pages/
│       ├── es/
│       │   └── index.astro
│       ├── en/
│       │   └── index.astro
│       └── index.astro
└── package.json
```

### Cómo funciona

1. **Archivos de traducción**: Los archivos JSON en `/public/locales/` contienen todas las cadenas traducidas organizadas por idioma.

2. **Detección de idioma**: El sistema detecta automáticamente el idioma del usuario basado en su ubicación geográfica usando `geoip-lite`.

3. **Estructura de URL**: Las URL incluyen el código de idioma como primer segmento (`/es/` o `/en/`).

4. **Redirección inteligente**: El archivo `index.astro` en la raíz redirige automáticamente a la versión localizada.

5. **Cambio de idioma**: El componente `LanguageSwitcher` permite cambiar entre idiomas manteniendo la ruta actual.

### Uso básico

```astro
---
import { getLocale, t } from '../i18n/i18n';
const locale = getLocale();
---

<h1>{t('welcome.title')}</h1>
<p>{t('welcome.description')}</p>
```

### Metadatos multilingües

Los metadatos (títulos, descripciones) están organizados en una sección `meta` en los archivos de traducción:

```json
{
  "meta": {
    "home": {
      "title": "Snacksyummies",
      "description": "Disfruta de los mejores snacks para ti y tu familia."
    }
  }
}
```

### Assets multilingües

El sistema permite tener imágenes específicas por idioma, organizadas en una sección `assets` en los archivos de traducción.

## ✨ Efectos Parallax y Animaciones

El proyecto incluye varios componentes para crear efectos parallax y animaciones de aparición al hacer scroll.

### Componentes disponibles

1. **RellaxParallax.astro**: Para elementos con efecto parallax

```astro
<RellaxParallax speed={-2} class="my-element">
  <h2>Título con efecto parallax</h2>
</RellaxParallax>
```

2. **SimpleParallax.astro**: Para imágenes con efecto parallax

```astro
<SimpleParallax 
  src="/images/tacos.jpg" 
  alt="Deliciosos tacos"
  scale={1.8}
  orientation="up"
  class="rounded-lg"
/>
```

3. **ParallaxSection.astro**: Para secciones completas con fondo parallax

```astro
<ParallaxSection 
  backgroundImage="/images/background.jpg"
  height="600px"
  speed={-3}
  overlayColor="rgba(0,0,0,0.6)"
>
  <h2>Contenido sobre fondo parallax</h2>
</ParallaxSection>
```

4. **ScrollReveal.astro**: Para animaciones de aparición al hacer scroll

```astro
<ScrollReveal origin="bottom" delay={200} duration={800}>
  <div class="card">Aparece al hacer scroll</div>
</ScrollReveal>
```

### Página de demostración

Puedes ver todos los efectos en acción en:
- `/es/parallax-demo`
- `/en/parallax-demo`

## 🚀 Estructura del Proyecto

La estructura completa del proyecto es la siguiente:

```text
/
├── public/
│   ├── images/
│   └── locales/
├── src/
│   ├── components/
│   ├── i18n/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── types/
├── package.json
├── tailwind.config.js
└── astro.config.mjs
```

## 🎨 Integración con Tailwind CSS

El proyecto utiliza Tailwind CSS para los estilos, con una configuración personalizada.

### Configuración

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Inter', 'sans-serif'],
        title: ['FontdinerSwanky', 'serif'],
      }
    }
  },
};
```

### Uso de fuentes personalizadas

Se han definido dos clases principales para tipografía:

- `font-sans`: Para texto general, utiliza la fuente Roboto
- `font-title`: Para títulos, utiliza la fuente FontdinerSwanky

```astro
<h1 class="font-title text-3xl">Título principal</h1>
<p class="font-sans">Texto normal con la fuente sans-serif</p>
```

## 🌍 Detección automática de país e idioma

El proyecto incluye un sistema de detección automática de país basado en la dirección IP del usuario, que establece el idioma predeterminado según la ubicación geográfica.

### Cómo funciona

1. Cuando un usuario visita el sitio por primera vez, se hace una petición al endpoint `/api/detect-locale`
2. Este endpoint utiliza `geoip-lite` para detectar el país del usuario basado en su IP
3. Si el usuario está en un país de habla inglesa (EE.UU., Reino Unido, Canadá, etc.), se establece el inglés como idioma predeterminado
4. Si el usuario está en Honduras u otro país de habla hispana, se establece el español como idioma predeterminado
5. La preferencia de idioma se guarda en localStorage para futuras visitas

### Configuración de países

**Países de habla inglesa:**

```js
const ENGLISH_SPEAKING_COUNTRIES = [
  'US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'ZA', 'JM', 'BZ', 'BS', 
  'BB', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'TT', 'GY'
];
```

**Países de habla hispana:**

```js
const SPANISH_SPEAKING_COUNTRIES = [
  'HN', 'ES', 'MX', 'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 
  'EC', 'SV', 'GT', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE'
];
```

## 🧞 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto, en una terminal:

| Comando                   | Acción                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Instala dependencias                            |
| `npm run dev`             | Inicia servidor de desarrollo en `localhost:4321`|
| `npm run build`           | Construye el sitio para producción en `./dist/` |
| `npm run preview`         | Vista previa local de la versión de producción  |
| `npm run format`          | Formatea el código con Prettier                 |
| `npm run lint`            | Ejecuta ESLint para verificar el código         |
| `npm run lint:fix`        | Corrige automáticamente problemas de linting    |

## 📝 Notas adicionales

- El proyecto utiliza una estructura de directorios organizada por funcionalidad
- Se ha implementado un sistema de metadatos dinámicos para SEO
- Los componentes están diseñados para ser reutilizables y personalizables
- La página principal redirige automáticamente a la versión localizada (/es/ por defecto)

## 👀 Enlaces útiles

- [Documentación de Astro](https://docs.astro.build)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Rellax.js](https://dixonandmoe.com/rellax/)
- [ScrollReveal](https://scrollrevealjs.org/)

## QA en deploy
- cambios para verficar caché vercel y corregir carga de datos.