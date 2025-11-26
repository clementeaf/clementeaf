import { AppDataSource } from '../../../config/database';
import { Quote } from '../entities/Quote.entity';
import { type CreateQuoteDto, type UpdateQuoteDto } from '../dto/CreateQuoteDto';

/**
 * Servicio para gestionar cotizaciones
 */
export class QuotesService {
  private get quotesRepository() {
    return AppDataSource.getRepository(Quote);
  }

  /**
   * Crea una nueva cotización
   * @param createQuoteDto - Datos de la cotización a crear
   * @returns Cotización creada
   */
  async createQuote(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    const quote = this.quotesRepository.create({
      // Paso 1: Información del Cliente
      clienteNombre: createQuoteDto.clienteNombre,
      direccionFacturacion: createQuoteDto.direccionFacturacion ?? null,
      telefono: createQuoteDto.telefono ?? null,
      regionComunaCodigo: createQuoteDto.regionComunaCodigo ?? null,
      asesorAsignado: createQuoteDto.asesorAsignado ?? null,
      contactoNombre: createQuoteDto.contactoNombre ?? null,
      contactoTelefono: createQuoteDto.contactoTelefono ?? null,
      contactoEmail: createQuoteDto.contactoEmail ?? null,
      countryCode: createQuoteDto.countryCode ?? null,
      countryDialCode: createQuoteDto.countryDialCode ?? null,
      contactoCountryCode: createQuoteDto.contactoCountryCode ?? null,
      contactoCountryDialCode: createQuoteDto.contactoCountryDialCode ?? null,

      // Paso 2: Condiciones
      numeroCotizacion: createQuoteDto.numeroCotizacion ?? null,
      fecha: createQuoteDto.fecha ? new Date(createQuoteDto.fecha) : null,
      terminosPago: createQuoteDto.terminosPago ?? null,
      numeroReferencia: createQuoteDto.numeroReferencia ?? null,
      centroCosto: createQuoteDto.centroCosto ?? null,
      listaPrecios: createQuoteDto.listaPrecios ?? null,
      sinCostoEnvio: createQuoteDto.sinCostoEnvio ?? false,

      // Paso 3: Productos
      productos: createQuoteDto.productos ?? null,

      // Estado
      estado: createQuoteDto.estado ?? 'borrador'
    } as Quote);

    const savedQuote = await this.quotesRepository.save(quote);
    return savedQuote;
  }

  /**
   * Obtiene una cotización por su ID
   * @param id - ID de la cotización
   * @returns Cotización encontrada
   */
  async getQuoteById(id: number): Promise<Quote> {
    try {
      const quote = await this.quotesRepository.findOne({
        where: { id }
      });

      if (!quote) {
        throw new Error('Cotización no encontrada');
      }

      return quote;
    } catch (error) {
      console.error('Error en getQuoteById:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error al obtener cotización: ${errorMessage}`);
    }
  }

  /**
   * Obtiene todas las cotizaciones con paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de cotizaciones paginada
   */
  async getAllQuotes(page: number = 1, limit: number = 50): Promise<{
    data: Quote[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await this.quotesRepository.findAndCount({
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
    } catch (error) {
      console.error('Error en getAllQuotes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error al obtener cotizaciones: ${errorMessage}`);
    }
  }

  /**
   * Actualiza una cotización
   * @param id - ID de la cotización
   * @param updateData - Datos a actualizar
   * @returns Cotización actualizada
   */
  async updateQuote(id: number, updateData: UpdateQuoteDto): Promise<Quote> {
    const quote = await this.getQuoteById(id);

    // Preparar datos para actualizar
    const updateFields: Partial<Quote> = {};

    if (updateData.clienteNombre !== undefined) updateFields.clienteNombre = updateData.clienteNombre;
    if (updateData.direccionFacturacion !== undefined) updateFields.direccionFacturacion = updateData.direccionFacturacion ?? null;
    if (updateData.telefono !== undefined) updateFields.telefono = updateData.telefono ?? null;
    if (updateData.regionComunaCodigo !== undefined) updateFields.regionComunaCodigo = updateData.regionComunaCodigo ?? null;
    if (updateData.asesorAsignado !== undefined) updateFields.asesorAsignado = updateData.asesorAsignado ?? null;
    if (updateData.contactoNombre !== undefined) updateFields.contactoNombre = updateData.contactoNombre ?? null;
    if (updateData.contactoTelefono !== undefined) updateFields.contactoTelefono = updateData.contactoTelefono ?? null;
    if (updateData.contactoEmail !== undefined) updateFields.contactoEmail = updateData.contactoEmail ?? null;
    if (updateData.countryCode !== undefined) updateFields.countryCode = updateData.countryCode ?? null;
    if (updateData.countryDialCode !== undefined) updateFields.countryDialCode = updateData.countryDialCode ?? null;
    if (updateData.contactoCountryCode !== undefined) updateFields.contactoCountryCode = updateData.contactoCountryCode ?? null;
    if (updateData.contactoCountryDialCode !== undefined) updateFields.contactoCountryDialCode = updateData.contactoCountryDialCode ?? null;
    if (updateData.numeroCotizacion !== undefined) updateFields.numeroCotizacion = updateData.numeroCotizacion ?? null;
    if (updateData.fecha !== undefined) updateFields.fecha = updateData.fecha ? new Date(updateData.fecha) : null;
    if (updateData.terminosPago !== undefined) updateFields.terminosPago = updateData.terminosPago ?? null;
    if (updateData.numeroReferencia !== undefined) updateFields.numeroReferencia = updateData.numeroReferencia ?? null;
    if (updateData.centroCosto !== undefined) updateFields.centroCosto = updateData.centroCosto ?? null;
    if (updateData.listaPrecios !== undefined) updateFields.listaPrecios = updateData.listaPrecios ?? null;
    if (updateData.sinCostoEnvio !== undefined) updateFields.sinCostoEnvio = updateData.sinCostoEnvio;
    if (updateData.productos !== undefined) updateFields.productos = updateData.productos ?? null;
    if (updateData.estado !== undefined) updateFields.estado = updateData.estado;

    Object.assign(quote, updateFields);
    const updatedQuote = await this.quotesRepository.save(quote);
    return updatedQuote;
  }

  /**
   * Elimina una cotización
   * @param id - ID de la cotización
   * @returns true si se eliminó correctamente
   */
  async deleteQuote(id: number): Promise<boolean> {
    const quote = await this.getQuoteById(id);
    await this.quotesRepository.remove(quote);
    return true;
  }
}

