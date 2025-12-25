import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Location } from './location.entity';
import { Official } from './official.entity';
import { Prediction } from './prediction.entity';

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
  status: string; // Enum: 'Created', 'Registered', 'Departed', 'Arrived', 'Delivered'

  @Column({ type: 'int', nullable: true })
  prediction_id: number | null;

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

  @OneToOne(() => Prediction, (prediction) => prediction.shipment, { nullable: true })
  prediction: Prediction | null;
}
