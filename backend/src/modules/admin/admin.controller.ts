import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '@prisma/client';
import {
  GetUsersDto,
  UpdateUserRoleDto,
  BlockUserDto,
  AdjustXPDto,
  SendBulkMessageDto,
  BulkImportQuestionsDto,
  ExportQuestionsDto,
  UpdateSettingsDto,
  GrowthStatsDto,
} from './dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== DASHBOARD ====================
  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/growth')
  @ApiOperation({ summary: 'Get growth statistics over time' })
  getGrowthStats(@Query() dto: GrowthStatsDto) {
    return this.adminService.getGrowthStats(dto.days);
  }

  // ==================== USER MANAGEMENT ====================
  @Get('users')
  @ApiOperation({ summary: 'Get all users with filters' })
  getUsers(@Query() dto: GetUsersDto) {
    return this.adminService.getUsers(dto);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Request() req: any,
  ) {
    return this.adminService.updateUserRole(id, dto.role, req.user.id);
  }

  @Patch('users/:id/block')
  @ApiOperation({ summary: 'Block or unblock user' })
  blockUser(@Param('id') id: string, @Body() dto: BlockUserDto) {
    return this.adminService.blockUser(id, dto.blocked);
  }

  @Patch('users/:id/xp')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Adjust user XP (Admin only)' })
  adjustUserXP(@Param('id') id: string, @Body() dto: AdjustXPDto) {
    return this.adminService.adjustUserXP(id, dto.amount, dto.reason);
  }

  @Delete('users/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ==================== MESSAGING ====================
  @Post('messages/bulk')
  @ApiOperation({ summary: 'Send bulk message to users' })
  sendBulkMessage(@Body() dto: SendBulkMessageDto, @Request() req: any) {
    return this.adminService.sendBulkMessage({
      adminId: req.user.id,
      ...dto,
    });
  }

  @Get('messages/history')
  @ApiOperation({ summary: 'Get sent messages history' })
  getMessageHistory(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getMessageHistory(req.user.id, page, limit);
  }

  // ==================== QUESTIONS ====================
  @Post('questions/import')
  @ApiOperation({ summary: 'Bulk import questions' })
  bulkImportQuestions(@Body() dto: BulkImportQuestionsDto) {
    return this.adminService.bulkImportQuestions(dto);
  }

  @Get('questions/export')
  @ApiOperation({ summary: 'Export questions to CSV format' })
  exportQuestions(@Query() dto: ExportQuestionsDto) {
    return this.adminService.exportQuestions(dto.categoryId);
  }

  // ==================== SETTINGS ====================
  @Get('settings')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get platform settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update platform settings' })
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.adminService.updateSettings(dto);
  }
}
