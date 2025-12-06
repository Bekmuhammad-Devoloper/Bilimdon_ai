import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private uploadDir: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    this.maxFileSize = parseInt(this.configService.get('MAX_FILE_SIZE') || '5242880'); // 5MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    const dirs = ['avatars', 'attachments', 'temp'];
    dirs.forEach(dir => {
      const fullPath = path.join(this.uploadDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    this.validateFile(file);

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${userId}-${Date.now()}${ext}`;
    const filepath = path.join(this.uploadDir, 'avatars', filename);

    await fs.promises.writeFile(filepath, file.buffer);

    return `/uploads/avatars/${filename}`;
  }

  async uploadAttachment(file: Express.Multer.File): Promise<string> {
    this.validateFile(file);

    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${hash}${ext}`;
    const filepath = path.join(this.uploadDir, 'attachments', filename);

    await fs.promises.writeFile(filepath, file.buffer);

    return `/uploads/attachments/${filename}`;
  }

  async deleteFile(filepath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filepath);
    
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Fayl yuklanmadi');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`Fayl hajmi ${this.maxFileSize / 1024 / 1024}MB dan oshmasligi kerak`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Faqat rasm fayllarini yuklash mumkin (JPEG, PNG, GIF, WebP)');
    }
  }

  getFilePath(filename: string, type: 'avatars' | 'attachments' = 'attachments'): string {
    return path.join(this.uploadDir, type, filename);
  }
}
