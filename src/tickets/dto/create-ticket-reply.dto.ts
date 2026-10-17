import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTicketReplyDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
