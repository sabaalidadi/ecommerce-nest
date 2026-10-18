import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'شناسه کاربر الزامی است' })
  @IsUUID('4', { message: 'فرمت شناسه کاربر نامعتبر است' })
  userId: string;

  @IsNotEmpty({ message: 'شناسه آدرس الزامی است' })
  @IsUUID('4', { message: 'فرمت شناسه آدرس نامعتبر است' })
  addressId: string;

  @IsOptional()
  @IsString({ message: 'کد تخفیف باید متن باشد' })
  discountCode?: string;
}
