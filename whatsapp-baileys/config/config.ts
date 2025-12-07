// Configuración general de la aplicación
interface BaileysConfig {
  sessionDir: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  authTimeout: number;
}

interface LoggingConfig {
  level: string;
  prettyPrint: boolean;
}

interface FilesConfig {
  logDir: string;
  maxFileSize: number;
}

interface Config {
  port: number;
  baileys: BaileysConfig;
  logging: LoggingConfig;
  files: FilesConfig;
}

const config: Config = {
  // Puerto para el servidor Express (si se usa)
  port: Number(process.env.PORT) || 3000,
  
  // Configuración de Baileys
  baileys: {
    // Directorio donde se guardarán las sesiones
    sessionDir: './sessions',
    
    // Tiempo de espera para reconexión (en milisegundos)
    reconnectInterval: 5000,
    
    // Número máximo de intentos de reconexión
    maxReconnectAttempts: 5,
    
    // Tiempo de espera para autenticación (en milisegundos)
    authTimeout: 60000,
  },
  
  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production',
  },
  
  // Configuración de archivos
  files: {
    // Directorio para logs
    logDir: './logs',
    
    // Tamaño máximo de archivos (en MB)
    maxFileSize: 10,
  }
};

export default config;