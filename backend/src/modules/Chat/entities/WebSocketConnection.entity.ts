import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entidad de Conexiones WebSocket
 */
@Entity('websocket_connections')
export class WebSocketConnection {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  connectionId!: string;

  @Column({ type: 'int' })
  userId!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  connectedAt!: Date;
}

