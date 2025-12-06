import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, Difficulty } from '@prisma/client';

// ==================== USER MANAGEMENT ====================
export class GetUsersDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLevel?: number;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;
}

export class BlockUserDto {
  @ApiProperty()
  @IsBoolean()
  blocked: boolean;
}

export class AdjustXPDto {
  @ApiProperty({ description: 'Amount to add (positive) or subtract (negative)' })
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  reason: string;
}

// ==================== MESSAGING ====================
export class MessageFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minXP?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  inactiveDays?: number;
}

export class SendBulkMessageDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: ['all', 'selected', 'filter'] })
  @IsEnum(['all', 'selected', 'filter'])
  targetType: 'all' | 'selected' | 'filter';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetIds?: string[];

  @ApiPropertyOptional({ type: MessageFilterDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MessageFilterDto)
  filter?: MessageFilterDto;
}

// ==================== QUESTIONS ====================
export class QuestionImportItemDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty({ type: [String], minItems: 4, maxItems: 4 })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ minimum: 0, maximum: 3 })
  @IsNumber()
  @Min(0)
  @Max(3)
  correctAnswer: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ enum: ['EASY', 'MEDIUM', 'HARD'] })
  @IsEnum(Difficulty)
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class BulkImportQuestionsDto {
  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({ type: [QuestionImportItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionImportItemDto)
  questions: QuestionImportItemDto[];
}

export class ExportQuestionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;
}

// ==================== SETTINGS ====================
export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  siteName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  testQuestionsCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  timerEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  timerSeconds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  easyXP?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  mediumXP?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  hardXP?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  aiDailyLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  geminiModel?: string;
}

// ==================== GROWTH STATS ====================
export class GrowthStatsDto {
  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  days?: number = 30;
}
