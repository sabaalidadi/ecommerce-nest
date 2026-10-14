import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../users/dto/create-user.dto.js';

export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {}
