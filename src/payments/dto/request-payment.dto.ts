import { IsUUID, IsNotEmpty } from 'class-validator';

export class RequestPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;
}
