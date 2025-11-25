import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { RollbackService } from './rollbackService.js';

const execAsync = promisify(exec);

/**
 * Interfaz para resultado de despliegue
 */
export interface DeploymentResult {
  success: boolean;
  stackName?: string;
  apiUrl?: string;
  message: string;
  backupId?: string;
  timestamp: string;
}

/**
 * Interfaz para estado de despliegue
 */
export interface DeploymentStatus {
  stackName: string;
  status: string;
  lastUpdated?: string;
  outputs?: Array<{ key: string; value: string }>;
  resources?: number;
}

/**
 * Servicio para gestionar despliegues serverless
 */
export class ServerlessService {
  private rollbackService: RollbackService;

  constructor() {
    this.rollbackService = new RollbackService();
  }

  /**
   * Despliega un servicio serverless
   * @param servicePath - Ruta al directorio del servicio
   * @param stage - Stage del despliegue
   * @param region - Región de AWS
   * @param createBackup - Si crear backup antes del despliegue
   * @returns Resultado del despliegue
   */
  async deploy(
    servicePath: string,
    stage: string = 'dev',
    region: string = 'us-east-1',
    createBackup: boolean = true
  ): Promise<DeploymentResult> {
    const timestamp = new Date().toISOString();
    let backupId: string | undefined;

    try {
      // Crear backup si se solicita
      if (createBackup) {
        backupId = await this.rollbackService.createBackup(servicePath, stage, region);
      }

      // Compilar TypeScript si existe
      const packageJsonPath = join(servicePath, 'package.json');
      try {
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
        if (packageJson.scripts?.build) {
          console.error(`Compilando TypeScript en ${servicePath}...`);
          await execAsync('npm run build', { cwd: servicePath });
        }
      } catch {
        // No hay package.json o no hay script de build, continuar
      }

      // Desplegar con serverless
      console.error(`Desplegando servicio serverless en ${servicePath}...`);
      const deployCommand = `npx serverless deploy --stage ${stage} --region ${region}`;
      const { stdout, stderr } = await execAsync(deployCommand, {
        cwd: servicePath,
        env: { ...process.env, AWS_REGION: region },
      });

      // Extraer información del despliegue
      const stackName = await this.extractStackName(stdout, servicePath, stage);
      const apiUrl = this.extractApiUrl(stdout);

      return {
        success: true,
        stackName,
        apiUrl,
        message: 'Despliegue completado exitosamente',
        backupId,
        timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Error en el despliegue: ${errorMessage}`,
        backupId,
        timestamp,
      };
    }
  }

  /**
   * Obtiene el estado de un despliegue
   * @param stackName - Nombre del stack
   * @param region - Región de AWS
   * @returns Estado del despliegue
   */
  async getDeploymentStatus(
    stackName: string,
    region: string = 'us-east-1'
  ): Promise<DeploymentStatus> {
    try {
      const { CloudFormationClient, DescribeStacksCommand } = await import(
        '@aws-sdk/client-cloudformation'
      );
      const client = new CloudFormationClient({ region });
      const command = new DescribeStacksCommand({ StackName: stackName });
      const response = await client.send(command);

      if (!response.Stacks || response.Stacks.length === 0) {
        throw new Error(`Stack no encontrado: ${stackName}`);
      }

      const stack = response.Stacks[0];
      return {
        stackName: stack.StackName || stackName,
        status: stack.StackStatus || 'UNKNOWN',
        lastUpdated: stack.LastUpdatedTime?.toISOString(),
        outputs: stack.Outputs?.map((output) => ({
          key: output.OutputKey || '',
          value: output.OutputValue || '',
        })),
        resources: stack.Outputs?.length || 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error al obtener estado del despliegue: ${errorMessage}`);
    }
  }

  /**
   * Extrae el nombre del stack del output de serverless
   */
  private async extractStackName(stdout: string, servicePath: string, stage: string): Promise<string> {
    // Intentar extraer del output
    const stackMatch = stdout.match(/stack:\s+([^\s]+)/i);
    if (stackMatch) {
      return stackMatch[1];
    }

    // Fallback: construir nombre basado en serverless.yml
    try {
      const { join } = await import('path');
      const serverlessPath = join(servicePath, 'serverless.yml');
      const serverlessContent = await readFile(serverlessPath, 'utf-8');
      const serviceMatch = serverlessContent.match(/^service:\s+(.+)$/m);
      const serviceName = serviceMatch ? serviceMatch[1].trim() : 'serverless';
      return `${serviceName}-${stage}`;
    } catch {
      // Si falla, usar nombre genérico
    }

    return `serverless-${stage}`;
  }

  /**
   * Extrae la URL del API del output de serverless
   */
  private extractApiUrl(stdout: string): string | undefined {
    const urlMatch = stdout.match(/https?:\/\/[^\s]+\.execute-api\.[^\s]+/i);
    return urlMatch ? urlMatch[0] : undefined;
  }
}

