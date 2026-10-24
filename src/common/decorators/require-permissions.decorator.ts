import { SetMetadata } from '@nestjs/common';
import { META_PERMISSIONS } from '../constants/metadata-keys.js';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(META_PERMISSIONS, permissions);
