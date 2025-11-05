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

