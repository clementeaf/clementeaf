import * as fs from 'fs';
import * as path from 'path';

export interface Capability {
  code: string;
  name: string;
  description: string;
  category: string;
  resource: string | null;
  action: string | null;
}

/**
 * Servicio para descubrir automáticamente las capacidades del sistema
 * basándose en serverless.yml y rutas del frontend
 */
export class CapabilitiesDiscoveryService {
  /**
   * Descubre todas las capacidades disponibles del sistema
   * @returns Lista de capacidades disponibles
   */
  async discoverCapabilities(): Promise<Capability[]> {
    const capabilities: Capability[] = [];

    // Descubrir capacidades del backend desde serverless.yml
    const backendCapabilities = await this.discoverBackendCapabilities();
    capabilities.push(...backendCapabilities);

    // Descubrir capacidades del frontend desde routes
    const frontendCapabilities = await this.discoverFrontendCapabilities();
    capabilities.push(...frontendCapabilities);

    return capabilities;
  }

  /**
   * Descubre capacidades del backend desde serverless.yml
   * @returns Lista de capacidades del backend
   */
  private async discoverBackendCapabilities(): Promise<Capability[]> {
    const capabilities: Capability[] = [];
    
    try {
      const serverlessPath = path.join(process.cwd(), 'serverless.yml');
      const serverlessContent = fs.readFileSync(serverlessPath, 'utf8');
      
      // Extraer funciones y sus eventos HTTP usando regex
      // Buscar bloques de funciones que tengan eventos HTTP
      const functionBlockRegex = /^  (\w+):\s*$/gm;
      const httpEventRegex = /path:\s*(['"]?)([^\s'"]+)\1\s*\n\s*method:\s*(['"]?)(\w+)\3/gi;
      
      const functions: Array<{ name: string; events: Array<{ path: string; method: string }> }> = [];
      const functionMatches = Array.from(serverlessContent.matchAll(functionBlockRegex));
      
      for (let i = 0; i < functionMatches.length; i++) {
        const functionMatch = functionMatches[i];
        const functionName = functionMatch[1];
        const functionStart = functionMatch.index || 0;
        
        // Buscar el siguiente bloque de función
        const nextFunctionMatch = functionMatches[i + 1];
        const functionEnd = nextFunctionMatch ? (nextFunctionMatch.index || serverlessContent.length) : serverlessContent.length;
        
        const functionBlock = serverlessContent.substring(functionStart, functionEnd);
        const events: Array<{ path: string; method: string }> = [];
        
        // Buscar todos los eventos HTTP en este bloque
        let eventMatch;
        httpEventRegex.lastIndex = 0;
        while ((eventMatch = httpEventRegex.exec(functionBlock)) !== null) {
          const eventPath = eventMatch[2];
          const eventMethod = (eventMatch[4] || '').toUpperCase();
          
          // Ignorar rutas públicas de autenticación
          if (eventPath.startsWith('auth/register') || eventPath.startsWith('auth/login')) {
            continue;
          }
          
          events.push({ path: eventPath, method: eventMethod });
        }
        
        if (events.length > 0) {
          functions.push({ name: functionName, events });
        }
      }

      for (const func of functions) {
        for (const event of func.events) {
          const category = this.extractCategoryFromPath(event.path);
          const resource = this.extractResourceFromPath(event.path);
          const action = this.mapMethodToAction(event.method);
          const code = this.generatePermissionCode(event.path, event.method);
          const name = this.generatePermissionName(func.name, event.path, event.method);

          capabilities.push({
            code,
            name,
            description: `Acceso a ${event.path} mediante ${event.method}`,
            category,
            resource,
            action
          });
        }
      }
    } catch (error) {
      console.error('Error descubriendo capacidades del backend:', error);
    }

    return capabilities;
  }

  /**
   * Descubre capacidades del frontend desde routes
   * @returns Lista de capacidades del frontend
   */
  private async discoverFrontendCapabilities(): Promise<Capability[]> {
    const capabilities: Capability[] = [];
    
    try {
      const routesPath = path.join(process.cwd(), '..', 'admin-frontend', 'src', 'routes', 'index.ts');
      
      if (!fs.existsSync(routesPath)) {
        return capabilities;
      }

      const routesContent = fs.readFileSync(routesPath, 'utf8');
      
      // Extraer rutas usando regex
      const routeMatches = routesContent.matchAll(/^\s*(\w+):\s*['"]([^'"]+)['"]/gm);
      
      const routeMap: Record<string, string> = {};
      for (const match of routeMatches) {
        const key = match[1];
        const value = match[2];
        if (key && value && !value.includes('*')) {
          routeMap[key] = value;
        }
      }

      // Mapeo de rutas a categorías y nombres
      const routeCategories: Record<string, { category: string; name: string }> = {
        home: { category: 'Vistas', name: 'Inicio' },
        clients: { category: 'Vistas', name: 'Clientes' },
        createClient: { category: 'Vistas', name: 'Crear Cliente' },
        clientDetails: { category: 'Vistas', name: 'Detalles de Cliente' },
        quotes: { category: 'Vistas', name: 'Notas de Venta' },
        createQuote: { category: 'Vistas', name: 'Crear Nota de Venta' },
        quoteDetails: { category: 'Vistas', name: 'Detalles de Nota de Venta' },
        salesOrder: { category: 'Vistas', name: 'Orden de Ventas' },
        collections: { category: 'Vistas', name: 'Cuentas por Cobrar' },
        picking: { category: 'Vistas', name: 'Picking' },
        pickingOrder: { category: 'Vistas', name: 'Orden de Picking' },
        pickingMetrics: { category: 'Vistas', name: 'Métricas de Picking' },
        analytics: { category: 'Vistas', name: 'Analíticas' },
        chat: { category: 'Vistas', name: 'Chat' },
        support: { category: 'Vistas', name: 'Soporte' },
        invoices: { category: 'Vistas', name: 'Facturas' }
      };

      for (const [key, route] of Object.entries(routeMap)) {
        const routeInfo = routeCategories[key];
        if (routeInfo) {
          capabilities.push({
            code: `view:${route}`,
            name: routeInfo.name,
            description: `Acceso a la vista ${routeInfo.name}`,
            category: routeInfo.category,
            resource: route,
            action: 'view'
          });
        }
      }
    } catch (error) {
      console.error('Error descubriendo capacidades del frontend:', error);
    }

    return capabilities;
  }

  /**
   * Extrae la categoría desde la ruta
   * @param path - Ruta del endpoint
   * @returns Categoría
   */
  private extractCategoryFromPath(path: string): string {
    const parts = path.split('/');
    if (parts.length > 0 && parts[0]) {
      const category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      return category;
    }
    return 'General';
  }

  /**
   * Extrae el recurso desde la ruta
   * @param path - Ruta del endpoint
   * @returns Recurso
   */
  private extractResourceFromPath(path: string): string | null {
    const parts = path.split('/');
    if (parts.length > 0 && parts[0]) {
      return parts[0];
    }
    return null;
  }

  /**
   * Mapea el método HTTP a una acción
   * @param method - Método HTTP
   * @returns Acción
   */
  private mapMethodToAction(method: string): string | null {
    const methodMap: Record<string, string> = {
      'GET': 'read',
      'POST': 'create',
      'PUT': 'update',
      'PATCH': 'update',
      'DELETE': 'delete'
    };
    return methodMap[method] || null;
  }

  /**
   * Genera el código de permiso
   * @param path - Ruta del endpoint
   * @param method - Método HTTP
   * @returns Código de permiso
   */
  private generatePermissionCode(path: string, method: string): string {
    const normalizedPath = path.replace(/\{.*?\}/g, '{id}').replace(/\//g, ':');
    return `${method.toLowerCase()}:${normalizedPath}`;
  }

  /**
   * Genera el nombre del permiso
   * @param _functionName - Nombre de la función (no usado, pero útil para contexto)
   * @param path - Ruta del endpoint
   * @param method - Método HTTP
   * @returns Nombre del permiso
   */
  private generatePermissionName(_functionName: string, path: string, method: string): string {
    const actionName = this.mapMethodToAction(method) || method.toLowerCase();
    const resourceName = this.extractResourceFromPath(path) || 'recurso';
    const capitalizedAction = actionName.charAt(0).toUpperCase() + actionName.slice(1);
    const capitalizedResource = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    return `${capitalizedAction} ${capitalizedResource}`;
  }
}

