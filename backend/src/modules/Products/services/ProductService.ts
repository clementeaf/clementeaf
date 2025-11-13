import { Repository } from 'typeorm';
import { initializeDatabase } from '../../../config/database';
import { Product } from '../entities/Product.entity';

export interface ProductFilters {
  codigo?: string;
  nombre?: string;
  clase1?: string;
  eliminado?: string;
  obsoleto?: string;
  publicado?: number;
  producto_web?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio para gestionar productos
 */
export class ProductService {
  private repository: Repository<Product> | null = null;

  private async getRepository(): Promise<Repository<Product>> {
    if (!this.repository) {
      const dataSource = await initializeDatabase();
      this.repository = dataSource.getRepository(Product);
    }
    return this.repository;
  }

  /**
   * Obtiene todos los productos con paginación y filtros
   */
  async getAllProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const repository = await this.getRepository();
    
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = repository.createQueryBuilder('product');

    // Aplicar filtros
    if (filters.codigo) {
      queryBuilder.andWhere('product.codigo LIKE :codigo', { codigo: `%${filters.codigo}%` });
    }

    if (filters.nombre) {
      queryBuilder.andWhere('product.nombre LIKE :nombre', { nombre: `%${filters.nombre}%` });
    }

    if (filters.clase1) {
      queryBuilder.andWhere('product.clase1 = :clase1', { clase1: filters.clase1 });
    }

    if (filters.eliminado !== undefined) {
      queryBuilder.andWhere('product.eliminado = :eliminado', { eliminado: filters.eliminado });
    }

    if (filters.obsoleto !== undefined) {
      queryBuilder.andWhere('product.obsoleto = :obsoleto', { obsoleto: filters.obsoleto });
    }

    if (filters.publicado !== undefined) {
      queryBuilder.andWhere('product.publicado = :publicado', { publicado: filters.publicado });
    }

    if (filters.producto_web !== undefined) {
      queryBuilder.andWhere('product.producto_web = :producto_web', { producto_web: filters.producto_web });
    }

    // Filtrar solo productos activos por defecto
    if (filters.eliminado === undefined) {
      queryBuilder.andWhere('product.eliminado != :eliminado OR product.eliminado IS NULL', { eliminado: '1' });
    }

    if (filters.obsoleto === undefined) {
      queryBuilder.andWhere('product.obsoleto != :obsoleto OR product.obsoleto IS NULL', { obsoleto: '1' });
    }

    // Ordenar por código
    queryBuilder.orderBy('product.codigo', 'ASC');

    // Obtener total y datos paginados
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtiene un producto por su código
   */
  async getProductByCode(codigo: string): Promise<Product | null> {
    const repository = await this.getRepository();
    return await repository.findOne({
      where: { codigo }
    });
  }

  /**
   * Obtiene un producto por su ID (nregist)
   */
  async getProductById(nregist: number): Promise<Product | null> {
    const repository = await this.getRepository();
    return await repository.findOne({
      where: { nregist }
    });
  }

  /**
   * Busca productos por nombre o código
   */
  async searchProducts(searchTerm: string, limit: number = 20): Promise<Product[]> {
    const repository = await this.getRepository();
    
    return await repository
      .createQueryBuilder('product')
      .where('product.codigo LIKE :search OR product.nombre LIKE :search', { search: `%${searchTerm}%` })
      .andWhere('(product.eliminado != :eliminado OR product.eliminado IS NULL)', { eliminado: '1' })
      .andWhere('(product.obsoleto != :obsoleto OR product.obsoleto IS NULL)', { obsoleto: '1' })
      .orderBy('product.codigo', 'ASC')
      .limit(limit)
      .getMany();
  }
}

