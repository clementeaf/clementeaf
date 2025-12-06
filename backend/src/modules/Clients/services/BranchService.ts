import { AppDataSource } from '../../../config/database';
import { Branch } from '../entities/Branch.entity';
import { type CreateBranchDto } from '../dto/CreateBranchDto';
import { type UpdateBranchDto } from '../dto/UpdateBranchDto';

/**
 * Servicio para gestionar sucursales de clientes
 */
export class BranchService {
  private get branchRepository() {
    return AppDataSource.getRepository(Branch);
  }

  /**
   * Obtiene todas las sucursales de un cliente
   * @param clientId - ID del cliente
   * @param includeInactive - Incluir sucursales inactivas
   * @returns Lista de sucursales
   */
  async getBranchesByClientId(clientId: number, includeInactive: boolean = false): Promise<Branch[]> {
    const where: { clientId: number; isActive?: boolean } = { clientId };
    
    if (!includeInactive) {
      where.isActive = true;
    }

    return await this.branchRepository.find({
      where,
      order: { nombre: 'ASC' }
    });
  }

  /**
   * Obtiene una sucursal por ID
   * @param id - ID de la sucursal
   * @returns Sucursal encontrada
   */
  async getBranchById(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['client']
    });

    if (!branch) {
      throw new Error('Sucursal no encontrada');
    }

    return branch;
  }

  /**
   * Crea una nueva sucursal
   * @param createBranchDto - Datos de la sucursal a crear
   * @returns Sucursal creada
   */
  async createBranch(createBranchDto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepository.create({
      clientId: createBranchDto.clientId,
      nombre: createBranchDto.nombre,
      direccion: createBranchDto.direccion ?? null,
      region: createBranchDto.region ?? null,
      comuna: createBranchDto.comuna ?? null,
      codigoPostal: createBranchDto.codigoPostal ?? null,
      contactoNombre: createBranchDto.contactoNombre ?? null,
      contactoTelefono: createBranchDto.contactoTelefono ?? null,
      contactoEmail: createBranchDto.contactoEmail ?? null,
      isActive: createBranchDto.isActive ?? true
    });

    return await this.branchRepository.save(branch);
  }

  /**
   * Actualiza una sucursal
   * @param id - ID de la sucursal
   * @param updateBranchDto - Datos a actualizar
   * @returns Sucursal actualizada
   */
  async updateBranch(id: number, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.getBranchById(id);

    if (updateBranchDto.nombre !== undefined) {
      branch.nombre = updateBranchDto.nombre;
    }
    if (updateBranchDto.direccion !== undefined) {
      branch.direccion = updateBranchDto.direccion ?? null;
    }
    if (updateBranchDto.region !== undefined) {
      branch.region = updateBranchDto.region ?? null;
    }
    if (updateBranchDto.comuna !== undefined) {
      branch.comuna = updateBranchDto.comuna ?? null;
    }
    if (updateBranchDto.codigoPostal !== undefined) {
      branch.codigoPostal = updateBranchDto.codigoPostal ?? null;
    }
    if (updateBranchDto.contactoNombre !== undefined) {
      branch.contactoNombre = updateBranchDto.contactoNombre ?? null;
    }
    if (updateBranchDto.contactoTelefono !== undefined) {
      branch.contactoTelefono = updateBranchDto.contactoTelefono ?? null;
    }
    if (updateBranchDto.contactoEmail !== undefined) {
      branch.contactoEmail = updateBranchDto.contactoEmail ?? null;
    }
    if (updateBranchDto.isActive !== undefined) {
      branch.isActive = updateBranchDto.isActive;
    }

    return await this.branchRepository.save(branch);
  }

  /**
   * Elimina una sucursal (soft delete)
   * @param id - ID de la sucursal
   */
  async deleteBranch(id: number): Promise<void> {
    const branch = await this.getBranchById(id);
    branch.isActive = false;
    await this.branchRepository.save(branch);
  }
}

