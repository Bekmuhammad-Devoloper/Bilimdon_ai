import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class AIService {
  private apiKey: string;
  private apiUrl: string;
  // Fallback models list - try each one until success
  private models: string[] = [
    'google/gemma-2-9b-it:free',      // Primary - free, reliable
    'meta-llama/llama-3.2-3b-instruct:free', // Fallback 1
    'mistralai/mistral-7b-instruct:free',    // Fallback 2
    'huggingfaceh4/zephyr-7b-beta:free',     // Fallback 3
  ];

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // OpenRouter API - works in all regions (bypasses geo-restrictions)
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || 
                  this.configService.get<string>('GEMINI_API_KEY') || '';
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
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
    let systemPrompt = `Sen "Bilimdon" ta'lim platformasining AI yordamchisisan.

QOIDALAR:
1. Faqat O'ZBEK tilida javob ber
2. Har safar "Salom! Men Bilimdon AI..." deb boshlaMA - faqat savolga javob ber
3. Qisqa, aniq va TO'G'RI ma'lumot ber
4. Agar bilmasang "Bu haqida aniq ma'lumotim yo'q" de
5. TARIXIY FAKTLARNI TO'G'RI BER:
   - Alisher Navoiy: 1441-yil tug'ilgan, Hirot shahri
   - Zahiriddin Muhammad Bobur: 1483-yil, Andijon shahri
   - Amir Temur: 1336-yil, Shahrisabz

Kategoriyalar: Dasturlash, Matematika, Fizika, Kimyo, Biologiya, Tarix, Ingliz tili, va boshqalar.

Kod so'ralganda to'liq va ishlaydigan kod ber.`;

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
      console.log('AI Request - Models:', this.models, 'Message:', dto.message.substring(0, 50));
      
      let aiResponse: string | null = null;
      let lastError: Error | null = null;

      // Try each model until one succeeds
      for (const model of this.models) {
        try {
          console.log('Trying model:', model);
          
          const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'https://bilimdon-ai.uz',
              'X-Title': 'Bilimdon AI',
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
              ],
              max_tokens: 2048,
            }),
          });

          const responseText = await response.text();
          console.log('AI Response status for', model, ':', response.status);
          
          if (!response.ok) {
            console.error('OpenRouter API Error for', model, ':', response.status, responseText);
            lastError = new Error(`API error: ${response.status}`);
            continue; // Try next model
          }

          const data = JSON.parse(responseText);
          aiResponse = data.choices?.[0]?.message?.content;
          
          if (aiResponse) {
            console.log('Success with model:', model);
            break; // Success, exit loop
          }
        } catch (modelError) {
          console.error('Error with model', model, ':', modelError);
          lastError = modelError as Error;
          continue; // Try next model
        }
      }

      if (!aiResponse) {
        throw lastError || new Error('All models failed');
      }

      // Clean response from model artifacts like <s>, </s>, etc.
      aiResponse = aiResponse
        .replace(/<s>/g, '')
        .replace(/<\/s>/g, '')
        .replace(/^\s+/, '')
        .trim();

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
