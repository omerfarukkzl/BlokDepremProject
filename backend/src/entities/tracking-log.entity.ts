import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity('tracking_logs')
export class TrackingLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shipment_id: number;

  @Column()
  status: string;

  @Column()
  transaction_hash: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => Shipment)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;
}
