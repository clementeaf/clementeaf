import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../Users/entities/User.entity';
import { Message } from './Message.entity';

/**
 * Entidad de Conversaciones
 */
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  participant1Id!: number;

  @Column({ type: 'int' })
  participant2Id!: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastMessageAt!: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'participant1Id' })
  participant1!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'participant2Id' })
  participant2!: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages!: Message[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}

