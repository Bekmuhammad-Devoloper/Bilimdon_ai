import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  auth_date: number;
  hash: string;
}

interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

@Injectable()
export class TelegramService {
  private botToken: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
  }

  /**
   * Validate Telegram Mini App init data
   */
  validateInitData(initData: string): TelegramInitData {
    if (!this.botToken) {
      throw new BadRequestException('Telegram bot token not configured');
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      throw new UnauthorizedException('Invalid init data: missing hash');
    }

    urlParams.delete('hash');
    
    // Sort params alphabetically
    const params = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(this.botToken)
      .digest();

    // Calculate expected hash
    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(params)
      .digest('hex');

    if (hash !== expectedHash) {
      throw new UnauthorizedException('Invalid init data: hash mismatch');
    }

    // Check auth_date (not older than 1 hour)
    const authDate = parseInt(urlParams.get('auth_date') || '0');
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 3600) {
      throw new UnauthorizedException('Init data expired');
    }

    // Parse user data
    const userStr = urlParams.get('user');
    let user: TelegramWebAppUser | undefined;
    
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        throw new BadRequestException('Invalid user data');
      }
    }

    return {
      query_id: urlParams.get('query_id') || undefined,
      user,
      auth_date: authDate,
      hash,
    };
  }

  /**
   * Authenticate or register user via Telegram Mini App
   */
  async authenticateWebApp(initData: string) {
    const validated = this.validateInitData(initData);
    
    if (!validated.user) {
      throw new BadRequestException('User data not found in init data');
    }

    const telegramUser = validated.user;
    
    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { telegramId: telegramUser.id.toString() },
    });

    if (!user) {
      // Generate unique username
      let username = telegramUser.username || `user_${telegramUser.id}`;
      const existingUsername = await this.prisma.user.findUnique({
        where: { username },
      });
      
      if (existingUsername) {
        username = `${username}_${Date.now().toString(36)}`;
      }

      const fullName = [telegramUser.first_name, telegramUser.last_name]
        .filter(Boolean)
        .join(' ');

      user = await this.prisma.user.create({
        data: {
          telegramId: telegramUser.id.toString(),
          username,
          fullName: fullName || username,
          avatar: telegramUser.photo_url,
          email: null,
          password: null,
        },
      });
    } else {
      // Update user info from Telegram
      const fullName = [telegramUser.first_name, telegramUser.last_name]
        .filter(Boolean)
        .join(' ');

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: fullName || user.fullName,
          avatar: telegramUser.photo_url || user.avatar,
        },
      });
    }

    // Generate JWT
    const token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
      telegramId: user.telegramId,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        totalXP: user.totalXP,
        level: user.level,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Get user by Telegram ID
   */
  async getUserByTelegramId(telegramId: string) {
    return this.prisma.user.findUnique({
      where: { telegramId },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        totalXP: true,
        level: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Send message via Telegram Bot API
   */
  async sendMessage(chatId: string | number, text: string, options?: {
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    reply_markup?: any;
  }) {
    if (!this.botToken) {
      throw new BadRequestException('Telegram bot token not configured');
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...options,
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new BadRequestException(`Telegram API error: ${data.description}`);
    }

    return data.result;
  }

  /**
   * Set webhook for Telegram Bot
   */
  async setWebhook(webhookUrl: string) {
    if (!this.botToken) {
      throw new BadRequestException('Telegram bot token not configured');
    }

    const url = `https://api.telegram.org/bot${this.botToken}/setWebhook`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new BadRequestException(`Telegram API error: ${data.description}`);
    }

    return data.result;
  }

  /**
   * Handle incoming webhook update from Telegram
   */
  async handleWebhookUpdate(update: any) {
    // Handle /start command
    if (update.message?.text?.startsWith('/start')) {
      const chatId = update.message.chat.id;
      const firstName = update.message.from.first_name;
      
      await this.sendMessage(chatId, 
        `Assalomu alaykum, ${firstName}! 👋\n\n` +
        `Bilimdon platformasiga xush kelibsiz! 🎓\n\n` +
        `Testlar topshirish va bilimingizni sinash uchun quyidagi tugmani bosing:`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[
              {
                text: '🚀 Platformani ochish',
                web_app: { url: this.configService.get('WEBAPP_URL') || 'https://bilimdon.uz' },
              },
            ]],
          },
        }
      );
    }

    // Handle callback queries (inline button presses)
    if (update.callback_query) {
      // Answer callback to remove loading state
      const callbackQueryId = update.callback_query.id;
      await fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId }),
      });
    }

    return { ok: true };
  }

  /**
   * Generate Mini App link with start parameter
   */
  generateMiniAppLink(startParam?: string) {
    const botUsername = this.configService.get('TELEGRAM_BOT_USERNAME') || 'Bilimdon_aibot';
    const webappUrl = this.configService.get('WEBAPP_URL') || 'http://localhost:3000';
    
    // Telegram Mini App URL format: https://t.me/bot_username/app_short_name
    let link = `https://t.me/${botUsername}/app`;
    
    if (startParam) {
      link += `?startapp=${startParam}`;
    }
    
    return link;
  }
}
