import { IsNotEmpty, IsString } from 'class-validator';

export class GetWeatherDto {
  @IsString({ message: 'نام شهر باید رشته متنی باشد' })
  @IsNotEmpty({ message: 'وارد کردن نام شهر الزامی است' })
  city: string;
}
