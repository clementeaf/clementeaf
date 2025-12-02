/**
 * Breakpoints responsive de Tailwind CSS
 */
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
} as const;

/**
 * Clases responsive comunes para contenedores
 */
export const containerClasses = {
  base: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
  fluid: 'w-full',
  centered: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  narrow: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  wide: 'w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',
} as const;

/**
 * Clases responsive comunes para espaciado
 */
export const spacingClasses = {
  section: 'py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12',
  container: 'px-4 sm:px-6 md:px-8 lg:px-10',
  gap: 'gap-2 sm:gap-4 md:gap-6 lg:gap-8',
} as const;

/**
 * Clases responsive comunes para tipografía
 */
export const typographyClasses = {
  h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
  h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
  h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
  h4: 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl',
  body: 'text-sm sm:text-base md:text-lg',
  small: 'text-xs sm:text-sm md:text-base',
} as const;

/**
 * Clases responsive comunes para grids
 */
export const gridClasses = {
  '1-col': 'grid grid-cols-1',
  '2-col': 'grid grid-cols-1 sm:grid-cols-2',
  '3-col': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4-col': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  'auto-fit': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
} as const;

/**
 * Clases responsive comunes para flex
 */
export const flexClasses = {
  row: 'flex flex-col sm:flex-row',
  column: 'flex flex-col',
  wrap: 'flex flex-wrap',
  'space-between': 'flex flex-col sm:flex-row justify-between items-start sm:items-center',
  'space-around': 'flex flex-col sm:flex-row justify-around items-center',
  center: 'flex items-center justify-center',
} as const;

