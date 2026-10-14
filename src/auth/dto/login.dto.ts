import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @Matches(/^09[0-9]{9}$/, {
    message: 'فرمت شماره موبایل نامعتبر است',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  @MinLength(6, {
    message: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
  })
  password: string;
}
