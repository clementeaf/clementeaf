import { type APIGatewayProxyEvent } from 'aws-lambda';
import { CheckAuditorService } from '../services/CheckAuditorService';
import { handlerWrapper } from '../utils/handlerWrapper';
import { successResponse, errorResponse } from '../../Users/utils/response';

/**
 * Handler para obtener datos generales de una empresa
 * @param event - Evento de API Gateway
 * @returns Datos generales de la empresa
 */
const getCompanyDataHandler = async (event: APIGatewayProxyEvent) => {
  const companyId = event.queryStringParameters?.company_id;
  
  if (!companyId) {
    return errorResponse(400, 'company_id is required');
  }

  const checkAuditorService = new CheckAuditorService();
  const result = await checkAuditorService.getCompanyData(companyId);

  return successResponse(200, result, 'Company data retrieved successfully');
};

export const handler = handlerWrapper(getCompanyDataHandler);

