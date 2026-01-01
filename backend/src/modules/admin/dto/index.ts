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

  @ApiPropertyOptional({ description: 'Image URL for message' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Video URL for message' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ enum: ['all', 'selected', 'filter'] })
  @IsEnum(['all', 'selected', 'filter'])
  targetType: 'all' | 'selected' | 'filter';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetIds?: string[];

  @ApiProperty({ type: [String], description: 'Channels: email, telegram, notification' })
  @IsArray()
  @IsString({ each: true })
  channels: string[];

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

  @ApiPropertyOptional({ description: 'Index in category difficultyLevels array' })
  @IsOptional()
  @IsNumber()
  levelIndex?: number;

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

// ==================== DESIGN SETTINGS ====================
export class UpdateDesignDto {
  @ApiPropertyOptional({ enum: ['default', 'custom'] })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({ description: 'Light mode video URL' })
  @IsOptional()
  @IsString()
  lightVideoUrl?: string;

  @ApiPropertyOptional({ description: 'Dark mode video URL' })
  @IsOptional()
  @IsString()
  darkVideoUrl?: string;

  @ApiPropertyOptional({ description: 'Light mode image URL (fallback)' })
  @IsOptional()
  @IsString()
  lightImageUrl?: string;

  @ApiPropertyOptional({ description: 'Dark mode image URL (fallback)' })
  @IsOptional()
  @IsString()
  darkImageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  videoLoop?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  videoMuted?: boolean;
}

// ==================== CATEGORY MANAGEMENT ====================
export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameRu?: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'programming, frontend, backend, database, devops, science, other' })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({ 
    example: ['Oson', "O'rta", 'Qiyin'], 
    description: 'Kategoriya uchun daraja nomlari (masalan: ["2022", "2023", "2024"])' 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  difficultyLevels?: string[];
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameRu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'programming, frontend, backend, database, devops, science, other' })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    example: ['Oson', "O'rta", 'Qiyin'], 
    description: 'Kategoriya uchun daraja nomlari' 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  difficultyLevels?: string[];
}

export class ImportQuestionsTextDto {
  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Questions in namuna.txt format' })
  @IsString()
  text: string;
}

export class CreateCategoryWithQuestionsDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Questions in namuna.txt format (min 300 questions)' })
  @IsString()
  questionsText: string;
}
