import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity.js';
import { Role } from './entities/role.entity.js';
import {
  AppPermission,
  ROLE_PERMISSIONS,
} from './constants/permissions.constant.js';

@Injectable()
export class RolesSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesSeedService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedPermissions();
    await this.seedRoles();
  }

  private async seedPermissions(): Promise<void> {
    const allPermissions = Object.values(AppPermission);

    for (const permName of allPermissions) {
      const exists = await this.permissionRepo.findOne({
        where: { name: permName },
      });
      if (!exists) {
        await this.permissionRepo.save(
          this.permissionRepo.create({ name: permName }),
        );
      }
    }
    this.logger.log('Permissions seed checked/completed.');
  }

  private async seedRoles(): Promise<void> {
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      let role = await this.roleRepo.findOne({
        where: { name: roleName },
        relations: {
          permissions: true,
        },
      });

      // پیدا کردن Entityهای مجوز مربوط به این نقش
      const matchedPermissions = await this.permissionRepo.find({
        where: { name: In(permissions) },
      });

      if (!role) {
        role = this.roleRepo.create({
          name: roleName,
          permissions: matchedPermissions,
        });
        await this.roleRepo.save(role);
      } else {
        // به‌روزرسانی پرمیشن‌های نقش در صورت تغییر
        role.permissions = matchedPermissions;
        await this.roleRepo.save(role);
      }
    }
    this.logger.log('Roles & Role-Permissions seed checked/completed.');
  }
}
