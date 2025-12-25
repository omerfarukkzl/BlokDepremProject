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

  /**
   * Computed property to check if this tracking log has been verified on blockchain.
   * Returns true if transaction_hash exists and is not 'pending'.
   */
  get is_on_blockchain(): boolean {
    return !!this.transaction_hash && this.transaction_hash !== 'pending';
  }

  /**
   * Alias for transaction_hash to match frontend field naming expectations
   */
  get blockchain_tx_hash(): string | null {
    return this.transaction_hash || null;
  }
}
