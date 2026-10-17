import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
