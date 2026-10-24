
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity.js';
import { Role } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ایجاد نقش جدید
  async createRole(name: string) {
    const normalizedName = name?.trim().toLowerCase();

    if (!normalizedName) {
      throw new BadRequestException('نام نقش الزامی است');
    }

    const existingRole = await this.roleRepository.findOne({
      where: { name: normalizedName },
    });

    if (existingRole) {
      throw new ConflictException('این نقش قبلاً ایجاد شده است');
    }

    const role = this.roleRepository.create({
      name: normalizedName,
    });

    return this.roleRepository.save(role);
  }

  // دریافت تمام نقش‌ها به همراه مجوزهایشان
  async findAllRoles() {
    return this.roleRepository.find({
      relations: { permissions: true },
      order: { name: 'ASC' },
    });
  }

  // دریافت تمام مجوزها
  async findAllPermissions() {
    return this.permissionRepository.find({
      order: { name: 'ASC' },
    });
  }

  // اختصاص نقش به کاربر
  async assignRoleToUser(userId: string, roleName: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد');
    }

    const normalizedRoleName = roleName?.trim().toLowerCase();

    const role = await this.roleRepository.findOne({
      where: { name: normalizedRoleName },
    });

    if (!role) {
      throw new NotFoundException('نقش پیدا نشد');
    }

    const alreadyAssigned = user.roles.some(
      (item) => item.id === role.id,
    );

    if (alreadyAssigned) {
      throw new ConflictException(
        'این نقش قبلاً به کاربر اختصاص داده شده است',
      );
    }

    user.roles = [...user.roles, role];

    // هماهنگ‌سازی فیلد نقش تکی، اگر لازم باشد
    user.role = role.name as UserRole;

    await this.userRepository.save(user);

    return this.getUserRoles(userId);
  }

  // دریافت تمام نقش‌های یک کاربر
  async getUserRoles(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { roles: { permissions: true } },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد');
    }

    return user.roles;
  }

  // جایگزین کردن یک نقش با نقش دیگر
  async replaceUserRole(
    userId: string,
    oldRoleName: string,
    newRoleName: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد');
    }

    const oldName = oldRoleName?.trim().toLowerCase();
    const newName = newRoleName?.trim().toLowerCase();

    if (!oldName || !newName) {
      throw new BadRequestException(
        'نام نقش قبلی و جدید الزامی است',
      );
    }

    if (oldName === newName) {
      throw new BadRequestException(
        'نقش قبلی و جدید نمی‌توانند یکسان باشند',
      );
    }

    const oldRole = user.roles.find(
      (role) => role.name === oldName,
    );

    if (!oldRole) {
      throw new NotFoundException(
        'نقش قبلی برای این کاربر پیدا نشد',
      );
    }

    const newRole = await this.roleRepository.findOne({
      where: { name: newName },
    });

    if (!newRole) {
      throw new NotFoundException('نقش جدید پیدا نشد');
    }

    if (
      user.roles.some((role) => role.id === newRole.id)
    ) {
      throw new ConflictException(
        'کاربر از قبل این نقش را دارد',
      );
    }

    user.roles = user.roles.map((role) =>
      role.id === oldRole.id ? newRole : role,
    );

    if (user.role === oldName) {
      user.role = newName as UserRole;
    }

    await this.userRepository.save(user);

    return this.getUserRoles(userId);
  }

  // حذف یک نقش از کاربر
  async removeUserRole(userId: string, roleName: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد');
    }

    const normalizedRoleName = roleName?.trim().toLowerCase();

    const roleExists = user.roles.some(
      (role) => role.name === normalizedRoleName,
    );

    if (!roleExists) {
      throw new NotFoundException(
        'این نقش به کاربر اختصاص داده نشده است',
      );
    }

    user.roles = user.roles.filter(
      (role) => role.name !== normalizedRoleName,
    );

    if (user.role === normalizedRoleName) {
      user.role = (user.roles[0]?.name ??
        UserRole.CUSTOMER) as UserRole;
    }

    await this.userRepository.save(user);

    return this.getUserRoles(userId);
  }
}
