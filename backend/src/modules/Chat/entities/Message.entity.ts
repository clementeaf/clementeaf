import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Conversation } from './Conversation.entity';
import { User } from '../../Users/entities/User.entity';

/**
 * Entidad de Mensajes
 */
@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['conversationId', 'senderId', 'readAt'])
@Index(['senderId'])
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  conversationId!: number;

  @Column({ type: 'int' })
  senderId!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  readAt!: Date | null;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}

