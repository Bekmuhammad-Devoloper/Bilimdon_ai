import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class AIService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // OpenRouter API - works in all regions (bypasses geo-restrictions)
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || 
                  this.configService.get<string>('GEMINI_API_KEY') || '';
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = 'meta-llama/llama-3.2-3b-instruct:free'; // Free model on OpenRouter
  }

  async chat(userId: string, dto: ChatDto) {
    if (!this.apiKey) {
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
    let systemPrompt = `Sen "Bilimdon" ta'lim platformasining shaxsiy AI yordamchisisan. Sening isming "Bilimdon AI".

MUHIM QOIDALAR:
1. FAQAT O'ZBEK TILIDA javob ber. Hech qachon ingliz yoki boshqa tilda javob berma.
2. Agar foydalanuvchi "salom", "assalomu alaykum" yoki shunga o'xshash so'z bilan murojaat qilsa, quyidagicha javob ber:
   "Salom! Men Bilimdon AI - sizning shaxsiy ta'lim yordamchingizman. Sizga qanday yordam bera olaman?"
3. Har doim samimiy, do'stona va yordam berishga tayyor bo'l.
4. Javoblarni tushunarli va sodda tilda yoz.

Sen quyidagi mavzularda yordam bera olasan:
- Dasturlash (JavaScript, Python, Java, C++, va boshqalar)
- Matematika (algebra, geometriya, statistika)
- Fanlar (fizika, kimyo, biologiya)
- Tillar (ingliz tili grammatikasi, so'z boyligi)
- Tarix, geografiya, iqtisod
- Va boshqa ta'lim mavzulari

Kod so'ralganda, to'liq va ishlaydigan kod ber, kodga izoh ham qo'sh.
Savollarga aniq javob ber, kerak bo'lsa misollar bilan tushuntir.`;

    if (dto.categorySlug) {
      systemPrompt += `\n\nHozirgi suhbat "${dto.categorySlug}" kategoriyasi bo'yicha. Shu mavzuga oid savollarga javob ber.`;
    }

    // Build conversation history for context
    const conversationContext = chatHistory
      .reverse()
      .map((chat) => `Foydalanuvchi: ${chat.message}\nAI: ${chat.response}`)
      .join('\n\n');

    const userMessage = conversationContext
      ? `Oldingi suhbat:\n${conversationContext}\n\nFoydalanuvchi: ${dto.message}`
      : dto.message;

    try {
      // Call OpenRouter API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://bilimdon-ai.uz',
          'X-Title': 'Bilimdon AI',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API Error:', response.status, errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'Javob olishda xatolik';

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
          response: aiResponse,
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
        response: aiResponse,
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
