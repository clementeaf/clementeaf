/**
 * Niveles de logging
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

/**
 * Configuración del logger
 */
interface LoggerConfig {
  /**
   * Nivel mínimo de logging (solo se mostrarán logs de este nivel o superior)
   */
  minLevel: LogLevel;
  /**
   * Si está en modo desarrollo
   */
  isDevelopment: boolean;
}

/**
 * Configuración por defecto
 */
const defaultConfig: LoggerConfig = {
  minLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  isDevelopment: import.meta.env.DEV
};

/**
 * Verifica si un nivel de log debe mostrarse según la configuración
 */
const shouldLog = (level: LogLevel, config: LoggerConfig): boolean => {
  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
  const currentLevelIndex = levels.indexOf(level);
  const minLevelIndex = levels.indexOf(config.minLevel);
  return currentLevelIndex >= minLevelIndex;
};

/**
 * Formatea el mensaje con prefijo según el nivel
 */
const formatMessage = (level: LogLevel, message: string): string => {
  const prefixes: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: '[DEBUG]',
    [LogLevel.INFO]: '[INFO]',
    [LogLevel.WARN]: '[WARN]',
    [LogLevel.ERROR]: '[ERROR]'
  };
  return `${prefixes[level]} ${message}`;
};

/**
 * Logger centralizado para la aplicación
 * Reemplaza console.log/error/warn con un sistema estructurado
 */
class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig = defaultConfig) {
    this.config = config;
  }

  /**
   * Log de debug (solo en desarrollo)
   * @param message - Mensaje a loguear
   * @param data - Datos adicionales opcionales
   */
  debug(message: string, data?: unknown): void {
    if (!shouldLog(LogLevel.DEBUG, this.config)) return;
    if (!this.config.isDevelopment) return;
    
    const formattedMessage = formatMessage(LogLevel.DEBUG, message);
    if (data !== undefined) {
      console.log(formattedMessage, data);
    } else {
      console.log(formattedMessage);
    }
  }

  /**
   * Log de información
   * @param message - Mensaje a loguear
   * @param data - Datos adicionales opcionales
   */
  info(message: string, data?: unknown): void {
    if (!shouldLog(LogLevel.INFO, this.config)) return;
    
    const formattedMessage = formatMessage(LogLevel.INFO, message);
    if (data !== undefined) {
      console.info(formattedMessage, data);
    } else {
      console.info(formattedMessage);
    }
  }

  /**
   * Log de advertencia
   * @param message - Mensaje a loguear
   * @param data - Datos adicionales opcionales
   */
  warn(message: string, data?: unknown): void {
    if (!shouldLog(LogLevel.WARN, this.config)) return;
    
    const formattedMessage = formatMessage(LogLevel.WARN, message);
    if (data !== undefined) {
      console.warn(formattedMessage, data);
    } else {
      console.warn(formattedMessage);
    }
  }

  /**
   * Log de error
   * @param message - Mensaje a loguear
   * @param error - Error opcional
   */
  error(message: string, error?: unknown): void {
    if (!shouldLog(LogLevel.ERROR, this.config)) return;
    
    const formattedMessage = formatMessage(LogLevel.ERROR, message);
    if (error !== undefined) {
      console.error(formattedMessage, error);
      
      // En producción, aquí se podría enviar el error a un servicio de logging
      // Ejemplo: sendToErrorTrackingService(message, error);
    } else {
      console.error(formattedMessage);
    }
  }
}

/**
 * Instancia singleton del logger
 */
export const logger = new Logger();

