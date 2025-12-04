import { AppDataSource } from '../../../config/database';
import { Quote } from '../entities/Quote.entity';
import { type CreateQuoteDto, type UpdateQuoteDto } from '../dto/CreateQuoteDto';

/**
 * Servicio para gestionar órdenes de compra
 */
export class QuotesService {
  private get quotesRepository() {
    return AppDataSource.getRepository(Quote);
  }

  /**
   * Crea una nueva orden de compra
   * @param createQuoteDto - Datos de la orden de compra a crear
   * @returns Orden de compra creada
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
   * Obtiene una orden de compra por su ID
   * @param id - ID de la orden de compra
   * @returns Orden de compra encontrada
   */
  async getQuoteById(id: number): Promise<Quote> {
    try {
      const quote = await this.quotesRepository.findOne({
        where: { id }
      });

      if (!quote) {
        throw new Error('Orden de compra no encontrada');
      }

      return quote;
    } catch (error) {
      console.error('Error en getQuoteById:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error al obtener orden de compra: ${errorMessage}`);
    }
  }

  /**
   * Obtiene todas las órdenes de compra con paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de órdenes de compra paginada
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
      throw new Error(`Error al obtener órdenes de compra: ${errorMessage}`);
    }
  }

  /**
   * Actualiza una orden de compra
   * @param id - ID de la orden de compra
   * @param updateData - Datos a actualizar
   * @returns Orden de compra actualizada
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
   * Elimina una orden de compra
   * @param id - ID de la orden de compra
   * @returns true si se eliminó correctamente
   */
  async deleteQuote(id: number): Promise<boolean> {
    const quote = await this.getQuoteById(id);
    await this.quotesRepository.remove(quote);
    return true;
  }

  /**
   * Obtiene el siguiente número correlativo de orden de compra
   * @returns Siguiente número de orden de compra
   */
  async getNextQuoteNumber(): Promise<string> {
    try {
      // Obtener la última orden de compra ordenada por numeroCotizacion descendente
      const lastQuote = await this.quotesRepository.findOne({
        where: {},
        order: { id: 'DESC' }
      });

      if (!lastQuote || !lastQuote.numeroCotizacion) {
        // Si no hay órdenes previas, empezar con 1
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}${month}${day}0000001`;
      }

      // Extraer el número secuencial del último número
      // Formato esperado: YYMMDD + número secuencial (ej: 2511190000001)
      const lastNumber = lastQuote.numeroCotizacion;
      
      // Si el formato es YYMMDD + número, extraer el número secuencial
      if (lastNumber.length >= 7) {
        const sequentialPart = lastNumber.slice(-7); // Últimos 7 dígitos
        const sequentialNumber = parseInt(sequentialPart, 10);
        
        if (!isNaN(sequentialNumber)) {
          const nextSequential = sequentialNumber + 1;
          const today = new Date();
          const year = today.getFullYear().toString().slice(-2);
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const day = today.getDate().toString().padStart(2, '0');
          return `${year}${month}${day}${nextSequential.toString().padStart(7, '0')}`;
        }
      }

      // Si no se puede parsear, generar un nuevo número basado en el ID
      const nextId = (lastQuote.id || 0) + 1;
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      return `${year}${month}${day}${nextId.toString().padStart(7, '0')}`;
    } catch (error) {
      console.error('Error en getNextQuoteNumber:', error);
      // En caso de error, generar un número basado en la fecha actual
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const timestamp = Date.now().toString().slice(-7);
      return `${year}${month}${day}${timestamp}`;
    }
  }
}

