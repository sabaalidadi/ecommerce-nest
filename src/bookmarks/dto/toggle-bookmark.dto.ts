import { IsNotEmpty, IsUUID } from 'class-validator';

export class ToggleBookmarkDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  productId: string;
}
