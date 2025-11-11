import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Entidad para tracking de typing indicators
 */
@Entity('typing_indicators')
@Index(['conversationId', 'userId'], { unique: true })
export class TypingIndicator {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  conversationId!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'boolean', default: true })
  isTyping!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  lastTypingAt!: Date;
}

