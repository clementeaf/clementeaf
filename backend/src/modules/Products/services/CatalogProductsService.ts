import { Repository, IsNull } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Product } from '../entities/Product.entity';
import type { ExternalProduct } from './ProductsService';

/**
 * Opciones de búsqueda de productos del catálogo WMS.
 */
export interface SearchCatalogProductsOptions {
  searchTerm: string;
  limit?: number;
  includeDiscontinued?: boolean;
  includeDeleted?: boolean;
}

/**
 * Payload para crear un producto del catálogo WMS.
 */
export interface CreateCatalogProductInput {
  codigo: string;
  nombre: string;
  sku?: string | null;
  zohoId?: number | null;
  itemId?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  brand?: string | null;
  manufacturer?: string | null;
  unit?: string | null;
  status?: string | null;
  rate?: number | null;
  taxPercentage?: number | null;
  purchaseRate?: string | null;
  description?: string | null;
  itemType?: string | null;
  productType?: string | null;
  activo?: boolean;
  descontinuado?: boolean;
  descontinuadoAt?: Date | null;
  descontinuadoReason?: string | null;
}

/**
 * Payload para actualizar un producto del catálogo WMS.
 */
export type UpdateCatalogProductInput = Partial<CreateCatalogProductInput>;

/**
 * Servicio de catálogo de productos (persistido en Postgres).
 */
export class CatalogProductsService {
  private get productRepository(): Repository<Product> {
    return AppDataSource.getRepository(Product);
  }

  /**
   * Busca productos del catálogo por código/nombre/sku.
   * @param options - Opciones de búsqueda.
   * @returns Lista de productos del catálogo.
   */
  async search(options: SearchCatalogProductsOptions): Promise<Product[]> {
    const { searchTerm, limit = 50, includeDiscontinued = true, includeDeleted = false } = options;
    const normalized = searchTerm.trim();
    if (normalized.length < 2) {
      return [];
    }

    const qb = this.productRepository
      .createQueryBuilder('p')
      .where(
        '(p.codigo ILIKE :term OR p.nombre ILIKE :term OR p.sku ILIKE :term OR p.itemId ILIKE :term)',
        { term: `%${normalized}%` }
      )
      .orderBy('p.nombre', 'ASC')
      .take(Math.min(Math.max(limit, 1), 200));

    if (!includeDiscontinued) {
      qb.andWhere('p.descontinuado = false');
    }

    if (!includeDeleted) {
      qb.andWhere('p.deletedAt IS NULL');
    }

    return await qb.getMany();
  }

  /**
   * Obtiene un producto por ID (si no está borrado).
   * @param id - ID del producto.
   * @returns Producto o null.
   */
  async getById(id: number): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: {
        id,
        deletedAt: IsNull()
      }
    });
  }

  /**
   * Crea un producto del catálogo.
   * @param input - Datos del producto.
   * @returns Producto creado.
   */
  async create(input: CreateCatalogProductInput): Promise<Product> {
    const codigo = input.codigo.trim();
    const nombre = input.nombre.trim();
    if (!codigo) {
      throw new Error('codigo es requerido');
    }
    if (!nombre) {
      throw new Error('nombre es requerido');
    }

    const existing = await this.productRepository.findOne({ where: { codigo } });
    if (existing && !existing.deletedAt) {
      throw new Error(`Ya existe un producto con código ${codigo}`);
    }

    const product = this.productRepository.create({
      ...input,
      codigo,
      nombre,
      activo: input.activo ?? true,
      descontinuado: input.descontinuado ?? false,
      deletedAt: null
    });

    return await this.productRepository.save(product);
  }

  /**
   * Actualiza un producto del catálogo (parcial).
   * @param id - ID del producto.
   * @param input - Campos a actualizar.
   * @returns Producto actualizado.
   */
  async update(id: number, input: UpdateCatalogProductInput): Promise<Product> {
    const product = await this.getById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    if (typeof input.codigo === 'string') {
      const codigo = input.codigo.trim();
      if (!codigo) {
        throw new Error('codigo no puede ser vacío');
      }
      product.codigo = codigo;
    }
    if (typeof input.nombre === 'string') {
      const nombre = input.nombre.trim();
      if (!nombre) {
        throw new Error('nombre no puede ser vacío');
      }
      product.nombre = nombre;
    }

    const assignable: Array<keyof UpdateCatalogProductInput> = [
      'sku',
      'zohoId',
      'itemId',
      'categoryId',
      'categoryName',
      'brand',
      'manufacturer',
      'unit',
      'status',
      'rate',
      'taxPercentage',
      'purchaseRate',
      'description',
      'itemType',
      'productType',
      'activo',
      'descontinuado',
      'descontinuadoAt',
      'descontinuadoReason'
    ];

    for (const key of assignable) {
      if (key in input) {
        (product as unknown as Record<string, unknown>)[key] = (input as unknown as Record<string, unknown>)[key];
      }
    }

    return await this.productRepository.save(product);
  }

  /**
   * Soft delete de un producto del catálogo.
   * @param id - ID del producto.
   * @returns Producto borrado (soft).
   */
  async softDelete(id: number): Promise<Product> {
    const product = await this.getById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    product.deletedAt = new Date();
    return await this.productRepository.save(product);
  }

  /**
   * Upsert de un producto desde el formato de Zoho (ExternalProduct).
   * @param external - Producto externo.
   * @returns Producto del catálogo creado/actualizado.
   */
  async upsertFromExternal(external: ExternalProduct): Promise<Product> {
    const codigo = external.cod_art_local?.trim();
    const nombre = (external.name || external.item_name || '').trim();
    if (!codigo) {
      throw new Error('Producto externo sin cod_art_local');
    }
    if (!nombre) {
      throw new Error(`Producto externo ${codigo} sin nombre`);
    }

    const existing = await this.productRepository.findOne({ where: { codigo } });
    const base: UpdateCatalogProductInput = {
      codigo,
      nombre,
      sku: external.sku ?? null,
      zohoId: typeof external.ID === 'number' ? external.ID : null,
      itemId: external.item_id ?? null,
      categoryId: external.category_id ?? null,
      categoryName: external.category_name ?? null,
      brand: external.brand ?? null,
      manufacturer: external.manufacturer ?? null,
      unit: external.unit ?? null,
      status: external.status ?? null,
      rate: typeof external.rate === 'number' ? external.rate : null,
      taxPercentage: typeof external.tax_percentage === 'number' ? external.tax_percentage : null,
      purchaseRate: external.purchase_rate ?? null,
      description: external.description ?? null,
      itemType: external.item_type ?? null,
      productType: external.product_type ?? null,
      activo: true
    };

    if (!existing) {
      const created = this.productRepository.create({
        ...(base as CreateCatalogProductInput),
        descontinuado: false,
        deletedAt: null
      });
      return await this.productRepository.save(created);
    }

    // Si estaba soft-deleted y vuelve a aparecer, lo reactivamos.
    existing.deletedAt = null;
    existing.codigo = base.codigo ?? existing.codigo;
    existing.nombre = base.nombre ?? existing.nombre;
    existing.sku = base.sku ?? existing.sku ?? null;
    existing.zohoId = base.zohoId ?? existing.zohoId ?? null;
    existing.itemId = base.itemId ?? existing.itemId ?? null;
    existing.categoryId = base.categoryId ?? existing.categoryId ?? null;
    existing.categoryName = base.categoryName ?? existing.categoryName ?? null;
    existing.brand = base.brand ?? existing.brand ?? null;
    existing.manufacturer = base.manufacturer ?? existing.manufacturer ?? null;
    existing.unit = base.unit ?? existing.unit ?? null;
    existing.status = base.status ?? existing.status ?? null;
    existing.rate = base.rate ?? existing.rate ?? null;
    existing.taxPercentage = base.taxPercentage ?? existing.taxPercentage ?? null;
    existing.purchaseRate = base.purchaseRate ?? existing.purchaseRate ?? null;
    existing.description = base.description ?? existing.description ?? null;
    existing.itemType = base.itemType ?? existing.itemType ?? null;
    existing.productType = base.productType ?? existing.productType ?? null;
    existing.activo = base.activo ?? existing.activo;

    return await this.productRepository.save(existing);
  }
}


