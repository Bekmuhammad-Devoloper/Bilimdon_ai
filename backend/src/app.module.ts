import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { TestsModule } from './modules/tests/tests.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { AIModule } from './modules/ai/ai.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';
import { TelegramModule } from './modules/telegram/telegram.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    PrismaModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    CategoriesModule,
    QuestionsModule,
    TestsModule,
    LeaderboardModule,
    AIModule,
    AchievementsModule,
    NotificationsModule,
    AdminModule,
    UploadModule,
    TelegramModule,
  ],
})
export class AppModule {}
