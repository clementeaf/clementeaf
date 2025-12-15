import { AppDataSource } from '../../../config/database';
import { UserActivity, ActivityType, ResourceType } from '../entities/UserActivity.entity';
import { Repository } from 'typeorm';

export interface CreateActivityInput {
  userId: number;
  activityType: ActivityType;
  resourceType?: ResourceType | null;
  resourceId?: string | null;
  description: string;
  path?: string | null;
  method?: string | null;
  targetElement?: string | null;
  targetId?: string | null;
  targetText?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  sessionId?: string | null;
  durationMs?: number | null;
}

export interface ActivityFilters {
  userId?: number;
  activityType?: ActivityType | ActivityType[];
  resourceType?: ResourceType | ResourceType[];
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  path?: string;
  sessionId?: string;
}

export interface ActivityStats {
  totalActivities: number;
  byType: Record<ActivityType, number>;
  byResource: Record<ResourceType, number>;
  topUsers: Array<{ userId: number; count: number }>;
  recentActivities: UserActivity[];
}

export class ActivityService {
  private activityRepository: Repository<UserActivity>;

  constructor() {
    this.activityRepository = AppDataSource.getRepository(UserActivity);
  }

  /**
   * Registrar una nueva actividad
   */
  async recordActivity(input: CreateActivityInput): Promise<UserActivity> {
    const activity = this.activityRepository.create(input);
    return await this.activityRepository.save(activity);
  }

  /**
   * Obtener actividades con filtros y paginación
   */
  async getActivities(
    filters: ActivityFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ activities: UserActivity[]; total: number }> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .orderBy('activity.createdAt', 'DESC');

    // Aplicar filtros
    if (filters.userId) {
      queryBuilder.andWhere('activity.userId = :userId', { userId: filters.userId });
    }

    if (filters.activityType) {
      if (Array.isArray(filters.activityType)) {
        queryBuilder.andWhere('activity.activityType IN (:...types)', { types: filters.activityType });
      } else {
        queryBuilder.andWhere('activity.activityType = :type', { type: filters.activityType });
      }
    }

    if (filters.resourceType) {
      if (Array.isArray(filters.resourceType)) {
        queryBuilder.andWhere('activity.resourceType IN (:...resourceTypes)', { resourceTypes: filters.resourceType });
      } else {
        queryBuilder.andWhere('activity.resourceType = :resourceType', { resourceType: filters.resourceType });
      }
    }

    if (filters.resourceId) {
      queryBuilder.andWhere('activity.resourceId = :resourceId', { resourceId: filters.resourceId });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('activity.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (filters.startDate) {
      queryBuilder.andWhere('activity.createdAt >= :startDate', { startDate: filters.startDate });
    } else if (filters.endDate) {
      queryBuilder.andWhere('activity.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters.path) {
      queryBuilder.andWhere('activity.path LIKE :path', { path: `%${filters.path}%` });
    }

    if (filters.sessionId) {
      queryBuilder.andWhere('activity.sessionId = :sessionId', { sessionId: filters.sessionId });
    }

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [activities, total] = await queryBuilder.getManyAndCount();

    return { activities, total };
  }

  /**
   * Obtener actividades de un usuario específico
   */
  async getUserActivities(userId: number, limit: number = 100): Promise<UserActivity[]> {
    return await this.activityRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * Obtener estadísticas de actividades
   */
  async getActivityStats(filters: ActivityFilters = {}): Promise<ActivityStats> {
    const queryBuilder = this.activityRepository.createQueryBuilder('activity');

    // Aplicar filtros de fecha si existen
    if (filters.startDate && filters.endDate) {
      queryBuilder.where('activity.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    // Total de actividades
    const totalActivities = await queryBuilder.getCount();

    // Por tipo
    const byTypeRaw = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.activityType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('activity.activityType')
      .getRawMany();

    const byType = byTypeRaw.reduce((acc, item) => {
      acc[item.type as ActivityType] = parseInt(item.count);
      return acc;
    }, {} as Record<ActivityType, number>);

    // Por recurso
    const byResourceRaw = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.resourceType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('activity.resourceType IS NOT NULL')
      .groupBy('activity.resourceType')
      .getRawMany();

    const byResource = byResourceRaw.reduce((acc, item) => {
      acc[item.type as ResourceType] = parseInt(item.count);
      return acc;
    }, {} as Record<ResourceType, number>);

    // Top usuarios
    const topUsersRaw = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('activity.userId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topUsers = topUsersRaw.map(item => ({
      userId: item.userId,
      count: parseInt(item.count),
    }));

    // Actividades recientes
    const recentActivities = await this.activityRepository.find({
      order: { createdAt: 'DESC' },
      take: 20,
      relations: ['user'],
    });

    return {
      totalActivities,
      byType,
      byResource,
      topUsers,
      recentActivities,
    };
  }

  /**
   * Obtener actividades por recurso
   */
  async getResourceActivities(
    resourceType: ResourceType,
    resourceId: string,
    limit: number = 50
  ): Promise<UserActivity[]> {
    return await this.activityRepository.find({
      where: { resourceType, resourceId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * Eliminar actividades antiguas (cleanup)
   */
  async deleteOldActivities(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.activityRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
