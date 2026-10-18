import { Controller, Post, Delete, Get, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { BasketService } from './basket.service.js';
import { BasketActionDto } from './dto/basket-action.dto.js';

@Controller('basket')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Post('add')
  addToBasket(@Body() dto: BasketActionDto) {
    return this.basketService.addToBasket(dto);
  }

  @Delete('remove')
  removeFromBasket(@Body() dto: BasketActionDto) {
    return this.basketService.removeFromBasket(dto);
  }

  @Get(':userId')
  getUserBasket(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.basketService.getUserBasket(userId);
  }
}
