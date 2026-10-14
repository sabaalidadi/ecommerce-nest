import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity.js';

export class CreateUserDto {
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @Matches(/^09[0-9]{9}$/, {
    message: 'فرمت شماره موبایل نامعتبر است (مثال: 09123456789)',
  })
  phoneNumber: string;

  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  @IsOptional()
  email?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
