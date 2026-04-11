import { Controller, Post, Delete, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schemas/user.schema';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  @Post('image')
  @Roles(UserRole.CONTENT_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // In production, upload to Supabase Storage
    // For now, return a placeholder URL
    return {
      url: `/uploads/${file?.originalname || 'image.png'}`,
      filename: file?.originalname || 'image.png',
      size: file?.size || 0,
    };
  }

  @Delete('image')
  @Roles(UserRole.CONTENT_ADMIN)
  async deleteImage(@Body('url') url: string) {
    // In production, delete from Supabase Storage
    return { deleted: true, url };
  }
}
