import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { CloudFormationClient, DescribeStacksCommand, GetTemplateCommand } from '@aws-sdk/client-cloudformation';

const execAsync = promisify(exec);

/**
 * Interfaz para información de backup
 */
export interface BackupInfo {
  backupId: string;
  stackName: string;
  timestamp: string;
  region: string;
  stage: string;
  template: string;
  outputs?: Array<{ key: string; value: string }>;
}

/**
 * Interfaz para resultado de rollback
 */
export interface RollbackResult {
  success: boolean;
  message: string;
  stackName: string;
  backupId: string;
  timestamp: string;
}

/**
 * Servicio para gestionar rollbacks de despliegues
 */
export class RollbackService {
  private backupsDir: string;

  constructor() {
    this.backupsDir = join(process.cwd(), '.mcp-backups');
    this.ensureBackupsDir();
  }

  /**
   * Asegura que el directorio de backups existe
   */
  private async ensureBackupsDir(): Promise<void> {
    try {
      await mkdir(this.backupsDir, { recursive: true });
    } catch {
      // El directorio ya existe o no se puede crear
    }
  }

  /**
   * Crea un backup del estado actual del stack
   * @param servicePath - Ruta al directorio del servicio
   * @param stage - Stage del despliegue
   * @param region - Región de AWS
   * @returns ID del backup creado
   */
  async createBackup(
    servicePath: string,
    stage: string,
    region: string = 'us-east-1'
  ): Promise<string> {
    const timestamp = new Date().toISOString();
    const backupId = `backup-${Date.now()}-${stage}`;

    try {
      // Obtener información del stack actual
      const stackName = await this.getStackName(servicePath, stage);
      const stackInfo = await this.getStackInfo(stackName, region);

      // Crear objeto de backup
      const backup: BackupInfo = {
        backupId,
        stackName,
        timestamp,
        region,
        stage,
        template: stackInfo.template,
        outputs: stackInfo.outputs,
      };

      // Guardar backup
      const backupPath = join(this.backupsDir, `${backupId}.json`);
      await writeFile(backupPath, JSON.stringify(backup, null, 2));

      console.error(`Backup creado: ${backupId}`);
      return backupId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error al crear backup: ${errorMessage}`);
      // Continuar sin backup si falla
      return backupId;
    }
  }

  /**
   * Lista todos los backups disponibles para un stack
   * @param stackName - Nombre del stack
   * @param region - Región de AWS
   * @returns Lista de backups
   */
  async listBackups(stackName: string, region: string = 'us-east-1'): Promise<BackupInfo[]> {
    try {
      const files = await readdir(this.backupsDir);
      const backups: BackupInfo[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const backupPath = join(this.backupsDir, file);
            const backup: BackupInfo = JSON.parse(await readFile(backupPath, 'utf-8'));

            if (backup.stackName === stackName && backup.region === region) {
              backups.push(backup);
            }
          } catch {
            // Ignorar archivos corruptos
          }
        }
      }

      // Ordenar por timestamp (más reciente primero)
      return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch {
      return [];
    }
  }

  /**
   * Hace rollback a un backup específico
   * @param servicePath - Ruta al directorio del servicio
   * @param stackName - Nombre del stack
   * @param backupId - ID del backup (opcional, usa el último si no se especifica)
   * @param region - Región de AWS
   * @returns Resultado del rollback
   */
  async rollback(
    servicePath: string,
    stackName: string,
    backupId?: string,
    region: string = 'us-east-1'
  ): Promise<RollbackResult> {
    const timestamp = new Date().toISOString();

    try {
      // Obtener backup
      let backup: BackupInfo;
      if (backupId) {
        const backupPath = join(this.backupsDir, `${backupId}.json`);
        backup = JSON.parse(await readFile(backupPath, 'utf-8'));
      } else {
        const backups = await this.listBackups(stackName, region);
        if (backups.length === 0) {
          throw new Error('No se encontraron backups para este stack');
        }
        backup = backups[0]; // Usar el más reciente
      }

      // Verificar que el backup corresponde al stack
      if (backup.stackName !== stackName) {
        throw new Error(
          `El backup ${backup.backupId} no corresponde al stack ${stackName}`
        );
      }

      // Restaurar template de CloudFormation
      const templatePath = join(servicePath, 'serverless.compiled.yml');
      await writeFile(templatePath, backup.template);

      // Hacer rollback usando serverless
      console.error(`Haciendo rollback a backup ${backup.backupId}...`);
      const rollbackCommand = `npx serverless deploy --stage ${backup.stage} --region ${region}`;
      await execAsync(rollbackCommand, {
        cwd: servicePath,
        env: { ...process.env, AWS_REGION: region },
      });

      return {
        success: true,
        message: `Rollback completado exitosamente a backup ${backup.backupId}`,
        stackName,
        backupId: backup.backupId,
        timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Error en el rollback: ${errorMessage}`,
        stackName,
        backupId: backupId || 'unknown',
        timestamp,
      };
    }
  }

  /**
   * Obtiene el nombre del stack desde serverless.yml
   */
  private async getStackName(servicePath: string, stage: string): Promise<string> {
    try {
      const serverlessPath = join(servicePath, 'serverless.yml');
      const serverlessContent = await readFile(serverlessPath, 'utf-8');
      const serviceMatch = serverlessContent.match(/^service:\s+(.+)$/m);
      const serviceName = serviceMatch ? serviceMatch[1].trim() : 'serverless';
      return `${serviceName}-${stage}`;
    } catch {
      return `serverless-${stage}`;
    }
  }

  /**
   * Obtiene información del stack desde CloudFormation
   */
  private async getStackInfo(
    stackName: string,
    region: string
  ): Promise<{ template: string; outputs?: Array<{ key: string; value: string }> }> {
    const client = new CloudFormationClient({ region });

    // Obtener template
    const templateCommand = new GetTemplateCommand({ StackName: stackName });
    const templateResponse = await client.send(templateCommand);
    const template = templateResponse.TemplateBody || '{}';

    // Obtener outputs
    const describeCommand = new DescribeStacksCommand({ StackName: stackName });
    const describeResponse = await client.send(describeCommand);
    const outputs =
      describeResponse.Stacks?.[0]?.Outputs?.map((output) => ({
        key: output.OutputKey || '',
        value: output.OutputValue || '',
      })) || [];

    return { template, outputs };
  }
}

