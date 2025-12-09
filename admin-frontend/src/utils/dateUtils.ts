/**
 * Formatea una fecha a tiempo relativo (hace X minutos, ayer, etc.)
 * @param dateString - Fecha en formato ISO string
 * @returns String con tiempo relativo
 */
export const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Menos de 1 minuto
  if (diffInSeconds < 60) {
    return 'ahora';
  }

  // Menos de 1 hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  // Menos de 24 horas
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  // Menos de 7 días
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) {
      return 'ayer';
    }
    return `hace ${days} días`;
  }

  // Más de 7 días - mostrar fecha completa
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Formatea una fecha para mostrar en la lista de conversaciones
 * @param dateString - Fecha en formato ISO string
 * @returns String con formato optimizado
 */
export const formatConversationDate = (dateString: string | null): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Hoy - mostrar hora
  if (diffInSeconds < 86400 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Ayer
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
    return 'Ayer';
  }

  // Esta semana - mostrar día de la semana
  if (diffInSeconds < 604800) {
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  }

  // Más de una semana - mostrar fecha
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Formatea una fecha ISO a formato DD/MM/YYYY
 * @param dateString - Fecha en formato ISO string o null
 * @returns Fecha formateada o '-' si no es válida
 */
export const formatDateShort = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
};

/**
 * Formatea una fecha con hora completa (DD/MM/YYYY HH:MM)
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha formateada con hora
 */
export const formatDateWithTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

