import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // gemini-1.5-flash - stable model
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async chat(userId: string, dto: ChatDto) {
    if (!this.model) {
      throw new BadRequestException('AI xizmati sozlanmagan');
    }

    // Check daily limit (100 requests per user per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.prisma.aIChat.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    if (todayCount >= 100) {
      throw new BadRequestException('Kunlik so\'rovlar limiti tugadi (100 ta). Ertaga qaytadan urinib ko\'ring.');
    }

    // Get chat history for context
    const chatHistory = await this.prisma.aIChat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { message: true, response: true },
    });

    // Build context
    let systemPrompt = `Siz "Bilimdon" ta'lim platformasining AI yordamchisisiz. 
Siz o'zbek tilida javob berasiz.
Siz quyidagi mavzularda yordam bera olasiz:
- Dasturlash (JavaScript, Python, Java, va boshqalar)
- Matematika (algebra, geometriya, statistika)
- Fanlar (fizika, kimyo, biologiya)
- Tillar (ingliz tili grammatikasi, so'z boyligi)
- Tarix, geografiya, iqtisod

Har doim tushunarli va foydali javob bering. Kod so'ralganda, to'liq va ishlaydigan kod bering.
Savollarga qisqa va aniq javob bering, lekin kerak bo'lsa tushuntirish ham bering.`;

    if (dto.categorySlug) {
      systemPrompt += `\n\nHozirgi suhbat "${dto.categorySlug}" kategoriyasi bo'yicha.`;
    }

    // Build conversation history for context
    const conversationContext = chatHistory
      .reverse()
      .map((chat) => `Foydalanuvchi: ${chat.message}\nAI: ${chat.response}`)
      .join('\n\n');

    const fullPrompt = conversationContext
      ? `${systemPrompt}\n\nOldingi suhbat:\n${conversationContext}\n\nFoydalanuvchi: ${dto.message}`
      : `${systemPrompt}\n\nFoydalanuvchi: ${dto.message}`;

    try {
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response.text();

      // Get category ID if slug provided
      let categoryId: string | null = null;
      if (dto.categorySlug) {
        const category = await this.prisma.category.findUnique({
          where: { slug: dto.categorySlug },
        });
        categoryId = category?.id || null;
      }

      // Save to database
      const aiChat = await this.prisma.aIChat.create({
        data: {
          userId,
          categoryId,
          message: dto.message,
          response,
        },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      return {
        id: aiChat.id,
        message: dto.message,
        response,
        category: aiChat.category,
        createdAt: aiChat.createdAt,
        remainingQueries: 100 - todayCount - 1,
      };
    } catch (error) {
      console.error('AI Error:', error);
      throw new BadRequestException('AI javob berishda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  }

  async getChatHistory(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      this.prisma.aIChat.findMany({
        where: { userId },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.aIChat.count({ where: { userId } }),
    ]);

    return {
      chats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async clearChatHistory(userId: string) {
    await this.prisma.aIChat.deleteMany({
      where: { userId },
    });

    return { message: 'Chat tarixi tozalandi' };
  }

  async getDailyUsage(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.prisma.aIChat.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    return {
      used: count,
      limit: 100,
      remaining: Math.max(0, 100 - count),
    };
  }
}
