#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { AwsService } from './services/awsService.js';
import { ServerlessService } from './services/serverlessService.js';
import { RollbackService } from './services/rollbackService.js';

/**
 * Servidor MCP para gestionar AWS y despliegues serverless
 */
class BanadosAwsMcpServer {
  private server: Server;
  private awsService: AwsService;
  private serverlessService: ServerlessService;
  private rollbackService: RollbackService;

  constructor() {
    this.server = new Server(
      {
        name: 'banados-aws-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.awsService = new AwsService();
    this.serverlessService = new ServerlessService();
    this.rollbackService = new RollbackService();

    this.setupHandlers();
  }

  /**
   * Configura los handlers del servidor MCP
   */
  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Consultas AWS
        {
          name: 'list_lambda_functions',
          description: 'Lista todas las funciones Lambda en AWS',
          inputSchema: {
            type: 'object',
            properties: {
              region: {
                type: 'string',
                description: 'Región de AWS (default: us-east-1)',
                default: 'us-east-1',
              },
            },
          },
        },
        {
          name: 'get_lambda_function',
          description: 'Obtiene información detallada de una función Lambda',
          inputSchema: {
            type: 'object',
            properties: {
              functionName: {
                type: 'string',
                description: 'Nombre de la función Lambda',
              },
              region: {
                type: 'string',
                description: 'Región de AWS (default: us-east-1)',
                default: 'us-east-1',
              },
            },
            required: ['functionName'],
          },
        },
        {
          name: 'list_cloudformation_stacks',
          description: 'Lista todos los stacks de CloudFormation',
          inputSchema: {
            type: 'object',
            properties: {
              region: {
                type: 'string',
                description: 'Región de AWS (default: us-east-1)',
                default: 'us-east-1',
              },
            },
          },
        },
        {
          name: 'get_cloudformation_stack',
          description: 'Obtiene información detallada de un stack de CloudFormation',
          inputSchema: {
            type: 'object',
            properties: {
              stackName: {
                type: 'string',
                description: 'Nombre del stack',
              },
              region: {
                type: 'string',
                description: 'Región de AWS (default: us-east-1)',
                default: 'us-east-1',
              },
            },
            required: ['stackName'],
          },
        },
        {
          name: 'list_api_gateways',
          description: 'Lista todos los API Gateways',
          inputSchema: {
            type: 'object',
            properties: {
              region: {
                type: 'string',
                description: 'Región de AWS (default: us-east-1)',
                default: 'us-east-1',
              },
            },
          },
        },
        // Despliegues Serverless
        {
          name: 'deploy_serverless',
          description: 'Despliega un servicio serverless a AWS',
          inputSchema: {
            type: 'object',
            properties: {
              servicePath: {
                type: 'string',
                description: 'Ruta al directorio del servicio serverless',
              },
              stage: {
                type: 'string',
                description: 'Stage del despliegue (dev, prod, etc.)',
                default: 'dev',
              },
              region: {
                type: 'string',
                description: 'Región de AWS (default: us-east-1)',
                default: 'us-east-1',
              },
              createBackup: {
                type: 'boolean',
                description: 'Crear backup antes del despliegue para rollback',
                default: true,
              },
            },
            required: ['servicePath'],
          },
        },
        {
          name: 'rollback_serverless',
          description: 'Hace rollback de un despliegue serverless a una versión anterior',
          inputSchema: {
            type: 'object',
            properties: {
              servicePath: {
                type: 'string',
                description: 'Ruta al directorio del servicio serverless',
              },
              stackName: {
                type: 'string',
                description: 'Nombre del stack de CloudFormation',
              },
              backupId: {
                type: 'string',
                description: 'ID del backup al que hacer rollback (opcional, usa el último si no se especifica)',
              },
              region: {
                type: 'string',
                description: 'Región de AWS (default: us-east-1)',
                default: 'us-east-1',
              },
            },
            required: ['servicePath', 'stackName'],
          },
        },
        {
          name: 'list_deployment_backups',
          description: 'Lista todos los backups disponibles para rollback',
          inputSchema: {
            type: 'object',
            properties: {
              stackName: {
                type: 'string',
                description: 'Nombre del stack de CloudFormation',
              },
              region: {
                type: 'string',
                description: 'Región de AWS (default: us-east-1)',
                default: 'us-east-1',
              },
            },
            required: ['stackName'],
          },
        },
        {
          name: 'get_deployment_status',
          description: 'Obtiene el estado actual de un despliegue',
          inputSchema: {
            type: 'object',
            properties: {
              stackName: {
                type: 'string',
                description: 'Nombre del stack de CloudFormation',
              },
              region: {
                type: 'string',
                description: 'Región de AWS (default: us-east-1)',
                default: 'us-east-1',
              },
            },
            required: ['stackName'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_lambda_functions':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.awsService.listLambdaFunctions(args?.region as string),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'get_lambda_function':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.awsService.getLambdaFunction(
                      args?.functionName as string,
                      args?.region as string
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'list_cloudformation_stacks':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.awsService.listCloudFormationStacks(args?.region as string),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'get_cloudformation_stack':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.awsService.getCloudFormationStack(
                      args?.stackName as string,
                      args?.region as string
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'list_api_gateways':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.awsService.listApiGateways(args?.region as string),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'deploy_serverless':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.serverlessService.deploy(
                      args?.servicePath as string,
                      args?.stage as string,
                      args?.region as string,
                      args?.createBackup as boolean
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'rollback_serverless':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.rollbackService.rollback(
                      args?.servicePath as string,
                      args?.stackName as string,
                      args?.backupId as string,
                      args?.region as string
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'list_deployment_backups':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.rollbackService.listBackups(
                      args?.stackName as string,
                      args?.region as string
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'get_deployment_status':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.serverlessService.getDeploymentStatus(
                      args?.stackName as string,
                      args?.region as string
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          default:
            throw new Error(`Herramienta desconocida: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: errorMessage,
                  tool: name,
                  arguments: args,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'aws://lambda/functions',
          name: 'Lambda Functions',
          description: 'Lista de funciones Lambda en AWS',
          mimeType: 'application/json',
        },
        {
          uri: 'aws://cloudformation/stacks',
          name: 'CloudFormation Stacks',
          description: 'Lista de stacks de CloudFormation',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'aws://lambda/functions') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(await this.awsService.listLambdaFunctions(), null, 2),
            },
          ],
        };
      }

      if (uri === 'aws://cloudformation/stacks') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(await this.awsService.listCloudFormationStacks(), null, 2),
            },
          ],
        };
      }

      throw new Error(`Recurso desconocido: ${uri}`);
    });
  }

  /**
   * Inicia el servidor MCP
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Banados AWS MCP Server iniciado');
  }
}

const server = new BanadosAwsMcpServer();
server.start().catch(console.error);

