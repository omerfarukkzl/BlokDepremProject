import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from './location.entity';
import { Official } from './official.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  barcode: string;

  @Column()
  source_location_id: number;

  @Column()
  destination_location_id: number;

  @Column()
  created_by_official_id: number;

  @Column()
  status: string; // Enum: 'Registered', 'InTransit', 'Delivered'

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'source_location_id' })
  sourceLocation: Location;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'destination_location_id' })
  destinationLocation: Location;

  @ManyToOne(() => Official)
  @JoinColumn({ name: 'created_by_official_id' })
  official: Official;
}
