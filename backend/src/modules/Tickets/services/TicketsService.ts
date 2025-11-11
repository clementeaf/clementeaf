import { AppDataSource } from '../../../config/database';
import { Ticket } from '../entities/Ticket.entity';
import { type CreateTicketDto } from '../dto/CreateTicketDto';
import { type UpdateTicketDto } from '../dto/UpdateTicketDto';

/**
 * Servicio para gestionar tickets
 */
export class TicketsService {
  private get ticketsRepository() {
    return AppDataSource.getRepository(Ticket);
  }

  /**
   * Crea un nuevo ticket
   * @param createTicketDto - Datos del ticket a crear
   * @param reporterId - ID del usuario que crea el ticket (obtenido de la sesión)
   * @returns Ticket creado
   */
  async createTicket(createTicketDto: CreateTicketDto, reporterId: number): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      title: createTicketDto.title,
      description: createTicketDto.description,
      type: createTicketDto.type,
      priority: createTicketDto.priority,
      reporterId,
      assigneeId: createTicketDto.assigneeId ?? null,
      images: createTicketDto.images ?? null
    } as Ticket);

    const savedTicket = await this.ticketsRepository.save(ticket);

    // Cargar relaciones
    const ticketWithRelations = await this.ticketsRepository.findOne({
      where: { id: savedTicket.id },
      relations: ['reporter', 'assignee']
    });

    if (!ticketWithRelations) {
      throw new Error('Error al crear el ticket');
    }

    return ticketWithRelations;
  }

  /**
   * Obtiene un ticket por su ID
   * @param id - ID del ticket
   * @returns Ticket encontrado
   */
  async getTicketById(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['reporter', 'assignee']
    });

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    return ticket;
  }

  /**
   * Obtiene todos los tickets con paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @param status - Filtro opcional por estado
   * @param type - Filtro opcional por tipo
   * @returns Lista de tickets paginada
   */
  async getAllTickets(
    page: number = 1,
    limit: number = 50,
    status?: string,
    type?: string
  ): Promise<{
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    const [data, total] = await this.ticketsRepository.findAndCount({
      where,
      relations: ['reporter', 'assignee'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
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
   * Obtiene todos los tickets creados por un usuario
   * @param reporterId - ID del usuario que creó los tickets
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de tickets paginada
   */
  async getTicketsByReporterId(
    reporterId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.ticketsRepository.findAndCount({
      where: { reporterId },
      relations: ['reporter', 'assignee'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
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
   * Obtiene todos los tickets asignados a un usuario
   * @param assigneeId - ID del usuario asignado
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista de tickets paginada
   */
  async getTicketsByAssigneeId(
    assigneeId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.ticketsRepository.findAndCount({
      where: { assigneeId },
      relations: ['reporter', 'assignee'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
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
   * Actualiza un ticket
   * @param id - ID del ticket
   * @param updateTicketDto - Datos a actualizar
   * @returns Ticket actualizado
   */
  async updateTicket(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.getTicketById(id);

    Object.assign(ticket, updateTicketDto);
    const updatedTicket = await this.ticketsRepository.save(ticket);

    // Cargar relaciones actualizadas
    const ticketWithRelations = await this.ticketsRepository.findOne({
      where: { id: updatedTicket.id },
      relations: ['reporter', 'assignee']
    });

    if (!ticketWithRelations) {
      throw new Error('Error al actualizar el ticket');
    }

    return ticketWithRelations;
  }

  /**
   * Elimina un ticket
   * @param id - ID del ticket
   * @returns true si se eliminó correctamente
   */
  async deleteTicket(id: number): Promise<boolean> {
    const ticket = await this.getTicketById(id);
    await this.ticketsRepository.remove(ticket);
    return true;
  }
}

