import { IsString, IsOptional, IsBoolean, IsInt, Min, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'JavaScript' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'JavaScript' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: 'JavaScript' })
  @IsOptional()
  @IsString()
  nameRu?: string;

  @ApiProperty({ example: 'javascript' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug faqat kichik harf, raqam va - dan iborat bo\'lishi kerak' })
  slug: string;

  @ApiPropertyOptional({ example: 'JavaScript dasturlash tili bo\'yicha testlar' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '🟨' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#f7df1e' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'JavaScript' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'JavaScript' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ example: 'JavaScript' })
  @IsOptional()
  @IsString()
  nameRu?: string;

  @ApiPropertyOptional({ example: 'javascript' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug faqat kichik harf, raqam va - dan iborat bo\'lishi kerak' })
  slug?: string;

  @ApiPropertyOptional({ example: 'JavaScript dasturlash tili bo\'yicha testlar' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '🟨' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#f7df1e' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
