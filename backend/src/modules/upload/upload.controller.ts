import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const url = await this.uploadService.uploadAvatar(file, req.user.id);
    return { url };
  }

  @Post('attachment')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadAttachment(file);
    return { url };
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete uploaded file' })
  async deleteFile(@Param('filename') filename: string) {
    await this.uploadService.deleteFile(filename);
    return { message: 'Fayl o\'chirildi' };
  }
}
