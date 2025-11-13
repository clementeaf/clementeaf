import { type APIGatewayProxyEvent } from 'aws-lambda';
import { handlerWrapper } from '../../Users/utils/handlerWrapper';
import { successResponse } from '../../Users/utils/response';
import { initializeDatabase } from '../../../config/database';
import { Product } from '../entities/Product.entity';
// Importar la entidad para que TypeORM la registre
import '../entities/Product.entity';

/**
 * Handler temporal para debug: verificar contenido de la tabla products
 */
const debugProductsHandler = async (_event: APIGatewayProxyEvent) => {
  const dataSource = await initializeDatabase();
  const repository = dataSource.getRepository(Product);

  // Contar total de productos
  const total = await repository.count();

  // Obtener algunos productos de ejemplo
  const sampleProducts = await repository
    .createQueryBuilder('product')
    .select(['product.nregist', 'product.codigo', 'product.nombre', 'product.eliminado', 'product.obsoleto'])
    .limit(10)
    .getMany();

  // Probar búsqueda con "as"
  const searchTerm = 'as';
  const searchResults = await repository
    .createQueryBuilder('product')
    .where('product.codigo LIKE :search OR product.nombre LIKE :search', { search: `%${searchTerm}%` })
    .andWhere('(product.eliminado != :eliminado OR product.eliminado IS NULL)', { eliminado: '1' })
    .andWhere('(product.obsoleto != :obsoleto OR product.obsoleto IS NULL)', { obsoleto: '1' })
    .select(['product.nregist', 'product.codigo', 'product.nombre'])
    .limit(5)
    .getMany();

  // Verificar productos sin filtros
  const allProductsNoFilter = await repository
    .createQueryBuilder('product')
    .select(['product.nregist', 'product.codigo', 'product.nombre', 'product.eliminado', 'product.obsoleto'])
    .limit(5)
    .getMany();

  return successResponse(200, {
    totalProducts: total,
    sampleProducts,
    searchResults: {
      term: searchTerm,
      count: searchResults.length,
      results: searchResults
    },
    allProductsNoFilter: {
      count: allProductsNoFilter.length,
      results: allProductsNoFilter
    }
  });
};

export const handler = handlerWrapper(debugProductsHandler);

