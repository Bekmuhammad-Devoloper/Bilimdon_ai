import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';

interface CreateNotificationDto {
  title: string;
  message: string;
  type?: NotificationType;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(userId: string, dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title: dto.title,
        message: dto.message,
        type: dto.type || NotificationType.SYSTEM,
        data: dto.data,
      },
    });

    // Send real-time notification via WebSocket
    this.notificationsGateway.sendToUser(userId, notification);

    return notification;
  }

  async createBulkNotifications(userIds: string[], dto: CreateNotificationDto) {
    const notifications = await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: dto.title,
        message: dto.message,
        type: dto.type || NotificationType.SYSTEM,
        data: dto.data,
      })),
    });

    // Send real-time notifications
    userIds.forEach((userId) => {
      this.notificationsGateway.sendToUser(userId, {
        title: dto.title,
        message: dto.message,
        type: dto.type || NotificationType.SYSTEM,
        data: dto.data,
      });
    });

    return notifications;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
