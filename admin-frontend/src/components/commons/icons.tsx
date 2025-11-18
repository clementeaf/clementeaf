/**
 * Componente de ícono de checkmark
 * @param color - Color del ícono
 * @returns Componente CheckIcon
 */
export const CheckIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L6 11L13 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono de dropdown
 * @param color - Color del ícono
 * @returns Componente DropdownIcon
 */
export const DropdownIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono de ordenamiento (flechas arriba/abajo)
 * @param color - Color del ícono
 * @returns Componente SortIcon
 */
export const SortIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 2L12 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 10L8 14L12 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono chevron hacia arriba
 * @param color - Color del ícono
 * @returns Componente ChevronUpIcon
 */
export const ChevronUpIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10L8 6L12 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono de campana (notificaciones)
 * @param color - Color del ícono
 * @returns Componente BellIcon
 */
export const BellIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 2C8.9 2 8 2.9 8 4V5.5C5.9 6.2 4.2 8.1 4 10.3V14.5C4 15.3 3.3 16 2.5 16H17.5C16.7 16 16 15.3 16 14.5V10.3C15.8 8.1 14.1 6.2 12 5.5V4C12 2.9 11.1 2 10 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 16C7 17.1 7.9 18 9 18H11C12.1 18 13 17.1 13 16"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Componente de ícono de perfil/usuario
 * @param color - Color del ícono
 * @returns Componente ProfileIcon
 */
export const ProfileIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="7" r="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M4 17C4 14.2 6.7 12 10 12C13.3 12 16 14.2 16 17"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Componente de ícono de plus/suma
 * @param color - Color del ícono
 * @returns Componente PlusIcon
 */
export const PlusIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4V12M4 8H12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono de búsqueda
 * @param color - Color del ícono
 * @returns Componente SearchIcon
 */
export const SearchIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 11L14 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono de documento
 * @param color - Color del ícono
 * @returns Componente DocumentIcon
 */
export const DocumentIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 2H10L12 4V14C12 14.6 11.6 15 11 15H4C3.4 15 3 14.6 3 14V3C3 2.4 3.4 2 4 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 2V4H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono de ojo (ver)
 * @param color - Color del ícono
 * @returns Componente EyeIcon
 */
export const EyeIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 4C5.3 4 3 5.6 1.5 8C3 10.4 5.3 12 8 12C10.7 12 13 10.4 14.5 8C13 5.6 10.7 4 8 4Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono de más opciones (tres puntos verticales)
 * @param color - Color del ícono
 * @returns Componente MoreOptionsIcon
 */
export const MoreOptionsIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="4" r="1" fill={color} />
    <circle cx="8" cy="8" r="1" fill={color} />
    <circle cx="8" cy="12" r="1" fill={color} />
  </svg>
);

/**
 * Componente de ícono de edificio/dirección
 * @param color - Color del ícono
 * @returns Componente BuildingIcon
 */
export const BuildingIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 18H17M4 18V9C4 8.4 4.4 8 5 8H9C9.6 8 10 8.4 10 9V18M10 18V6C10 5.4 10.4 5 11 5H15C15.6 5 16 5.4 16 6V18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M7 12H9M7 15H9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono de persona/contacto
 * @param color - Color del ícono
 * @returns Componente PersonIcon
 */
export const PersonIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="6" r="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M4 18C4 15.2 6.5 13 10 13C13.5 13 16 15.2 16 18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Componente de ícono de ubicación/dirección
 * @param color - Color del ícono
 * @returns Componente LocationIcon
 */
export const LocationIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 10C11.1 10 12 9.1 12 8C12 6.9 11.1 6 10 6C8.9 6 8 6.9 8 8C8 9.1 8.9 10 10 10Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 2C7.2 2 5 4.2 5 7C5 11 10 17 10 17C10 17 15 11 15 7C15 4.2 12.8 2 10 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Componente de ícono de chevron derecho (>)
 * @param color - Color del ícono
 * @returns Componente ChevronRightIcon
 */
export const ChevronRightIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4L10 8L6 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Componente de ícono de email/correo
 * @param color - Color del ícono
 * @returns Componente EmailIcon
 */
export const EmailIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 4H14C14.6 4 15 4.4 15 5V11C15 11.6 14.6 12 14 12H2C1.4 12 1 11.6 1 11V5C1 4.4 1.4 4 2 4Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 5L8 9L1 5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
