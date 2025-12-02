# Guía de Responsive Design - Sells Frontend

Este proyecto está configurado para ser **ABSOLUTAMENTE RESPONSIVE** desde el inicio.

## Configuración Base

### Viewport
- Configurado en `index.html` con soporte completo para dispositivos móviles
- Incluye `maximum-scale` y `user-scalable` para mejor UX

### Tailwind CSS
- Breakpoints personalizados: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- Utilidades responsive predefinidas en `src/index.css`
- Clases helper en `src/utils/responsive.ts`

## Breakpoints Disponibles

```typescript
xs:  475px   // Extra pequeño
sm:  640px   // Móvil
md:  768px   // Tablet
lg:  1024px  // Desktop pequeño
xl:  1280px  // Desktop
2xl: 1536px  // Desktop grande
3xl: 1920px  // Desktop extra grande
```

## Clases Utility Responsive

### Contenedores
- `.container-responsive` - Contenedor con padding responsive
- Usa `containerClasses` de `src/utils/responsive.ts`

### Tipografía
- `.text-responsive` - Texto que escala con el viewport
- `.heading-responsive` - Títulos que escalan con el viewport
- Usa `typographyClasses` de `src/utils/responsive.ts`

### Espaciado
- Usa `spacingClasses` de `src/utils/responsive.ts`

### Grids
- Usa `gridClasses` de `src/utils/responsive.ts`

### Flexbox
- Usa `flexClasses` de `src/utils/responsive.ts`

## Componente Layout

Usa el componente `<Layout>` para envolver páginas:

```tsx
import { Layout } from './components';

function MyPage() {
  return (
    <Layout>
      <h1>Mi Contenido</h1>
    </Layout>
  );
}
```

## Mejores Prácticas

### 1. Mobile-First
Siempre diseña primero para móvil, luego agrega breakpoints mayores:

```tsx
// ✅ Correcto (Mobile-First)
<div className="text-sm md:text-base lg:text-lg">

// ❌ Incorrecto (Desktop-First)
<div className="text-lg md:text-base sm:text-sm">
```

### 2. Uso de Breakpoints
Usa breakpoints de forma consistente:

```tsx
// Grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

// Espaciado responsive
<div className="p-4 sm:p-6 md:p-8 lg:p-10">

// Flexbox responsive
<div className="flex flex-col sm:flex-row">
```

### 3. Imágenes Responsive
Siempre usa imágenes responsive:

```tsx
<img 
  src="image.jpg" 
  alt="Description"
  className="w-full h-auto"
/>
```

### 4. Texto Responsive
Usa las clases de tipografía predefinidas:

```tsx
<h1 className={typographyClasses.h1}>Título</h1>
<p className={typographyClasses.body}>Texto</p>
```

### 5. Testing
Prueba en diferentes tamaños:
- Móvil: 320px - 640px
- Tablet: 768px - 1024px
- Desktop: 1280px+

## Herramientas de Desarrollo

### Chrome DevTools
- Usa Device Toolbar (Cmd/Ctrl + Shift + M)
- Prueba diferentes dispositivos

### Extensiones Recomendadas
- Responsive Viewer
- Window Resizer

## Recursos

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

