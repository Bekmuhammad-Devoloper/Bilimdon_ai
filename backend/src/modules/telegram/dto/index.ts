import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TelegramWebAppAuthDto {
  @ApiProperty({ description: 'Telegram Mini App init data string' })
  @IsString()
  @IsNotEmpty()
  initData: string;
}

export class SendTelegramMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ enum: ['HTML', 'Markdown', 'MarkdownV2'] })
  @IsOptional()
  @IsString()
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export class SetWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  webhookUrl: string;
}

export class SavePhoneDto {
  @ApiProperty({ description: 'Phone number from Telegram contact' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
