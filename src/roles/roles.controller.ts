
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { RolesService } from './roles.service.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { AppPermission } from './constants/permissions.constant.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard) 
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ایجاد نقش جدید
  @Post()
  @RequirePermissions(AppPermission.USERS_MANAGE)
  createRole(@Body() body: { name: string }) {
    return this.rolesService.createRole(body.name);
  }

  // دریافت لیست تمام نقش‌ها
  @Get()
  @RequirePermissions(AppPermission.USERS_MANAGE)
  findAllRoles() {
    return this.rolesService.findAllRoles();
  }

  // دریافت لیست تمام مجوزها
  @Get('permissions')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  // اختصاص نقش به کاربر
  @Post('assign-role')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  assignRoleToUser(
    @Body() body: { userId: string; roleName: string },
  ) {
    return this.rolesService.assignRoleToUser(
      body.userId,
      body.roleName,
    );
  }

  // دریافت تمام نقش‌های یک کاربر
  @Get('users/:userId')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  getUserRoles(@Param('userId') userId: string) {
    return this.rolesService.getUserRoles(userId);
  }

  // جایگزینی یک نقش با نقش دیگر
  @Post('users/:userId/replace-role')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  replaceUserRole(
    @Param('userId') userId: string,
    @Body()
    body: {
      oldRoleName: string;
      newRoleName: string;
    },
  ) {
    return this.rolesService.replaceUserRole(
      userId,
      body.oldRoleName,
      body.newRoleName,
    );
  }

  // حذف یک نقش از کاربر
  @Delete('users/:userId/roles/:roleName')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  removeUserRole(
    @Param('userId') userId: string,
    @Param('roleName') roleName: string,
  ) {
    return this.rolesService.removeUserRole(
      userId,
      roleName,
    );
  }
}
