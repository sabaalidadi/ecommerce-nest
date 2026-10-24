import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';
import { RolesSeedService } from './roles-seed.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  providers: [RolesSeedService],
  exports: [TypeOrmModule],
})
export class RolesModule {}
