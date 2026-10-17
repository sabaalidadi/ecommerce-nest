import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Ticket } from './entities/ticket.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { CreateTicketReplyDto } from './dto/create-ticket-reply.dto.js';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد');
    }

    const ticket = this.ticketRepository.create({
      userId: dto.userId,
      title: dto.title,
      subject: dto.subject,
      description: dto.description,
      replyId: null,
    });

    return this.ticketRepository.save(ticket);
  }

  async createReply(
    ticketId: string,
    dto: CreateTicketReplyDto,
  ): Promise<Ticket> {
    const rootTicket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!rootTicket) {
      throw new NotFoundException('تیکت اصلی پیدا نشد');
    }

    // پاسخ باید به تیکت اصلی وصل شود، نه به یک پاسخ دیگر.
    if (rootTicket.replyId !== null) {
      throw new BadRequestException(
        'برای ثبت پاسخ باید شناسه تیکت اصلی را ارسال کنید',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد');
    }

    const reply = this.ticketRepository.create({
      userId: dto.userId,
      title: rootTicket.title,
      subject: rootTicket.subject,
      description: dto.description,
      replyId: rootTicket.id,
    });

    return this.ticketRepository.save(reply);
  }

  async findAllRootTickets(): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { replyId: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneWithReplies(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: {
        user: true,
        replies: {
          user: true,
        },
      },
      order: {
        replies: {
          createdAt: 'ASC', // پاسخ‌ها به ترتیب از قدیم به جدید (مثل چت)
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('تیکتی با این شناسه یافت نشد');
    }

    return ticket;
  }

}
