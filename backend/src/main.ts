import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Body parser limits for large file uploads
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Security - rasmlar uchun crossOriginResourcePolicy'ni o'chiramiz
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS
  const telegramWebAppUrl = configService.get('TELEGRAM_WEBAPP_URL') || 'https://web.telegram.org';
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://web.telegram.org',
      telegramWebAppUrl,
    ],
    credentials: true,
  });

  // Global prefix - uploads yo'lini exclude qilamiz
  app.setGlobalPrefix('api', {
    exclude: ['/uploads/(.*)'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Bilimdon API')
    .setDescription('Bilimdon - Educational Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('categories', 'Categories management')
    .addTag('questions', 'Questions management')
    .addTag('tests', 'Test system')
    .addTag('leaderboard', 'Leaderboard and rankings')
    .addTag('ai', 'AI Assistant')
    .addTag('achievements', 'Achievements system')
    .addTag('notifications', 'Notifications')
    .addTag('admin', 'Admin panel')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Bilimdon API running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
