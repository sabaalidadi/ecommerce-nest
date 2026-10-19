import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rate_limits')
export class RateLimit {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  ip: string;

  @Column({ type: 'int', default: 1 })
  requestCount: number;

  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  blockedUntil: Date | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP', // 👈 مقدار پیش‌فرض زمان فعلی
  })
  lastRequestAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
