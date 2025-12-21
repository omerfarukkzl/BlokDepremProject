import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from './location.entity';

@Entity('officials')
export class Official {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  wallet_address: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  location_id: number;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @CreateDateColumn()
  created_at: Date;
}
