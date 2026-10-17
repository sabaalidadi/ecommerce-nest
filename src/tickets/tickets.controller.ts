import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { CreateTicketReplyDto } from './dto/create-ticket-reply.dto.js';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Post(':id/replies')
  createReply(
    @Param('id') id: string,
    @Body() dto: CreateTicketReplyDto,
  ) {
    return this.ticketsService.createReply(id, dto);
  }

  @Get()
  findAllRootTickets() {
    return this.ticketsService.findAllRootTickets();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOneWithReplies(id);
  }

}
