import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email or username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
      }
      throw new ConflictException('Bu username allaqachon band');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        fullName: dto.fullName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        totalXP: true,
        level: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = this.generateToken(user.id, user.role);

    return {
      user,
      token,
    };
  }

  async login(dto: LoginDto) {
    // Find user by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.emailOrUsername }, { username: dto.emailOrUsername }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Noto\'g\'ri email/username yoki parol');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Hisobingiz bloklangan');
    }

    if (!user.password) {
      throw new UnauthorizedException('Telegram orqali ro\'yxatdan o\'tgan foydalanuvchi. Telegram orqali kiring');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Noto\'g\'ri email/username yoki parol');
    }

    // Update last active
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Generate token
    const token = this.generateToken(user.id, user.role);

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async telegramAuth(dto: TelegramAuthDto) {
    // Find or create user by Telegram ID
    let user = await this.prisma.user.findUnique({
      where: { telegramId: dto.telegramId },
    });

    if (!user) {
      // Create new user from Telegram
      const username = dto.username || `tg_${dto.telegramId}`;
      const uniqueUsername = await this.generateUniqueUsername(username);

      user = await this.prisma.user.create({
        data: {
          telegramId: dto.telegramId,
          username: uniqueUsername,
          email: `${dto.telegramId}@telegram.bilimdon.uz`,
          password: await bcrypt.hash(Math.random().toString(36), 12),
          fullName: `${dto.firstName || ''} ${dto.lastName || ''}`.trim() || 'Telegram User',
          avatar: dto.photoUrl,
        },
      });
    } else {
      // Update last active
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Hisobingiz bloklangan');
    }

    // Generate token
    const token = this.generateToken(user.id, user.role);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        bio: true,
        totalXP: true,
        level: true,
        role: true,
        telegramId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            testAttempts: true,
            userAchievements: { where: { unlockedAt: { not: null } } },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    return user;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    if (!user.password) {
      throw new BadRequestException('Telegram orqali ro\'yxatdan o\'tgan foydalanuvchi uchun parol o\'zgartirish mumkin emas');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Joriy parol noto\'g\'ri');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Parol muvaffaqiyatli o\'zgartirildi' };
  }

  private generateToken(userId: string, role: string) {
    return this.jwtService.sign({
      sub: userId,
      role,
    });
  }

  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
    let counter = 0;

    while (true) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: counter === 0 ? username : `${username}${counter}` },
      });

      if (!existingUser) {
        return counter === 0 ? username : `${username}${counter}`;
      }

      counter++;
    }
  }

  async sendVerificationCode(email: string) {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to database
    await this.prisma.emailVerification.upsert({
      where: { email },
      create: {
        email,
        code,
        expiresAt,
        verified: false,
      },
      update: {
        code,
        expiresAt,
        verified: false,
      },
    });

    // Send email
    await this.mailService.sendVerificationCode(email, code);

    return { message: 'Tasdiqlash kodi emailingizga yuborildi' };
  }

  async verifyEmail(email: string, code: string) {
    const verification = await this.prisma.emailVerification.findUnique({
      where: { email },
    });

    if (!verification) {
      throw new BadRequestException('Tasdiqlash kodi topilmadi');
    }

    if (verification.verified) {
      throw new BadRequestException('Email allaqachon tasdiqlangan');
    }

    if (verification.code !== code) {
      throw new BadRequestException('Noto\'g\'ri tasdiqlash kodi');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Tasdiqlash kodi muddati tugagan');
    }

    // Mark as verified
    await this.prisma.emailVerification.update({
      where: { email },
      data: { verified: true },
    });

    return { message: 'Email muvaffaqiyatli tasdiqlandi' };
  }

  async sendPhoneToTelegram(phone: string, email: string) {
    // Here you would integrate with Telegram Bot API
    // For now, just save to database or log
    console.log(`Phone ${phone} for email ${email} would be sent to Telegram`);
    
    // TODO: Implement Telegram bot integration
    // Example: send message to admin bot with phone number
    
    return { message: 'Telefon raqam Telegramga yuborildi' };
  }
}

