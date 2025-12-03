import { AppDataSource } from '../../../config/database';
import { Clients } from '../entities/Clients.entity';
import { type CreateClientDto } from '../dto/CreateClientDto';
import { Like, type FindOptionsWhere } from 'typeorm';

/**
 * Servicio para gestionar clientes
 */
export class ClientsService {
  private get clientsRepository() {
    return AppDataSource.getRepository(Clients);
  }

  /**
   * Crea un nuevo cliente
   * @param createClientDto - Datos del cliente a crear
   * @returns Cliente creado
   */
  async createClient(createClientDto: CreateClientDto): Promise<Clients> {
    // Verificar si ya existe un cliente con el mismo RUT
    const existingClient = await this.clientsRepository.findOne({
      where: { rut: createClientDto.rut }
    });

    if (existingClient) {
      throw new Error('Cliente con este RUT ya existe');
    }

    // Crear el cliente
    const client = this.clientsRepository.create({
      // Paso 1: Información del Cliente
      rut: createClientDto.rut,
      razonSocial: createClientDto.razonSocial,
      nombreCliente: createClientDto.nombreCliente,
      rutCompleto: createClientDto.rutCompleto,
      giro: createClientDto.giro,
      sitioWeb: createClientDto.sitioWeb ?? null,

      // Paso 2: Segmentación
      propietarioCliente: createClientDto.propietarioCliente ?? null,
      tamanoEmpresa: createClientDto.tamanoEmpresa ?? null,
      segmento: createClientDto.segmento ?? null,
      subsegmento: createClientDto.subsegmento ?? null,
      empleados: createClientDto.empleados ?? null,
      tratos: createClientDto.tratos ?? null,

      // Paso 3: Facturación
      documentoPorDefecto: createClientDto.documentoPorDefecto ?? null,
      formaPago: createClientDto.formaPago ?? null,
      listaPrecios: createClientDto.listaPrecios ?? null,
      ingresosAnuales: createClientDto.ingresosAnuales ?? null,
      limiteCredito: createClientDto.limiteCredito ?? null,
      creditoUsado: createClientDto.creditoUsado ?? null,
      motivoBloqueo: createClientDto.motivoBloqueo ?? null,
      respaldoRUT: createClientDto.respaldoRUT ?? null,
      clienteExigeOC: createClientDto.clienteExigeOC ?? false,
      aprobadoPorFinanzas: createClientDto.aprobadoPorFinanzas ?? false,

      // Paso 4: Contacto
      contactoNombre: createClientDto.contactoNombre ?? null,
      contactoCargo: createClientDto.contactoCargo ?? null,
      contactoCorreoElectronico: createClientDto.contactoCorreoElectronico ?? null,
      contactoTelefono: createClientDto.contactoTelefono ?? null,
      contactoCountryCode: createClientDto.contactoCountryCode ?? null,
      contactoCountryDialCode: createClientDto.contactoCountryDialCode ?? null,

      // Paso 5: Dirección de Facturación
      direccionFacturacion: createClientDto.direccionFacturacion ?? null,
      regionFacturacion: createClientDto.regionFacturacion ?? null,
      comunaFacturacion: createClientDto.comunaFacturacion ?? null,
      codigoPostalFacturacion: createClientDto.codigoPostalFacturacion ?? null,

      // Paso 5: Dirección de Despacho
      direccionDespacho: createClientDto.direccionDespacho ?? null,
      regionDespacho: createClientDto.regionDespacho ?? null,
      comunaDespacho: createClientDto.comunaDespacho ?? null,
      codigoPostalDespacho: createClientDto.codigoPostalDespacho ?? null,
      usarMismaDireccion: createClientDto.usarMismaDireccion ?? false
    } as Clients);

    const savedClient = await this.clientsRepository.save(client);
    return savedClient;
  }

  /**
   * Obtiene un cliente por su ID
   * @param id - ID del cliente
   * @returns Cliente encontrado
   */
  async getClientById(id: number): Promise<Clients> {
    const client = await this.clientsRepository.findOne({
      where: { id }
    });

    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    return client;
  }

  /**
   * Obtiene un cliente por su RUT
   * @param rut - RUT del cliente
   * @returns Cliente encontrado
   */
  async getClientByRut(rut: string): Promise<Clients | null> {
    const client = await this.clientsRepository.findOne({
      where: { rut }
    });

    return client;
  }

  /**
   * Obtiene todos los clientes con paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de clientes paginada
   */
  async getAllClients(page: number = 1, limit: number = 50): Promise<{
    data: Clients[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.clientsRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Busca clientes por nombre o RUT
   * @param options - Opciones de búsqueda
   * @param options.nombre - Término de búsqueda por nombre
   * @param options.rut - Término de búsqueda por RUT
   * @param options.limit - Límite de resultados (default: 10)
   * @returns Lista de clientes encontrados
   */
  async searchClients(options: { nombre?: string; rut?: string; limit?: number }): Promise<Clients[]> {
    const { nombre, rut, limit = 10 } = options;
    
    // Si no hay ningún término de búsqueda, retornar vacío
    if ((!nombre || nombre.trim().length < 2) && (!rut || rut.trim().length < 2)) {
      return [];
    }

    const whereConditions: Array<FindOptionsWhere<Clients>> = [];

    // Si hay término de búsqueda por nombre
    if (nombre && nombre.trim().length >= 2) {
      const nombrePattern = `%${nombre.trim()}%`;
      whereConditions.push(
        { nombreCliente: Like(nombrePattern) },
        { razonSocial: Like(nombrePattern) }
      );
    }

    // Si hay término de búsqueda por RUT
    if (rut && rut.trim().length >= 2) {
      const rutPattern = `%${rut.trim()}%`;
      whereConditions.push({ rut: Like(rutPattern) });
    }

    // Si no hay condiciones, retornar vacío
    if (whereConditions.length === 0) {
      return [];
    }

    // TypeORM trata un array en where como OR automáticamente
    const clients = await this.clientsRepository.find({
      where: whereConditions,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return clients;
  }

  /**
   * Actualiza un cliente
   * @param id - ID del cliente
   * @param updateData - Datos a actualizar
   * @returns Cliente actualizado
   */
  async updateClient(id: number, updateData: Partial<CreateClientDto>): Promise<Clients> {
    const client = await this.getClientById(id);

    // Si se intenta actualizar el RUT, verificar que no exista otro cliente con ese RUT
    if (updateData.rut && updateData.rut !== client.rut) {
      const existingClient = await this.getClientByRut(updateData.rut);
      if (existingClient) {
        throw new Error('Cliente con este RUT ya existe');
      }
    }

    Object.assign(client, updateData);
    const updatedClient = await this.clientsRepository.save(client);
    return updatedClient;
  }

  /**
   * Elimina un cliente
   * @param id - ID del cliente
   * @returns true si se eliminó correctamente
   */
  async deleteClient(id: number): Promise<boolean> {
    const client = await this.getClientById(id);
    await this.clientsRepository.remove(client);
    return true;
  }
}

