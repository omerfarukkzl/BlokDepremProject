import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from './location.entity';

export enum OfficialRole {
  OFFICIAL = 'official',
  ADMIN = 'admin',
}

@Entity('officials')
export class Official {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  wallet_address: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'varchar',
    default: OfficialRole.OFFICIAL,
  })
  role: OfficialRole;

  @Column({ nullable: true })
  location_id: number;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @CreateDateColumn()
  created_at: Date;
}
