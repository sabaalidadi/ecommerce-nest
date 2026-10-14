import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty({ message: 'شناسه کاربر الزامی است' })
  @IsUUID('all', { message: 'شناسه کاربر باید یک UUID معتبر باشد' })
  userId: string;

  @IsNotEmpty({ message: 'عنوان آدرس الزامی است' })
  @IsString({ message: 'عنوان آدرس باید متنی باشد' })
  title: string;

  @IsNotEmpty({ message: 'استان الزامی است' })
  @IsString({ message: 'استان باید متنی باشد' })
  province: string;

  @IsNotEmpty({ message: 'شهر الزامی است' })
  @IsString({ message: 'شهر باید متنی باشد' })
  city: string;

  @IsNotEmpty({ message: 'آدرس پستی الزامی است' })
  @IsString({ message: 'آدرس پستی باید متنی باشد' })
  postalAddress: string;

  @IsNotEmpty({ message: 'کد پستی الزامی است' })
  @Matches(/^[0-9]{10}$/, {
    message: 'کد پستی باید دقیقا ۱۰ رقم عددی باشد',
  })
  postalCode: string;

  @IsNotEmpty({ message: 'نام تحویل‌گیرنده الزامی است' })
  @IsString({ message: 'نام تحویل‌گیرنده باید متنی باشد' })
  receiverName: string;

  @IsNotEmpty({ message: 'شماره تماس تحویل‌گیرنده الزامی است' })
  @Matches(/^09[0-9]{9}$/, {
    message: 'شماره تماس تحویل‌گیرنده باید یک شماره موبایل معتبر ۱۱ رقمی با فرمت 09xxxxxxxxx باشد',
  })
  receiverPhone: string;

  @IsOptional()
  @IsBoolean({ message: 'آدرس پیش‌فرض باید مقدار بولین (true/false) باشد' })
  isDefault?: boolean;
}
