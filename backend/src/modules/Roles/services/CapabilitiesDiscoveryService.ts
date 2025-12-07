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

    // Agregar permisos manuales adicionales
    const manualCapabilities = this.getManualCapabilities();
    capabilities.push(...manualCapabilities);

    return capabilities;
  }

  /**
   * Obtiene permisos manuales adicionales que no se descubren automáticamente
   * @returns Lista de capacidades manuales
   */
  private getManualCapabilities(): Capability[] {
    return [
      {
        code: 'view:products:history',
        name: 'Ver Historial de Productos',
        description: 'Permite ver el historial de movimientos de stock de productos',
        category: 'Productos',
        resource: 'products',
        action: 'view'
      },
      {
        code: 'create:products:movements',
        name: 'Crear Movimientos de Stock',
        description: 'Permite crear movimientos de stock (entradas, salidas, ajustes)',
        category: 'Productos',
        resource: 'products',
        action: 'create'
      },
      {
        code: 'view:whatsapp:status',
        name: 'Ver Estado de WhatsApp',
        description: 'Permite ver el estado de conexión de WhatsApp',
        category: 'WhatsApp',
        resource: 'whatsapp',
        action: 'view:status'
      },
      {
        code: 'manage:whatsapp:connection',
        name: 'Gestionar Conexión de WhatsApp',
        description: 'Permite conectar y desconectar WhatsApp',
        category: 'WhatsApp',
        resource: 'whatsapp',
        action: 'manage:connection'
      },
      {
        code: 'send:whatsapp:messages',
        name: 'Enviar Mensajes de WhatsApp',
        description: 'Permite enviar mensajes de texto e imágenes por WhatsApp',
        category: 'WhatsApp',
        resource: 'whatsapp',
        action: 'send:messages'
      }
    ];
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
   * Descubre capacidades del frontend desde navItems (módulos) y routes (vistas)
   * @returns Lista de capacidades del frontend
   */
  private async discoverFrontendCapabilities(): Promise<Capability[]> {
    const capabilities: Capability[] = [];
    
    try {
      const routesPath = path.join(process.cwd(), '..', 'admin-frontend', 'src', 'routes', 'index.ts');
      const navItemsPath = path.join(process.cwd(), '..', 'admin-frontend', 'src', 'components', 'Sidebar', 'navItems.config.ts');
      
      if (!fs.existsSync(routesPath)) {
        return capabilities;
      }

      const routesContent = fs.readFileSync(routesPath, 'utf8');
      let navItemsContent = '';
      if (fs.existsSync(navItemsPath)) {
        navItemsContent = fs.readFileSync(navItemsPath, 'utf8');
      }

      // PASO 1: Descubrir módulos principales del sidebar (navItems)
      // Leer línea por línea para detectar módulos activos (no comentados)
      const modules: Array<{ name: string; routeKey: string; path: string; hasSubItems: boolean }> = [];
      const lines = navItemsContent.split('\n');
      
      // Buscar el inicio del array navItems
      let inNavItemsArray = false;
      let braceCount = 0;
      let currentModuleLines: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Detectar inicio del array navItems
        if (trimmedLine.includes('export const navItems') || trimmedLine.includes('navItems:')) {
          inNavItemsArray = true;
          continue;
        }
        
        // Si estamos dentro del array navItems
        if (inNavItemsArray) {
          // Detectar comentarios de línea completa
          if (trimmedLine.startsWith('//')) {
            continue;
          }
          
          // Detectar inicio de objeto módulo
          if (trimmedLine.startsWith('{')) {
            braceCount = 1;
            currentModuleLines = [line];
            continue;
          }
          
          // Si estamos dentro de un objeto módulo
          if (braceCount > 0) {
            currentModuleLines.push(line);
            
            // Contar llaves para detectar fin de objeto
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            
            // Si el objeto está completo
            if (braceCount === 0) {
              const moduleBlock = currentModuleLines.join('\n');
              
              // Verificar que no esté comentado
              const isCommented = currentModuleLines.some(l => l.trim().startsWith('//'));
              
              if (!isCommented) {
                // Extraer name, path y hasSubItems
                const nameMatch = moduleBlock.match(/name:\s*['"]([^'"]+)['"]/);
                const pathMatch = moduleBlock.match(/path:\s*routes\.(\w+)/);
                const hasSubItems = moduleBlock.includes('hasSubItems: true');
                
                if (nameMatch && pathMatch) {
                  const name = nameMatch[1];
                  const routeKey = pathMatch[1];
                  
                  // Extraer la ruta correspondiente
                  const routeMatch = routesContent.match(new RegExp(`^\\s*${routeKey}:\\s*['"]([^'"]+)['"]`, 'm'));
                  if (routeMatch) {
                    // Evitar duplicados
                    if (!modules.some(m => m.routeKey === routeKey)) {
                      modules.push({
                        name,
                        routeKey,
                        path: routeMatch[1],
                        hasSubItems
                      });
                    }
                  }
                }
              }
              
              currentModuleLines = [];
            }
          }
          
          // Detectar fin del array
          if (trimmedLine === '];' && braceCount === 0) {
            break;
          }
        }
      }

      // PASO 2: Descubrir submódulos (subitems)
      const subItemsPatterns = [
        { module: 'Ventas', pattern: /sellsSubItems.*?name:\s*['"]([^'"]+)['"].*?path:\s*routes\.(\w+)/gs },
        { module: 'Picking', pattern: /pickingSubItems.*?name:\s*['"]([^'"]+)['"].*?path:\s*routes\.(\w+)/gs },
        { module: 'Roles', pattern: /rolesSubItems.*?name:\s*['"]([^'"]+)['"].*?path:\s*routes\.(\w+)/gs }
      ];

      const subModules: Array<{ name: string; routeKey: string; path: string; module: string }> = [];
      
      for (const { module, pattern } of subItemsPatterns) {
        const matches = navItemsContent.matchAll(pattern);
        for (const match of matches) {
          const name = match[1];
          const routeKey = match[2];
          const routeMatch = routesContent.match(new RegExp(`^\\s*${routeKey}:\\s*['"]([^'"]+)['"]`, 'm'));
          if (routeMatch) {
            subModules.push({
              name,
              routeKey,
              path: routeMatch[1],
              module
            });
          }
        }
      }

      // PASO 3: Generar permisos para módulos principales primero
      for (const module of modules) {
        const normalizedRoute = module.path.replace(/^\//, '').replace(/\//g, ':').replace(/:{id}/g, ':id');
        const permissionCode = `module:${normalizedRoute}`;
        
        capabilities.push({
          code: permissionCode,
          name: module.name,
          description: `Acceso al módulo ${module.name}`,
          category: 'Módulos',
          resource: module.path,
          action: 'access'
        });
      }

      // PASO 4: Generar permisos para submódulos/vistas
      for (const subModule of subModules) {
        const normalizedRoute = subModule.path.replace(/^\//, '').replace(/\//g, ':').replace(/:{id}/g, ':id');
        const permissionCode = `view:${normalizedRoute}`;
        
        capabilities.push({
          code: permissionCode,
          name: subModule.name,
          description: `Acceso a ${subModule.name} (${subModule.module})`,
          category: subModule.module,
          resource: subModule.path,
          action: 'view'
        });
      }

      // PASO 5: Generar permisos para vistas adicionales que no están en submódulos
      const routeMatches = routesContent.matchAll(/^\s*(\w+):\s*['"]([^'"]+)['"]/gm);
      const routeMap: Record<string, string> = {};
      for (const match of routeMatches) {
        const key = match[1];
        const value = match[2];
        if (key && value && !value.includes('*') && key !== 'root' && key !== 'notFound') {
          routeMap[key] = value;
        }
      }

      // Mapeo de rutas adicionales
      const additionalRoutes: Record<string, { category: string; name: string }> = {
        home: { category: 'Módulos', name: 'Inicio' },
        createClient: { category: 'Ventas', name: 'Crear Cliente' },
        clientDetails: { category: 'Ventas', name: 'Detalles de Cliente' },
        createQuote: { category: 'Ventas', name: 'Crear Nota de Venta' },
        createRole: { category: 'Roles', name: 'Crear Rol' },
        quoteDetails: { category: 'Ventas', name: 'Detalles de Nota de Venta' }
      };

      for (const [key, route] of Object.entries(routeMap)) {
        // Solo agregar si no está ya en módulos o submódulos
        const alreadyAdded = modules.some(m => m.routeKey === key) || 
                            subModules.some(s => s.routeKey === key);
        
        if (!alreadyAdded && additionalRoutes[key]) {
          const routeInfo = additionalRoutes[key];
          const normalizedRoute = route.replace(/^\//, '').replace(/\//g, ':').replace(/:{id}/g, ':id');
          const permissionCode = `view:${normalizedRoute}`;
          
          capabilities.push({
            code: permissionCode,
            name: routeInfo.name,
            description: `Acceso a ${routeInfo.name}`,
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

