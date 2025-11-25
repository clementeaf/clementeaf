import { LambdaClient, ListFunctionsCommand, GetFunctionCommand } from '@aws-sdk/client-lambda';
import {
  CloudFormationClient,
  ListStacksCommand,
  DescribeStacksCommand,
  StackStatus,
} from '@aws-sdk/client-cloudformation';
import {
  APIGatewayClient,
  GetRestApisCommand,
  GetRestApiCommand,
} from '@aws-sdk/client-apigateway';

/**
 * Interfaz para información de función Lambda
 */
export interface LambdaFunctionInfo {
  functionName: string;
  runtime: string;
  handler: string;
  memorySize: number;
  timeout: number;
  lastModified: string;
  codeSize: number;
  description?: string;
}

/**
 * Interfaz para información de stack de CloudFormation
 */
export interface CloudFormationStackInfo {
  stackName: string;
  stackId: string;
  stackStatus: string;
  creationTime: string;
  lastUpdatedTime?: string;
  description?: string;
  outputs?: Array<{ OutputKey: string; OutputValue: string }>;
}

/**
 * Interfaz para información de API Gateway
 */
export interface ApiGatewayInfo {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  version?: string;
}

/**
 * Servicio para interactuar con AWS
 */
export class AwsService {
  private getLambdaClient(region: string = 'us-east-1'): LambdaClient {
    return new LambdaClient({ region });
  }

  private getCloudFormationClient(region: string = 'us-east-1'): CloudFormationClient {
    return new CloudFormationClient({ region });
  }

  private getApiGatewayClient(region: string = 'us-east-1'): APIGatewayClient {
    return new APIGatewayClient({ region });
  }

  /**
   * Lista todas las funciones Lambda
   * @param region - Región de AWS
   * @returns Lista de funciones Lambda
   */
  async listLambdaFunctions(region: string = 'us-east-1'): Promise<LambdaFunctionInfo[]> {
    const client = this.getLambdaClient(region);
    const command = new ListFunctionsCommand({});
    const response = await client.send(command);

    return (
      response.Functions?.map((func) => ({
        functionName: func.FunctionName || '',
        runtime: func.Runtime || '',
        handler: func.Handler || '',
        memorySize: func.MemorySize || 0,
        timeout: func.Timeout || 0,
        lastModified: func.LastModified?.toISOString() || '',
        codeSize: func.CodeSize || 0,
        description: func.Description,
      })) || []
    );
  }

  /**
   * Obtiene información detallada de una función Lambda
   * @param functionName - Nombre de la función
   * @param region - Región de AWS
   * @returns Información de la función Lambda
   */
  async getLambdaFunction(
    functionName: string,
    region: string = 'us-east-1'
  ): Promise<LambdaFunctionInfo> {
    const client = this.getLambdaClient(region);
    const command = new GetFunctionCommand({ FunctionName: functionName });
    const response = await client.send(command);

    if (!response.Configuration) {
      throw new Error(`Función Lambda no encontrada: ${functionName}`);
    }

    const config = response.Configuration;
    return {
      functionName: config.FunctionName || '',
      runtime: config.Runtime || '',
      handler: config.Handler || '',
      memorySize: config.MemorySize || 0,
      timeout: config.Timeout || 0,
      lastModified: config.LastModified?.toISOString() || '',
      codeSize: config.CodeSize || 0,
      description: config.Description,
    };
  }

  /**
   * Lista todos los stacks de CloudFormation
   * @param region - Región de AWS
   * @returns Lista de stacks
   */
  async listCloudFormationStacks(region: string = 'us-east-1'): Promise<CloudFormationStackInfo[]> {
    const client = this.getCloudFormationClient(region);
    const command = new ListStacksCommand({
      StackStatusFilter: [
        StackStatus.CREATE_COMPLETE,
        StackStatus.UPDATE_COMPLETE,
        StackStatus.UPDATE_ROLLBACK_COMPLETE,
        StackStatus.UPDATE_IN_PROGRESS,
        StackStatus.CREATE_IN_PROGRESS,
      ],
    });
    const response = await client.send(command);

    return (
      response.StackSummaries?.map((stack) => ({
        stackName: stack.StackName || '',
        stackId: stack.StackId || '',
        stackStatus: stack.StackStatus || '',
        creationTime: stack.CreationTime?.toISOString() || '',
        lastUpdatedTime: stack.LastUpdatedTime?.toISOString(),
      })) || []
    );
  }

  /**
   * Obtiene información detallada de un stack de CloudFormation
   * @param stackName - Nombre del stack
   * @param region - Región de AWS
   * @returns Información del stack
   */
  async getCloudFormationStack(
    stackName: string,
    region: string = 'us-east-1'
  ): Promise<CloudFormationStackInfo> {
    const client = this.getCloudFormationClient(region);
    const command = new DescribeStacksCommand({ StackName: stackName });
    const response = await client.send(command);

    if (!response.Stacks || response.Stacks.length === 0) {
      throw new Error(`Stack no encontrado: ${stackName}`);
    }

    const stack = response.Stacks[0];
    return {
      stackName: stack.StackName || '',
      stackId: stack.StackId || '',
      stackStatus: stack.StackStatus || '',
      creationTime: stack.CreationTime?.toISOString() || '',
      lastUpdatedTime: stack.LastUpdatedTime?.toISOString(),
      description: stack.Description,
      outputs: stack.Outputs?.map((output) => ({
        OutputKey: output.OutputKey || '',
        OutputValue: output.OutputValue || '',
      })),
    };
  }

  /**
   * Lista todos los API Gateways
   * @param region - Región de AWS
   * @returns Lista de API Gateways
   */
  async listApiGateways(region: string = 'us-east-1'): Promise<ApiGatewayInfo[]> {
    const client = this.getApiGatewayClient(region);
    const command = new GetRestApisCommand({});
    const response = await client.send(command);

    return (
      response.items?.map((api) => ({
        id: api.id || '',
        name: api.name || '',
        description: api.description,
        createdDate: api.createdDate?.toISOString() || '',
        version: api.version,
      })) || []
    );
  }
}

