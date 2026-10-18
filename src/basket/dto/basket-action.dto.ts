import { IsArray, IsNotEmpty, IsUUID, ArrayNotEmpty } from 'class-validator';

export class BasketActionDto {
  @IsNotEmpty({ message: 'شناسه کاربر الزامی است' })
  @IsUUID('4', { message: 'فرمت شناسه کاربر نامعتبر است' })
  userId: string;

  @IsArray({ message: 'شناسه‌های محصولات باید به صورت آرایه باشند' })
  @ArrayNotEmpty({ message: 'آرایه شناسه‌های محصولات نباید خالی باشد' })
  @IsUUID('4', { each: true, message: 'هر یک از شناسه‌های محصول باید UUID معتبر باشد' })
  productIds: string[];
}
