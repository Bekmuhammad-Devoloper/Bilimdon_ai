import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ==================== DASHBOARD ====================
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [
      totalUsers,
      todayUsers,
      weekUsers,
      totalTests,
      todayTests,
      totalQuestions,
      totalCategories,
      totalAIChats,
      todayAIChats,
      avgTestScore,
      topCategories,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.testAttempt.count(),
      this.prisma.testAttempt.count({ where: { completedAt: { gte: today } } }),
      this.prisma.question.count(),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.aIChat.count(),
      this.prisma.aIChat.count({ where: { createdAt: { gte: today } } }),
      this.prisma.testAttempt.aggregate({ _avg: { score: true } }),
      this.prisma.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { testAttempts: true } } },
        orderBy: { testAttempts: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        today: todayUsers,
        thisWeek: weekUsers,
      },
      tests: {
        total: totalTests,
        today: todayTests,
        averageScore: avgTestScore._avg.score || 0,
      },
      questions: totalQuestions,
      categories: totalCategories,
      aiChats: {
        total: totalAIChats,
        today: todayAIChats,
      },
      topCategories: topCategories.map(c => ({
        id: c.id,
        name: c.name,
        testsCount: c._count.testAttempts,
      })),
    };
  }

  async getGrowthStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const users = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _count: true,
    });

    const tests = await this.prisma.testAttempt.groupBy({
      by: ['completedAt'],
      where: { completedAt: { gte: startDate } },
      _count: true,
    });

    // Group by date
    const usersByDate = new Map<string, number>();
    const testsByDate = new Map<string, number>();

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split('T')[0];
      usersByDate.set(key, 0);
      testsByDate.set(key, 0);
    }

    users.forEach(u => {
      const key = u.createdAt.toISOString().split('T')[0];
      usersByDate.set(key, (usersByDate.get(key) || 0) + u._count);
    });

    tests.forEach(t => {
      if (t.completedAt) {
        const key = t.completedAt.toISOString().split('T')[0];
        testsByDate.set(key, (testsByDate.get(key) || 0) + t._count);
      }
    });

    return {
      users: Array.from(usersByDate.entries()).map(([date, count]) => ({ date, count })),
      tests: Array.from(testsByDate.entries()).map(([date, count]) => ({ date, count })),
    };
  }

  // ==================== USER MANAGEMENT ====================
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    minLevel?: number;
    maxLevel?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 20, search, role, minLevel, maxLevel, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (minLevel) where.level = { gte: minLevel };
    if (maxLevel) where.level = { ...where.level, lte: maxLevel };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          avatar: true,
          totalXP: true,
          level: true,
          role: true,
          isActive: true,
          telegramId: true,
          createdAt: true,
          _count: {
            select: {
              testAttempts: true,
              aiChats: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        categoryStats: {
          include: { category: true },
        },
        userAchievements: {
          include: { achievement: true },
        },
        testAttempts: {
          take: 10,
          orderBy: { completedAt: 'desc' },
          include: { category: true },
        },
        aiChats: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            testAttempts: true,
            aiChats: true,
            userAchievements: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    // Get ranking
    const rank = await this.prisma.user.count({
      where: { totalXP: { gt: user.totalXP } },
    });

    return { ...user, rank: rank + 1 };
  }

  async updateUserRole(userId: string, role: Role, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await this.notificationsService.createNotification(userId, {
      title: 'Rol o\'zgartirildi',
      message: `Sizning rolingiz ${role} ga o'zgartirildi`,
      type: NotificationType.SYSTEM,
    });

    return updated;
  }

  async blockUser(userId: string, blocked: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !blocked },
    });
  }

  async adjustUserXP(userId: string, amount: number, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const newXP = Math.max(0, user.totalXP + amount);
    const newLevel = this.calculateLevel(newXP);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { totalXP: newXP, level: newLevel },
    });

    await this.notificationsService.createNotification(userId, {
      title: amount > 0 ? 'XP qo\'shildi' : 'XP ayirildi',
      message: `${Math.abs(amount)} XP ${amount > 0 ? 'qo\'shildi' : 'ayirildi'}. Sabab: ${reason}`,
      type: NotificationType.SYSTEM,
    });

    return updated;
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    // Delete related data first
    await this.prisma.$transaction([
      this.prisma.testAnswer.deleteMany({ where: { testAttempt: { userId } } }),
      this.prisma.testAttempt.deleteMany({ where: { userId } }),
      this.prisma.categoryStat.deleteMany({ where: { userId } }),
      this.prisma.aIChat.deleteMany({ where: { userId } }),
      this.prisma.userAchievement.deleteMany({ where: { userId } }),
      this.prisma.notification.deleteMany({ where: { userId } }),
      this.prisma.weeklyXP.deleteMany({ where: { userId } }),
      this.prisma.monthlyXP.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    return { message: 'Foydalanuvchi o\'chirildi' };
  }

  // ==================== BULK MESSAGING ====================
  async sendBulkMessage(params: {
    adminId: string;
    title: string;
    message: string;
    targetType: 'all' | 'selected' | 'filter';
    targetIds?: string[];
    filter?: {
      minLevel?: number;
      maxLevel?: number;
      minXP?: number;
      categoryId?: string;
      inactiveDays?: number;
    };
  }) {
    const { adminId, title, message, targetType, targetIds, filter } = params;

    let userIds: string[] = [];

    if (targetType === 'all') {
      const users = await this.prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      userIds = users.map(u => u.id);
    } else if (targetType === 'selected' && targetIds) {
      userIds = targetIds;
    } else if (targetType === 'filter' && filter) {
      const where: any = { isActive: true };
      
      if (filter.minLevel) where.level = { gte: filter.minLevel };
      if (filter.maxLevel) where.level = { ...where.level, lte: filter.maxLevel };
      if (filter.minXP) where.totalXP = { gte: filter.minXP };
      
      if (filter.inactiveDays) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - filter.inactiveDays);
        where.lastActiveAt = { lt: cutoff };
      }

      if (filter.categoryId) {
        const categoryUsers = await this.prisma.testAttempt.findMany({
          where: { categoryId: filter.categoryId },
          select: { userId: true },
          distinct: ['userId'],
        });
        userIds = categoryUsers.map(u => u.userId);
      } else {
        const users = await this.prisma.user.findMany({ where, select: { id: true } });
        userIds = users.map(u => u.id);
      }
    }

    if (userIds.length === 0) {
      throw new BadRequestException('Hech qanday foydalanuvchi topilmadi');
    }

    // Create admin message record
    const adminMessage = await this.prisma.adminMessage.create({
      data: {
        adminId,
        targetType,
        targetIds: userIds,
        title,
        message,
        sentAt: new Date(),
      },
    });

    // Send notifications
    await Promise.all(
      userIds.map(userId =>
        this.notificationsService.createNotification(userId, {
          title,
          message,
          type: NotificationType.MESSAGE,
        })
      )
    );

    return {
      messageId: adminMessage.id,
      recipientsCount: userIds.length,
    };
  }

  async getMessageHistory(adminId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.adminMessage.findMany({
        where: { adminId },
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          admin: {
            select: { username: true, fullName: true },
          },
        },
      }),
      this.prisma.adminMessage.count({ where: { adminId } }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== QUESTIONS BULK OPERATIONS ====================
  async bulkImportQuestions(data: {
    categoryId: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      tags?: string[];
    }>;
  }) {
    const { categoryId, questions } = data;

    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');

    const xpMap = { EASY: 5, MEDIUM: 10, HARD: 15 };

    const created = await this.prisma.question.createMany({
      data: questions.map(q => ({
        categoryId,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        xpReward: xpMap[q.difficulty],
        tags: q.tags || [],
        isActive: true,
      })),
    });

    return { imported: created.count };
  }

  async exportQuestions(categoryId?: string) {
    const where = categoryId ? { categoryId } : {};

    const questions = await this.prisma.question.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
    });

    return questions.map(q => ({
      category: q.category.name,
      categorySlug: q.category.slug,
      question: q.question,
      optionA: q.options[0],
      optionB: q.options[1],
      optionC: q.options[2],
      optionD: q.options[3],
      correctAnswer: ['A', 'B', 'C', 'D'][q.correctAnswer],
      explanation: q.explanation || '',
      difficulty: q.difficulty,
      tags: q.tags.join(', '),
    }));
  }

  // ==================== SETTINGS ====================
  async getSettings() {
    const settings = await this.prisma.setting.findMany();
    const result: Record<string, any> = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    return result;
  }

  async updateSettings(settings: Record<string, any>) {
    const updates = Object.entries(settings).map(([key, value]) =>
      this.prisma.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      })
    );

    await Promise.all(updates);
    return this.getSettings();
  }

  // ==================== HELPERS ====================
  private calculateLevel(xp: number): number {
    const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8500, 13000, 20000];
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (xp >= thresholds[i]) return i + 1;
    }
    return 1;
  }
}
