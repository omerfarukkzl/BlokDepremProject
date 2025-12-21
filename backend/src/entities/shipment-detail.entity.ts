import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from './shipment.entity';
import { AidItem } from './aid-item.entity';

@Entity('shipment_details')
export class ShipmentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shipment_id: number;

  @Column()
  item_id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Shipment)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @ManyToOne(() => AidItem)
  @JoinColumn({ name: 'item_id' })
  item: AidItem;
}
